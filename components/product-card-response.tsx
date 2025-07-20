"use client"

import { motion } from "framer-motion"
import { Plus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

interface ProductCardResponseProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  explanation?: string
}

export function ProductCardResponse({ products, onAddToCart, explanation }: ProductCardResponseProps) {
  return (
    <div className="space-y-4">
      {explanation && <p className="text-gray-300 leading-relaxed mb-4">{explanation}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-effect rounded-xl p-4 hover:bg-white/5 transition-all duration-300 group"
          >
            <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-lg mb-3 flex items-center justify-center group-hover:from-white/15 group-hover:to-white/10 transition-all duration-300 overflow-hidden">
              {product.image && !product.image.includes("placeholder") ? (
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    target.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              <Package
                className={`h-8 w-8 text-gray-400 group-hover:text-gray-300 transition-colors ${
                  product.image && !product.image.includes("placeholder") ? "hidden" : ""
                }`}
              />
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-sm leading-tight text-white mb-1">{product.name}</h3>
                {product.brand && (
                  <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">{product.brand}</span>
                )}
              </div>

              <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-green-400 text-sm">
                    KES {(product.price || product.wholesalePrice)?.toLocaleString() || "N/A"}
                  </span>
                  {product.unit && <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(product)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg shadow-lg text-xs px-3 py-1.5"
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
    </div>
  )
}
