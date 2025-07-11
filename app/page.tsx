"use client";

import { useState, useEffect } from "react";
import { PRODUCTS } from "@/data/products";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// Components
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/components/chat-view";
import { BrowseView } from "@/components/browse-view";
import { QuickOrdersView } from "@/components/quick-orders-view";
import { SettingsView } from "@/components/settings-view";
import { CartModal } from "@/components/cart-modal";
import { AllProductsModal } from "@/components/all-products-modal";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { Login } from "@/components/auth/login";
import { Signup } from "@/components/auth/signup";
import { LoginPromptModal } from "@/components/login-prompt-modal";
import { CheckoutModal } from "@/components/checkout-modal";
import { ProductManagementModal } from "@/components/product-management-modal";
import { OrderHistoryModal } from "@/components/order-history-modal";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  image: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "mpesa" | "card" | "cash";
  deliveryAddress: { address: string; location: { lat: number; lng: number }; notes: string };
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string;
  date?: string;
}

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  date: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: any[];
}

export default function Home() {
  const { user, userData, loading, logout } = useAuth();

  // UI state
  const [currentView, setCurrentView] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Data state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("default");
  const [products, setProducts] = useState(PRODUCTS);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage and Firestore
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("vendai-cart") || "[]");
    const savedSessions = JSON.parse(localStorage.getItem("vendai-chat-sessions") || "[]");

    setCart(savedCart);
    setChatSessions(savedSessions);

    const fetchOrders = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    const fetchChatSessions = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, "chatSessions"),
          where("userId", "==", user.uid),
          orderBy("updatedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setChatSessions(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ChatSession)));
      } catch (err) {
        console.error("Error fetching chat sessions:", err);
      }
    };

    if (!loading && user) {
      fetchOrders();
      fetchChatSessions();
    }
  }, [user, loading]);

  useEffect(() => {
    localStorage.setItem("vendai-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("vendai-chat-sessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Chat functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: data.id,
        role: "assistant",
        content: data.content,
        products: data.products || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update chat session
      updateChatSession([...messages, userMessage, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatSession = (newMessages: Message[]) => {
    const sessionTitle = newMessages[0]?.content.slice(0, 30) + "..." || "New Chat";
    const now = new Date().toISOString();
    const session: ChatSession = {
      id: currentSessionId,
      userId: user?.uid || "",
      title: sessionTitle,
      messages: newMessages,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      date: now,
    };

    setChatSessions((prev) => {
      const existing = prev.find((s) => s.id === currentSessionId);
      if (existing) {
        return prev.map((s) => (s.id === currentSessionId ? session : s));
      } else {
        return [session, ...prev];
      }
    });
  };

  // Cart functions with animation
  const handleAddToCart = (product: any, quantity = 1) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const cartButton = document.querySelector("[data-cart-button]");
    if (cartButton) {
      cartButton.classList.add("animate-bounce");
      setTimeout(() => cartButton.classList.remove("animate-bounce"), 600);
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleCheckoutComplete = (orderData: any) => {
    setOrders((prev) => [orderData, ...prev]);
    setCart([]);
    setShowCheckout(false);
  };

  const handleReorder = (items: CartItem[]) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    items.forEach((item) => {
      handleAddToCart(item, item.quantity);
    });
  };

  const handleLogin = () => {
    setShowLogin(false);
    setShowLoginPrompt(false);
  };

  const handleSignup = () => {
    setShowSignup(false);
    setShowLoginPrompt(false);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from useAuth
      setCart([]);
      setOrders([]);
      setChatSessions([]);
      setMessages([]);
      setCurrentSessionId("default");
      localStorage.removeItem("vendai-cart");
      localStorage.removeItem("vendai-chat-sessions");
      localStorage.removeItem("vendai-orders");
      setChatHistoryOpen(false); // Close chat history sidebar on logout
      console.log("Logged out successfully at", new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setCurrentView("chat");
  };

  const handleLoadSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setCurrentView("chat");
    }
  };

  const handleBackToChat = () => {
    setCurrentView("chat");
    setShowOrderHistory(false);
  };

  const handleProductRemove = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleProductUpdate = (productId: number, updates: any) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, ...updates } : item))
    );
  };

  const handleBackToMain = () => {
    setCurrentView("chat");
  };

  const handleSettings = () => {
    setCurrentView("settings");
  };

  const handleCloseAuth = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

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
        );
      case "settings":
        return (
          <SettingsView
            onBack={handleBackToMain}
            onProductManagement={() => setShowProductManagement(true)}
          />
        );
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
            onViewAll={() => setShowAllProducts(true)}
            setCurrentView={setCurrentView}
            onBackToMain={handleBackToMain}
            isInSubView={currentView !== "chat"}
            chatHistoryMinimized={!chatHistoryOpen}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="shooting-star"></div>
      {/* Authentication Modals */}
      {showLogin && (
        <Login
          onLogin={handleLogin}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onClose={handleCloseAuth}
        />
      )}

      {showSignup && (
        <Signup
          onSignup={handleSignup}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
          onClose={handleCloseAuth}
        />
      )}

      <LoginPromptModal
        show={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={() => {
          setShowLoginPrompt(false);
          setShowLogin(true);
        }}
        onSignup={() => {
          setShowLoginPrompt(false);
          setShowSignup(true);
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
          onLogin={() => setShowLogin(true)}
          onSignup={() => setShowSignup(true)}
          onBackToChat={handleBackToChat}
          user={userData}
          isAuthenticated={!!user}
          onSettings={handleSettings}
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

      <OrderHistoryModal
        show={showOrderHistory}
        onClose={() => setShowOrderHistory(false)}
        orders={orders}
      />
    </div>
  );
}