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
} from "firebase/firestore";
import { db } from "./firebase";
import type { ChatSession, Order, CartItem } from "./types";

// Global counters for Firestore operations
let readCount = 0;
let writeCount = 0;

// In-memory cache to reduce reads
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = {
  userProfile: 5 * 60 * 1000, // 5 minutes
  userSettings: 10 * 60 * 1000, // 10 minutes
  userPreferences: 10 * 60 * 1000, // 10 minutes
  products: 2 * 60 * 1000, // 2 minutes
};

// Cache helpers
const getCacheKey = (collection: string, id: string) => `${collection}:${id}`;

const setCache = (key: string, data: any, ttl: number) => {
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

const getCache = (key: string) => {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

const clearCache = (key: string) => {
  cache.delete(key);
};

// Helper to log and increment read count
const logRead = (operation: string, userId?: string, details?: any) => {
  const docCount = details?.docCount || 1;
  readCount += docCount;
  console.log(`[Firestore] READ: ${operation} ${userId ? `for ${userId}` : ""} (${docCount} docs)`, details || "");
  console.log(`[Firestore] Total Reads: ${readCount}, Total Writes: ${writeCount}`);
};

// Helper to log and increment write count
const logWrite = (operation: string, userId?: string, details?: any) => {
  writeCount++;
  console.log(`[Firestore] WRITE: ${operation} ${userId ? `for ${userId}` : ""}`, details || "");
  console.log(`[Firestore] Total Reads: ${readCount}, Total Writes: ${writeCount}`);
};

// Debounced write helper with stronger change detection
const debounceMap = new Map<string, NodeJS.Timeout>();

const debounceWrite = (key: string, writeFunction: () => Promise<void>, delay: number = 2000) => {
  if (debounceMap.has(key)) {
    clearTimeout(debounceMap.get(key)!);
  }

  const timeoutId = setTimeout(async () => {
    await writeFunction();
    debounceMap.delete(key);
  }, delay);

  debounceMap.set(key, timeoutId);
};

// User Profile Services
export const userProfileService = {
  async getUserProfile(userId: string) {
    const cacheKey = getCacheKey("userProfile", userId);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[Cache] Hit for userProfile: ${userId}`);
      return cached;
    }

    logRead(`userProfile`, userId);
    try {
      const docRef = doc(db, "userProfiles", userId);
      const docSnap = await getDoc(docRef);
      const data = docSnap.exists() ? docSnap.data() : null;

      if (data) {
        setCache(cacheKey, data, CACHE_TTL.userProfile);
      }

      return data;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  },

  async updateUserProfile(userId: string, profileData: any) {
    const cacheKey = getCacheKey("userProfile", userId);
    clearCache(cacheKey);

    // Update cache immediately for better UX
    setCache(cacheKey, profileData, CACHE_TTL.userProfile);

    // Debounce the write to avoid multiple rapid updates
    debounceWrite(`userProfile:${userId}`, async () => {
      logWrite(`userProfile`, userId, profileData);
      try {
        const docRef = doc(db, "userProfiles", userId);
        await setDoc(
          docRef,
          {
            ...profileData,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error: any) {
        if (error.code === "resource-exhausted") {
          console.error("[Firestore] Quota exceeded for updateUserProfile. Data not saved to Firestore.");
          localStorage.setItem(`pending-profile-${userId}`, JSON.stringify(profileData));
        } else {
          console.error("Error updating user profile:", error);
        }
      }
    });

    return true;
  },
};

// User Settings Services
export const userSettingsService = {
  async getUserSettings(userId: string) {
    const cacheKey = getCacheKey("userSettings", userId);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[Cache] Hit for userSettings: ${userId}`);
      return cached;
    }

    logRead(`userSettings`, userId);
    try {
      const docRef = doc(db, "userSettings", userId);
      const docSnap = await getDoc(docRef);
      const data = docSnap.exists()
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
          };

      setCache(cacheKey, data, CACHE_TTL.userSettings);
      return data;
    } catch (error) {
      console.error("Error getting user settings:", error);
      return null;
    }
  },

  async updateUserSettings(userId: string, settings: any) {
    const cacheKey = getCacheKey("userSettings", userId);
    clearCache(cacheKey);
    setCache(cacheKey, settings, CACHE_TTL.userSettings);

    debounceWrite(`userSettings:${userId}`, async () => {
      logWrite(`userSettings`, userId, settings);
      try {
        const docRef = doc(db, "userSettings", userId);
        await setDoc(
          docRef,
          {
            ...settings,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error: any) {
        if (error.code === "resource-exhausted") {
          console.error("[Firestore] Quota exceeded for updateUserSettings. Data not saved to Firestore.");
          localStorage.setItem(`pending-settings-${userId}`, JSON.stringify(settings));
        } else {
          console.error("Error updating user settings:", error);
        }
      }
    });

    return true;
  },
};

// Cart Services - Optimized with local state management and change detection
export const cartService = {
  // Local cart state to avoid frequent reads
  localCart: new Map<string, CartItem[]>(),
  // Track subscribers to prevent multiple listeners
  subscribers: new Map<string, ((items: CartItem[]) => void)[]>(),

  async getUserCart(userId: string) {
    // Check local cart first
    if (this.localCart.has(userId)) {
      console.log(`[Local] Cart hit for ${userId}`);
      return this.localCart.get(userId) || [];
    }

    logRead(`userCart`, userId);
    try {
      const docRef = doc(db, "userCarts", userId);
      const docSnap = await getDoc(docRef);
      const items = docSnap.exists() ? docSnap.data().items || [] : [];

      // Store in local cache
      this.localCart.set(userId, items);

      // Notify subscribers (in case subscription was set up first)
      const callbacks = this.subscribers.get(userId) || [];
      callbacks.forEach((callback) => callback(items));

      return items;
    } catch (error) {
      console.error("Error getting user cart:", error);
      return [];
    }
  },

  async updateUserCart(userId: string, cartItems: CartItem[], isUserAction = false) {
    // Get current local cart for comparison
    const currentCart = this.localCart.get(userId) || [];

    // Deep comparison to prevent redundant writes
    if (JSON.stringify(currentCart) === JSON.stringify(cartItems)) {
      console.log(`[Firestore] Skipping redundant cart write for ${userId}`);
      return true;
    }

    // Update local cart immediately
    this.localCart.set(userId, cartItems);

    // Notify subscribers
    const callbacks = this.subscribers.get(userId) || [];
    callbacks.forEach((callback) => callback(cartItems));

    // Skip Firestore write for empty cart unless it's a user action
    if (!isUserAction && cartItems.length === 0) {
      console.log(`[Firestore] Skipping empty cart write for ${userId}`);
      return true;
    }

    // Debounce cart writes to avoid excessive writes
    debounceWrite(
      `userCart:${userId}`,
      async () => {
        logWrite(`userCart`, userId, `${cartItems.length} items`);
        try {
          const docRef = doc(db, "userCarts", userId);
          const updateData: any = { items: cartItems };
          if (isUserAction) {
            updateData.updatedAt = serverTimestamp();
          }
          await setDoc(docRef, updateData, { merge: true });
        } catch (error: any) {
          if (error.code === "resource-exhausted") {
            console.error("[Firestore] Quota exceeded for updateUserCart. Cart not saved to Firestore.");
            localStorage.setItem(`pending-cart-${userId}`, JSON.stringify(cartItems));
          } else {
            console.error("Error updating user cart:", error);
          }
        }
      },
      1000 // 1-second debounce for cart updates
    );

    return true;
  },

  async clearUserCart(userId: string) {
    this.localCart.delete(userId);

    // Notify subscribers
    const callbacks = this.subscribers.get(userId) || [];
    callbacks.forEach((callback) => callback([]));

    logWrite(`clearUserCart`, userId);
    try {
      const docRef = doc(db, "userCarts", userId);
      await setDoc(docRef, {
        items: [],
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for clearUserCart. Cart not cleared in Firestore.");
        return false;
      }
      console.error("Error clearing user cart:", error);
      return false;
    }
  },
};

// Product Management Services - Cached with pagination
export const productService = {
  async getUserProducts(userId: string, limitCount = 10, useCache = true) {
    const cacheKey = getCacheKey("userProducts", userId);

    if (useCache) {
      const cached = getCache(cacheKey);
      if (cached) {
        console.log(`[Cache] Hit for userProducts: ${userId}`);
        return cached;
      }
    }

    logRead(`userProducts`, userId, { docCount: limitCount });
    try {
      const q = query(
        collection(db, "userProducts"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Cache the results
      setCache(cacheKey, products, CACHE_TTL.products);

      return products;
    } catch (error) {
      console.error("Error getting user products:", error);
      return [];
    }
  },

  async addUserProduct(userId: string, productData: any) {
    // Clear cache when adding new product
    clearCache(getCacheKey("userProducts", userId));

    logWrite(`addUserProduct`, userId, productData);
    try {
      const docRef = await addDoc(collection(db, "userProducts"), {
        ...productData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for addUserProduct. Product not added to Firestore.");
        return null;
      }
      console.error("Error adding user product:", error);
      return null;
    }
  },

  async updateUserProduct(productId: string, updates: any) {
    logWrite(`updateUserProduct`, productId, updates);
    try {
      const docRef = doc(db, "userProducts", productId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateUserProduct. Product not updated in Firestore.");
        return false;
      }
      console.error("Error updating user product:", error);
      return false;
    }
  },

  async deleteUserProduct(productId: string) {
    logWrite(`deleteUserProduct`, productId);
    try {
      await deleteDoc(doc(db, "userProducts", productId));
      return true;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for deleteUserProduct. Product not deleted from Firestore.");
        return false;
      }
      console.error("Error deleting user product:", error);
      return false;
    }
  },
};

// Chat Sessions Services - Optimized with local state
export const chatService = {
  // Local cache for chat sessions
  localSessions: new Map<string, ChatSession[]>(),

  async getUserChatSessions(userId: string, limitCount = 5, useCache = true): Promise<ChatSession[]> {
    if (useCache && this.localSessions.has(userId)) {
      console.log(`[Local] Chat sessions hit for ${userId}`);
      return this.localSessions.get(userId) || [];
    }

    logRead(`chatSessions`, userId, { docCount: limitCount });
    try {
      const q = query(
        collection(db, "chatSessions"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const sessions = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || userId,
          title: data.title || "New Chat",
          messages: data.messages || [],
          isActive: data.isActive || false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          date: data.date || data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        } as ChatSession;
      });

      // Cache locally
      this.localSessions.set(userId, sessions);

      return sessions;
    } catch (error) {
      console.error("Error getting chat sessions:", error);
      return [];
    }
  },

  async saveChatSession(sessionData: ChatSession, isUserAction = false): Promise<boolean> {
    // Update local cache immediately
    const sessions = this.localSessions.get(sessionData.userId) || [];
    const existingIndex = sessions.findIndex((s) => s.id === sessionData.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData;
    } else {
      sessions.unshift(sessionData);
    }

    this.localSessions.set(sessionData.userId, sessions);

    // Debounce saves to avoid excessive writes during typing
    debounceWrite(
      `chatSession:${sessionData.id}`,
      async () => {
        logWrite(`chatSession`, sessionData.id, `${sessionData.messages.length} messages`);
        try {
          const docRef = doc(db, "chatSessions", sessionData.id);
          await setDoc(docRef, { ...sessionData }, { merge: true });
        } catch (error: any) {
          if (error.code === "resource-exhausted") {
            console.error("[Firestore] Quota exceeded for saveChatSession. Chat session not saved to Firestore.");
            localStorage.setItem(`pending-chat-session-${sessionData.id}`, JSON.stringify(sessionData));
          } else {
            console.error("Error saving chat session:", error);
          }
        }
      },
      3000 // Longer debounce for chat sessions
    );

    return true;
  },

  async deleteChatSession(sessionId: string): Promise<boolean> {
    // Remove from local cache
    for (const [userId, sessions] of this.localSessions.entries()) {
      const filtered = sessions.filter((s) => s.id !== sessionId);
      this.localSessions.set(userId, filtered);
    }

    logWrite(`deleteChatSession`, sessionId);
    try {
      await deleteDoc(doc(db, "chatSessions", sessionId));
      return true;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for deleteChatSession. Chat session not deleted from Firestore.");
        return false;
      }
      console.error("Error deleting chat session:", error);
      return false;
    }
  },
};

// Orders Services - Cached with pagination
export const orderService = {
  // Local cache for orders
  localOrders: new Map<string, { orders: Order[]; hasMore: boolean }>(),

  async getUserOrders(userId: string, lastDoc?: any, limitCount = 5, useCache = true): Promise<{ orders: Order[]; lastDoc?: any }> {
    // Only use cache for first page
    if (useCache && !lastDoc && this.localOrders.has(userId)) {
      console.log(`[Local] Orders hit for ${userId}`);
      const cached = this.localOrders.get(userId)!;
      return { orders: cached.orders, lastDoc: undefined };
    }

    logRead(`orders`, userId, { docCount: limitCount });
    try {
      let q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map((doc) => {
        const data = doc.data();
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
        } as Order;
      });

      // Cache first page only
      if (!lastDoc) {
        this.localOrders.set(userId, { orders, hasMore: orders.length === limitCount });
      }

      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { orders, lastDoc: newLastDoc };
    } catch (error) {
      console.error("Error getting user orders:", error);
      return { orders: [], lastDoc: undefined };
    }
  },

  async createOrder(orderData: any): Promise<string | null> {
    // Clear orders cache when creating new order
    this.localOrders.delete(orderData.userId);

    logWrite(`createOrder`, orderData.userId, orderData);
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for createOrder. Order not created in Firestore.");
        localStorage.setItem(`pending-order-${orderData.userId}-${Date.now()}`, JSON.stringify(orderData));
        return null;
      }
      console.error("Error creating order:", error);
      return null;
    }
  },

  async updateOrderStatus(orderId: string, status: string, updates: any = {}): Promise<boolean> {
    logWrite(`updateOrderStatus`, orderId, { status, ...updates });
    try {
      const docRef = doc(db, "orders", orderId);
      await updateDoc(docRef, {
        status,
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for updateOrderStatus. Order status not updated in Firestore.");
        return false;
      }
      console.error("Error updating order status:", error);
      return false;
    }
  },

  async createOrderAndClearCartBatch(userId: string, orderData: any): Promise<string | null> {
    // Clear local caches
    this.localOrders.delete(userId);
    cartService.localCart.delete(userId);

    // Notify subscribers of cart clear
    const callbacks = cartService.subscribers.get(userId) || [];
    callbacks.forEach((callback) => callback([]));

    logWrite(`createOrderAndClearCartBatch`, userId, { orderData });
    const batch = writeBatch(db);
    try {
      const orderRef = doc(collection(db, "orders"));
      batch.set(orderRef, {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const cartRef = doc(db, "userCarts", userId);
      batch.set(cartRef, {
        items: [],
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
      return orderRef.id;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error(
          "[Firestore] Quota exceeded for createOrderAndClearCartBatch. Order and cart not updated in Firestore."
        );
        localStorage.setItem(
          `pending-batch-checkout-${userId}-${Date.now()}`,
          JSON.stringify({ orderData, cartCleared: true })
        );
        return null;
      }
      console.error("Error creating order and clearing cart in batch:", error);
      return null;
    }
  },
};

// User Preferences Services - Cached and optimized
export const userPreferencesService = {
  async getUserPreferences(userId: string) {
    const cacheKey = getCacheKey("userPreferences", userId);
    const cached = getCache(cacheKey);
    if (cached) {
      console.log(`[Cache] Hit for userPreferences: ${userId}`);
      return cached;
    }

    logRead(`userPreferences`, userId);
    try {
      const docRef = doc(db, "userPreferences", userId);
      const docSnap = await getDoc(docRef);
      const data = docSnap.exists()
        ? docSnap.data()
        : {
            preferredBrands: [],
            commonPurchases: [],
            priceRange: "medium",
            location: "",
            searchHistory: [],
            favoriteProducts: [],
          };

      setCache(cacheKey, data, CACHE_TTL.userPreferences);
      return data;
    } catch (error) {
      console.error("Error getting user preferences:", error);
      return null;
    }
  },

  async updateUserPreferences(userId: string, preferences: any) {
    const cacheKey = getCacheKey("userPreferences", userId);
    clearCache(cacheKey);
    setCache(cacheKey, preferences, CACHE_TTL.userPreferences);

    debounceWrite(`userPreferences:${userId}`, async () => {
      logWrite(`userPreferences`, userId, preferences);
      try {
        const docRef = doc(db, "userPreferences", userId);
        await setDoc(
          docRef,
          {
            ...preferences,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error: any) {
        if (error.code === "resource-exhausted") {
          console.error("[Firestore] Quota exceeded for updateUserPreferences. Preferences not saved to Firestore.");
          localStorage.setItem(`pending-preferences-${userId}`, JSON.stringify(preferences));
        } else {
          console.error("Error updating user preferences:", error);
        }
      }
    });

    return true;
  },

  async addToSearchHistory(userId: string, searchTerm: string) {
    try {
      const preferences = await this.getUserPreferences(userId);
      const searchHistory = preferences?.searchHistory || [];

      const updatedHistory = [searchTerm, ...searchHistory.filter((term: string) => term !== searchTerm)].slice(0, 50);

      await this.updateUserPreferences(userId, {
        ...preferences,
        searchHistory: updatedHistory,
      });
      return true;
    } catch (error: any) {
      if (error.code === "resource-exhausted") {
        console.error("[Firestore] Quota exceeded for addToSearchHistory. Search history not updated in Firestore.");
        return false;
      }
      console.error("Error adding to search history:", error);
      return false;
    }
  },
};

// Optimized Real-time service
export const realtimeService = {
  async getUserCartOnce(userId: string): Promise<CartItem[]> {
    return cartService.getUserCart(userId);
  },

  async getUserOrdersOnce(userId: string, lastDoc?: any): Promise<{ orders: Order[]; lastDoc?: any }> {
    return orderService.getUserOrders(userId, lastDoc);
  },

  async getUserChatSessionsOnce(userId: string): Promise<ChatSession[]> {
    return chatService.getUserChatSessions(userId);
  },

  subscribeToActiveChatSession(sessionId: string, callback: (session: ChatSession | null) => void) {
    console.log(`[Firestore] Subscribing to ACTIVE chat session: ${sessionId}`);
    const docRef = doc(db, "chatSessions", sessionId);
    return onSnapshot(
      docRef,
      (doc) => {
        logRead(`onSnapshot: active chat session`, sessionId);
        if (doc.exists()) {
          const data = doc.data();
          callback({
            id: doc.id,
            userId: data.userId,
            title: data.title || "New Chat",
            messages: data.messages || [],
            isActive: data.isActive || false,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
            date: data.date || data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
          } as ChatSession);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("[Firestore] Error in active chat session onSnapshot:", error);
        if (error.code === "resource-exhausted") {
          console.error("[Firestore] Quota exceeded for active chat session onSnapshot.");
        }
      }
    );
  },

  // NEW: Subscribe to user cart with single listener
  subscribeToUserCart(userId: string, callback: (items: CartItem[]) => void) {
    // Check if already subscribed
    const existingCallbacks = cartService.subscribers.get(userId) || [];
    if (existingCallbacks.includes(callback)) {
      console.log(`[Firestore] Already subscribed to user cart: ${userId}`);
      return () => {}; // Return empty unsubscribe function
    }

    // Add callback to subscribers
    cartService.subscribers.set(userId, [...existingCallbacks, callback]);

    // If this is the first subscriber, set up the listener
    if (cartService.subscribers.get(userId)!.length === 1) {
      console.log(`[Firestore] Subscribing to user cart: ${userId}`);
      const docRef = doc(db, "userCarts", userId);
      return onSnapshot(
        docRef,
        (doc) => {
          logRead(`onSnapshot: userCart`, userId);
          const items = doc.exists() ? doc.data().items || [] : [];
          // Update local cart cache
          cartService.localCart.set(userId, items);
          // Notify all subscribers
          const callbacks = cartService.subscribers.get(userId) || [];
          callbacks.forEach((cb) => cb(items));
        },
        (error) => {
          console.error("[Firestore] Error in user cart onSnapshot:", error);
          if (error.code === "resource-exhausted") {
            console.error("[Firestore] Quota exceeded for user cart onSnapshot.");
          }
        }
      );
    }

    // Return unsubscribe function
    return () => {
      const callbacks = cartService.subscribers.get(userId) || [];
      const filteredCallbacks = callbacks.filter((cb) => cb !== callback);
      cartService.subscribers.set(userId, filteredCallbacks);

      // If no subscribers remain, the onSnapshot listener will persist until explicitly unsubscribed
      // This is handled by Firebase's internal cleanup when the component unmounts
    };
  },
};

// Utility function to clear all caches
export const clearAllCaches = () => {
  cache.clear();
  cartService.localCart.clear();
  cartService.subscribers.clear();
  chatService.localSessions.clear();
  orderService.localOrders.clear();
  console.log("[Cache] All caches cleared");
};

// Utility function to get cache stats
export const getCacheStats = () => {
  return {
    cacheSize: cache.size,
    localCartSize: cartService.localCart.size,
    localSessionsSize: chatService.localSessions.size,
    localOrdersSize: orderService.localOrders.size,
    cartSubscribersSize: cartService.subscribers.size,
    totalReads: readCount,
    totalWrites: writeCount,
  };
};