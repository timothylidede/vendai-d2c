import type { Product, Message } from './types'

// Agentic conversation memory
export interface ConversationMemory {
  userId: string
  businessType?: 'retailer' | 'distributor'
  preferences: {
    categories: string[]
    brands: string[]
    priceRange: { min: number; max: number }
    bulkPreference: boolean
    seasonalTrends: string[]
  }
  orderHistory: {
    productId: string
    quantity: number
    date: string
    category: string
    price: number
  }[]
  conversationContext: {
    lastQuery: string
    lastCategory: string
    lastBrand: string
    intent: string
  }
  lastInteraction: string
}

// Agentic response with proactive suggestions
export interface AgenticResponse {
  response: string
  products: Product[]
  proactiveSuggestions: string[]
  businessInsights: string[]
  followUpQuestions: string[]
  seasonalRecommendations: string[]
}

// Business intelligence agent
export class BusinessIntelligenceAgent {
  private static readonly SEASONAL_TRENDS = {
    'december': ['beverages', 'snacks', 'cleaning-products'],
    'january': ['cleaning-products', 'personal-care---hygiene'],
    'february': ['beverages', 'snacks'],
    'march': ['beverages', 'snacks'],
    'april': ['beverages', 'snacks'],
    'may': ['beverages', 'snacks'],
    'june': ['beverages', 'snacks'],
    'july': ['beverages', 'snacks'],
    'august': ['beverages', 'snacks'],
    'september': ['beverages', 'snacks'],
    'october': ['beverages', 'snacks'],
    'november': ['beverages', 'snacks', 'cleaning-products']
  }

  private static readonly COMPLEMENTARY_PRODUCTS = {
    'beverages': ['snacks', 'cleaning-products'],
    'snacks': ['beverages', 'cleaning-products'],
    'cleaning-products': ['personal-care---hygiene', 'household-items'],
    'personal-care---hygiene': ['cleaning-products', 'household-items'],
    'household-items': ['cleaning-products', 'personal-care---hygiene']
  }

  private static readonly PROFIT_MARGINS = {
    'beverages': { min: 15, max: 25 },
    'snacks': { min: 20, max: 30 },
    'cleaning-products': { min: 25, max: 35 },
    'personal-care---hygiene': { min: 30, max: 40 }
  }

  static getSeasonalRecommendations(): string[] {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase()
    return this.SEASONAL_TRENDS[currentMonth as keyof typeof this.SEASONAL_TRENDS] || []
  }

  static getComplementaryCategories(category: string): string[] {
    return this.COMPLEMENTARY_PRODUCTS[category.toLowerCase() as keyof typeof this.COMPLEMENTARY_PRODUCTS] || []
  }

  static getProfitMargin(category: string): { min: number; max: number } {
    return this.PROFIT_MARGINS[category.toLowerCase() as keyof typeof this.PROFIT_MARGINS] || { min: 15, max: 25 }
  }

  static suggestBulkPurchase(product: Product, userHistory: any[]): boolean {
    const hasOrderedBefore = userHistory.some(order => order.productId === product.id)
    const isHighDemand = ['beverages', 'snacks', 'cleaning-products'].includes(product.category.toLowerCase())
    const isSeasonal = this.getSeasonalRecommendations().includes(product.category.toLowerCase())
    
    return hasOrderedBefore || isHighDemand || isSeasonal
  }

  static calculateOptimalQuantity(product: Product, userHistory: any[]): number {
    const previousOrders = userHistory.filter(order => order.productId === product.id)
    if (previousOrders.length === 0) return 1
    
    const avgQuantity = previousOrders.reduce((sum, order) => sum + order.quantity, 0) / previousOrders.length
    return Math.ceil(avgQuantity * 1.2) // Suggest 20% more than average
  }

  static generateBusinessInsights(memory: ConversationMemory, products: Product[]): string[] {
    const insights: string[] = []
    
    if (memory.businessType === 'retailer') {
      // Analyze profit margins
      const categories = [...new Set(products.map(p => p.category))]
      categories.forEach(category => {
        const margin = this.getProfitMargin(category)
        insights.push(`${category} typically has ${margin.min}-${margin.max}% profit margins - great for your shop!`)
      })

      // Suggest bulk purchases
      const bulkProducts = products.filter(p => this.suggestBulkPurchase(p, memory.orderHistory))
      if (bulkProducts.length > 0) {
        insights.push(`Consider ordering ${bulkProducts[0].name} in bulk for better wholesale pricing`)
      }
    }

    // Seasonal insights
    const seasonalCategories = this.getSeasonalRecommendations()
    if (seasonalCategories.length > 0) {
      insights.push(`${seasonalCategories[0]} and ${seasonalCategories[1]} are trending this month`)
    }

    return insights
  }
}

// Conversation memory manager
export class ConversationMemoryManager {
  private static memories = new Map<string, ConversationMemory>()

  static getMemory(userId: string): ConversationMemory {
    if (!this.memories.has(userId)) {
      this.memories.set(userId, {
        userId,
        preferences: {
          categories: [],
          brands: [],
          priceRange: { min: 0, max: 10000 },
          bulkPreference: false,
          seasonalTrends: []
        },
        orderHistory: [],
        conversationContext: {
          lastQuery: '',
          lastCategory: '',
          lastBrand: '',
          intent: ''
        },
        lastInteraction: new Date().toISOString()
      })
    }
    return this.memories.get(userId)!
  }

  static updateMemory(userId: string, updates: Partial<ConversationMemory>): void {
    const memory = this.getMemory(userId)
    Object.assign(memory, updates)
    memory.lastInteraction = new Date().toISOString()
  }

  static addOrderToHistory(userId: string, order: { productId: string; quantity: number; category: string; price: number }): void {
    const memory = this.getMemory(userId)
    memory.orderHistory.push({
      ...order,
      date: new Date().toISOString()
    })
  }

  static updatePreferences(userId: string, preferences: Partial<ConversationMemory['preferences']>): void {
    const memory = this.getMemory(userId)
    Object.assign(memory.preferences, preferences)
  }

  static updateConversationContext(userId: string, context: Partial<ConversationMemory['conversationContext']>): void {
    const memory = this.getMemory(userId)
    Object.assign(memory.conversationContext, context)
  }
}

// Agentic chat service
export class AgenticChatService {
  static async generateResponse(
    userId: string,
    query: string,
    products: Product[],
    searchMode: 'fast' | 'deep'
  ): Promise<AgenticResponse> {
    const memory = ConversationMemoryManager.getMemory(userId)
    
    // Update conversation context
    ConversationMemoryManager.updateConversationContext(userId, {
      lastQuery: query,
      lastCategory: products[0]?.category || '',
      lastBrand: products[0]?.brand || '',
      intent: this.extractIntent(query)
    })

    // Generate base response
    const response = this.generateBaseResponse(query, products, searchMode)
    
    // Generate proactive suggestions
    const proactiveSuggestions = this.generateProactiveSuggestions(memory, products, query)
    
    // Generate business insights
    const businessInsights = BusinessIntelligenceAgent.generateBusinessInsights(memory, products)
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(memory, products, query)
    
    // Generate seasonal recommendations
    const seasonalRecommendations = this.generateSeasonalRecommendations(memory, products)

    return {
      response,
      products,
      proactiveSuggestions,
      businessInsights,
      followUpQuestions,
      seasonalRecommendations
    }
  }

  private static extractIntent(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('shop') || lowerQuery.includes('store') || lowerQuery.includes('duka')) {
      return 'business_retail'
    }
    if (lowerQuery.includes('wholesale') || lowerQuery.includes('distributor')) {
      return 'business_distribution'
    }
    if (lowerQuery.includes('bulk') || lowerQuery.includes('many')) {
      return 'bulk_purchase'
    }
    if (lowerQuery.includes('cheap') || lowerQuery.includes('budget')) {
      return 'price_sensitive'
    }
    if (lowerQuery.includes('premium') || lowerQuery.includes('luxury')) {
      return 'premium_selection'
    }
    
    return 'general_search'
  }

  private static generateBaseResponse(query: string, products: Product[], searchMode: 'fast' | 'deep'): string {
    if (products.length === 0) {
      return `I couldn't find any products matching "${query}". Let me suggest some alternatives or help you refine your search.`
    }

    const categories = [...new Set(products.map(p => p.category))]
    let response = `I found ${products.length} ${products.length === 1 ? 'product' : 'products'} for "${query}"`
    
    if (categories.length === 1) {
      response += ` in the ${categories[0]} category`
    }
    
    if (searchMode === 'deep') {
      response += ' ✨ (AI-enhanced search)'
    }

    return response
  }

  private static generateProactiveSuggestions(memory: ConversationMemory, products: Product[], query: string): string[] {
    const suggestions: string[] = []
    
    // Suggest complementary products
    if (products.length > 0) {
      const category = products[0].category
      const complementary = BusinessIntelligenceAgent.getComplementaryCategories(category)
      if (complementary.length > 0) {
        suggestions.push(`Consider adding ${complementary[0]} to complement your ${category} selection`)
      }
    }

    // Suggest bulk purchases for business users
    if (memory.businessType === 'retailer') {
      const bulkProducts = products.filter(p => BusinessIntelligenceAgent.suggestBulkPurchase(p, memory.orderHistory))
      if (bulkProducts.length > 0) {
        suggestions.push(`Order ${bulkProducts[0].name} in bulk for better wholesale pricing`)
      }
    }

    // Seasonal suggestions
    const seasonalCategories = BusinessIntelligenceAgent.getSeasonalRecommendations()
    if (seasonalCategories.length > 0) {
      suggestions.push(`Stock up on ${seasonalCategories[0]} - it's trending this month!`)
    }

    return suggestions
  }

  private static generateFollowUpQuestions(memory: ConversationMemory, products: Product[], query: string): string[] {
    const questions: string[] = []
    
    if (memory.businessType === 'retailer') {
      questions.push('Would you like me to suggest optimal order quantities for better margins?')
      questions.push('Should I show you complementary products that pair well with these items?')
    }

    if (products.length > 0) {
      const category = products[0].category
      questions.push(`Would you like to see more ${category} options?`)
      questions.push('Should I check if any of these products are available in bulk quantities?')
    }

    return questions
  }

  private static generateSeasonalRecommendations(memory: ConversationMemory, products: Product[]): string[] {
    const recommendations: string[] = []
    const seasonalCategories = BusinessIntelligenceAgent.getSeasonalRecommendations()
    
    seasonalCategories.forEach(category => {
      if (!products.some(p => p.category === category)) {
        recommendations.push(`${category} is trending this month - consider adding it to your inventory`)
      }
    })

    return recommendations
  }
}
