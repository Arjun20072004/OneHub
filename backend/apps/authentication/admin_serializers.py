from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone", "is_active", "date_joined", "roles"]
        read_only_fields = ["id", "email", "date_joined", "roles"]

    def get_roles(self, obj):
        return list(obj.user_roles.values_list("role__name", flat=True))
