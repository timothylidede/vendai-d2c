// lib/cart-operations.ts
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  image: string;
}

// Save or update cart in Firestore
export const saveCartToFirestore = async (userId: string, cart: CartItem[]) => {
  try {
    const cartRef = doc(db, "carts", userId);
    await setDoc(cartRef, { items: cart }, { merge: true });
  } catch (error) {
    console.error("Error saving cart to Firestore:", error);
    throw error;
  }
};

// Fetch cart from Firestore
export const fetchCartFromFirestore = async (userId: string): Promise<CartItem[]> => {
  try {
    const cartRef = doc(db, "carts", userId);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) {
      return cartSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching cart from Firestore:", error);
    return [];
  }
};

// Clear cart in Firestore
export const clearCartInFirestore = async (userId: string) => {
  try {
    const cartRef = doc(db, "carts", userId);
    await deleteDoc(cartRef);
  } catch (error) {
    console.error("Error clearing cart in Firestore:", error);
    throw error;
  }
};