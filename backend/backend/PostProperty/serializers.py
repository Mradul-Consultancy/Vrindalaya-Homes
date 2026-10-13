import re

from django.core.files.uploadedfile import UploadedFile
from rest_framework import serializers

from .models import PropertyImage, PropertyListing


class ListingImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, UploadedFile) and data.size > 10 * 1024 * 1024:
            raise serializers.ValidationError('Each image must be 10 MB or smaller.')
        return super().to_internal_value(data)


class PropertyListingSerializer(serializers.ModelSerializer):
    gallery = serializers.ListField(
        child=ListingImageField(),
        required=False,
        write_only=True,
        max_length=9,
    )
    images = ListingImageField(required=True)
    floor_plan = ListingImageField(required=False, allow_null=True)
    gallery_images = serializers.SerializerMethodField()

    class Meta:
        model = PropertyListing
        fields = [
            'id',
            'status',
            'title',
            'property_type',
            'size_sqft',
            'bedrooms',
            'bathrooms',
            'furnishing_status',
            'price',
            'city',
            'locality',
            'pincode',
            'construction_status',
            'age_of_property',
            'floor_number',
            'total_floors',
            'parking',
            'images',
            'floor_plan',
            'gallery',
            'gallery_images',
            'seller_name',
            'seller_contact',
            'seller_email',
            'address',
            'seller_type',
            'description',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'gallery_images', 'created_at']
        extra_kwargs = {
            'seller_contact': {'write_only': True},
            'seller_email': {'write_only': True},
            'address': {'write_only': True},
        }

    def get_gallery_images(self, listing):
        request = self.context.get('request')
        return [
            request.build_absolute_uri(image.image.url) if request else image.image.url
            for image in listing.gallery.all()
        ]

    def create(self, validated_data):
        gallery = validated_data.pop('gallery', [])
        listing = super().create(validated_data)
        for image in gallery:
            PropertyImage.objects.create(property=listing, image=image)
        return listing

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than zero.')
        return value

    def validate_size_sqft(self, value):
        if value <= 0:
            raise serializers.ValidationError('Property size must be greater than zero.')
        return value

    def validate_seller_contact(self, value):
        if not re.fullmatch(r'\+?[0-9\s()-]{7,20}', value):
            raise serializers.ValidationError('Enter a valid phone number.')
        return value

    def validate_pincode(self, value):
        if not re.fullmatch(r'[0-9]{6}', value):
            raise serializers.ValidationError('Enter a valid 6-digit PIN code.')
        return value

    def validate(self, attrs):
        total_floors = attrs.get('total_floors')
        floor_number = attrs.get('floor_number')
        if total_floors is not None and total_floors < 1:
            raise serializers.ValidationError({'total_floors': 'Total floors must be at least one.'})
        if total_floors is not None and floor_number is not None and floor_number > total_floors:
            raise serializers.ValidationError({'floor_number': 'Floor number cannot exceed total floors.'})
        return attrs


class MyPropertyListingSerializer(PropertyListingSerializer):
    seller_contact = serializers.CharField()
    seller_email = serializers.EmailField()
    address = serializers.CharField()

    class Meta(PropertyListingSerializer.Meta):
        read_only_fields = PropertyListingSerializer.Meta.read_only_fields

    def update(self, instance, validated_data):
        gallery = validated_data.pop('gallery', [])
        listing = super().update(instance, validated_data)
        for image in gallery:
            PropertyImage.objects.create(property=listing, image=image)
        return listing
