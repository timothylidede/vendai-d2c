import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// User Management
export const createUser = async (userData: any) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export const getUser = async (userId: string) => {
  try {
    const docRef = doc(db, "users", userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export const updateUser = async (userId: string, userData: any) => {
  try {
    const docRef = doc(db, "users", userId)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Products Management
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"))
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting products:", error)
    throw error
  }
}

// Orders Management
export const createOrder = async (orderData: any) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export const getUserOrders = async (userId: string) => {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting user orders:", error)
    throw error
  }
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const docRef = doc(db, "orders", orderId)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

// Chat Sessions Management
export const createChatSession = async (sessionData: any) => {
  try {
    const docRef = await addDoc(collection(db, "chatSessions"), {
      ...sessionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating chat session:", error)
    throw error
  }
}

export const updateChatSession = async (sessionId: string, sessionData: any) => {
  try {
    const docRef = doc(db, "chatSessions", sessionId)
    await updateDoc(docRef, {
      ...sessionData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating chat session:", error)
    throw error
  }
}

export const getUserChatSessions = async (userId: string) => {
  try {
    const q = query(
      collection(db, "chatSessions"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(50),
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting user chat sessions:", error)
    throw error
  }
}

// Payments Management
export const createPayment = async (paymentData: any) => {
  try {
    const docRef = await addDoc(collection(db, "payments"), {
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating payment:", error)
    throw error
  }
}

export const updatePaymentStatus = async (paymentId: string, status: string, transactionData?: any) => {
  try {
    const docRef = doc(db, "payments", paymentId)
    await updateDoc(docRef, {
      status,
      ...(transactionData && { transactionData }),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating payment status:", error)
    throw error
  }
}
