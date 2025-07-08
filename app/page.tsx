"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { PRODUCTS } from "@/data/products"

// Components
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ChatView } from "@/components/chat-view"
import { BrowseView } from "@/components/browse-view"
import { QuickOrdersView } from "@/components/quick-orders-view"
import { SettingsView } from "@/components/settings-view"
import { CartModal } from "@/components/cart-modal"
import { AllProductsModal } from "@/components/all-products-modal"
import { ChatHistorySidebar } from "@/components/chat-history-sidebar"
import { Login } from "@/components/auth/login"
import { Signup } from "@/components/auth/signup"
import { LoginPromptModal } from "@/components/login-prompt-modal"
import { CheckoutModal } from "@/components/checkout-modal"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
  description: string
  image: string
}

interface Order {
  id: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "completed"
  date: string
  deliveryDate: string
}

interface ChatSession {
  id: string
  title: string
  messages: any[]
  date: string
}

export default function Home() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // UI state
  const [currentView, setCurrentView] = useState("chat")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Data state
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState("default")

  // Chat functionality
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      // Handle special commands
      if (message.content.includes("ADD_TO_CART:")) {
        const productName = message.content.split("ADD_TO_CART:")[1]?.split("x")[0]?.trim()
        const quantity = Number.parseInt(message.content.split("x")[1]?.trim()) || 1

        const product = PRODUCTS.find((p) => p.name.toLowerCase().includes(productName?.toLowerCase() || ""))

        if (product) {
          handleAddToCart(product, quantity)
        }
      }
    },
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("vendai-cart")
    const savedOrders = localStorage.getItem("vendai-orders")
    const savedUser = localStorage.getItem("vendai-user")
    const savedSessions = localStorage.getItem("vendai-chat-sessions")

    if (savedCart) setCart(JSON.parse(savedCart))
    if (savedOrders) setOrders(JSON.parse(savedOrders))
    if (savedSessions) setChatSessions(JSON.parse(savedSessions))

    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("vendai-cart", JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem("vendai-orders", JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    localStorage.setItem("vendai-chat-sessions", JSON.stringify(chatSessions))
  }, [chatSessions])

  // Cart functions
  const handleAddToCart = (product: any, quantity = 1) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      }
      return [...prevCart, { ...product, quantity }]
    })
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

  const handleCheckoutComplete = (orderData: any) => {
    setOrders((prev) => [orderData, ...prev])
    setCart([])
    setShowCheckout(false)
  }

  const handleReorder = (items: CartItem[]) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }

    items.forEach((item) => {
      handleAddToCart(item, item.quantity)
    })
  }

  // Auth functions
  const handleLogin = (email: string, password: string) => {
    const userData = {
      id: "user-1",
      name: "John Doe",
      email: email,
      phone: "+254 712 345 678",
      location: "Westlands",
      city: "Nairobi",
    }

    setUser(userData)
    setIsAuthenticated(true)
    setShowLogin(false)
    setShowLoginPrompt(false)
    localStorage.setItem("vendai-user", JSON.stringify(userData))
  }

  const handleSignup = (userData: any) => {
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      location: "Westlands", // Default location
      city: "Nairobi", // Default city
    }

    setUser(newUser)
    setIsAuthenticated(true)
    setShowSignup(false)
    setShowLoginPrompt(false)
    localStorage.setItem("vendai-user", JSON.stringify(newUser))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setShowProfile(false)
    localStorage.removeItem("vendai-user")
    localStorage.removeItem("vendai-cart")
    localStorage.removeItem("vendai-orders")
    setCart([])
    setOrders([])
  }

  // Chat functions
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`
    setCurrentSessionId(newSessionId)
    setMessages([])
  }

  const handleLoadSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
    }
  }

  // View functions
  const handleBackToMain = () => {
    setCurrentView("chat")
  }

  const handleSettings = () => {
    setCurrentView("settings")
    setShowProfile(false)
  }

  // Close auth modals
  const handleCloseAuth = () => {
    setShowLogin(false)
    setShowSignup(false)
  }

  // Render main content
  const renderMainContent = () => {
    switch (currentView) {
      case "browse":
        return <BrowseView products={PRODUCTS} onAddToCart={handleAddToCart} onBack={handleBackToMain} />
      case "quickOrders":
        return (
          <QuickOrdersView
            products={PRODUCTS}
            orders={orders}
            onAddToCart={handleAddToCart}
            onReorder={handleReorder}
            onBack={handleBackToMain}
          />
        )
      case "settings":
        return <SettingsView onBack={handleBackToMain} />
      default:
        return (
          <ChatView
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            products={PRODUCTS}
            onQuickAdd={handleAddToCart}
            onViewAll={() => setShowAllProducts(true)}
            setCurrentView={setCurrentView}
            onBackToMain={handleBackToMain}
            isInSubView={currentView !== "chat"}
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Authentication Modals */}
      {!isAuthenticated && showLogin && (
        <Login
          onLogin={handleLogin}
          onSwitchToSignup={() => {
            setShowLogin(false)
            setShowSignup(true)
          }}
          onClose={handleCloseAuth}
        />
      )}

      {!isAuthenticated && showSignup && (
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() => {
            setShowSignup(false)
            setShowLogin(true)
          }}
          onClose={handleCloseAuth}
        />
      )}

      {/* Login Prompt Modal */}
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

      {/* Sidebar */}
      {isAuthenticated && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} orders={orders} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          chatHistoryOpen={chatHistoryOpen}
          setChatHistoryOpen={setChatHistoryOpen}
          cart={cart}
          setShowCart={setShowCart}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
          orders={orders}
          onSettings={handleSettings}
          onLogout={handleLogout}
          onLogin={() => setShowLogin(true)}
          onSignup={() => setShowSignup(true)}
          user={user}
          isAuthenticated={isAuthenticated}
        />

        {/* Main Content Area */}
        {renderMainContent()}
      </div>

      {/* Chat History Sidebar */}
      {isAuthenticated && (
        <ChatHistorySidebar
          chatHistoryOpen={chatHistoryOpen}
          setChatHistoryOpen={setChatHistoryOpen}
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onLoadSession={handleLoadSession}
          onNewChat={handleNewChat}
        />
      )}

      {/* Cart Modal */}
      <CartModal
        show={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        show={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        onCheckoutComplete={handleCheckoutComplete}
        user={user}
      />

      {/* All Products Modal */}
      <AllProductsModal
        show={showAllProducts}
        onClose={() => setShowAllProducts(false)}
        products={PRODUCTS}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
