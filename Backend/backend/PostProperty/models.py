from django.conf import settings
from django.db import models


LISTING_STATUS = [
    ('Under Review', 'Under Review'),
    ('Active', 'Active'),
    ('Sold', 'Sold'),
    ('Rejected', 'Rejected'),
]

FURNISHING_OPTIONS = [
    ('Furnished', 'Furnished'),
    ('Semi-Furnished', 'Semi-Furnished'),
    ('Unfurnished', 'Unfurnished'),
]

CONSTRUCTION_STATUS = [
    ('Ready to Move', 'Ready to Move'),
    ('Under Construction', 'Under Construction'),
]

AGE_OF_PROPERTY = [
    ('New', 'New'),
    ('Less than 5 years', 'Less than 5 years'),
    ('5-10 years', '5-10 years'),
    ('10+ years', '10+ years'),
]

SELLER_TYPE = [
    ('Owner', 'Owner'),
    ('Agent', 'Agent'),
    ('Builder', 'Builder'),
]

PROPERTY_TYPE = [
    ('House', 'House'),
    ('Apartment', 'Apartment'),
    ('Plot', 'Plot'),
    ('Commercial', 'Commercial'),
]

class PropertyListing(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='property_listings',
        null=True,
        blank=True,
    )
    status = models.CharField(max_length=20, choices=LISTING_STATUS, default='Active')
    title = models.CharField(max_length=255)
    property_type = models.CharField(max_length=50, choices=PROPERTY_TYPE)
    size_sqft = models.DecimalField(max_digits=10, decimal_places=2)
    bedrooms = models.PositiveIntegerField(null=True, blank=True)
    bathrooms = models.PositiveIntegerField(null=True, blank=True)
    furnishing_status = models.CharField(max_length=50, choices=FURNISHING_OPTIONS, blank=True)
    price = models.DecimalField(max_digits=14, decimal_places=2)

    city = models.CharField(max_length=100)
    locality = models.CharField(max_length=100)
    address = models.TextField()
    pincode = models.CharField(max_length=10)

    construction_status = models.CharField(max_length=50, choices=CONSTRUCTION_STATUS)
    age_of_property = models.CharField(max_length=50, choices=AGE_OF_PROPERTY)
    floor_number = models.IntegerField()
    total_floors = models.IntegerField()
    parking = models.BooleanField()

    images = models.ImageField(upload_to='property_images/', null=True, blank=True)
    floor_plan = models.ImageField(upload_to='property_floor_plans/', null=True, blank=True)
    seller_name = models.CharField(max_length=100)
    seller_contact = models.CharField(max_length=15)
    seller_email = models.EmailField()
    seller_type = models.CharField(max_length=20, choices=SELLER_TYPE)
    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.city}"


class PropertyImage(models.Model):
    property = models.ForeignKey(
        PropertyListing,
        on_delete=models.CASCADE,
        related_name='gallery',
    )
    image = models.ImageField(upload_to='property_images/gallery/')