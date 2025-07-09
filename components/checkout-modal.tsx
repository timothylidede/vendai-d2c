"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Navigation, CreditCard, Smartphone, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
  description: string
  image: string
}

interface CheckoutModalProps {
  show: boolean
  onClose: () => void
  cart: CartItem[]
  onCheckoutComplete: (orderData: any) => void
  user: any
}

declare global {
  interface Window {
    google: any
  }
}

export function CheckoutModal({ show, onClose, cart, onCheckoutComplete, user }: CheckoutModalProps) {
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Initialize Google Maps
  useEffect(() => {
    if (show && step === 1 && mapRef.current && window.google) {
      initializeMap()
    }
  }, [show, step])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return

    // Default to Nairobi center
    const defaultLocation = { lat: -1.2921, lng: 36.8219 }

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: selectedLocation || defaultLocation,
      styles: [
        {
          featureType: "all",
          elementType: "geometry.fill",
          stylers: [{ color: "#1a1a1a" }],
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }],
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#2563eb" }],
        },
      ],
    })

    mapInstanceRef.current = map

    // Add click listener to place marker
    map.addListener("click", (event: any) => {
      placeMarker(event.latLng)
    })

    // Add existing marker if location is selected
    if (selectedLocation) {
      placeMarker(new window.google.maps.LatLng(selectedLocation.lat, selectedLocation.lng))
    }
  }

  const placeMarker = (location: any) => {
    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
    })

    markerRef.current = marker

    // Update selected location
    setSelectedLocation({
      lat: location.lat(),
      lng: location.lng(),
    })

    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setDeliveryAddress(results[0].formatted_address)
      }
    })

    // Add drag listener
    marker.addListener("dragend", (event: any) => {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      }
      setSelectedLocation(newLocation)

      // Update address
      geocoder.geocode({ location: event.latLng }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          setDeliveryAddress(results[0].formatted_address)
        }
      })
    })
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          setSelectedLocation(location)

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location)
            placeMarker(new window.google.maps.LatLng(location.lat, location.lng))
          }

          setIsLoadingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoadingLocation(false)
        },
      )
    } else {
      setIsLoadingLocation(false)
    }
  }

  const handleCheckout = () => {
    if (!selectedLocation || !deliveryAddress) {
      alert("Please select a delivery location on the map")
      return
    }

    const orderData = {
      id: `ORDER-${Date.now()}`,
      items: cart,
      total,
      status: "pending" as const,
      date: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod,
      phoneNumber,
      deliveryAddress,
      deliveryNotes,
      deliveryLocation: selectedLocation,
      user: user?.name || "Guest",
    }

    onCheckoutComplete(orderData)
    setStep(1)
    setSelectedLocation(null)
    setDeliveryAddress("")
    setDeliveryNotes("")
    setPhoneNumber("")
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-purple-400" />
          Delivery Location
        </h3>

        {/* Map Container */}
        <div className="relative">
          <div ref={mapRef} className="w-full h-64 rounded-lg border border-white/10 bg-gray-900" />

          {/* Use Current Location Button */}
          <Button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="absolute top-3 right-3 bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1 h-8"
          >
            <Navigation className="h-3 w-3 mr-1" />
            {isLoadingLocation ? "Getting..." : "Use Current"}
          </Button>
        </div>

        <p className="text-sm text-gray-400 mt-2">
          Click on the map to place a delivery pin, or use your current location
        </p>
      </div>

      {/* Address Display */}
      {deliveryAddress && (
        <div>
          <Label htmlFor="address" className="text-white">
            Delivery Address
          </Label>
          <Textarea
            id="address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="mt-1 bg-white/5 border-white/10 text-white"
            rows={2}
          />
        </div>
      )}

      {/* Delivery Notes */}
      <div>
        <Label htmlFor="notes" className="text-white">
          Delivery Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          placeholder="Building name, floor, apartment number, etc."
          className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400"
          rows={2}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
        <div className="grid grid-cols-1 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod("mpesa")}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              paymentMethod === "mpesa"
                ? "border-green-500 bg-green-500/10"
                : "border-white/10 bg-white/5 hover:border-green-500/50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6 text-green-400" />
              <div className="text-left">
                <p className="font-medium text-white">M-Pesa</p>
                <p className="text-sm text-gray-400">Pay with your mobile money</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod("card")}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              paymentMethod === "card"
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/10 bg-white/5 hover:border-blue-500/50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-blue-400" />
              <div className="text-left">
                <p className="font-medium text-white">Card Payment</p>
                <p className="text-sm text-gray-400">Visa, Mastercard</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod("cash")}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              paymentMethod === "cash"
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-white/10 bg-white/5 hover:border-yellow-500/50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Banknote className="h-6 w-6 text-yellow-400" />
              <div className="text-left">
                <p className="font-medium text-white">Cash on Delivery</p>
                <p className="text-sm text-gray-400">Pay when you receive</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {paymentMethod === "mpesa" && (
        <div>
          <Label htmlFor="phone" className="text-white">
            M-Pesa Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="254712345678"
            className="mt-1 bg-white/5 border-white/10 text-white placeholder-gray-400"
          />
        </div>
      )}
    </div>
  )

  const renderOrderSummary = () => (
    <div className="bg-white/5 rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-white">Order Summary</h4>
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between text-sm">
          <span className="text-gray-300">
            {item.name} × {item.quantity}
          </span>
          <span className="text-white">KES {(item.price * item.quantity).toLocaleString()}</span>
        </div>
      ))}
      <div className="border-t border-white/10 pt-3">
        <div className="flex justify-between font-medium">
          <span className="text-white">Total</span>
          <span className="text-white">KES {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  // Load Google Maps script
  useEffect(() => {
    if (show && !window.google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{step === 1 ? "Delivery Details" : "Payment & Review"}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center mb-8">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"
                }`}
              >
                1
              </div>
              <div className={`flex-1 h-1 mx-3 ${step >= 2 ? "bg-purple-500" : "bg-white/10"}`} />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"
                }`}
              >
                2
              </div>
            </div>

            {/* Step Content */}
            {step === 1 ? renderStep1() : renderStep2()}

            {/* Order Summary */}
            <div className="mt-8">{renderOrderSummary()}</div>

            {/* Actions */}
            <div className="flex space-x-3 mt-8">
              {step === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={step === 1 ? () => setStep(2) : handleCheckout}
                disabled={step === 1 && (!selectedLocation || !deliveryAddress)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {step === 1 ? "Continue to Payment" : `Pay KES ${total.toLocaleString()}`}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
