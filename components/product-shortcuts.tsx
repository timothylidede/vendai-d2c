"use client"

import { motion } from "framer-motion"
import { Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string
}

interface ProductShortcutsProps {
  products: Product[]
  onQuickAdd: (product: Product) => void
  onViewAll: () => void
}

export function ProductShortcuts({ products, onQuickAdd, onViewAll }: ProductShortcutsProps) {
  // Safety check to ensure products is an array
  const safeProducts = Array.isArray(products) ? products : []

  // Get essential products for shortcuts
  const essentialProducts = safeProducts
    .filter(
      (product) =>
        // Show smaller unit cooking oils, flour, and other daily essentials
        (product.category.includes("Cooking Oils") && product.price < 300) ||
        (product.category.includes("Flour") && product.price < 100) ||
        (product.category.includes("Personal Care") && product.price < 200) ||
        (product.category.includes("Cleaning") && product.price < 200) ||
        (product.category.includes("Dairy") && product.price < 400),
    )
    .slice(0, 3)

  return (
    <div className="pb-3 border-b border-white/5">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {essentialProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuickAdd(product)}
              className="text-xs bg-gradient-to-r from-white/5 to-white/10 hover:from-white/15 hover:to-white/20 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2 h-auto transition-all duration-300 whitespace-nowrap shadow-lg"
            >
              <Plus className="h-3 w-3 mr-2" />
              <div className="text-left">
                <div className="font-medium">{product.name}</div>
                <div className="text-green-400 font-bold">KES {product.price.toLocaleString()}</div>
              </div>
            </Button>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-xl px-4 py-2 h-auto text-blue-300 transition-all duration-300 whitespace-nowrap shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            <Sparkles className="h-3 w-3 mr-2" />
            <div className="text-left">
              <div className="font-medium">View All Products</div>
              <div className="text-blue-400">50+ items available</div>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
