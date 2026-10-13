from django.contrib import admin
from .models import PropertyImage, PropertyListing


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0

@admin.register(PropertyListing)
class PropertyListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'property_type', 'price', 'seller_name', 'status', 'created_at')
    search_fields = ('title', 'city', 'seller_name')
    list_filter = ('status', 'property_type', 'city', 'seller_type')
    list_editable = ('status',)
    inlines = [PropertyImageInline]