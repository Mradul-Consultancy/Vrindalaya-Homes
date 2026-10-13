from rest_framework import serializers


class PricePredictionInputSerializer(serializers.Serializer):
    """Accepts property features and returns an estimated price."""

    property_type = serializers.ChoiceField(
        choices=['House', 'Apartment', 'Plot', 'Commercial'],
        help_text='Type of property',
    )
    city = serializers.CharField(max_length=100, help_text='City name')
    locality = serializers.CharField(
        max_length=100, required=False, default='', help_text='Locality / neighbourhood',
    )
    size_sqft = serializers.DecimalField(
        max_digits=10, decimal_places=2, help_text='Area in square feet',
    )
    bedrooms = serializers.IntegerField(
        required=False, default=0, min_value=0, help_text='Number of bedrooms',
    )
    bathrooms = serializers.IntegerField(
        required=False, default=0, min_value=0, help_text='Number of bathrooms',
    )
    floor_number = serializers.IntegerField(
        required=False, default=1, help_text='Floor the unit is on',
    )
    total_floors = serializers.IntegerField(
        required=False, default=1, min_value=1, help_text='Total floors in building',
    )
    age_of_property = serializers.ChoiceField(
        choices=['New', 'Less than 5 years', '5-10 years', '10+ years'],
        required=False,
        default='New',
    )
    furnishing_status = serializers.ChoiceField(
        choices=['Furnished', 'Semi-Furnished', 'Unfurnished'],
        required=False,
        default='Unfurnished',
    )
    parking = serializers.BooleanField(required=False, default=False)


class PricePredictionOutputSerializer(serializers.Serializer):
    estimated_price = serializers.DecimalField(max_digits=14, decimal_places=2)
    confidence = serializers.CharField(help_text='low | medium | high')
    comparable_range = serializers.DictField(
        child=serializers.DecimalField(max_digits=14, decimal_places=2),
        help_text='{"min": ..., "max": ...}',
    )
    note = serializers.CharField()

