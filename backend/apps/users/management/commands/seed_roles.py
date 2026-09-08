from django.core.management.base import BaseCommand

from apps.users.models import Role


class Command(BaseCommand):
    help = "Create the default OneHub application roles."

    def handle(self, *args, **options):
        roles = [
            (
                Role.RoleType.CUSTOMER,
                "Standard OneHub customer.",
            ),
            (
                Role.RoleType.PROVIDER,
                "User who provides one or more services.",
            ),
            (
                Role.RoleType.ADMIN,
                "Platform administrator.",
            ),
            (
                Role.RoleType.SUPER_ADMIN,
                "Full platform administrator.",
            ),
        ]

        for role_name, description in roles:
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={
                    "description": description,
                },
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Created role: {role.get_name_display()}"
                    )
                )
            else:
                self.stdout.write(
                    f"Role already exists: {role.get_name_display()}"
                )