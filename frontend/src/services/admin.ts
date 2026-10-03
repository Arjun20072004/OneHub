import { api } from "./api";

export interface AdminUser { id: number; email: string; first_name: string; last_name: string; phone: string; is_active: boolean; date_joined: string; roles: string[]; }
export interface AdminProvider { id: number; business_name: string; business_address: string; city: string; experience: number; description: string; verification_status: "pending" | "approved" | "rejected"; rejection_reason: string; email: string; is_active: boolean; }

export async function getAdminUsers() { return (await api.get<AdminUser[]>("/auth/admin/users/")).data; }
export async function setUserActive(userId: number, isActive: boolean) { return (await api.post<AdminUser>(`/auth/admin/users/${userId}/status/`, { is_active: isActive })).data; }
export async function getAdminProviders() { return (await api.get<AdminProvider[]>("/providers/admin/all/")).data; }
export async function setProviderStatus(
  providerId: number,
  verificationStatus: AdminProvider["verification_status"],
  rejectionReason = "",
) {
  return (
    await api.post<AdminProvider>(
      `/providers/admin/${providerId}/status/`,
      {
        verification_status: verificationStatus,
        rejection_reason: rejectionReason,
      },
    )
  ).data;
}
export interface AdminRestaurant { id: number; name: string; cuisine: string; city: string; rating: string; is_open: boolean; is_active: boolean; provider_email: string; }
export interface AdminOrder { id: number; order_number: string; customer_email: string; provider_name?: string; status: string; total_amount: string; payment_status: string; order_type: string; created_at: string; }
export async function getAdminRestaurants() { return (await api.get<AdminRestaurant[]>("/food/admin/restaurants/")).data; }
export async function getAdminOrders() { return (await api.get<AdminOrder[]>("/orders/admin/")).data; }
