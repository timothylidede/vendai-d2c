import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"
import type { Product } from "@/lib/types"
import { handle_Search, healthCheck } from "./communicate"

export const maxDuration = 30

export function getProductsByIds(ids: number[], searchQuery?: string): Product[] {
  try {
    const products = PRODUCTS.filter((product) => ids.includes(product.id)).map((product) => ({
      ...product,
      distributorName: product.distributorName || "Unknown Distributor",
    }))

    if (searchQuery && products.length > 1) {
      const normalizedQuery = searchQuery.toLowerCase()

      return products.sort((a, b) => {
        let scoreA = 0
        let scoreB = 0

        if (a.name.toLowerCase().includes(normalizedQuery)) scoreA += 10
        if (b.name.toLowerCase().includes(normalizedQuery)) scoreB += 10

        if (a.category.toLowerCase().includes(normalizedQuery)) scoreA += 5
        if (b.category.toLowerCase().includes(normalizedQuery)) scoreB += 5

        if (a.brand?.toLowerCase().includes(normalizedQuery)) scoreA += 3
        if (b.brand?.toLowerCase().includes(normalizedQuery)) scoreB += 3

        if (a.inStock && !b.inStock) scoreA += 2
        if (b.inStock && !a.inStock) scoreB += 2

        if (scoreA === scoreB) {
          return a.price - b.price
        }

        return scoreB - scoreA
      })
    }

    return products
  } catch (error) {
    console.error("Error in getProductsByIds:", error)
    return []
  }
}

interface SearchAnalytics {
  query: string
  searchMode: "fast" | "deep"
  resultCount: number
  responseTime: number
  success: boolean
  timestamp: string
  userAgent?: string
}

const searchAnalytics: SearchAnalytics[] = []

function logSearchAnalytics(analytics: SearchAnalytics) {
  try {
    searchAnalytics.push(analytics)
    if (searchAnalytics.length > 1000) {
      searchAnalytics.shift()
    }
    console.log(`📊 Search Analytics:`, {
      query: analytics.query,
      mode: analytics.searchMode,
      results: analytics.resultCount,
      time: `${analytics.responseTime}ms`,
      success: analytics.success,
    })
  } catch (error) {
    console.warn("Failed to log search analytics:", error)
  }
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 30,
}

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetTime: number } {
  try {
    const now = Date.now()
    const clientLimit = rateLimitMap.get(clientIp)

    if (!clientLimit || now > clientLimit.resetTime) {
      rateLimitMap.set(clientIp, {
        count: 1,
        resetTime: now + RATE_LIMIT.windowMs,
      })
      return {
        allowed: true,
        remaining: RATE_LIMIT.maxRequests - 1,
        resetTime: now + RATE_LIMIT.windowMs,
      }
    }

    if (clientLimit.count >= RATE_LIMIT.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: clientLimit.resetTime,
      }
    }

    clientLimit.count++
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxRequests - clientLimit.count,
      resetTime: clientLimit.resetTime,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    // Allow request if rate limiting fails
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxRequests - 1,
      resetTime: Date.now() + RATE_LIMIT.windowMs,
    }
  }
}

function createErrorResponse(message: string, statusCode = 500, errorCode?: string) {
  return NextResponse.json(
    {
      id: Date.now().toString(),
      role: "assistant",
      content: message,
      products: [],
      timestamp: new Date().toISOString(),
      error: {
        code: errorCode || "INTERNAL_ERROR",
        message,
      },
    },
    { status: statusCode },
  )
}

function validateSearchRequest(body: any): { valid: boolean; error?: string } {
  try {
    if (!body) {
      return { valid: false, error: "Request body is required" }
    }

    const { messages, searchMode } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { valid: false, error: "Messages array is required and must not be empty" }
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || !lastMessage.content) {
      return { valid: false, error: "Last message must have content" }
    }

    if (typeof lastMessage.content !== 'string' || lastMessage.content.trim().length === 0) {
      return { valid: false, error: "Search query cannot be empty" }
    }

    if (lastMessage.content.length > 500) {
      return { valid: false, error: "Search query is too long (max 500 characters)" }
    }

    if (searchMode && !["fast", "deep"].includes(searchMode)) {
      return { valid: false, error: "Invalid search mode. Must be 'fast' or 'deep'" }
    }

    return { valid: true }
  } catch (error) {
    console.error("Validation error:", error)
    return { valid: false, error: "Invalid request format" }
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let searchAnalyticsData: Partial<SearchAnalytics> = {
    timestamp: new Date().toISOString(),
    success: false,
  };

  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(',')[0]?.trim() ||
                     req.headers.get("x-real-ip") ||
                     req.headers.get("cf-connecting-ip") ||
                     "unknown";

    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." } },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.maxRequests.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    let body;
    try {
      body = await req.json();
      console.log("Received request body:", body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return createErrorResponse("Invalid JSON in request body", 400, "INVALID_JSON");
    }

    const validation = validateSearchRequest(body);
    if (!validation.valid) {
      console.error("Validation failed:", validation.error);
      return createErrorResponse(validation.error!, 400, "VALIDATION_ERROR");
    }

    const { messages, searchMode = "fast" } = body;
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content.trim();

    searchAnalyticsData = {
      ...searchAnalyticsData,
      query,
      searchMode: searchMode as "fast" | "deep",
      userAgent: req.headers.get("user-agent") || undefined,
    };

    console.log(`🔍 ${searchMode.toUpperCase()} SEARCH: "${query}"`);

    const response = await handle_Search("user", query, searchMode);
    console.log("handle_Search response:", {
      productIds: response.productIds,
      vendaiResponse: response.vendaiResponse,
      productsCount: response.products.length,
    });

    const result = {
      id: Date.now().toString(),
      role: "assistant" as const,
      content: response.vendaiResponse,
      products: response.products,
      timestamp: new Date().toISOString(),
      metadata: {
        searchMode,
        resultCount: response.products.length,
        queryProcessed: query,
        responseTime: Date.now() - startTime,
        deepSeekUsed: searchMode === "deep",
      },
    };

    searchAnalyticsData.resultCount = response.products.length;
    searchAnalyticsData.success = true;
    searchAnalyticsData.responseTime = Date.now() - startTime;
    logSearchAnalytics(searchAnalyticsData as SearchAnalytics);

    const headers = {
      "X-RateLimit-Limit": RATE_LIMIT.maxRequests.toString(),
      "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
      "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      "Content-Type": "application/json",
    };

    return NextResponse.json(result, { headers });
  } catch (error) {
    console.error("💥 Chat API critical error:", error);
    searchAnalyticsData.success = false;
    searchAnalyticsData.responseTime = Date.now() - startTime;
    if (searchAnalyticsData.query) {
      logSearchAnalytics(searchAnalyticsData as SearchAnalytics);
    }
    return createErrorResponse(
      "An unexpected error occurred. Please try again.",
      500,
      "SEARCH_ERROR"
    );
  }
}

// GET endpoint for health checks
export async function GET() {
  try {
    const health = await healthCheck()
    
    return NextResponse.json({
      status: health.status,
      timestamp: new Date().toISOString(),
      details: health.details,
      version: "1.0.0"
    })
  } catch (error) {
    console.error("Health check failed:", error)
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: {
          deepseek: false,
          cache_size: 0,
          products_count: 0,
        }
      },
      { status: 503 }
    )
  }
}