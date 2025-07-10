export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "mpesa" | "card" | "cash";
  deliveryAddress: { address: string; location: { lat: number; lng: number }; notes: string };
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string; // Optional to match order-history-modal
  date?: string; // Optional to match order-history-modal
}