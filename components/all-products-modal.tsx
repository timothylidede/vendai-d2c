"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Package, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AllProductsModalProps {
  show: boolean
  onClose: () => void
  products: any[]
  onAddToCart: (product: any) => void
}

export function AllProductsModal({ show, onClose, products, onAddToCart }: AllProductsModalProps) {
  // Safety check to ensure products is an array
  const safeProducts = Array.isArray(products) ? products : []

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient">All Products</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-effect rounded-lg p-4 hover:bg-white/5 transition-all duration-300"
                >
                  <div className="aspect-square bg-white/10 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="font-medium mb-2">{product.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">KES {product.price.toLocaleString()}</span>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={() => {
                          onAddToCart(product)
                          onClose()
                        }}
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
