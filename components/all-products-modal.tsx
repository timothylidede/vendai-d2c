"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useMemo } from "react"

interface AllProductsModalProps {
  show: boolean
  onClose: () => void
  products: any[]
  onAddToCart: (product: any) => void
}

export function AllProductsModal({ show, onClose, products, onAddToCart }: AllProductsModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Safety check to ensure products is an array
  const safeProducts = Array.isArray(products) ? products : []

  // Filter products based on search query
  const filteredProducts = safeProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Pagination logic
  const itemsPerPage = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024 ? 30 : 10 // lg screens: 30, smaller: 10
    }
    return 30 // default for SSR
  }, [])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to first page when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

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
            className="glass-effect rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-white/10 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gradient">Products</h2>
                <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full bg-black border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
                />
              </div>

              {/* Pagination Info */}
              {filteredProducts.length > 0 && (
                <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length}{" "}
                    products
                  </span>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-effect rounded-lg p-4 hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="aspect-square bg-white/10 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={product.image || `/placeholder.svg?height=200&width=200`}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=200&width=200`
                        }}
                      />
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

              {/* No results message */}
              {filteredProducts.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No products found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 bg-black/80 backdrop-blur-sm border-t border-white/10 p-4">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className={currentPage === pageNum ? "bg-white text-black" : "hover:bg-white/10"}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
