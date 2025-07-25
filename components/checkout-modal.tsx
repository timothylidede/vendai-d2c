"use client"

import type React from "react"

declare global {
  interface Window {
    google?: any
  }
}

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MapPin, Navigation, Smartphone, AlertCircle, Search, CheckCircle, Loader2, Phone, CreditCard } from "lucide-react"
import type { CartItem, UserData } from "@/lib/types" // Import UserData and CartItem from lib/types

interface CheckoutModalProps {
  show: boolean
  onClose: () => void
  cart: CartItem[]
  onCheckoutComplete: (orderData: any) => void
  user: UserData | null // Corrected type for user
}

interface PlaceSuggestion {
  place_id: string
  description: string
  main_text: string
  secondary_text: string
}

export function CheckoutModal({ show, onClose, cart, onCheckoutComplete, user }: CheckoutModalProps) {
  const [step, setStep] = useState(1)
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "")
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // M-Pesa Payment states
  const [mpesaStatus, setMpesaStatus] = useState<"idle" | "pending" | "success" | "failed">("idle")
  const [mpesaMessage, setMpesaMessage] = useState("")
  const [mpesaCheckoutRequestId, setMpesaCheckoutRequestId] = useState("")

  // Search states
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const autocompleteServiceRef = useRef<any>(null)
  const placesServiceRef = useRef<any>(null)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Check if Google Maps API key is available
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Load Google Maps script with error handling
  useEffect(() => {
    if (show && !window.google && !isMapLoaded) {
      if (!apiKey) {
        setMapError(
          "Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.",
        )
        return
      }
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => {
        setIsMapLoaded(true)
        setMapError(null)
      }

      script.onerror = () => {
        setMapError("Failed to load Google Maps. Please check your API key and internet connection.")
      }
      document.head.appendChild(script)
    }
  }, [show, apiKey, isMapLoaded])

  // Initialize Google Maps
  useEffect(() => {
    if (show && step === 1 && mapRef.current && window.google && isMapLoaded && !mapError) {
      initializeMap()
    }
  }, [show, step, isMapLoaded, mapError])

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return
    try {
      // Default to Nairobi center
      const defaultLocation = { lat: -1.2921, lng: 36.8219 }
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: selectedLocation || defaultLocation,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#000000" }, { lightness: 13 }],
          },
          {
            featureType: "administrative",
            elementType: "geometry.fill",
            stylers: [{ color: "#000000" }],
          },
          {
            featureType: "administrative",
            elementType: "geometry.stroke",
            stylers: [{ color: "#144b53" }, { lightness: 14 }, { weight: 1.4 }],
          },
          {
            featureType: "landscape",
            elementType: "all",
            stylers: [{ color: "#08304b" }],
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#0c4152" }, { lightness: 5 }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#000000" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#0b434f" }, { lightness: 25 }],
          },
          {
            featureType: "road.arterial",
            elementType: "geometry.fill",
            stylers: [{ color: "#000000" }],
          },
          {
            featureType: "road.arterial",
            elementType: "geometry.stroke",
            stylers: [{ color: "#0b3d51" }, { lightness: 16 }],
          },
          {
            featureType: "road.local",
            elementType: "geometry",
            stylers: [{ color: "#000000" }],
          },
          {
            featureType: "transit",
            elementType: "all",
            stylers: [{ color: "#146474" }],
          },
          {
            featureType: "water",
            elementType: "all",
            stylers: [{ color: "#021019" }],
          },
        ],
      })
      mapInstanceRef.current = map
      // Initialize Places services
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      placesServiceRef.current = new window.google.maps.places.PlacesService(map)
      // Add click listener to place marker
      map.addListener("click", (event: any) => {
        placeMarker(event.latLng)
      })
      // Add existing marker if location is selected
      if (selectedLocation) {
        placeMarker(new window.google.maps.LatLng(selectedLocation.lat, selectedLocation.lng))
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapError("Failed to initialize the map. Please refresh the page and try again.")
    }
  }

  const placeMarker = (location: any) => {
    if (!window.google || !mapInstanceRef.current) return
    try {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
      // Create new marker with custom icon
      const marker = new window.google.maps.Marker({
        position: location,
        map: mapInstanceRef.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#8B5CF6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
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
          setSearchQuery(results[0].formatted_address)
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
            setSearchQuery(results[0].formatted_address)
          }
        })
      })
    } catch (error) {
      console.error("Error placing marker:", error)
      setMapError("Failed to place marker. Please try again.")
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)

    if (value.length > 2 && autocompleteServiceRef.current) {
      setIsLoadingSuggestions(true)

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: "ke" }, // Restrict to Kenya
          types: ["establishment", "geocode"],
        },
        (predictions: any, status: any) => {
          setIsLoadingSuggestions(false)

          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions = predictions.map((prediction: any) => ({
              place_id: prediction.place_id,
              description: prediction.description,
              main_text: prediction.structured_formatting.main_text,
              secondary_text: prediction.structured_formatting.secondary_text,
            }))
            setSuggestions(formattedSuggestions)
            setShowSuggestions(true)
          } else {
            setSuggestions([])
            setShowSuggestions(false)
          }
        },
      )
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: PlaceSuggestion) => {
    if (!placesServiceRef.current) return
    placesServiceRef.current.getDetails({ placeId: suggestion.place_id }, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const location = place.geometry.location

        setSelectedLocation({
          lat: location.lat(),
          lng: location.lng(),
        })

        setDeliveryAddress(place.formatted_address)
        setSearchQuery(place.formatted_address)
        setShowSuggestions(false)

        // Update map center and place marker
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location)
          mapInstanceRef.current.setZoom(15)
          placeMarker(location)
        }
      }
    })
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setSelectedLocation(location)
        if (mapInstanceRef.current && window.google) {
          mapInstanceRef.current.setCenter(location)
          mapInstanceRef.current.setZoom(15)
          placeMarker(new window.google.maps.LatLng(location.lat, location.lng))
        }
        setIsLoadingLocation(false)
      },
      (error) => {
        // Improved error logging
        console.error("Geolocation error:", error.code, error.message, error)
        let errorMessage = "Unable to get your location. "

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions and try again."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage += "Location request timed out."
            break
          default:
            errorMessage += "An unknown error occurred."
            break
        }

        alert(errorMessage)
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const handleMpesaSTKPush = async () => {
    console.log("Starting M-Pesa STK Push...", { phoneNumber, deliveryAddress, cart, selectedLocation })

    // Validate inputs
    if (!phoneNumber || !deliveryAddress || cart.length === 0 || !selectedLocation) {
      setMpesaStatus("failed")
      setMpesaMessage("Please fill in all required fields and select a delivery location.")
      return
    }

    setIsSubmitting(true)
    setMpesaStatus("pending")
    setMpesaMessage("Initiating M-Pesa payment...")
    setMpesaCheckoutRequestId("")

    try {
      // Validate and format phone number
      const formattedPhone = formatPhoneNumber(phoneNumber)
      console.log("Formatted phone number:", formattedPhone)

      if (!formattedPhone) {
        throw new Error("Invalid phone number format. Please use 07XXXXXXXX or 254XXXXXXXXX")
      }

      // Ensure amount is an integer
      const totalAmount = Math.ceil(total)
      console.log("Payment amount:", totalAmount)

      const requestPayload = {
        phoneNumber: formattedPhone,
        amount: totalAmount,
        accountReference: `VendAI-${Date.now()}`,
        transactionDesc: `VendAI Order`,
      }

      console.log("Sending STK Push request:", requestPayload)

      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      })

      const responseData = await response.json()
      console.log("STK Push response received:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      })

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status} ${response.statusText}`)
      }

      if (responseData.success && responseData.data) {
        const stkData = responseData.data

        if (stkData.ResponseCode === "0" && stkData.CheckoutRequestID) {
          setMpesaStatus("pending")
          setMpesaMessage(
            `STK Push sent to ${responseData.validatedPhone}. ` +
              "Please check your phone and enter your M-Pesa PIN to complete payment.",
          )
          setMpesaCheckoutRequestId(stkData.CheckoutRequestID)

          // Store order data for later creation after payment confirmation
          const pendingOrderData = {
            userId: user?.uid || "guest",
            items: cart,
            total: totalAmount,
            status: "pending",
            paymentStatus: "pending",
            paymentMethod: "mpesa",
            deliveryAddress: {
              address: deliveryAddress,
              location: selectedLocation,
              notes: deliveryNotes,
            },
            deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            orderNumber: stkData.CheckoutRequestID,
            mpesaRequestId: stkData.CheckoutRequestID,
            createdAt: new Date().toISOString(),
          }

          // Set up payment status polling
          pollPaymentStatus(stkData.CheckoutRequestID, pendingOrderData)
        } else {
          throw new Error(
            stkData.ResponseDescription || stkData.CustomerMessage || "STK Push failed with invalid response",
          )
        }
      } else {
        throw new Error(responseData.error || "Invalid response from payment service")
      }
    } catch (error) {
      console.error("STK Push error:", error)
      setMpesaStatus("failed")

      let errorMessage = "Payment initiation failed. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("phone number")) {
          errorMessage = "Invalid phone number format. Please use 07XXXXXXXX or 254XXXXXXXXX"
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient M-Pesa balance. Please top up your account and try again."
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out. Please try again."
        } else {
          errorMessage = error.message
        }
      }

      setMpesaMessage(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const pollPaymentStatus = async (checkoutRequestId: string, orderData: any) => {
    let attempts = 0
    const maxAttempts = 24 // 2 minutes with 5-second intervals

    const checkPayment = async () => {
      attempts++

      try {
        const response = await fetch("/api/mpesa/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutRequestId }),
        })

        const result = await response.json()

        if (result.success && result.data.ResultCode === "0") {
          // Payment successful
          setMpesaStatus("success")
          setMpesaMessage("Payment confirmed! Your order has been placed successfully.")

          // Now create the order
          onCheckoutComplete(orderData)
          return
        } else if (result.success && result.data.ResultCode !== "1032") {
          // Payment failed (but not timeout)
          setMpesaStatus("failed")
          setMpesaMessage(`Payment failed: ${result.data.ResultDesc || "Unknown error"}`)
          return
        }

        // Continue polling if still pending or timeout
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 5000) // Check every 5 seconds
        } else {
          setMpesaStatus("failed")
          setMpesaMessage("Payment request timed out. Please try again or contact support if money was deducted.")
        }
      } catch (error) {
        console.error("Error checking payment status:", error)
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 5000)
        } else {
          setMpesaStatus("failed")
          setMpesaMessage("Unable to verify payment status. Please contact support.")
        }
      }
    }

    // Start checking after 10 seconds
    setTimeout(checkPayment, 10000)
  }

  const resetModal = () => {
    setStep(1)
    setMpesaStatus("idle")
    setMpesaMessage("")
    setMpesaCheckoutRequestId("")
    setSelectedLocation(null)
    setDeliveryAddress("")
    setDeliveryNotes("")
    setSearchQuery("")
    setIsMapLoaded(false) // Reset map loaded state to force re-initialization
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedLocation || !deliveryAddress) {
        setMpesaStatus("failed")
        setMpesaMessage("Please select a delivery location on the map and enter the address.")
        return
      }
      setMpesaStatus("idle") // Clear any previous M-Pesa messages
      setMpesaMessage("")
      setStep(2)
    }
  }

  const handleFinalCheckout = async () => {
    if (!user) {
      alert("Please log in to complete the checkout.");
      return;
    }
    // Validate phone number only when submitting
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone || phoneNumber.length < 10) {
      setMpesaStatus("failed");
      setMpesaMessage("Please enter a valid M-Pesa phone number (e.g., 0712345678 or 254712345678).");
      return;
    }
    await handleMpesaSTKPush();
  };

  const formatPhoneNumber = (phone: string): string | null => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/[^\d]/g, "");
    console.log("Cleaning phone number:", phone, "->", cleaned);

    // Return null if the input is empty or too short to process
    if (!cleaned) return null;

    // Only proceed with validation if the number is long enough to be meaningful
    if (cleaned.length < 9) {
      console.log("Phone number too short for validation:", cleaned);
      return cleaned; // Return cleaned partial number for display purposes
    }

    // Handle different input cases
    let formattedNumber: string;

    if (cleaned.startsWith("0")) {
      // Handle Kenyan numbers starting with 0 (e.g., 0712345678)
      if (cleaned.length === 10 && (cleaned.startsWith("07") || cleaned.startsWith("01"))) {
        formattedNumber = "254" + cleaned.substring(1);
      } else {
        console.log("Invalid 0-prefixed number format:", cleaned);
        return null;
      }
    } else if (cleaned.startsWith("254")) {
      // Handle numbers starting with 254 (e.g., 254712345678)
      if (cleaned.length === 12) {
        formattedNumber = cleaned;
      } else {
        console.log("Invalid 254-prefixed number format:", cleaned);
        return null;
      }
    } else if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
      // Handle 9-digit numbers (e.g., 712345678)
      formattedNumber = "254" + cleaned;
    } else {
      console.log("Unsupported phone number format:", cleaned);
      return null;
    }

    // Final validation: Ensure the number is a valid Kenyan mobile number
    if (!formattedNumber.match(/^254[17]\d{8}$/)) {
      console.log("Invalid Kenyan mobile number format:", formattedNumber);
      return null;
    }

    console.log("Formatted phone number:", formattedNumber);
    return formattedNumber;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value); // Allow partial input without immediate validation
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-white mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-purple-400" />
          Location
        </h3>
        
        {/* Search Box */}
        <div className="relative mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search for places, restaurants, landmarks..."
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
            />
            {isLoadingSuggestions && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 glass-effect rounded-lg shadow-xl max-h-60 overflow-y-auto bg-black border border-white/10">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 focus:outline-none focus:bg-white/10"
                >
                  <div className="text-white font-medium text-sm">{suggestion.main_text}</div>
                  <div className="text-gray-400 text-xs">{suggestion.secondary_text}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Map Container */}
        <div className="relative">
          {mapError ? (
            <div className="w-full h-64 rounded-lg glass-effect bg-red-900/20 flex items-center justify-center border border-red-500/20">
              <div className="text-center text-red-400 p-4">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{mapError}</p>
                <p className="text-xs mt-2 text-red-300">You can still enter your address manually below</p>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={mapRef}
                className="w-full h-64 rounded-lg border border-white/10 bg-black shadow-lg"
                style={{ minHeight: "300px" }}
              />
              <button
                onClick={getCurrentLocation}
                disabled={isLoadingLocation || !isMapLoaded}
                className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 h-auto shadow-lg rounded-lg flex items-center gap-1 disabled:opacity-50 touch-manipulation"
              >
                <Navigation className="h-3 w-3" />
                {isLoadingLocation ? "Getting..." : "Current Location"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* M-Pesa Info */}
      <div className="glass-effect rounded-lg p-4 bg-green-500/10 border border-green-500/20">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-6 w-6 text-green-400" />
          <div>
            <p className="font-medium text-white text-sm">Pay with M-Pesa</p>
            <p className="text-xs text-gray-400">Secure mobile money payment</p>
          </div>
        </div>
      </div>
      
      {/* Phone Number Input */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">M-Pesa Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="0712345678 or 254712345678"
            className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/10 text-white placeholder-gray-400 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
          />
        </div>
      </div>
      
      {/* Payment Status */}
      {mpesaStatus !== "idle" && (
        <div
          className={`rounded-lg p-2 border ${
            mpesaStatus === "pending"
              ? "bg-blue-500/10 border-blue-500/20"
              : mpesaStatus === "success"
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
          }`}
        >
          <div className="flex items-center space-x-2">
            {mpesaStatus === "pending" && <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />}
            {mpesaStatus === "success" && <CheckCircle className="h-4 w-4 text-green-400" />}
            {mpesaStatus === "failed" && <AlertCircle className="h-4 w-4 text-red-400" />}
            <p
              className={`font-medium text-xs ${
                mpesaStatus === "pending"
                  ? "text-blue-400"
                  : mpesaStatus === "success"
                    ? "text-green-400"
                    : "text-red-400"
              }`}
            >
              {mpesaStatus === "pending"
                ? "Waiting..."
                : mpesaStatus === "success"
                  ? "Success"
                  : "Failed"}
            </p>
            <p className="text-xs text-gray-300 ml-2">{mpesaMessage}</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderOrderSummary = () => (
    <div className="glass-effect rounded-lg p-4 space-y-3 bg-black">
      <h4 className="font-medium text-white text-sm">Order Summary</h4>
      <div className="space-y-2">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-xs">
            <span className="text-gray-300">
              {item.name} × {item.quantity}
            </span>
            <span className="text-white">KES {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">Total Amount</span>
          <span className="text-lg font-bold text-green-400">KES {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{
              y: "100%",
              opacity: 0,
              scale: 1,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
              scale: 1,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="glass-effect w-full h-[90vh] md:h-auto md:max-h-[80vh] md:w-full md:max-w-2xl md:rounded-2xl overflow-hidden flex flex-col bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Sticky on mobile */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-gradient">
                  {step === 1 ? "Delivery Details" : "Payment"}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center px-12 md:px-14 py-3 bg-black border-b border-white/10">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step >= 1 ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"
                }`}
              >
                1
              </div>
              <div className={`flex-1 h-0.5 mx-3 ${step >= 2 ? "bg-purple-500" : "bg-white/10"}`} />
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step >= 2 ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"
                }`}
              >
                2
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-black/80">
              <div className="p-4 md:p-6 bg-black">
                {/* Step Content */}
                {step === 1 ? renderStep1() : renderStep2()}
                
                {/* Order Summary - Render only in step 2 */}
                {step === 2 && (
                  <div className="mt-6">{renderOrderSummary()}</div>
                )}
              </div>
            </div>

            {/* Footer - Sticky on mobile */}
            <div className="border-t border-white/10 bg-black p-4 md:p-6 sticky bottom-0">
              <div className="flex space-x-3">
                {step === 2 && mpesaStatus === "idle" && (
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors text-sm font-medium touch-manipulation"
                  >
                    Back
                  </button>
                )}

                {step === 1 && (
                  <button
                    onClick={handleNextStep}
                    disabled={!deliveryAddress || !selectedLocation}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-black hover:from-purple-600 hover:to-gray-900 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium touch-manipulation"
                  >
                    Continue to Payment
                  </button>
                )}

                {step === 2 && mpesaStatus === "idle" && (
                  <button
                    onClick={handleFinalCheckout}
                    disabled={!phoneNumber || formatPhoneNumber(phoneNumber) === null || isSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm font-medium touch-manipulation"
                  >
                    <Smartphone className="h-4 w-4" />
                    {isSubmitting ? "Processing..." : `Pay KES ${total.toLocaleString()}`}
                  </button>
                )}

                {step === 2 && mpesaStatus === "failed" && (
                  <button
                    onClick={() => setMpesaStatus("idle")}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium touch-manipulation"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}