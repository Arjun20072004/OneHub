export type UserRole =
  | "customer"
  | "provider"
  | "admin"
  | "super_admin";


export interface CustomerProfile {
  id: number;
  address: string;
  city: string;
  date_of_birth: string | null;
  preferences: Record<string, unknown>;
}


export interface ProviderDocument {
  id: number;

  document_type:
    | "business_registration"
    | "identity_proof"
    | "address_proof"
    | "other";

  document_type_display: string;

  document_name: string;

  file: string;

  file_url: string;

  created_at: string;

  updated_at: string;
}


export interface ProviderProfile {
  id: number;

  business_name: string;

  business_address: string;

  city: string;

  verification_status:
    | "pending"
    | "approved"
    | "rejected";

  rejection_reason?: string;

  experience: number;

  description: string;

  email?: string;

  first_name?: string;

  last_name?: string;

  phone?: string;

  avatar_data?: string;

  created_at?: string;

  updated_at?: string;

  documents?: ProviderDocument[];
}


export interface User {
  id: number;

  email: string;

  first_name: string;

  last_name: string;

  phone: string;

  avatar_data: string;

  date_joined: string;

  roles: UserRole[];

  customer_profile:
    | CustomerProfile
    | null;

  provider_profile:
    | ProviderProfile
    | null;
}


export interface LoginResponse {
  access: string;
  refresh: string;
}


export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  account_type?: "customer" | "provider";
  business_name?: string;
}


export interface ProfileUpdateRequest {
  first_name: string;

  last_name: string;

  phone: string;

  avatar_data: string;

  customer_profile?: Pick<
    CustomerProfile,
    "address" |
    "city" |
    "date_of_birth"
  >;
}