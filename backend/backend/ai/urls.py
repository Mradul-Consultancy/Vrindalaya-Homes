from django.urls import path

from .views import PricePredictionView

urlpatterns = [
    path('predict/', PricePredictionView.as_view(), name='ai-predict-price'),
]

