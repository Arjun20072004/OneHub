import { api } from "./api";

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  rating: string;
  delivery_minutes: number;
  price_for_two: string;
  is_open: boolean;
  vegetarian_available: boolean;
}

export interface MenuItemVariant {
  id: number;
  name: string;
  price_delta: string;
  is_available: boolean;
}

export interface MenuItemAddon {
  id: number;
  name: string;
  price: string;
  is_available: boolean;
}

export interface MenuItem {
  id: number;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  preparation_minutes: number;
  is_vegetarian: boolean;
  is_available: boolean;
  variants: MenuItemVariant[];
  addons: MenuItemAddon[];
}

export interface RestaurantDetail extends Restaurant {
  categories: Array<{ id: number; name: string; sort_order: number; items: MenuItem[] }>;
}

export async function getRestaurants(search = ""): Promise<Restaurant[]> {
  const response = await api.get<Restaurant[]>("/food/restaurants/", { params: search ? { search } : undefined });
  return response.data;
}

export async function getRestaurant(id: number): Promise<RestaurantDetail> {
  const response = await api.get<RestaurantDetail>(`/food/restaurants/${id}/`);
  return response.data;
}
