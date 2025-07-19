// "use client";

// app/page.tsx
// This file serves as the main entry point for the VendAI e-commerce application.
// It renders the core UI, manages state for cart, orders, and chat sessions, and
// integrates Firebase for authentication and data persistence. The UI is responsive,
// supporting both authenticated and unauthenticated users, with modals for cart,
// checkout, and product management.

import { useState, useEffect } from "react";
import { PRODUCTS } from "../data/products"; // Adjusted the path to match the relative location
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// Components
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/components/chat-view";
import { BrowseView } from "@/components/browse-view"; // Note: Not used in current code, consider removing if unused
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

// Interface for cart items, representing products added to the user's cart
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  image: string;
}

// Interface for items within an order, used for order history
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

// Interface for orders, stored in Firestore and displayed in order history
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

// Interface for chat sessions, stored in Firestore and localStorage
interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: any[]; // TODO: Replace `any` with `Message[]` for type safety
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  date: string;
}

// Interface for chat messages, used in the chat UI
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: any[]; // TODO: Replace `any` with proper product type
}

export default function Home() {
  const { user, userData, loading, logout } = useAuth();

  // --- UI State ---
  // Manages the current view (chat, quickOrders, settings)
  const [currentView, setCurrentView] = useState("chat");
  // Controls visibility of the right sidebar (order history)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Controls visibility of the left chat history sidebar
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  // Toggles cart modal visibility
  const [showCart, setShowCart] = useState(false);
  // Toggles checkout modal visibility
  const [showCheckout, setShowCheckout] = useState(false);
  // Toggles all products modal visibility
  const [showAllProducts, setShowAllProducts] = useState(false);
  // Toggles order history modal visibility
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  // Toggles product management modal visibility
  const [showProductManagement, setShowProductManagement] = useState(false);
  // Toggles login modal visibility
  const [showLogin, setShowLogin] = useState(false);
  // Toggles signup modal visibility
  const [showSignup, setShowSignup] = useState(false);
  // Toggles login prompt modal visibility
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // --- Data State ---
  // Stores cart items, synced with localStorage
  const [cart, setCart] = useState<CartItem[]>([]);
  // Stores user orders, fetched from Firestore
  const [orders, setOrders] = useState<Order[]>([]);
  // Stores chat sessions, synced with localStorage and Firestore
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  // Tracks the active chat session ID
  const [currentSessionId, setCurrentSessionId] = useState("default");
  // Stores product catalog, initialized from PRODUCTS
  const [products, setProducts] = useState(PRODUCTS);

  // --- Chat State ---
  // Stores messages for the current chat session
  const [messages, setMessages] = useState<Message[]>([]);
  // Tracks user input in the chat input field
  const [input, setInput] = useState("");
  // Indicates if a chat request is in progress
  const [isLoading, setIsLoading] = useState(false);

  // --- Data Fetching and Persistence ---
  // Loads cart and chat sessions from localStorage and fetches orders/chat sessions from Firestore
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem("vendai-cart") || "[]");
    // Load chat sessions from localStorage
    const savedSessions = JSON.parse(localStorage.getItem("vendai-chat-sessions") || "[]");

    setCart(savedCart);
    setChatSessions(savedSessions);

    // Fetch orders for authenticated users
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

    // Fetch chat sessions for authenticated users
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

  // Sync cart to localStorage on update
  useEffect(() => {
    localStorage.setItem("vendai-cart", JSON.stringify(cart));
  }, [cart]);

  // Sync chat sessions to localStorage on update
  useEffect(() => {
    localStorage.setItem("vendai-chat-sessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  // --- Chat Functions ---
  // Updates the chat input state
  // @param e - The input change event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Submits a user message to the chat API and updates the chat session
  // @param e - The form submit event
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

      // Update chat session with new messages
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

  // Updates or creates a chat session with the latest messages
  // @param newMessages - Array of messages to include in the session
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

  // --- Cart Functions ---
  // Adds a product to the cart with an animation effect
  // @param product - The product to add
  // @param quantity - Number of items to add (default: 1)
  const handleAddToCart = (product: any, quantity = 1) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    // Trigger bounce animation on cart button
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

  // Removes a product from the cart
  // @param productId - The ID of the product to remove
  const handleRemoveFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Updates the quantity of a cart item
  // @param productId - The ID of the product
  // @param quantity - The new quantity (removes item if <= 0)
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  // Initiates the checkout process
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
  };

  // Completes the checkout process and clears the cart
  // @param orderData - The order data from the checkout modal
  const handleCheckoutComplete = (orderData: any) => {
    setOrders((prev) => [orderData, ...prev]);
    setCart([]);
    setShowCheckout(false);
  };

  // Reorders items from a previous order
  // @param items - Array of items to reorder
  const handleReorder = (items: CartItem[]) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    items.forEach((item) => {
      handleAddToCart(item, item.quantity);
    });
  };

  // --- Authentication Handlers ---
  // Handles successful login
  const handleLogin = () => {
    setShowLogin(false);
    setShowLoginPrompt(false);
  };

  // Handles successful signup
  const handleSignup = () => {
    setShowSignup(false);
    setShowLoginPrompt(false);
  };

  // Handles user logout, clearing state and localStorage
  const handleLogout = async () => {
    try {
      await logout();
      setCart([]);
      setOrders([]);
      setChatSessions([]);
      setMessages([]);
      setCurrentSessionId("default");
      localStorage.removeItem("vendai-cart");
      localStorage.removeItem("vendai-chat-sessions");
      localStorage.removeItem("vendai-orders");
      setChatHistoryOpen(false);
      console.log("Logged out successfully at", new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }));
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- Chat Session Handlers ---
  // Starts a new chat session
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setMessages([]);
    setCurrentView("chat");
  };

  // Loads an existing chat session
  // @param sessionId - The ID of the session to load
  const handleLoadSession = (sessionId: string) => {
    const session = chatSessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setCurrentView("chat");
    }
  };

  // --- Navigation Handlers ---
  // Navigates back to the chat view
  const handleBackToChat = () => {
    setCurrentView("chat");
    setShowOrderHistory(false);
  };

  // Removes a product from the catalog and cart
  // @param productId - The ID of the product to remove
  const handleProductRemove = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Updates a product in the catalog and cart
  // @param productId - The ID of the product to update
  // @param updates - The updated product fields
  const handleProductUpdate = (productId: number, updates: any) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, ...updates } : item))
    );
  };

  // Navigates back to the main chat view
  const handleBackToMain = () => {
    setCurrentView("chat");
  };

  // Navigates to the settings view
  const handleSettings = () => {
    setCurrentView("settings");
  };

  // Closes authentication modals
  const handleCloseAuth = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  // Renders the main content based on the current view
  // @returns The appropriate view component (ChatView, QuickOrdersView, or SettingsView)
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

  // --- Render ---
  // Show loading state while authentication is in progress
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