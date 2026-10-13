from io import BytesIO
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import PropertyListing


@override_settings(
    STORAGES={
        'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
        'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
    }
)
class PropertyListingApiTests(APITestCase):
    def setUp(self):
        media_directory = tempfile.TemporaryDirectory()
        self.addCleanup(media_directory.cleanup)
        media_settings = override_settings(MEDIA_ROOT=media_directory.name)
        media_settings.enable()
        self.addCleanup(media_settings.disable)
        self.user = User.objects.create_user(
            email='seller@example.com',
            first_name='Local',
            last_name='Seller',
            password='Strong-Test-Pass-2026!',
        )
        self.payload = {
            'title': 'Vrindavan home',
            'property_type': 'House',
            'size_sqft': '1200',
            'price': '4500000',
            'city': 'Vrindavan',
            'locality': 'Raman Reti',
            'address': 'Private street address',
            'pincode': '281121',
            'construction_status': 'Ready to Move',
            'age_of_property': 'New',
            'floor_number': '1',
            'total_floors': '2',
            'parking': 'true',
            'seller_name': 'Local Seller',
            'seller_contact': '+919876543210',
            'seller_email': 'seller@example.com',
            'seller_type': 'Owner',
            'description': 'A test property description.',
        }

    def make_image(self, name='home.png'):
        contents = BytesIO()
        Image.new('RGB', (2, 2), color='white').save(contents, format='PNG')
        return SimpleUploadedFile(name, contents.getvalue(), content_type='image/png')

    def create_active_listing(self):
        return PropertyListing.objects.create(
            title='Vrindavan home',
            property_type='House',
            size_sqft='1200',
            price='4500000',
            city='Vrindavan',
            locality='Raman Reti',
            address='Private street address',
            pincode='281121',
            construction_status='Ready to Move',
            age_of_property='New',
            floor_number=1,
            total_floors=2,
            parking=True,
            seller_name='Local Seller',
            seller_contact='+919876543210',
            seller_email='seller@example.com',
            seller_type='Owner',
            description='A test property description.',
            status='Active',
            owner=self.user,
        )

    def test_listing_creation_requires_authentication(self):
        response = self.client.post('/api/property/sell/', self.payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_listing_is_held_for_review_and_private_fields_are_not_returned(self):
        self.client.force_authenticate(self.user)
        payload = {
            **self.payload,
            'images': self.make_image(),
            'gallery': [self.make_image('gallery.png')],
            'floor_plan': self.make_image('floor-plan.png'),
        }
        response = self.client.post('/api/property/sell/', payload, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        listing = PropertyListing.objects.get(pk=response.data['id'])
        self.assertEqual(listing.owner, self.user)
        self.assertEqual(listing.status, 'Under Review')
        self.assertEqual(listing.gallery.count(), 1)
        self.assertTrue(listing.floor_plan)
        self.assertNotIn('seller_contact', response.data)
        self.assertNotIn('seller_email', response.data)
        self.assertNotIn('address', response.data)

    def test_invalid_price_is_rejected(self):
        self.client.force_authenticate(self.user)
        payload = {**self.payload, 'price': '0', 'images': self.make_image()}
        response = self.client.post('/api/property/sell/', payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('price', response.data)

    def test_public_list_is_paginated_and_contact_is_login_gated(self):
        listing = self.create_active_listing()
        response = self.client.get('/api/property/buy/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], listing.id)
        self.assertEqual(
            self.client.get(f'/api/property/property/{listing.id}/contact/').status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.client.force_authenticate(self.user)
        contact = self.client.get(f'/api/property/property/{listing.id}/contact/')
        self.assertEqual(contact.status_code, status.HTTP_200_OK)
        self.assertEqual(contact.data['seller_email'], 'seller@example.com')

    def test_public_list_filters_active_inventory(self):
        self.create_active_listing()
        response = self.client.get('/api/property/buy/', {'city__iexact': 'Vrindavan', 'price__gte': '4000000'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

        response = self.client.get('/api/property/buy/', {'property_type': 'Plot'})
        self.assertEqual(response.data['count'], 0)

    def test_owner_can_manage_only_their_active_listing(self):
        listing = self.create_active_listing()
        self.client.force_authenticate(self.user)

        mine = self.client.get('/api/property/mine/')
        self.assertEqual(mine.status_code, status.HTTP_200_OK)
        self.assertEqual(mine.data['results'][0]['seller_contact'], '+919876543210')

        sold = self.client.post(f'/api/property/mine/{listing.id}/sold/')
        self.assertEqual(sold.status_code, status.HTTP_200_OK)
        listing.refresh_from_db()
        self.assertEqual(listing.status, 'Sold')

    def test_owner_edit_returns_active_listing_to_review(self):
        listing = self.create_active_listing()
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            f'/api/property/mine/{listing.id}/',
            {'title': 'Updated Vrindavan home'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        listing.refresh_from_db()
        self.assertEqual(listing.title, 'Updated Vrindavan home')
        self.assertEqual(listing.status, 'Under Review')
        self.assertEqual(response.data['status'], 'Under Review')

    def test_owner_cannot_update_another_users_listing(self):
        listing = self.create_active_listing()
        other_user = User.objects.create_user(
            email='other@example.com',
            first_name='Other',
            last_name='User',
            password='Strong-Test-Pass-2026!',
        )
        self.client.force_authenticate(other_user)

        response = self.client.patch(
            f'/api/property/mine/{listing.id}/',
            {'title': 'Unauthorized edit'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        listing.refresh_from_db()
        self.assertEqual(listing.title, 'Vrindavan home')
