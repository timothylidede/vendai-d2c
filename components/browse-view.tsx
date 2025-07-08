"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ShoppingBag, Plus, Search, Filter, X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuantityInput } from "./quantity-input"

interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string
  stock: number
  unit: string
  brand?: string
  size?: string
}

interface BrowseViewProps {
  products: Product[]
  onAddToCart: (product: Product, quantity?: number) => void
  onBack: () => void
}

export function BrowseView({ products, onAddToCart, onBack }: BrowseViewProps) {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])

  // Safety check to ensure products is an array
  const safeProducts = Array.isArray(products) ? products : []

  // Get categories with product counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    safeProducts.forEach((product) => {
      counts[product.category] = (counts[product.category] || 0) + 1
    })
    return Object.entries(counts).map(([category, count]) => ({ category, count }))
  }, [safeProducts])

  // Filter products based on search, category, and price
  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [safeProducts, searchQuery, selectedCategory, priceRange])

  // Essential categories (prioritized)
  const essentialCategories = [
    "Cooking Oils & Fats",
    "Rice & Grains",
    "Flour",
    "Sugar & Sweeteners",
    "Dairy Products",
    "Personal Care & Hygiene",
  ]

  const getQuantity = (productId: number) => quantities[productId] || 1

  const setQuantity = (productId: number, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: quantity }))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setPriceRange([0, 10000])
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="glass-effect border-b border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-white/10 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl font-bold text-gradient">Browse Products</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="hover:bg-white/10 rounded-xl"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, brands, or categories..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-white/20 rounded-xl"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Category Pills - Essential First */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              selectedCategory === "all"
                ? "bg-white text-black shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
            }`}
          >
            All ({safeProducts.length})
          </motion.button>

          {/* Essential Categories First */}
          {essentialCategories.map((category) => {
            const categoryData = categoriesWithCounts.find((c) => c.category === category)
            if (!categoryData) return null

            return (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                {category.split(" ")[0]} ({categoryData.count})
              </motion.button>
            )
          })}

          {/* Other Categories */}
          {categoriesWithCounts
            .filter(({ category }) => !essentialCategories.includes(category))
            .map(({ category, count }) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                {category.split(" ")[0]} ({count})
              </motion.button>
            ))}
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategory !== "all") && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-gray-400">Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                {selectedCategory}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs hover:bg-white/10 rounded-lg">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect border-b border-white/10 p-4"
          >
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Price Range</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Min Price</label>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="bg-white/5 border-white/10 text-white rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Max Price</label>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="bg-white/5 border-white/10 text-white rounded-lg"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} className="bg-white text-black hover:bg-gray-200 rounded-xl">
              Clear Filters
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-effect rounded-xl p-4 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-xl mb-3 flex items-center justify-center group-hover:from-white/15 group-hover:to-white/10 transition-all duration-300">
                  <Package className="h-12 w-12 text-gray-400 group-hover:text-gray-300 transition-colors" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-sm leading-tight">{product.name}</h3>
                    {product.brand && (
                      <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-lg">KES {product.price.toLocaleString()}</span>
                      {product.unit && <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>}
                    </div>
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                      {product.category.split(" ")[0]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <QuantityInput
                      value={getQuantity(product.id)}
                      onChange={(qty) => setQuantity(product.id, qty)}
                      className="scale-90"
                    />

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => onAddToCart(product, getQuantity(product.id))}
                        className="bg-white text-black hover:bg-gray-200 rounded-xl shadow-lg"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
