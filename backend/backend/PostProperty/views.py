# views.py
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework import status
from rest_framework.generics import CreateAPIView, GenericAPIView, ListAPIView, RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PropertyListing
from .serializers import MyPropertyListingSerializer, PropertyListingSerializer


class PropertyListingCreateView(CreateAPIView):
    queryset = PropertyListing.objects.all()
    serializer_class = PropertyListingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status='Under Review')


class PropertyListingListView(ListAPIView):
    queryset = PropertyListing.objects.filter(status='Active').order_by('-created_at', '-id')
    serializer_class = PropertyListingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        'city': ['iexact'],
        'locality': ['icontains'],
        'property_type': ['exact'],
        'price': ['gte', 'lte'],
        'bedrooms': ['gte', 'lte'],
    }
    ordering_fields = ['created_at', 'price']
    ordering = ['-created_at']


class PropertyDetailView(RetrieveAPIView):
    queryset = PropertyListing.objects.filter(status='Active')
    serializer_class = PropertyListingSerializer
    lookup_field = 'id'


class PropertyContactView(RetrieveAPIView):
    queryset = PropertyListing.objects.filter(status='Active')
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        listing = self.get_object()
        return Response({
            'seller_contact': listing.seller_contact,
            'seller_email': listing.seller_email,
        })


class MyPropertyListingsView(ListAPIView):
    serializer_class = MyPropertyListingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PropertyListing.objects.filter(owner=self.request.user).order_by('-created_at', '-id')


class MyPropertyListingDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = MyPropertyListingSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return PropertyListing.objects.filter(owner=self.request.user)

    def perform_update(self, serializer):
        listing = serializer.instance
        if listing.status == 'Active':
            serializer.save(status='Under Review')
        else:
            serializer.save()


class MarkPropertySoldView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return PropertyListing.objects.filter(owner=self.request.user)

    def post(self, request, *args, **kwargs):
        listing = self.get_object()
        if listing.status != 'Active':
            return Response(
                {'detail': 'Only active listings can be marked as sold.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        listing.status = 'Sold'
        listing.save(update_fields=['status'])
        return Response({'status': listing.status}, status=status.HTTP_200_OK)