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
    <div className="border-t border-white/5 pt-3">
      <p className="text-xs text-gray-500 mb-2 text-center">Quick add:</p>
      <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide">
        {essentialProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuickAdd(product)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-lg px-3 py-2 h-auto transition-all duration-300 whitespace-nowrap"
            >
              <Plus className="h-3 w-3 mr-1" />
              <div className="text-left">
                <div className="font-medium text-xs">{product.name.split(" ").slice(0, 2).join(" ")}</div>
                <div className="text-green-400 font-bold text-xs">KES {product.price.toLocaleString()}</div>
              </div>
            </Button>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-shrink-0"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg px-3 py-2 h-auto text-purple-300 transition-all duration-300 whitespace-nowrap"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            <div className="text-left">
              <div className="font-medium text-xs">View All</div>
              <div className="text-purple-400 text-xs">120+ items</div>
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
