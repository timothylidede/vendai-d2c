"use client"

import { motion } from "framer-motion"
import { Plus, Package, Eye, Star, MapPin, Phone, Mail, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Product, Distributor } from "@/lib/types"

interface ProductCardResponseProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  explanation?: string
  distributors?: Distributor[] // Add distributors data
}

export function ProductCardResponse({ products, onAddToCart, explanation, distributors = [] }: ProductCardResponseProps) {
  const [showAll, setShowAll] = useState(false)
  const [hoveredDistributor, setHoveredDistributor] = useState<string | null>(null)
  const displayProducts = showAll ? products : products.slice(0, 5)
  const hasMore = products.length > 5

  // Helper function to get distributor info by name
  const getDistributorInfo = (distributorName: string) => {
    return distributors.find(d => d.name === distributorName)
  }

  return (
    <div className="space-y-4">
      {explanation && <p className="text-gray-300 leading-relaxed mb-4">{explanation}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts.map((product, index) => {
          const distributorInfo = product.distributorName ? getDistributorInfo(product.distributorName) : null
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect rounded-xl p-4 hover:bg-white/5 transition-all duration-300 group relative"
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

                {/* Show product description */}
                <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>

                {/* Distributor Name with Gold Star */}
                {product.distributorName && (
                  <div className="relative">
                    <div
                      className="flex items-center space-x-1 cursor-pointer w-fit"
                      onMouseEnter={() => setHoveredDistributor(product.distributorName!)}
                      onMouseLeave={() => setHoveredDistributor(null)}
                    >
                      <span className="text-xs text-amber-400 font-medium">
                        {product.distributorName}
                      </span>
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    </div>

                    {/* Distributor Info Dropdown */}
                    {hoveredDistributor === product.distributorName && distributorInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 left-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 shadow-xl"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white text-sm">{distributorInfo.name}</h4>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs text-amber-400">{distributorInfo.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2 text-xs text-gray-300">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span>{distributorInfo.email}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-300">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{distributorInfo.phone}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-300">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span>{distributorInfo.area}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-xs text-gray-300">
                              <Award className="h-3 w-3 text-gray-400" />
                              <span>{distributorInfo.completedOrders} orders completed</span>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-700/50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Status:</span>
                              <span className={`px-2 py-0.5 rounded-full ${
                                distributorInfo.isActive 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {distributorInfo.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

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
          )
        })}
      </div>

      {hasMore && !showAll && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setShowAll(true)}
            variant="outline"
            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 bg-transparent"
          >
            <Eye className="h-4 w-4 mr-2" />
            Show {products.length - 5} more products
          </Button>
        </div>
      )}

      {showAll && hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setShowAll(false)}
            variant="outline"
            className="border-gray-500/30 text-gray-300 hover:bg-gray-500/10 hover:border-gray-400 bg-transparent"
          >
            Show less
          </Button>
        </div>
      )}
    </div>
  )
}