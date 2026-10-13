# property/urls.py
from django.urls import path
from .views import (
    PropertyListingCreateView,
    PropertyListingListView,
    PropertyDetailView,
    PropertyContactView,
    MyPropertyListingsView,
    MyPropertyListingDetailView,
    MarkPropertySoldView,
)

urlpatterns = [
    path('sell/', PropertyListingCreateView.as_view(), name='property-sell'),
    path('buy/', PropertyListingListView.as_view(), name='property-buy'),
    path('mine/', MyPropertyListingsView.as_view(), name='my-property-listings'),
    path('mine/<int:id>/', MyPropertyListingDetailView.as_view(), name='my-property-detail'),
    path('mine/<int:id>/sold/', MarkPropertySoldView.as_view(), name='my-property-sold'),
    path('property/<int:id>/', PropertyDetailView.as_view(), name='property-detail'),
    path('property/<int:id>/contact/', PropertyContactView.as_view(), name='property-contact'),
]