"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { PRODUCTS } from "@/data/products"
import { useAuth } from "@/lib/auth-context"
import {
  cartService,
  orderService,
  chatService,
  userPreferencesService,
  realtimeService,
} from "@/lib/firebase-services"
import type { CartItem, Order, ChatSession, Message, Product } from "@/lib/types" // Import Product and UserData type

// Components
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ChatView } from "@/components/chat-view"
import { QuickOrdersView } from "@/components/quick-orders-view"
import { SettingsView } from "@/components/settings-view"
import { CartModal } from "@/components/cart-modal"
import { AllProductsModal } from "@/components/all-products-modal"
import { ChatHistorySidebar } from "@/components/chat-history-sidebar"
import { Login } from "@/components/auth/login"
import { Signup } from "@/components/auth/signup"
import { LoginPromptModal } from "@/components/login-prompt-modal"
import { CheckoutModal } from "@/components/checkout-modal"
import { ProductManagementModal } from "@/components/product-management-modal"
import { OrderHistoryModal } from "@/components/order-history-modal"

// Example of a simple debounce function (can be placed in lib/utils.ts)
function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  )
}

export default function Home() {
  const { user, userData, loading, logout } = useAuth() // Removed onLogin, onSignup from useAuth destructuring

  // UI state
  const [currentView, setCurrentView] = useState("chat")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatHistoryOpen, setChatHistoryOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024
    }
    return false
  })
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [showProductManagement, setShowProductManagement] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showCartAdded, setShowCartAdded] = useState(false)
  const [isOnline, setIsOnline] = useState(true) // New state for online status
  const [chatHistoryMinimized, setChatHistoryMinimized] = useState(false) // Declare chatHistoryMinimized variable

  // Data state
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState("default")
  const [products, setProducts] = useState<Product[]>(PRODUCTS) // Explicitly type products

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Function to handle viewing all products
  const onViewAll = () => {
    setShowAllProducts(true)
  }

  // Debounced functions
  const debouncedUpdateCart = useDebounce(
    (uid: string, items: CartItem[]) => cartService.updateUserCart(uid, items),
    500,
  )
  const debouncedSaveChatSession = useDebounce((session: ChatSession) => chatService.saveChatSession(session), 500)

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine) // Set initial status

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Real-time subscriptions
  useEffect(() => {
    if (!user?.uid || !isOnline) return // Only subscribe if online

    const unsubscribeCart = realtimeService.subscribeToUserCart(user.uid, (cartData: CartItem[]) => {
      setCart(cartData)
    })

    const unsubscribeOrders = realtimeService.subscribeToUserOrders(user.uid, (ordersData: Order[]) => {
      setOrders(ordersData)
    })

    const unsubscribeChatSessions = realtimeService.subscribeToUserChatSessions(
      user.uid,
      (sessionsData: ChatSession[]) => {
        setChatSessions(sessionsData)
      },
    )

    return () => {
      unsubscribeCart()
      unsubscribeOrders()
      unsubscribeChatSessions()
    }
  }, [user?.uid, isOnline]) // Re-run when online status changes

  // Load initial data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return

      try {
        // Load cart from Firebase
        const cartData: CartItem[] = await cartService.getUserCart(user.uid)
        setCart(cartData)

        // Load orders from Firebase
        const ordersData: Order[] = await orderService.getUserOrders(user.uid)
        setOrders(ordersData)

        // Load chat sessions from Firebase
        const sessionsData: ChatSession[] = await chatService.getUserChatSessions(user.uid)
        setChatSessions(sessionsData)
      } catch (error) {
        console.error("Error loading user data from Firebase:", error)
        // Fallback to localStorage if Firebase fails or offline
        const savedCart = JSON.parse(localStorage.getItem("vendai-cart") || "[]") as CartItem[]
        const savedSessions = JSON.parse(localStorage.getItem("vendai-chat-sessions") || "[]") as ChatSession[]
        setCart(savedCart)
        setChatSessions(savedSessions)
      }
    }

    if (!loading && user && isOnline) {
      loadUserData()
    } else if (!loading && !isOnline) {
      // If offline, load from localStorage immediately
      const savedCart = JSON.parse(localStorage.getItem("vendai-cart") || "[]") as CartItem[]
      const savedSessions = JSON.parse(localStorage.getItem("vendai-chat-sessions") || "[]") as ChatSession[]
      setCart(savedCart)
      setChatSessions(savedSessions)
    }
  }, [user, loading, isOnline]) // Re-run when online status changes

  // Sync cart with Firebase when it changes
  useEffect(() => {
    if (user?.uid && cart.length >= 0 && isOnline) {
      debouncedUpdateCart(user.uid, cart)
    }
    localStorage.setItem("vendai-cart", JSON.stringify(cart))
  }, [cart, user?.uid, debouncedUpdateCart, isOnline])

  // Sync chat sessions with Firebase when they change
  useEffect(() => {
    if (user?.uid && chatSessions.length >= 0 && isOnline) {
      chatSessions.forEach((session) => {
        if (session.userId === user.uid) {
          debouncedSaveChatSession(session)
        }
      })
    }
    localStorage.setItem("vendai-chat-sessions", JSON.stringify(chatSessions))
  }, [chatSessions, user?.uid, debouncedSaveChatSession, isOnline])

  useEffect(() => {
    if (!loading && user && typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        setChatHistoryOpen(true)
      }
    } else if (!user) {
      setChatHistoryOpen(false)
    }
  }, [user, loading])

  // Chat functions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])

    // Save search to user preferences
    if (user?.uid) {
      userPreferencesService.addToSearchHistory(user.uid, input.trim())
    }

    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()
      const assistantMessage: Message = {
        id: data.id,
        role: "assistant",
        content: data.content,
        products: data.products || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
      updateChatSession([...messages, userMessage, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const updateChatSession = (newMessages: Message[]) => {
    const sessionTitle = newMessages[0]?.content.slice(0, 30) + "..." || "New Chat"
    const now = new Date().toISOString()
    const session: ChatSession = {
      id: currentSessionId,
      userId: user?.uid || "",
      title: sessionTitle,
      messages: newMessages,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      date: now,
    }

    setChatSessions((prev) => {
      const existing = prev.find((s) => s.id === currentSessionId)
      if (existing) {
        return prev.map((s) => (s.id === currentSessionId ? session : s))
      } else {
        return [session, ...prev]
      }
    })

    // Save to Firebase
    if (user?.uid && isOnline) {
      chatService.saveChatSession(session)
    }
  }

  // Cart functions with Firebase sync
  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }

    const cartButton = document.querySelector("[data-cart-button]")
    if (cartButton) {
      cartButton.classList.add("animate-bounce")
      setTimeout(() => cartButton.classList.remove("animate-bounce"), 600)
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      }
      // Ensure price is a number, provide default if undefined
      const itemPrice = product.price ?? 0
      return [...prevCart, { ...product, price: itemPrice, quantity }] as CartItem[]
    })

    // Trigger the fancy animation
    setShowCartAdded(true)
    setTimeout(() => setShowCartAdded(false), 1500) // Show for 1.5 seconds
  }

  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId)
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
    }
  }

  const handleCheckout = () => {
    if (cart.length === 0) return
    setShowCart(false)
    setShowCheckout(true)
  }

  const handleCheckoutComplete = async (orderData: any) => {
    // Save order to Firebase
    if (user?.uid && isOnline) {
      const orderId = await orderService.createOrder({
        ...orderData,
        userId: user.uid,
      })
      if (orderId) {
        orderData.id = orderId
      }
    }

    setOrders((prev) => [orderData, ...prev])
    setCart([])
    setShowCheckout(false)

    // Clear cart in Firebase
    if (user?.uid && isOnline) {
      cartService.clearUserCart(user.uid)
    }
  }

  const handleReorder = (items: CartItem[]) => {
    if (!user) {
      setShowLoginPrompt(true)
      return
    }
    items.forEach((item) => {
      // item is CartItem, which now extends Product, so it's compatible
      handleAddToCart(item, item.quantity)
    })
  }

  const handleLogin = () => {
    setShowLogin(false)
    setShowLoginPrompt(false)
  }

  const handleSignup = () => {
    setShowSignup(false)
    setShowLoginPrompt(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setCart([])
      setOrders([])
      setChatSessions([])
      setMessages([])
      setCurrentSessionId("default")
      localStorage.removeItem("vendai-cart")
      localStorage.removeItem("vendai-chat-sessions")
      localStorage.removeItem("vendai-orders")
      setChatHistoryOpen(false)
      console.log("Logged out successfully at", new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }))
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`
    setCurrentSessionId(newSessionId)
    setMessages([])
    setCurrentView("chat")
  }

  const handleLoadSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
      setCurrentView("chat")
    }
  }

  const handleBackToChat = () => {
    setCurrentView("chat")
    setShowOrderHistory(false)
  }

  const handleProductRemove = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const handleProductUpdate = (productId: number, updates: any) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)))
    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, ...updates } : item)))
  }

  const handleBackToMain = () => {
    setCurrentView("chat")
  }

  const handleSettings = () => {
    setCurrentView("settings")
  }

  const handleCloseAuth = () => {
    setShowLogin(false)
    setShowSignup(false)
  }

  const renderMainContent = () => {
    switch (currentView) {
      case "quickOrders":
        return (
          <QuickOrdersView
            products={products}
            orders={orders}
            onAddToCart={handleAddToCart}
            onReorder={handleReorder}
            onBack={handleBackToMain}
          />
        )
      case "settings":
        return <SettingsView onBack={handleBackToMain} onProductManagement={() => setShowProductManagement(true)} />
      default:
        return (
          <ChatView
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            products={products}
            onQuickAdd={handleAddToCart}
            onViewAll={onViewAll}
            setCurrentView={setCurrentView}
            onBackToMain={handleBackToMain}
            isInSubView={currentView !== "chat"}
            chatHistoryMinimized={chatHistoryMinimized}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        {isOnline ? (
          "Loading..."
        ) : (
          <div className="text-center p-4">
            <p className="text-lg font-bold mb-2">No Internet Connection</p>
            <p className="text-sm text-gray-400">Please check your network and try again.</p>
            <p className="text-xs text-gray-500 mt-2">
              (Some data might be loaded from your last session if available)
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="shooting-star"></div>

      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onLogin={handleLogin} // Re-added
          onSwitchToSignup={() => {
            setShowLogin(false)
            setShowSignup(true)
          }}
          onClose={handleCloseAuth}
        />
      )}

      {showSignup && (
        <Signup
          onSignup={handleSignup} // Re-added
          onSwitchToLogin={() => {
            setShowSignup(false)
            setShowLogin(true)
          }}
          onClose={handleCloseAuth}
        />
      )}

      <LoginPromptModal
        show={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={() => {
          setShowLoginPrompt(false)
          setShowLogin(true)
        }}
        onSignup={() => {
          setShowLoginPrompt(false)
          setShowSignup(true)
        }}
      />

      {/* Chat History Sidebar - Left */}
      {user && (
        <ChatHistorySidebar
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onLoadSession={handleLoadSession}
          onNewChat={handleNewChat}
          isOpen={chatHistoryOpen}
          setIsOpen={setChatHistoryOpen}
          user={userData}
          orders={orders}
          onSettings={handleSettings}
          onLogout={handleLogout}
          isAuthenticated={!!user}
        />
      )}

      {/* Main Content with Overlay */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 content-overlay ${
          user ? (chatHistoryOpen ? "ml-80" : "ml-0") : ""
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          chatHistoryOpen={chatHistoryOpen}
          setChatHistoryOpen={setChatHistoryOpen}
          cart={cart}
          setShowCart={setShowCart}
          showOrderHistory={showOrderHistory}
          setShowOrderHistory={setShowOrderHistory}
          orders={orders}
          onLogout={handleLogout}
          onLogin={() => setShowLogin(true)} // Re-added
          onSignup={() => setShowSignup(true)} // Re-added
          onBackToChat={handleBackToChat}
          user={userData}
          isAuthenticated={!!user}
          onSettings={handleSettings}
          showCartAdded={showCartAdded}
        />

        {renderMainContent()}
      </div>

      {/* Order History Sidebar */}
      {user && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} orders={orders} />}

      {/* Modals */}
      <CartModal
        show={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        onCheckoutComplete={handleCheckoutComplete}
        user={userData}
      />

      <AllProductsModal
        show={showAllProducts}
        onClose={() => setShowAllProducts(false)}
        products={products}
        onAddToCart={handleAddToCart}
      />

      <ProductManagementModal
        show={showProductManagement}
        onClose={() => setShowProductManagement(false)}
        onProductRemove={handleProductRemove}
        onProductUpdate={handleProductUpdate}
      />

      <OrderHistoryModal show={showOrderHistory} onClose={() => setShowOrderHistory(false)} orders={orders} />
    </div>
  )
}
