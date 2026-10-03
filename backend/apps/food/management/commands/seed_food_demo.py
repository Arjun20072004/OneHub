from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.users.models import ProviderProfile, Role, User, UserRole

from ...models import MenuCategory, MenuItem, MenuItemAddon, MenuItemVariant, Restaurant


RESTAURANTS = [
    ("spice-route-kitchen", "Spice Route Kitchen", "Biryani, Chinese, Kebabs", "Popular biryani and wok favourites prepared fresh.", Decimal("4.7"), 35, Decimal("450")),
    ("bawarchi", "Bawarchi", "Biryani, North Indian", "Classic Hyderabad biryani and family meals.", Decimal("4.5"), 30, Decimal("300")),
    ("chutneys", "Chutneys", "South Indian, Breakfast", "South Indian breakfast, thalis and fresh chutneys.", Decimal("4.6"), 25, Decimal("350")),
]

MENU = {
    "spice-route-kitchen": [
        ("Biryani", "Chicken Dum Biryani", "Aromatic basmati rice, tender chicken and saffron spices", Decimal("289"), False, [("Regular", Decimal("0")), ("Large", Decimal("100"))], [("Raita", Decimal("30")), ("Extra Egg", Decimal("20"))]),
        ("Biryani", "Mutton Biryani", "Slow-cooked mutton with fragrant long-grain rice", Decimal("369"), False, [("Regular", Decimal("0")), ("Large", Decimal("120"))], [("Raita", Decimal("30"))]),
        ("Starters", "Paneer Tikka", "Charred cottage cheese, peppers and mint chutney", Decimal("249"), True, [], [("Extra Mint Chutney", Decimal("20"))]),
        ("Chinese", "Dragon Chicken", "Crispy chicken tossed in a hot garlic chilli sauce", Decimal("279"), False, [], [("Coke", Decimal("50"))]),
        ("Chinese", "Veg Hakka Noodles", "Wok-tossed noodles with seasonal vegetables", Decimal("199"), True, [], [("Add Paneer", Decimal("60"))]),
        ("Desserts", "Gulab Jamun", "Warm syrup-soaked dumplings, two pieces", Decimal("99"), True, [], []),
    ],
    "bawarchi": [("Biryani", "Chicken Biryani", "Hyderabadi dum biryani", Decimal("299"), False, [], [("Raita", Decimal("25"))])],
    "chutneys": [("Breakfast", "Ghee Podi Idli", "Soft idlis with podi and ghee", Decimal("180"), True, [], [("Filter Coffee", Decimal("60"))])],
}


class Command(BaseCommand):
    help = "Seed repeatable OneHub food restaurants, menus, variants and add-ons."

    @transaction.atomic
    def handle(self, *args, **options):
        provider_role, _ = Role.objects.get_or_create(name=Role.RoleType.PROVIDER)
        for slug, name, cuisine, description, rating, minutes, price_for_two in RESTAURANTS:
            email = f"demo.{slug}@onehub.local"
            user, created = User.objects.get_or_create(email=email, defaults={"username": slug, "first_name": name})
            if created:
                user.set_unusable_password()
                user.save(update_fields=["password"])
            UserRole.objects.get_or_create(user=user, role=provider_role)
            provider, _ = ProviderProfile.objects.get_or_create(user=user, defaults={"business_name": name, "business_address": "Gachibowli, Hyderabad", "city": "Hyderabad", "verification_status": "approved", "description": description})
            provider.verification_status = "approved"
            provider.save(update_fields=["verification_status"])
            restaurant, _ = Restaurant.objects.update_or_create(provider=provider, defaults={"name": name, "description": description, "cuisine": cuisine, "address": "Gachibowli, Hyderabad", "city": "Hyderabad", "rating": rating, "delivery_minutes": minutes, "price_for_two": price_for_two, "is_active": True, "is_open": True, "vegetarian_available": True})
            for category_name, item_name, item_description, price, vegetarian, variants, addons in MENU[slug]:
                category, _ = MenuCategory.objects.get_or_create(restaurant=restaurant, name=category_name)
                item, _ = MenuItem.objects.update_or_create(category=category, name=item_name, defaults={"description": item_description, "price": price, "is_vegetarian": vegetarian, "is_available": True})
                for variant_name, delta in variants:
                    MenuItemVariant.objects.update_or_create(menu_item=item, name=variant_name, defaults={"price_delta": delta, "is_available": True})
                for addon_name, addon_price in addons:
                    MenuItemAddon.objects.update_or_create(menu_item=item, name=addon_name, defaults={"price": addon_price, "is_available": True})
            self.stdout.write(self.style.SUCCESS(f"Seeded {name}"))
