import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot,
  serverTimestamp,
  limit, // Import limit
} from "firebase/firestore"
import { db } from "./firebase"

import type { ChatSession, Order, CartItem } from "./types"

// User Profile Services
export const userProfileService = {
  async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, "userProfiles", userId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data() : null
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  },

  async updateUserProfile(userId: string, profileData: any) {
    try {
      const docRef = doc(db, "userProfiles", userId)
      await setDoc(
        docRef,
        {
          ...profileData,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (error) {
      console.error("Error updating user profile:", error)
      return false
    }
  },
}

// User Settings Services
export const userSettingsService = {
  async getUserSettings(userId: string) {
    try {
      const docRef = doc(db, "userSettings", userId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
        ? docSnap.data()
        : {
            notifications: {
              orderUpdates: true,
              promotions: false,
              deliveryAlerts: true,
              weeklyDeals: true,
            },
            deliveryPreferences: {
              preferredTime: "anytime",
              specialInstructions: "",
            },
            paymentMethods: [],
          }
    } catch (error) {
      console.error("Error getting user settings:", error)
      return null
    }
  },

  async updateUserSettings(userId: string, settings: any) {
    try {
      const docRef = doc(db, "userSettings", userId)
      await setDoc(
        docRef,
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (error) {
      console.error("Error updating user settings:", error)
      return false
    }
  },
}

// Cart Services
export const cartService = {
  async getUserCart(userId: string) {
    try {
      const docRef = doc(db, "userCarts", userId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data().items || [] : []
    } catch (error) {
      console.error("Error getting user cart:", error)
      return []
    }
  },

  async updateUserCart(userId: string, cartItems: any[]) {
    try {
      const docRef = doc(db, "userCarts", userId)
      await setDoc(docRef, {
        items: cartItems,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error updating user cart:", error)
      return false
    }
  },

  async clearUserCart(userId: string) {
    try {
      const docRef = doc(db, "userCarts", userId)
      await setDoc(docRef, {
        items: [],
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error clearing user cart:", error)
      return false
    }
  },
}

// Product Management Services
export const productService = {
  async getUserProducts(userId: string) {
    try {
      const q = query(collection(db, "userProducts"), where("userId", "==", userId), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error("Error getting user products:", error)
      return []
    }
  },

  async addUserProduct(userId: string, productData: any) {
    try {
      const docRef = await addDoc(collection(db, "userProducts"), {
        ...productData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding user product:", error)
      return null
    }
  },

  async updateUserProduct(productId: string, updates: any) {
    try {
      const docRef = doc(db, "userProducts", productId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error updating user product:", error)
      return false
    }
  },

  async deleteUserProduct(productId: string) {
    try {
      await deleteDoc(doc(db, "userProducts", productId))
      return true
    } catch (error) {
      console.error("Error deleting user product:", error)
      return false
    }
  },
}

// Chat Sessions Services (Enhanced)
export const chatService = {
  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    try {
      // Limit to 20 most recent chat sessions for initial load
      const q = query(
        collection(db, "chatSessions"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc"),
        limit(20), // Apply limit here
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId || userId,
          title: data.title || "New Chat",
          messages: data.messages || [],
          isActive: data.isActive || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          date: data.date || data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        } as ChatSession
      })
    } catch (error) {
      console.error("Error getting chat sessions:", error)
      return []
    }
  },

  async saveChatSession(sessionData: ChatSession): Promise<boolean> {
    try {
      const docRef = doc(db, "chatSessions", sessionData.id)
      await setDoc(docRef, {
        ...sessionData,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error saving chat session:", error)
      return false
    }
  },

  async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, "chatSessions", sessionId))
      return true
    } catch (error) {
      console.error("Error deleting chat session:", error)
      return false
    }
  },
}

// Orders Services (Enhanced)
export const orderService = {
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      // Limit to 20 most recent orders for initial load
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20), // Apply limit here
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId || userId,
          items: data.items || [],
          total: data.total || 0,
          status: data.status || "pending",
          paymentStatus: data.paymentStatus || "pending",
          paymentMethod: data.paymentMethod || "mpesa",
          deliveryAddress: data.deliveryAddress || { address: "", location: { lat: 0, lng: 0 }, notes: "" },
          deliveryDate: data.deliveryDate || new Date().toISOString(),
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          orderNumber: data.orderNumber,
          date: data.date || data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        } as Order
      })
    } catch (error) {
      console.error("Error getting user orders:", error)
      return []
    }
  },

  async createOrder(orderData: any): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating order:", error)
      return null
    }
  },

  async updateOrderStatus(orderId: string, status: string, updates: any = {}): Promise<boolean> {
    try {
      const docRef = doc(db, "orders", orderId)
      await updateDoc(docRef, {
        status,
        ...updates,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error) {
      console.error("Error updating order status:", error)
      return false
    }
  },
}

// User Preferences Services
export const userPreferencesService = {
  async getUserPreferences(userId: string) {
    try {
      const docRef = doc(db, "userPreferences", userId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists()
        ? docSnap.data()
        : {
            preferredBrands: [],
            commonPurchases: [],
            priceRange: "medium",
            location: "",
            searchHistory: [],
            favoriteProducts: [],
          }
    } catch (error) {
      console.error("Error getting user preferences:", error)
      return null
    }
  },

  async updateUserPreferences(userId: string, preferences: any) {
    try {
      const docRef = doc(db, "userPreferences", userId)
      await setDoc(
        docRef,
        {
          ...preferences,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return true
    } catch (error) {
      console.error("Error updating user preferences:", error)
      return false
    }
  },

  async addToSearchHistory(userId: string, searchTerm: string) {
    try {
      const preferences = await this.getUserPreferences(userId)
      const searchHistory = preferences?.searchHistory || []

      // Add new search term and keep only last 50
      const updatedHistory = [searchTerm, ...searchHistory.filter((term: string) => term !== searchTerm)].slice(0, 50)

      await this.updateUserPreferences(userId, {
        ...preferences,
        searchHistory: updatedHistory,
      })
      return true
    } catch (error) {
      console.error("Error adding to search history:", error)
      return false
    }
  },
}

// Real-time listeners
export const realtimeService = {
  subscribeToUserCart(userId: string, callback: (cart: CartItem[]) => void) {
    const docRef = doc(db, "userCarts", userId)
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data().items || [])
      } else {
        callback([])
      }
    })
  },

  subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void) {
    // Limit to 20 most recent orders for real-time updates
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(20), // Apply limit here
    )
    return onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId || userId,
          items: data.items || [],
          total: data.total || 0,
          status: data.status || "pending",
          paymentStatus: data.paymentStatus || "pending",
          paymentMethod: data.paymentMethod || "mpesa",
          deliveryAddress: data.deliveryAddress || { address: "", location: { lat: 0, lng: 0 }, notes: "" },
          deliveryDate: data.deliveryDate || new Date().toISOString(),
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          orderNumber: data.orderNumber,
          date: data.date || data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
        } as Order
      })
      callback(orders)
    })
  },

  subscribeToUserChatSessions(userId: string, callback: (sessions: ChatSession[]) => void) {
    // Limit to 20 most recent chat sessions for real-time updates
    const q = query(
      collection(db, "chatSessions"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(20), // Apply limit here
    )
    return onSnapshot(q, (querySnapshot) => {
      const sessions = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId || userId,
          title: data.title || "New Chat",
          messages: data.messages || [],
          isActive: data.isActive || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          date: data.date || data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        } as ChatSession
      })
      callback(sessions)
    })
  },
}
