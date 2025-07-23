export interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
  image?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled"
  paymentStatus: "pending" | "completed" | "failed" | "paid"
  paymentMethod: string
  deliveryAddress: {
    address: string
    location: { lat: number; lng: number }
    notes: string
  }
  deliveryDate: string
  createdAt: string
  updatedAt: string
  orderNumber?: string
  date: string
  assignedDistributor?: string
  distributorStatus?: "pending" | "assigned" | "accepted" | "preparing" | "shipped" | "delivered"
}

export interface Product {
  id: number
  name: string
  wholesalePrice: number
  category: string
  description: string
  image: string
  stock: number
  unit: string
  brand?: string
  size?: string
  price?: number
  wholesaleQuantity?: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
  image?: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[]
  timestamp?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  messages: ChatMessage[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  date: string
}

export interface UserData {
  uid: string
  name: string | null
  displayName?: string | null
  email: string | null
  phone: string | null
  photoURL: string | null
  provider: string
  address?: string
  city?: string
  area?: string
  role?: "admin" | "distributor" | "customer"
  createdAt: string
  updatedAt: string
}

export interface Distributor {
  id: string
  name: string
  email: string
  phone: string
  address: string
  area: string
  isActive: boolean
  assignedOrders: string[]
  completedOrders: number
  rating: number
  createdAt: string
  updatedAt: string
}

export interface OrderAssignment {
  id: string
  orderId: string
  distributorId: string
  assignedAt: string
  status: "pending" | "accepted" | "rejected" | "completed"
  notes?: string
}

export interface Analytics {
  id: string
  date: string
  totalOrders: number
  totalRevenue: number
  newUsers: number
  activeUsers: number
  completedOrders: number
  cancelledOrders: number
  averageOrderValue: number
  topProducts: { productId: number; name: string; quantity: number }[]
  createdAt: string
}

export interface DashboardMetrics {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  activeDistributors: number
  revenueGrowth: number
  orderGrowth: number
  userGrowth: number
}
