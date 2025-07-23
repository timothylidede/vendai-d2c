import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  writeBatch,
  getDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Order, UserData, Distributor } from "./types"

export const dashboardService = {
  // Get all orders from Firebase
  async getAllOrders(limitCount = 50): Promise<Order[]> {
    try {
      console.log("[Dashboard] Fetching orders from Firebase...")
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(limitCount))
      const querySnapshot = await getDocs(q)
      const orders = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId || "",
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
          assignedDistributor: data.assignedDistributor,
          distributorStatus: data.distributorStatus,
        } as Order
      })
      console.log(`[Dashboard] Fetched ${orders.length} orders from Firebase`)
      return orders
    } catch (error) {
      console.error("Error getting all orders:", error)
      return []
    }
  },

  // Get all users from Firebase userProfiles collection
  async getAllUsers(limitCount = 100): Promise<UserData[]> {
    try {
      console.log("[Dashboard] Fetching users from Firebase...")
      const q = query(collection(db, "userProfiles"), orderBy("createdAt", "desc"), limit(limitCount))
      const querySnapshot = await getDocs(q)
      const users = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          uid: doc.id,
          name: data.name || data.displayName || null,
          displayName: data.displayName || null,
          email: data.email || null,
          phone: data.phone || null,
          photoURL: data.photoURL || null,
          provider: data.provider || "unknown",
          address: data.address,
          city: data.city,
          area: data.area,
          role: data.role || "customer",
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        } as UserData
      })
      console.log(`[Dashboard] Fetched ${users.length} users from Firebase`)
      return users
    } catch (error) {
      console.error("Error getting all users:", error)
      return []
    }
  },

  // Get dashboard analytics from real Firebase data
  async getDashboardAnalytics() {
    try {
      console.log("[Dashboard] Computing analytics from Firebase data...")
      const [orders, users] = await Promise.all([this.getAllOrders(1000), this.getAllUsers(1000)])
      const totalRevenue = orders
        .filter((order) => order.paymentStatus === "paid")
        .reduce((sum, order) => sum + (order.total || 0), 0)
      const todayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        const today = new Date()
        return orderDate.toDateString() === today.toDateString()
      })
      const thisMonthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        const now = new Date()
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
      })
      const analytics = {
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue,
        todayOrders: todayOrders.length,
        thisMonthOrders: thisMonthOrders.length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        completedOrders: orders.filter((o) => o.status === "completed").length,
        recentOrders: orders.slice(0, 10),
        recentUsers: users.slice(0, 10),
      }
      console.log("[Dashboard] Analytics computed:", {
        totalOrders: analytics.totalOrders,
        totalUsers: analytics.totalUsers,
        totalRevenue: analytics.totalRevenue,
      })
      return analytics
    } catch (error) {
      console.error("Error getting dashboard analytics:", error)
      return {
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        todayOrders: 0,
        thisMonthOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        recentOrders: [],
        recentUsers: [],
      }
    }
  },

  // Set user role in Firebase
  async setUserRole(userId: string, role: "admin" | "distributor" | "customer"): Promise<boolean> {
    try {
      console.log(`[Dashboard] Setting user ${userId} role to ${role}`)
      const userRef = doc(db, "userProfiles", userId)
      // First check if user document exists
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userRef, {
          role,
          updatedAt: serverTimestamp(),
        })
      } else {
        // Create new document with role
        await setDoc(
          userRef,
          {
            role,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      }
      console.log(`[Dashboard] Successfully set user ${userId} role to ${role}`)
      return true
    } catch (error) {
      console.error("Error setting user role:", error)
      return false
    }
  },

  // Assign order to distributor in Firebase
  async assignOrderToDistributor(orderId: string, distributorId: string): Promise<boolean> {
    try {
      console.log(`[Dashboard] Assigning order ${orderId} to distributor ${distributorId}`)
      const batch = writeBatch(db)
      const orderRef = doc(db, "orders", orderId)
      batch.update(orderRef, {
        assignedDistributor: distributorId,
        distributorStatus: "assigned",
        updatedAt: serverTimestamp(),
      })
      await batch.commit()
      console.log(`[Dashboard] Successfully assigned order ${orderId} to distributor ${distributorId}`)
      return true
    } catch (error) {
      console.error("Error assigning order to distributor:", error)
      return false
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const q = query(collection(db, "orders"), where("status", "==", status), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        date: doc.data().date || doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      })) as Order[]
    } catch (error) {
      console.error(`Error getting orders by status ${status}:`, error)
      return []
    }
  },

  // Get users by role
  async getUsersByRole(role: string): Promise<UserData[]> {
    try {
      const q = query(collection(db, "userProfiles"), where("role", "==", role), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
      })) as UserData[]
    } catch (error) {
      console.error(`Error getting users by role ${role}:`, error)
      return []
    }
  },

  // Get all distributors
  async getDistributors(): Promise<Distributor[]> {
    try {
      console.log("[Dashboard] Fetching distributors from Firebase...")
      const q = query(collection(db, "distributors"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const distributors = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          area: data.area || "",
          isActive: data.isActive || true,
          assignedOrders: data.assignedOrders || [],
          completedOrders: data.completedOrders || 0,
          rating: data.rating || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        } as Distributor
      })

      console.log(`[Dashboard] Fetched ${distributors.length} distributors from Firebase`)
      return distributors
    } catch (error) {
      console.error("Error getting distributors:", error)
      return []
    }
  },

  // Add new distributor
  async addDistributor(distributorData: Partial<Distributor>): Promise<boolean> {
    try {
      console.log("[Dashboard] Adding new distributor...")
      const distributorRef = doc(collection(db, "distributors"))
      await setDoc(distributorRef, {
        ...distributorData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Also set user role to distributor if email exists
      if (distributorData.email) {
        const usersQuery = query(collection(db, "userProfiles"), where("email", "==", distributorData.email))
        const userSnapshot = await getDocs(usersQuery)
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0]
          await updateDoc(doc(db, "userProfiles", userDoc.id), {
            role: "distributor",
            updatedAt: serverTimestamp(),
          })
        }
      }

      console.log("[Dashboard] Successfully added distributor")
      return true
    } catch (error) {
      console.error("Error adding distributor:", error)
      return false
    }
  },

  // Update distributor
  async updateDistributor(distributorId: string, updates: Partial<Distributor>): Promise<boolean> {
    try {
      console.log(`[Dashboard] Updating distributor ${distributorId}`)
      const distributorRef = doc(db, "distributors", distributorId)

      await updateDoc(distributorRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      console.log(`[Dashboard] Successfully updated distributor ${distributorId}`)
      return true
    } catch (error) {
      console.error("Error updating distributor:", error)
      return false
    }
  },

  // Delete distributor
  async deleteDistributor(distributorId: string): Promise<boolean> {
    try {
      console.log(`[Dashboard] Deleting distributor ${distributorId}`)
      const distributorRef = doc(db, "distributors", distributorId)

      // Get distributor data first to find associated user
      const distributorDoc = await getDoc(distributorRef)
      if (distributorDoc.exists()) {
        const distributorData = distributorDoc.data()

        // If this distributor is linked to a user, update the user's role back to customer
        if (distributorData.email) {
          // Try to find user by email
          const usersQuery = query(collection(db, "userProfiles"), where("email", "==", distributorData.email))
          const userSnapshot = await getDocs(usersQuery)

          if (!userSnapshot.empty) {
            const userId = userSnapshot.docs[0].id
            await this.setUserRole(userId, "customer")
            console.log(`[Dashboard] Updated user ${userId} role back to customer`)
          }
        }
      }

      // Delete the distributor document
      await setDoc(
        distributorRef,
        {
          isActive: false,
          updatedAt: serverTimestamp(),
          deletedAt: serverTimestamp(),
        },
        { merge: true },
      )

      console.log(`[Dashboard] Successfully marked distributor ${distributorId} as deleted`)
      return true
    } catch (error) {
      console.error("Error deleting distributor:", error)
      return false
    }
  },
}

export const distributorService = {
  // Get orders assigned to a specific distributor
  async getAssignedOrders(distributorId: string): Promise<Order[]> {
    try {
      console.log(`[Distributor] Fetching orders assigned to ${distributorId}`)
      const q = query(
        collection(db, "orders"),
        where("assignedDistributor", "==", distributorId),
        orderBy("createdAt", "desc"),
      )
      const querySnapshot = await getDocs(q)
      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        date: doc.data().date || doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      })) as Order[]
      console.log(`[Distributor] Found ${orders.length} assigned orders`)
      return orders
    } catch (error) {
      console.error("Error getting assigned orders:", error)
      return []
    }
  },

  // Update order status by distributor
  async updateOrderStatus(orderId: string, status: string, distributorStatus: string): Promise<boolean> {
    try {
      console.log(`[Distributor] Updating order ${orderId} status to ${status}/${distributorStatus}`)
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        status,
        distributorStatus,
        updatedAt: serverTimestamp(),
      })
      console.log(`[Distributor] Successfully updated order ${orderId}`)
      return true
    } catch (error) {
      console.error("Error updating order status:", error)
      return false
    }
  },

  // Get distributor analytics
  async getDistributorAnalytics(distributorId: string) {
    try {
      const orders = await this.getAssignedOrders(distributorId)
      const completedOrders = orders.filter((o) => o.status === "completed")
      const pendingOrders = orders.filter(
        (o) => o.distributorStatus === "assigned" || o.distributorStatus === "pending",
      )
      const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0)

      return {
        totalAssigned: orders.length,
        completed: completedOrders.length,
        pending: pendingOrders.length,
        totalRevenue,
        completionRate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
        recentOrders: orders.slice(0, 10),
      }
    } catch (error) {
      console.error("Error getting distributor analytics:", error)
      return {
        totalAssigned: 0,
        completed: 0,
        pending: 0,
        totalRevenue: 0,
        completionRate: 0,
        recentOrders: [],
      }
    }
  },
}
