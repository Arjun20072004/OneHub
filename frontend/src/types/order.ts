export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected";

export interface OrderItemInput {
  item_name?: string;
  menu_item?: number;
  quantity: number;
  unit_price?: string;
  variant_id?: number;
  addon_ids?: number[];
}

export interface CreateOrderInput {
  order_type: "shopping" | "food" | "service" | "booking";
  delivery_address: string;
  contact_phone: string;
  payment_method: "cash" | "online";
  items: OrderItemInput[];
}

export interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  provider: number | null;
  provider_name?: string;
  order_type: string;
  status: OrderStatus;
  total_amount: string;
  delivery_address: string;
  contact_phone: string;
  payment_method: string;
  payment_status: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}
