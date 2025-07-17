"use client"

import type React from "react"

import { X, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import { toast } from "sonner"
import type { CartItem } from "@/lib/types" // Import CartItem from global types

interface CartModalProps {
  show: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemoveItem: (productId: number) => void
  onCheckout: () => void
}

const CartModal: React.FC<CartModalProps> = ({ show, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      onRemoveItem(productId)
      return
    }
    onUpdateQuantity(productId, quantity)
  }

  const handleRemoveItem = (productId: number) => {
    onRemoveItem(productId)
    toast.success("Item removed from cart.")
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    onCheckout()
  }

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-5 w-5 text-purple-400" />
              <DialogTitle className="text-xl font-bold text-gradient">Your Cart</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        {cart.length > 0 ? (
          <>
            <ScrollArea className="h-[300px] p-2">
              {cart.map((item) => (
                <div key={item.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-16">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{item.name}</h3>
                        <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Badge className="bg-secondary border-secondary text-secondary-foreground">{item.quantity}</Badge>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <Button
                    variant="link"
                    size="sm"
                    className="ml-auto flex w-fit items-center justify-center space-x-2 text-destructive"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </Button>
                </div>
              ))}
            </ScrollArea>
            <div className="mt-4">
              <Separator />
              <div className="mt-4 flex items-center justify-between font-semibold">
                <p>Total</p>
                <p>{formatPrice(totalPrice)}</p>
              </div>
              <Button className="w-full mt-4" onClick={handleCheckout}>
                Checkout
              </Button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <ShoppingCart className="mx-auto h-6 w-6 text-gray-500" />
            <p className="mt-2 text-sm text-gray-500">Your cart is empty.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { CartModal }
