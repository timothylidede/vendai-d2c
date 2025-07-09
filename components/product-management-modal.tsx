"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Edit, Trash2, Search, Package, Upload, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/data/products"

interface ProductManagementModalProps {
  show: boolean
  onClose: () => void
  onProductRemove: (productId: number) => void
  onProductUpdate: (productId: number, updates: any) => void
}

export function ProductManagementModal({
  show,
  onClose,
  onProductRemove,
  onProductUpdate,
}: ProductManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  // Filter products
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleRemoveProduct = (productId: number) => {
    onProductRemove(productId)
    setShowDeleteConfirm(null)
  }

  const handleUpdateProduct = (updates: any) => {
    if (editingProduct) {
      onProductUpdate(editingProduct.id, updates)
      setEditingProduct(null)
    }
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-gradient">Product Management</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white min-w-48"
            >
              <option value="all">All Categories</option>
              {Object.values(PRODUCT_CATEGORIES).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-effect rounded-lg p-4 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.image || `/placeholder.svg?height=64&width=64`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=64&width=64`
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
                    <p className="font-bold text-green-400">KES {product.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                    className="hover:bg-blue-500/20 text-blue-400"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(product.id)}
                    className="hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="glass-effect rounded-xl p-6 max-w-md mx-4"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">Delete Product</h3>
                    <p className="text-sm text-gray-400">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-6">
                  Are you sure you want to delete this product? It will be removed from all views and cart items.
                </p>

                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleRemoveProduct(showDeleteConfirm)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Product Modal */}
        <AnimatePresence>
          {editingProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center overflow-y-auto"
            >
              <EditProductForm
                product={editingProduct}
                onSave={handleUpdateProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Edit Product Form Component
function EditProductForm({ product, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: product.name,
    price: product.price,
    stock: product.stock,
    description: product.description,
    image: product.image,
    brand: product.brand || "",
    category: product.category,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="glass-effect rounded-xl p-6 max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
    >
      <h3 className="text-lg font-bold mb-4">Edit Product</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Product Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Brand</label>
            <Input
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Price (KES)</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Stock</label>
            <Input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            {Object.values(PRODUCT_CATEGORIES).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white h-20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Image URL</label>
          <div className="flex space-x-2">
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="flex-1 bg-white/5 border-white/10 text-white"
              placeholder="/images/products/product-name.jpg"
            />
            <Button type="button" variant="ghost" className="hover:bg-white/10">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {formData.image && (
            <div className="mt-2">
              <img
                src={formData.image || "/placeholder.svg"}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `/placeholder.svg?height=80&width=80`
                }}
              />
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 hover:bg-white/10">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 bg-white text-black hover:bg-gray-200">
            Save Changes
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
