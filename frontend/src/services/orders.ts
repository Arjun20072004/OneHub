import { api } from "./api";
import type { CreateOrderInput, Order } from "../types/order";

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await api.post<Order>("/orders/", input);
  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/");
  return response.data;
}

export async function getOrder(orderId: number): Promise<Order> {
  const response = await api.get<Order>(`/orders/${orderId}/`);
  return response.data;
}

export async function cancelOrder(orderId: number): Promise<Order> {
  const response = await api.post<Order>(`/orders/${orderId}/cancel/`);
  return response.data;
}

export async function getProviderOrders(): Promise<Order[]> {
  const response = await api.get<Order[]>("/orders/provider/");
  return response.data;
}

export async function updateProviderOrder(orderId: number, action: "accept" | "reject" | "status", status?: string): Promise<Order> {
  const response = await api.post<Order>(`/orders/provider/${orderId}/${action}/`, status ? { status } : {});
  return response.data;
}
