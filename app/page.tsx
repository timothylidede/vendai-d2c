"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

// Import the auth components
import { Login } from "@/components/auth/login"
import { Signup } from "@/components/auth/signup"

// Components
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { ChatHistorySidebar } from "@/components/chat-history-sidebar"
import { ChatView } from "@/components/chat-view"
import { BrowseView } from "@/components/browse-view"
import { QuickOrdersView } from "@/components/quick-orders-view"
import { SettingsView } from "@/components/settings-view"
import { AllProductsModal } from "@/components/all-products-modal"
import { QuantityInput } from "@/components/quantity-input"

// Existing modals (keeping these in main file for now)
import { ShoppingCart, X, Trash2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string
}

interface CartItem extends Product {
  quantity: number
}

interface Order {
  id: string
  items: CartItem[]
  total: number
  date: string
  status: "completed" | "processing" | "shipped"
  deliveryDate?: string
}

interface ChatSession {
  id: string
  title: string
  messages: any[]
  date: string
}

type ViewMode = "chat" | "browse" | "quickOrders" | "settings"

export default function VendAI() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [cartAnimation, setCartAnimation] = useState<{ show: boolean; product: string }>({ show: false, product: "" })
  const [currentView, setCurrentView] = useState<ViewMode>("chat")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [showLoginNudge, setShowLoginNudge] = useState(false)

  // Add authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [user, setUser] = useState<any>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      // Save chat session after each message
      saveChatSession()

      if (message.content.includes("ADD_TO_CART:")) {
        const productMatch = message.content.match(/ADD_TO_CART: (.+) x (\d+)/)
        if (productMatch) {
          const [, productName, quantity] = productMatch
          addToCart(productName, Number.parseInt(quantity))
        }
      } else if (message.content.includes("VIEW_CART")) {
        if (isAuthenticated) {
          setShowCart(true)
        } else {
          handleLoginNudge()
        }
      } else if (message.content.includes("CHECKOUT")) {
        if (isAuthenticated) {
          setShowCheckout(true)
        } else {
          handleLoginNudge()
        }
      }
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I'm having trouble connecting right now. You can browse our products using the buttons above or add items directly using the quick shortcuts!",
        },
      ])
    },
  })

  useEffect(() => {
    fetchProducts()
    if (isAuthenticated) {
      loadOrderHistory()
      loadChatHistory()
    }

    // Create initial session if none exists
    if (currentSessionId === "" && messages.length === 0) {
      createNewChatSession()
    }

    if (orders.length === 0 && isAuthenticated) {
      const dummyOrders: Order[] = [
        {
          id: "ORD-2024-001",
          items: [
            {
              id: 1,
              name: "Maize Flour",
              price: 325,
              category: "Grains",
              description: "Premium quality maize flour",
              image: "/placeholder.svg?height=200&width=200",
              quantity: 2,
            },
            {
              id: 3,
              name: "Bar Soap",
              price: 162,
              category: "Personal Care",
              description: "Gentle moisturizing bar soap",
              image: "/placeholder.svg?height=200&width=200",
              quantity: 3,
            },
          ],
          total: 1136,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "completed",
          deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "ORD-2024-002",
          items: [
            {
              id: 2,
              name: "Cooking Oil",
              price: 649,
              category: "Oils",
              description: "Pure vegetable cooking oil",
              image: "/placeholder.svg?height=200&width=200",
              quantity: 1,
            },
            {
              id: 10,
              name: "Milk",
              price: 363,
              category: "Dairy",
              description: "Fresh whole milk",
              image: "/placeholder.svg?height=200&width=200",
              quantity: 2,
            },
          ],
          total: 1375,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "shipped",
          deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "ORD-2024-003",
          items: [
            {
              id: 6,
              name: "Tea Bags",
              price: 454,
              category: "Beverages",
              description: "Premium black tea bags",
              image: "/placeholder.svg?height=200&width=200",
              quantity: 1,
            },
            {
              id: 5,
              name: "Sugar",
              price: 389,
              category: "Sweeteners",
              description: "Pure white granulated sugar",
              image: "/placeholder.svg?height=200&width=200",
              quantity: 1,
            },
            {
              id: 9,
              name: "Bread",
              price: 259,
              category: "Bakery",
              description: "Fresh whole wheat bread loaf",
              image: "/placeholder.svg?height=200&width=200",
              quantity: 1,
            },
          ],
          total: 1102,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "processing",
          deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setOrders(dummyOrders)
    }
  }, [isAuthenticated, messages.length, currentSessionId])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const result = await response.json()

      if (result.success && result.data) {
        setProducts(result.data)
      } else {
        console.error("Failed to fetch products:", result.message)
        setProducts([])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setProducts([])
    }
  }

  const loadOrderHistory = () => {
    const savedOrders = localStorage.getItem("vendai-orders")
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
  }

  const loadChatHistory = () => {
    const savedSessions = localStorage.getItem("vendai-chat-sessions")
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions))
    }
  }

  const createNewChatSession = () => {
    const newSessionId = `chat-${Date.now()}`
    setCurrentSessionId(newSessionId)
    setMessages([])
  }

  const saveChatSession = () => {
    if (currentSessionId && messages.length > 0 && isAuthenticated) {
      const title = messages[0]?.content?.slice(0, 50) + "..." || "New Chat"
      const session: ChatSession = {
        id: currentSessionId,
        title,
        messages: [...messages],
        date: new Date().toISOString(),
      }

      setChatSessions((prev) => {
        const updated = prev.filter((s) => s.id !== currentSessionId)
        const newSessions = [session, ...updated]
        localStorage.setItem("vendai-chat-sessions", JSON.stringify(newSessions))
        return newSessions
      })
    }
  }

  const loadChatSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setMessages(session.messages)
      setChatHistoryOpen(false)
    }
  }

  const handleLoginNudge = () => {
    setShowLoginNudge(true)
    setTimeout(() => setShowLoginNudge(false), 3000)
  }

  const addToCart = (productName: string, quantity = 1) => {
    if (!isAuthenticated) {
      handleLoginNudge()
      return
    }

    const product = products.find((p) => p.name.toLowerCase().includes(productName.toLowerCase()))

    if (product) {
      setCartAnimation({ show: true, product: product.name })
      setTimeout(() => setCartAnimation({ show: false, product: "" }), 1000)

      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id)
        if (existing) {
          return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
        }
        return [...prev, { ...product, quantity }]
      })
    }
  }

  const addProductToCart = (product: Product, quantity = 1) => {
    if (!isAuthenticated) {
      handleLoginNudge()
      return
    }

    setCartAnimation({ show: true, product: product.name })
    setTimeout(() => setCartAnimation({ show: false, product: "" }), 1000)

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity } : item))
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const updateCartQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const completeOrder = () => {
    const newOrder: Order = {
      id: `ORD-2024-${Date.now().toString().slice(-3)}`,
      items: [...cart],
      total: getTotalPrice(),
      date: new Date().toISOString(),
      status: "processing",
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    }

    const updatedOrders = [newOrder, ...orders]
    setOrders(updatedOrders)
    localStorage.setItem("vendai-orders", JSON.stringify(updatedOrders))

    setCart([])
    setShowCheckout(false)
    setOrderComplete(true)

    setTimeout(() => setOrderComplete(false), 3000)
  }

  const handleQuickAdd = (product: Product) => {
    addToCart(product.name, 1)
  }

  const reorderItems = (orderItems: CartItem[]) => {
    if (!isAuthenticated) {
      handleLoginNudge()
      return
    }
    orderItems.forEach((item) => {
      addProductToCart(item, item.quantity)
    })
  }

  // Add authentication handlers
  const handleLogin = (email: string, password: string) => {
    // Simulate login with dummy data
    const userData = {
      name: "John Doe",
      email: email,
      phone: "+254 712 345 678",
      address: "123 Nairobi Street",
      city: "Nairobi",
      area: "Westlands",
    }
    setUser(userData)
    setIsAuthenticated(true)
    setShowLogin(false)
    loadOrderHistory()
    loadChatHistory()
  }

  const handleSignup = (userData: any) => {
    setUser(userData)
    setIsAuthenticated(true)
    setShowSignup(false)
    loadOrderHistory()
    loadChatHistory()
  }

  const handleLogout = () => {
    // Save current session before logout
    saveChatSession()

    // Reset all state
    setUser(null)
    setIsAuthenticated(false)
    setCart([])
    setOrders([])
    setChatSessions([])
    setCurrentSessionId("")
    setMessages([])
    setCurrentView("chat")
    setSidebarOpen(false)
    setChatHistoryOpen(false)
    setShowProfile(false)

    // Create new session for logged out state
    createNewChatSession()

    // Show login nudge
    handleLoginNudge()
  }

  const handleBackToMain = () => {
    setCurrentView("chat")
    if (messages.length === 0) {
      createNewChatSession()
    }
  }

  // Close profile when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showProfile) {
        setShowProfile(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [showProfile])

  // Add authentication check
  // Remove the full authentication check that returns Login/Signup components
  // Keep the existing return statement for the main app

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Login Nudge */}
      <AnimatePresence>
        {showLoginNudge && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass-effect rounded-lg p-4 border border-blue-500/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-blue-400">Login Required</p>
                <p className="text-sm text-gray-300">Please login to add items to cart and checkout</p>
              </div>
              <Button size="sm" onClick={() => setShowLogin(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                Login
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Animation */}
      <AnimatePresence>
        {cartAnimation.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed top-20 right-20 z-50 glass-effect rounded-lg p-3 pointer-events-none"
          >
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm">{cartAnimation.product} added to cart!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {isAuthenticated && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} orders={orders} />}

      {/* Chat History Sidebar */}
      {isAuthenticated && (
        <ChatHistorySidebar
          chatHistoryOpen={chatHistoryOpen}
          setChatHistoryOpen={setChatHistoryOpen}
          chatSessions={chatSessions}
          currentSessionId={currentSessionId}
          onLoadSession={loadChatSession}
          onNewChat={createNewChatSession}
        />
      )}

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
          onSettings={() => setCurrentView("settings")}
          onLogout={handleLogout}
          onLogin={() => setShowLogin(true)}
          onSignup={() => setShowSignup(true)}
          user={user}
          isAuthenticated={isAuthenticated}
        />

        {/* Dynamic Content Based on Current View */}
        {currentView === "chat" && (
          <ChatView
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            products={products}
            onQuickAdd={handleQuickAdd}
            onViewAll={() => setShowAllProducts(true)}
            setCurrentView={setCurrentView}
            onBackToMain={handleBackToMain}
            showBackButton={false}
          />
        )}
        {currentView === "browse" && (
          <BrowseView products={products} onAddToCart={addProductToCart} onBack={handleBackToMain} />
        )}
        {currentView === "quickOrders" && (
          <QuickOrdersView
            products={products}
            orders={orders}
            onAddToCart={addProductToCart}
            onReorder={reorderItems}
            onBack={handleBackToMain}
          />
        )}
        {currentView === "settings" && <SettingsView onBack={handleBackToMain} />}
      </div>

      {/* All Products Modal */}
      <AllProductsModal
        show={showAllProducts}
        onClose={() => setShowAllProducts(false)}
        products={products}
        onAddToCart={addProductToCart}
      />

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass-effect rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gradient">Shopping Cart</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)} className="hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {cart.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-gray-400">Your cart is empty</p>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 glass-effect rounded-lg p-3 hover:bg-white/5 transition-all duration-300"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-xs text-gray-400">KES {item.price.toLocaleString()} each</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <QuantityInput
                            value={item.quantity}
                            onChange={(qty) => updateCartQuantity(item.id, qty)}
                            className="scale-75"
                          />
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-lg">KES {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => {
                          setShowCart(false)
                          setShowCheckout(true)
                        }}
                        className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Checkout
                      </Button>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="glass-effect rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gradient">Checkout</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)} className="hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                <div className="glass-effect rounded-lg p-4">
                  <h3 className="font-medium mb-3">Order Summary</h3>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.name} x{item.quantity}
                        </span>
                        <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Subtotal:</span>
                      <span>KES {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Delivery:</span>
                      <span className="text-green-400">Free</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>KES {getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-4">
                  <h3 className="font-medium mb-3">Delivery Information</h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>
                        📍 {user?.address}, {user?.area}
                      </span>
                      <Button variant="ghost" size="sm" className="text-xs hover:bg-white/10">
                        Change
                      </Button>
                    </div>
                    <p>📞 {user?.phone}</p>
                    <p>⏰ Expected: Tomorrow, 2-4 PM</p>
                  </div>
                </div>

                <div className="glass-effect rounded-lg p-4">
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
                      <input type="radio" name="payment" defaultChecked className="text-white" />
                      <span className="text-sm">M-Pesa (+254 712 *** 678)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors">
                      <input type="radio" name="payment" className="text-white" />
                      <span className="text-sm">Visa Card (**** 1234)</span>
                    </label>
                  </div>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={completeOrder}
                  className="w-full bg-white text-black hover:bg-gray-200 transition-all duration-300"
                >
                  Complete Order - KES {getTotalPrice().toLocaleString()}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Complete Notification */}
      <AnimatePresence>
        {orderComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-4 right-4 glass-effect rounded-lg p-4 z-50"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-green-500 rounded-full p-1"
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
              <div>
                <p className="font-medium">Order Placed!</p>
                <p className="text-sm text-gray-400">Thank you for shopping with us</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Login
                onLogin={handleLogin}
                onSwitchToSignup={() => {
                  setShowLogin(false)
                  setShowSignup(true)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSignup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Signup
                onSignup={handleSignup}
                onSwitchToLogin={() => {
                  setShowSignup(false)
                  setShowLogin(true)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
