"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  cartService,
  orderService,
  chatService,
  userPreferencesService,
  realtimeService,
} from "@/lib/firebase-services";
import type { CartItem, Order, ChatSession, Message, ChatMessage, Product } from "@/lib/types";

// Components
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ChatView } from "@/components/chat-view";
import { QuickOrdersView } from "@/components/quick-orders-view";
import { SettingsView } from "@/components/settings-view";
import { CartModal } from "@/components/cart-modal";
import { AllProductsModal } from "@/components/all-products-modal";
import { ChatHistorySidebar } from "@/components/chat-history-sidebar";
import { Login } from "@/components/auth/login";
import { Signup } from "@/components/auth/signup";
import { LoginPromptModal } from "@/components/login-prompt-modal";
import { CheckoutModal } from "@/components/checkout-modal";
import { OrderHistoryModal } from "@/components/order-history-modal";

// Import products with error handling
let PRODUCTS: Product[] = [];
try {
  const productsModule = require("@/data/products");
  PRODUCTS = productsModule.PRODUCTS || [];
} catch (error) {
  console.error("Failed to load products:", error);
  PRODUCTS = [];
}

// Simple debounce function
function useDebounce(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

// Helper function to generate meaningful chat titles
function generateChatTitle(userMessage: string, aiResponse: string): string {
  const cleanUserMessage = userMessage.trim().toLowerCase();

  // Skip generic/unclear messages
  const skipPatterns = [/^(hi|hello|hey|yo|sup)$/, /^(ok|okay|yes|no|sure)$/, /^[.!?]*$/, /^.{1,2}$/];

  if (skipPatterns.some((pattern) => pattern.test(cleanUserMessage))) {
    return "";
  }

  // Generate title based on content
  if (cleanUserMessage.includes("phone") || cleanUserMessage.includes("mobile")) {
    return "Looking for phones";
  } else if (cleanUserMessage.includes("coffee") || cleanUserMessage.includes("drink")) {
    return "Coffee & beverages";
  } else if (cleanUserMessage.includes("juice") || cleanUserMessage.includes("acacia")) {
    return "Juice products";
  } else if (cleanUserMessage.includes("fitness") || cleanUserMessage.includes("exercise")) {
    return "Fitness products";
  } else if (cleanUserMessage.includes("cheap") || cleanUserMessage.includes("budget")) {
    return "Budget-friendly options";
  } else if (cleanUserMessage.includes("expensive") || cleanUserMessage.includes("premium")) {
    return "Premium products";
  } else if (cleanUserMessage.includes("recommend") || cleanUserMessage.includes("suggest")) {
    return "Product recommendations";
  } else if (cleanUserMessage.length > 20) {
    // For longer messages, take first meaningful words
    const words = cleanUserMessage.split(" ").slice(0, 4);
    return words.join(" ").charAt(0).toUpperCase() + words.join(" ").slice(1);
  } else {
    // For shorter messages, capitalize first letter
    return cleanUserMessage.charAt(0).toUpperCase() + cleanUserMessage.slice(1);
  }
}

export default function Home() {
  const { user, userData, loading, logout } = useAuth();

  // UI state
  const [currentView, setCurrentView] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showCartAdded, setShowCartAdded] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [searchMode, setSearchMode] = useState<"fast" | "deep">("fast");
  const [chatHistoryMinimized, setChatHistoryMinimized] = useState(false);

  // Data state - Initialize products with fallback
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("default");
  const [products] = useState<Product[]>(PRODUCTS || []);

  // Pagination state
  const [, setLastOrderDoc] = useState<any>(undefined);
  const [, setLoadingMoreOrders] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Active chat session listener
  const [activeChatUnsubscribe, setActiveChatUnsubscribe] = useState<(() => void) | null>(null);

  // Debug log to verify products are loaded
  console.log("App products loaded:", products?.length || 0);

  // Debounced functions
  const debouncedUpdateCart = useDebounce((uid: string, items: CartItem[]) => {
    cartService.updateUserCart(uid, items, true);
  }, 1500);

  const debouncedSaveChatSession = useDebounce((session: ChatSession) => {
    chatService.saveChatSession(session, true);
  }, 2000);

  // Function to handle viewing all products with error handling
  const onViewAll = useCallback(() => {
    console.log("Opening AllProductsModal with products:", products?.length || 0);
    if (!products || products.length === 0) {
      console.warn("No products available to display");
      return;
    }
    setShowAllProducts(true);
  }, [products]);

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load searchMode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSearchMode = localStorage.getItem("vendai-search-mode") as "fast" | "deep" | null;
      if (savedSearchMode) {
        setSearchMode(savedSearchMode);
      }
    }
  }, []);

  // Save searchMode to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vendai-search-mode", searchMode);
    }
  }, [searchMode]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Load cart
        const savedCart = localStorage.getItem("vendai-cart");
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }

        // Load orders
        const savedOrders = localStorage.getItem("vendai-orders");
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }

        // Load chat sessions
        const savedSessions = localStorage.getItem("vendai-chat-sessions");
        if (savedSessions) {
          setChatSessions(JSON.parse(savedSessions));
        }

        // Load current messages and session ID
        const savedMessages = localStorage.getItem("vendai-current-messages");
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }

        const savedSessionId = localStorage.getItem("vendai-current-session-id");
        if (savedSessionId) {
          setCurrentSessionId(savedSessionId);
        }

        console.log("[LocalStorage] Data restored from localStorage");
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    }
  }, []);

  // Load user data with smart caching
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      try {
        const cachedCart = JSON.parse(localStorage.getItem("vendai-cart") || "[]") as CartItem[];
        const cachedOrders = JSON.parse(localStorage.getItem("vendai-orders") || "[]") as Order[];
        const cachedSessions = JSON.parse(localStorage.getItem("vendai-chat-sessions") || "[]") as ChatSession[];

        setCart(cachedCart);
        setOrders(cachedOrders);
        setChatSessions(cachedSessions);

        if (isOnline) {
          const lastSync = localStorage.getItem("vendai-last-sync");
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;

          if (!lastSync || now - Number.parseInt(lastSync) > fiveMinutes) {
            console.log("[Cache] Syncing with Firestore...");

            const cartData = await cartService.getUserCart(user.uid);
            if (JSON.stringify(cartData) !== JSON.stringify(cachedCart)) {
              setCart(cartData);
              localStorage.setItem("vendai-cart", JSON.stringify(cartData));
            }

            const { orders: ordersData } = await realtimeService.getUserOrdersOnce(user.uid);
            if (JSON.stringify(ordersData) !== JSON.stringify(cachedOrders)) {
              setOrders(ordersData);
              localStorage.setItem("vendai-orders", JSON.stringify(ordersData));
            }

            const sessionsData = await realtimeService.getUserChatSessionsOnce(user.uid);
            if (JSON.stringify(sessionsData) !== JSON.stringify(cachedSessions)) {
              setChatSessions(sessionsData);
              localStorage.setItem("vendai-chat-sessions", JSON.stringify(sessionsData));
            }

            localStorage.setItem("vendai-last-sync", now.toString());
          } else {
            console.log("[Cache] Using cached data, sync not needed");
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    if (!loading && user) {
      loadUserData();
    } else if (!loading && !user) {
      setCart([]);
      setOrders([]);
      setChatSessions([]);
    }
  }, [user, loading, isOnline]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vendai-cart", JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vendai-orders", JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vendai-chat-sessions", JSON.stringify(chatSessions));
    }
  }, [chatSessions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vendai-current-messages", JSON.stringify(messages));
      localStorage.setItem("vendai-current-session-id", currentSessionId);
    }
  }, [messages, currentSessionId]);

  // Cart sync
  useEffect(() => {
    if (user?.uid && isOnline && cart.length > 0) {
      debouncedUpdateCart(user.uid, cart);
    }
  }, [cart, user?.uid, debouncedUpdateCart, isOnline]);

  // Chat session sync
  useEffect(() => {
    if (user?.uid && isOnline) {
      const sessionToSave = chatSessions.find((s) => s.id === currentSessionId);
      if (sessionToSave && sessionToSave.messages.length > 0) {
        debouncedSaveChatSession(sessionToSave);
      }
    }
  }, [chatSessions, user?.uid, debouncedSaveChatSession, isOnline, currentSessionId]);

  // Active chat session listener - FIXED
  useEffect(() => {
    if (user?.uid && currentView === "chat" && isOnline) {
      if (activeChatUnsubscribe) {
        activeChatUnsubscribe();
        setActiveChatUnsubscribe(null);
      }

      // Only subscribe if we have messages to sync
      if (messages.length > 0) {
        const unsubscribe = realtimeService.subscribeToActiveChatSession(currentSessionId, (session) => {
          if (session && session.messages.length !== messages.length) {
            // Convert ChatMessages to Messages, preserving products
            const updatedMessages: Message[] = session.messages.map((chatMsg) => {
              const existingMsg = messages.find((m) => m.id === chatMsg.id);
              return {
                id: chatMsg.id,
                role: chatMsg.role,
                content: chatMsg.content,
                timestamp: chatMsg.timestamp,
                products: existingMsg?.products || chatMsg.products || [], // Preserve products
              };
            });
            setMessages(updatedMessages);
          }
        });
        setActiveChatUnsubscribe(() => unsubscribe);
      }
    }

    return () => {
      if (activeChatUnsubscribe) {
        activeChatUnsubscribe();
        setActiveChatUnsubscribe(null);
      }
    };
  }, [user?.uid, currentView, messages.length, currentSessionId, isOnline]);

  useEffect(() => {
    if (!loading && user && typeof window !== "undefined") {
      if (window.innerWidth >= 1024) {
        setChatHistoryOpen(true);
      }
    } else if (!user) {
      setChatHistoryOpen(false);
    }
  }, [user, loading]);

  // Chat functions - IMPROVED ERROR HANDLING
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
      products: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending chat request:", { messages: [...messages, userMessage], searchMode });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          searchMode,
        }),
      });

      if (!response.ok) {
        console.error("API response error:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received API response:", data);

      if (!data || typeof data.content !== "string") {
        throw new Error("Invalid response format from chat API");
      }

      const assistantMessage: Message = {
        id: data.id || (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        products: Array.isArray(data.products) ? data.products : [],
        timestamp: data.timestamp || new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      updateChatSession([...messages, userMessage, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isOnline
          ? "Sorry, something went wrong. Please try again."
          : "You're currently offline. Please check your internet connection and try again.",
        timestamp: new Date().toISOString(),
        products: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // IMPROVED updateChatSession function
  const updateChatSession = (newMessages: Message[]) => {
    if (newMessages.length < 2) return;

    try {
      const userMsg = newMessages[newMessages.length - 2];
      const aiMsg = newMessages[newMessages.length - 1];

      if (!userMsg || !aiMsg || userMsg.role !== "user" || aiMsg.role !== "assistant") {
        console.warn("Invalid message structure for chat session update");
        return;
      }

      const sessionTitle = generateChatTitle(userMsg.content, aiMsg.content);

      // Skip saving if title is empty (generic message)
      if (!sessionTitle) {
        console.log("Skipping chat session save - generic message");
        return;
      }

      const now = new Date().toISOString();

      // Convert Messages to ChatMessages, preserving products
      const chatMessages: ChatMessage[] = newMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || now,
        products: Array.isArray(msg.products) ? msg.products : [], // Ensure products is always an array
      }));

      const session: ChatSession = {
        id: currentSessionId,
        userId: user?.uid || "",
        title: sessionTitle,
        messages: chatMessages,
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

      console.log("Chat session updated:", {
        sessionId: currentSessionId,
        title: sessionTitle,
        messageCount: chatMessages.length
      });

    } catch (error) {
      console.error("Error updating chat session:", error);
    }
  };

  // Cart functions
  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const cartButton = document.querySelector("[data-cart-button]");
      if (cartButton) {
        cartButton.classList.add("animate-bounce");
        setTimeout(() => cartButton.classList.remove("animate-bounce"), 600);
      }

      setCart((prevCart) => {
        const productIdStr = product.id.toString();
        const existingItem = prevCart.find((item) => item.id === productIdStr);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === productIdStr ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        const itemPrice = product.price ?? 0;
        return [
          ...prevCart,
          {
            id: productIdStr,
            name: product.name,
            price: itemPrice,
            quantity,
            category: product.category,
            image: product.image,
          },
        ] as CartItem[];
      });

      setShowCartAdded(true);
      setTimeout(() => setShowCartAdded(false), 1500);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item)));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleCheckoutComplete = async (orderData: any) => {
    if (!user?.uid || !isOnline) {
      console.error("User not authenticated or offline, cannot complete checkout.");
      return;
    }

    try {
      const newOrderId = await orderService.createOrderAndClearCartBatch(user.uid, {
        ...orderData,
        userId: user.uid,
      });

      if (newOrderId) {
        orderData.id = newOrderId;
        setOrders((prev) => [orderData, ...prev]);
        setCart([]);
        setShowCheckout(false);
        localStorage.setItem("vendai-orders", JSON.stringify([orderData, ...orders]));
        localStorage.setItem("vendai-cart", JSON.stringify([]));
      } else {
        console.error("Failed to create order and clear cart.");
      }
    } catch (error) {
      console.error("Error during batched checkout complete:", error);
    }
  };

  const handleReorder = (items: CartItem[]) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    items.forEach((item) => {
      // Convert CartItem back to Product for handleAddToCart
      const product: Product = {
        id: Number.parseInt(item.id),
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image || "",
        wholesalePrice: item.price,
        description: "",
        inStock: true,
        unit: "piece",
      };
      handleAddToCart(product, item.quantity);
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
      if (activeChatUnsubscribe) {
        activeChatUnsubscribe();
        setActiveChatUnsubscribe(null);
      }
      await logout();
      setCart([]);
      setOrders([]);
      setChatSessions([]);
      setMessages([]);
      setCurrentSessionId("default");
      localStorage.removeItem("vendai-cart");
      localStorage.removeItem("vendai-chat-sessions");
      localStorage.removeItem("vendai-orders");
      localStorage.removeItem("vendai-current-messages");
      localStorage.removeItem("vendai-current-session-id");
      localStorage.removeItem("vendai-last-sync");
      localStorage.removeItem("vendai-search-mode");
      setChatHistoryOpen(false);
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
      // Convert ChatMessages back to Messages, preserving products
      const loadedMessages: Message[] = session.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        products: Array.isArray(msg.products) ? msg.products : [], // Ensure products is always an array
      }));
      setMessages(loadedMessages);
      setCurrentView("chat");
      console.log("Loaded chat session:", {
        sessionId,
        messageCount: loadedMessages.length,
        title: session.title
      });
    }
  };

  const handleBackToChat = () => {
    setCurrentView("chat");
    setShowOrderHistory(false);
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
        return <SettingsView onBack={handleBackToMain} />;
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
            searchMode={searchMode}
            setSearchMode={setSearchMode}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        {isOnline ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
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
      <OrderHistoryModal show={showOrderHistory} onClose={() => setShowOrderHistory(false)} orders={orders} />
    </div>
  );
}