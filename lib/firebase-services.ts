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
  limit,
  writeBatch,
  startAfter,
} from "firebase/firestore"
import { db } from "./firebase"

import type { ChatSession, Order, CartItem } from "./types"

// Global counters for Firestore operations
let readCount = 0
let writeCount = 0

// Helper to log and increment read count
const logRead = (operation: string, userId?: string, details?: any) => {
  const docCount = details?.docCount || 1
  readCount += docCount
  console.log(`[Firestore] READ: ${operation} ${userId ? `for ${userId}` : ""} (${docCount} docs)`, details || "")
  console.log(`[Firestore] Total Reads: ${readCount}, Total Writes: ${writeCount}`)
}

// Helper to log and increment write count
const logWrite = (operation: string, userId?: string, details?: any) => {
  writeCount++
  console.log(`[Firestore] WRITE: ${operation} ${userId ? `for ${userId}` : ""}`, details || "")
  console.log(`[Firestore] Total Reads: ${readCount}, Total Writes: ${writeCount}`)
}

// User Profile Services
export const userProfileService = {
  async getUserProfile(userId: string) {
    logRead(`userProfile`, userId)
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
    logWrite(`userProfile`, userId, profileData)
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
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateUserProfile. Data not saved to Firestore.")
        localStorage.setItem(`pending-profile-${userId}`, JSON.stringify(profileData))
        return false
      }
      console.error("Error updating user profile:", error)
      return false
    }
  },
}

// User Settings Services
export const userSettingsService = {
  async getUserSettings(userId: string) {
    logRead(`userSettings`, userId)
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
    }
    return null
  },

  async updateUserSettings(userId: string, settings: any) {
    logWrite(`userSettings`, userId, settings)
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
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateUserSettings. Data not saved to Firestore.")
        localStorage.setItem(`pending-settings-${userId}`, JSON.stringify(settings))
        return false
      }
      console.error("Error updating user settings:", error)
      return false
    }
  },
}

// Cart Services - NO REAL-TIME LISTENERS
export const cartService = {
  async getUserCart(userId: string) {
    logRead(`userCart`, userId)
    try {
      const docRef = doc(db, "userCarts", userId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data().items || [] : []
    } catch (error) {
      console.error("Error getting user cart:", error)
      return []
    }
  },

  async updateUserCart(userId: string, cartItems: any[], isUserAction = false) {
    try {
      // Skip write if cart is empty and not a user action
      if (cartItems.length === 0 && !isUserAction) {
        console.log(`[Firestore] Skipping empty cart write for ${userId}`)
        return true
      }
      logWrite(`userCart`, userId, `${cartItems.length} items`)
      const docRef = doc(db, "userCarts", userId)
      const updateData: any = { items: cartItems }
      if (isUserAction) {
        updateData.updatedAt = serverTimestamp()
      }
      await setDoc(docRef, updateData, { merge: true })
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateUserCart. Cart not saved to Firestore.")
        localStorage.setItem(`pending-cart-${userId}`, JSON.stringify(cartItems))
        return false
      }
      console.error("Error updating user cart:", error)
      return false
    }
  },

  async clearUserCart(userId: string) {
    logWrite(`clearUserCart`, userId)
    try {
      const docRef = doc(db, "userCarts", userId)
      await setDoc(docRef, {
        items: [],
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for clearUserCart. Cart not cleared in Firestore.")
        return false
      }
      console.error("Error clearing user cart:", error)
      return false
    }
  },
}

// Product Management Services - REDUCED LIMITS
export const productService = {
  async getUserProducts(userId: string, limitCount = 20) {
    // Reduced from 50 to 20
    logRead(`userProducts`, userId, { docCount: limitCount })
    try {
      const q = query(
        collection(db, "userProducts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      )
      const querySnapshot = await getDocs(q)
      logRead(`userProducts`, userId, { docCount: querySnapshot.docs.length })
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error("Error getting user products:", error)
      return []
    }
  },

  async addUserProduct(userId: string, productData: any) {
    logWrite(`addUserProduct`, userId, productData)
    try {
      const docRef = await addDoc(collection(db, "userProducts"), {
        ...productData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for addUserProduct. Product not added to Firestore.")
        return null
      }
      console.error("Error adding user product:", error)
      return null
    }
  },

  async updateUserProduct(productId: string, updates: any) {
    logWrite(`updateUserProduct`, productId, updates)
    try {
      const docRef = doc(db, "userProducts", productId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateUserProduct. Product not updated in Firestore.")
        return false
      }
      console.error("Error updating user product:", error)
      return false
    }
  },

  async deleteUserProduct(productId: string) {
    logWrite(`deleteUserProduct`, productId)
    try {
      await deleteDoc(doc(db, "userProducts", productId))
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for deleteUserProduct. Product not deleted from Firestore.")
        return false
      }
      console.error("Error deleting user product:", error)
      return false
    }
  },
}

// Chat Sessions Services - REDUCED LIMITS, NO REAL-TIME BY DEFAULT
export const chatService = {
  async getUserChatSessions(userId: string, limitCount = 10): Promise<ChatSession[]> {
    // Reduced from 20 to 10
    logRead(`chatSessions`, userId, { docCount: limitCount })
    try {
      const q = query(
        collection(db, "chatSessions"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc"),
        limit(limitCount),
      )
      const querySnapshot = await getDocs(q)
      logRead(`chatSessions`, userId, { docCount: querySnapshot.docs.length })
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

  async saveChatSession(sessionData: ChatSession, isUserAction = false): Promise<boolean> {
    logWrite(`chatSession`, sessionData.id, `${sessionData.messages.length} messages`)
    try {
      const docRef = doc(db, "chatSessions", sessionData.id)
      await setDoc(docRef, { ...sessionData }, { merge: true })
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for saveChatSession. Chat session not saved to Firestore.")
        localStorage.setItem(`pending-chat-session-${sessionData.id}`, JSON.stringify(sessionData))
        return false
      }
      console.error("Error saving chat session:", error)
      return false
    }
  },

  async deleteChatSession(sessionId: string): Promise<boolean> {
    logWrite(`deleteChatSession`, sessionId)
    try {
      await deleteDoc(doc(db, "chatSessions", sessionId))
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for deleteChatSession. Chat session not deleted from Firestore.")
        return false
      }
      console.error("Error deleting chat session:", error)
      return false
    }
  },
}

// Orders Services - REDUCED LIMITS, PAGINATION SUPPORT
export const orderService = {
  async getUserOrders(userId: string, lastDoc?: any, limitCount = 10): Promise<{ orders: Order[]; lastDoc?: any }> {
    // Reduced from 20 to 10, added pagination
    logRead(`orders`, userId, { docCount: limitCount })
    try {
      let q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      )

      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      const querySnapshot = await getDocs(q)
      logRead(`orders`, userId, { docCount: querySnapshot.docs.length })

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

      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
      return { orders, lastDoc: newLastDoc }
    } catch (error) {
      console.error("Error getting user orders:", error)
      return { orders: [], lastDoc: undefined }
    }
  },

  async createOrder(orderData: any): Promise<string | null> {
    logWrite(`createOrder`, orderData.userId, orderData)
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for createOrder. Order not created in Firestore.")
        localStorage.setItem(`pending-order-${orderData.userId}-${Date.now()}`, JSON.stringify(orderData))
        return null
      }
      console.error("Error creating order:", error)
      return null
    }
  },

  async updateOrderStatus(orderId: string, status: string, updates: any = {}): Promise<boolean> {
    logWrite(`updateOrderStatus`, orderId, { status, ...updates })
    try {
      const docRef = doc(db, "orders", orderId)
      await updateDoc(docRef, {
        status,
        ...updates,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateOrderStatus. Order status not updated in Firestore.")
        return false
      }
      console.error("Error updating order status:", error)
      return false
    }
  },

  async createOrderAndClearCartBatch(userId: string, orderData: any): Promise<string | null> {
    logWrite(`createOrderAndClearCartBatch`, userId, { orderData })
    const batch = writeBatch(db)
    try {
      const orderRef = doc(collection(db, "orders"))
      batch.set(orderRef, {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const cartRef = doc(db, "userCarts", userId)
      batch.set(cartRef, {
        items: [],
        updatedAt: serverTimestamp(),
      })

      await batch.commit()
      return orderRef.id
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error(
          "[Firestore] Quota exceeded for createOrderAndClearCartBatch. Order and cart not updated in Firestore.",
        )
        localStorage.setItem(
          `pending-batch-checkout-${userId}-${Date.now()}`,
          JSON.stringify({ orderData, cartCleared: true }),
        )
        return null
      }
      console.error("Error creating order and clearing cart in batch:", error)
      return null
    }
  },
}

// User Preferences Services
export const userPreferencesService = {
  async getUserPreferences(userId: string) {
    logRead(`userPreferences`, userId)
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
    logWrite(`userPreferences`, userId, preferences)
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
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateUserPreferences. Preferences not saved to Firestore.")
        localStorage.setItem(`pending-preferences-${userId}`, JSON.stringify(preferences))
        return false
      }
      console.error("Error updating user preferences:", error)
      return false
    }
  },

  async addToSearchHistory(userId: string, searchTerm: string) {
    // Don't log this as a write since it's just updating search history
    try {
      const preferences = await this.getUserPreferences(userId)
      const searchHistory = preferences?.searchHistory || []

      const updatedHistory = [searchTerm, ...searchHistory.filter((term: string) => term !== searchTerm)].slice(0, 50)

      await this.updateUserPreferences(userId, {
        ...preferences,
        searchHistory: updatedHistory,
      })
      return true
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for addToSearchHistory. Search history not updated in Firestore.")
        return false
      }
      console.error("Error adding to search history:", error)
      return false
    }
  },
}

// MINIMAL Real-time listeners - ONLY for critical updates
export const realtimeService = {
  // ONE-TIME QUERIES INSTEAD OF REAL-TIME
  async getUserCartOnce(userId: string): Promise<CartItem[]> {
    return cartService.getUserCart(userId)
  },

  async getUserOrdersOnce(userId: string, lastDoc?: any): Promise<{ orders: Order[]; lastDoc?: any }> {
    return orderService.getUserOrders(userId, lastDoc)
  },

  async getUserChatSessionsOnce(userId: string): Promise<ChatSession[]> {
    return chatService.getUserChatSessions(userId)
  },

  // ONLY keep real-time listener for chat sessions when actively chatting
  subscribeToActiveChatSession(sessionId: string, callback: (session: ChatSession | null) => void) {
    console.log(`[Firestore] Subscribing to ACTIVE chat session: ${sessionId}`)
    const docRef = doc(db, "chatSessions", sessionId)
    return onSnapshot(
      docRef,
      (doc) => {
        logRead(`onSnapshot: active chat session`, sessionId)
        if (doc.exists()) {
          const data = doc.data()
          callback({
            id: doc.id,
            userId: data.userId,
            title: data.title || "New Chat",
            messages: data.messages || [],
            isActive: data.isActive || false,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
            date: data.date || data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          } as ChatSession)
        } else {
          callback(null)
        }
      },
      (error) => {
        console.error("[Firestore] Error in active chat session onSnapshot:", error)
        if (error.code === "resource-exhausted") {
          console.error("[Firestore] Quota exceeded for active chat session onSnapshot.")
        }
      },
    )
  },
}
