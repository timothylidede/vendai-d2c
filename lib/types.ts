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
  items: OrderItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "failed"
  paymentMethod: "mpesa" | "card" | "cash"
  deliveryAddress: { address: string; location: { lat: number; lng: number }; notes: string }
  deliveryDate: string
  createdAt: string
  updatedAt: string
  orderNumber?: string // Optional to match order-history-modal
  date?: string // Optional to match order-history-modal
}

// Updated Product interface to match data/products.ts
export interface Product {
  id: number
  name: string
  wholesalePrice: number // Required as per data/products.ts
  category: string
  description: string
  image: string
  stock: number // Required as per data/products.ts
  unit: string // Corrected from 'units' and required as per data/products.ts
  brand?: string
  size?: string
  price?: number // Optional as per data/products.ts
  wholesaleQuantity?: number
}

// CartItem now extends Product, inheriting its properties, and ensures price is a number
export interface CartItem extends Product {
  quantity: number
  price: number // Ensure price is always a number for CartItem
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[] // Using the updated Product type
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  messages: Message[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  date: string
}

// New UserData interface with displayName, photoURL, provider, area, and updatedAt
export interface UserData {
  uid: string
  email: string | null
  displayName: string | null // Added displayName
  name?: string
  phone?: string
  address?: string
  city?: string
  area?: string // Added area
  postalCode?: string
  createdAt?: string
  updatedAt?: string // Added updatedAt
  photoURL?: string | null // Added photoURL
  provider?: string // Added provider
  // Add other user-related fields as needed
}
