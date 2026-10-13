"""
Stub price-prediction view.

This is a **Phase-3 placeholder** that returns a rule-based estimate using
simple per-sqft rates.  Once you collect enough listing data the plan is to
swap this for a trained ML model (Random Forest / XGBoost) serialised to a
.pkl file — see AI_Implementation_Plan.md for details.
"""

from decimal import Decimal

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import PricePredictionInputSerializer, PricePredictionOutputSerializer

# ── Stub per-sqft base rates (₹) by property type ──────────────────────
_BASE_RATE = {
    'House': Decimal('4500'),
    'Apartment': Decimal('5000'),
    'Plot': Decimal('3000'),
    'Commercial': Decimal('6500'),
}

# ── Simple multipliers ─────────────────────────────────────────────────
_AGE_FACTOR = {
    'New': Decimal('1.10'),
    'Less than 5 years': Decimal('1.00'),
    '5-10 years': Decimal('0.90'),
    '10+ years': Decimal('0.80'),
}

_FURNISHING_FACTOR = {
    'Furnished': Decimal('1.15'),
    'Semi-Furnished': Decimal('1.05'),
    'Unfurnished': Decimal('1.00'),
}


class PricePredictionView(APIView):
    """
    POST /api/ai/predict/

    Accepts property features and returns an estimated price.
    Currently uses a rule-based stub; will be replaced by an ML model later.
    """

    def post(self, request):
        ser = PricePredictionInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        d = ser.validated_data

        base = _BASE_RATE.get(d['property_type'], Decimal('4000'))
        sqft = d['size_sqft']
        age_mult = _AGE_FACTOR.get(d['age_of_property'], Decimal('1.00'))
        furn_mult = _FURNISHING_FACTOR.get(d['furnishing_status'], Decimal('1.00'))
        parking_add = Decimal('200000') if d['parking'] else Decimal('0')

        estimated = (base * sqft * age_mult * furn_mult) + parking_add
        estimated = estimated.quantize(Decimal('1.00'))

        low = (estimated * Decimal('0.85')).quantize(Decimal('1.00'))
        high = (estimated * Decimal('1.15')).quantize(Decimal('1.00'))

        result = {
            'estimated_price': estimated,
            'confidence': 'low',
            'comparable_range': {'min': low, 'max': high},
            'note': (
                'This is a rule-based stub estimate. '
                'A trained ML model will replace this once sufficient listing data is collected.'
            ),
        }

        out = PricePredictionOutputSerializer(result)
        return Response(out.data, status=status.HTTP_200_OK)

