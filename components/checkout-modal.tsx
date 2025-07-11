"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Navigation, CreditCard, Smartphone, Banknote, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  description: string;
  image: string;
}

interface CheckoutModalProps {
  show: boolean;
  onClose: () => void;
  cart: CartItem[];
  onCheckoutComplete: (orderData: any) => void;
  user: any;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export function CheckoutModal({ show, onClose, cart, onCheckoutComplete, user }: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // New states for autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check if Google Maps API key is available
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script with error handling
  useEffect(() => {
    if (show && !window.google && !isMapLoaded) {
      if (!apiKey) {
        setMapError("Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsMapLoaded(true);
        setMapError(null);
      };
      
      script.onerror = () => {
        setMapError("Failed to load Google Maps. Please check your API key and internet connection.");
      };

      document.head.appendChild(script);
    }
  }, [show, apiKey, isMapLoaded]);

  // Initialize Google Maps
  useEffect(() => {
    if (show && step === 1 && mapRef.current && window.google && isMapLoaded && !mapError) {
      initializeMap();
    }
  }, [show, step, isMapLoaded, mapError]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      // Default to Nairobi center
      const defaultLocation = { lat: -1.2921, lng: 36.8219 };

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: selectedLocation || defaultLocation,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#ffffff" }]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#000000" }, { "lightness": 13 }]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#000000" }]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#144b53" }, { "lightness": 14 }, { "weight": 1.4 }]
          },
          {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{ "color": "#08304b" }]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{ "color": "#0c4152" }, { "lightness": 5 }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#000000" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#0b434f" }, { "lightness": 25 }]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#000000" }]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#0b3d51" }, { "lightness": 16 }]
          },
          {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{ "color": "#000000" }]
          },
          {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{ "color": "#146474" }]
          },
          {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{ "color": "#021019" }]
          }
        ],
      });

      mapInstanceRef.current = map;

      // Initialize Places services
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);

      // Add click listener to place marker
      map.addListener("click", (event: any) => {
        placeMarker(event.latLng);
      });

      // Add existing marker if location is selected
      if (selectedLocation) {
        placeMarker(new window.google.maps.LatLng(selectedLocation.lat, selectedLocation.lng));
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize the map. Please refresh the page and try again.");
    }
  };

  const placeMarker = (location: any) => {
    if (!window.google || !mapInstanceRef.current) return;

    try {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
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
      });

      markerRef.current = marker;

      // Update selected location
      setSelectedLocation({
        lat: location.lat(),
        lng: location.lng(),
      });

      // Reverse geocode to get address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results: any, status: any) => {
        if (status === "OK" && results[0]) {
          setDeliveryAddress(results[0].formatted_address);
          setSearchQuery(results[0].formatted_address);
        }
      });

      // Add drag listener
      marker.addListener("dragend", (event: any) => {
        const newLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setSelectedLocation(newLocation);

        // Update address
        geocoder.geocode({ location: event.latLng }, (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            setDeliveryAddress(results[0].formatted_address);
            setSearchQuery(results[0].formatted_address);
          }
        });
      });
    } catch (error) {
      console.error("Error placing marker:", error);
      setMapError("Failed to place marker. Please try again.");
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length > 2 && autocompleteServiceRef.current) {
      setIsLoadingSuggestions(true);
      
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: 'ke' }, // Restrict to Kenya
          types: ['establishment', 'geocode'],
        },
        (predictions: any, status: any) => {
          setIsLoadingSuggestions(false);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions = predictions.map((prediction: any) => ({
              place_id: prediction.place_id,
              description: prediction.description,
              main_text: prediction.structured_formatting.main_text,
              secondary_text: prediction.structured_formatting.secondary_text,
            }));
            setSuggestions(formattedSuggestions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: PlaceSuggestion) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      { placeId: suggestion.place_id },
      (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const location = place.geometry.location;
          
          setSelectedLocation({
            lat: location.lat(),
            lng: location.lng(),
          });
          
          setDeliveryAddress(place.formatted_address);
          setSearchQuery(place.formatted_address);
          setShowSuggestions(false);
          
          // Update map center and place marker
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(15);
            placeMarker(location);
          }
        }
      }
    );
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setSelectedLocation(location);

        if (mapInstanceRef.current && window.google) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(15);
          placeMarker(new window.google.maps.LatLng(location.lat, location.lng));
        }

        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your location. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        
        alert(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please log in to complete the checkout.");
      return;
    }

    if (!selectedLocation || !deliveryAddress) {
      alert("Please select a delivery location on the map.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data matching Firestore schema
      const orderData = {
        userId: user.uid,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          description: item.description,
          image: item.image,
        })),
        total,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        deliveryAddress: {
          address: deliveryAddress,
          location: selectedLocation,
          notes: deliveryNotes,
        },
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save order to Firestore
      const orderRef = await addDoc(collection(db, "orders"), orderData);

      // Initiate M-Pesa payment if selected
      if (paymentMethod === "mpesa") {
        const paymentResponse = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderRef.id,
            userId: user.uid,
            amount: total,
            phoneNumber,
          }),
        });

        const paymentData = await paymentResponse.json();

        if (!paymentData.success) {
          throw new Error(paymentData.error || "Failed to initiate M-Pesa payment");
        }

        // Save payment to Firestore
        await addDoc(collection(db, "payments"), {
          orderId: orderRef.id,
          userId: user.uid,
          amount: total,
          phoneNumber,
          provider: "mpesa",
          status: "pending",
          checkoutRequestId: paymentData.checkoutRequestId,
          transactionId: "",
          transactionData: {},
          description: `Payment for order ${orderRef.id}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      onCheckoutComplete({ id: orderRef.id, ...orderData });
      setStep(1);
      setSelectedLocation(null);
      setDeliveryAddress("");
      setDeliveryNotes("");
      setPhoneNumber("");
      setSearchQuery("");
      onClose();
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-purple-400" />
          Delivery Location
        </h3>

        {/* Search Box */}
        <div className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search for places, restaurants, landmarks..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
            />
            {isLoadingSuggestions && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 focus:outline-none focus:bg-white/10"
                >
                  <div className="text-white font-medium">{suggestion.main_text}</div>
                  <div className="text-gray-400 text-sm">{suggestion.secondary_text}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative">
          {mapError ? (
            <div className="w-full h-64 rounded-lg border border-red-500/20 bg-red-900/20 flex items-center justify-center">
              <div className="text-center text-red-400 p-4">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">{mapError}</p>
                <p className="text-xs mt-2 text-red-300">
                  You can still enter your address manually below
                </p>
              </div>
            </div>
          ) : (
            <>
              <div 
                ref={mapRef} 
                className="w-full h-64 rounded-lg border border-white/20 bg-gray-900 shadow-lg" 
                style={{ minHeight: '300px' }}
              />
              <Button
                onClick={getCurrentLocation}
                disabled={isLoadingLocation || !isMapLoaded}
                className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 h-auto shadow-lg"
              >
                <Navigation className="h-3 w-3 mr-1" />
                {isLoadingLocation ? "Getting..." : "Current Location"}
              </Button>
            </>
          )}
        </div>

        {!mapError && (
          <p className="text-sm text-gray-400 mt-2">
            🔍 Search for places above, click on the map to place a pin, or use your current location
          </p>
        )}
      </div>

      {/* Address Display */}
      <div>
        <Label htmlFor="address" className="text-white">
          Delivery Address
        </Label>
        <Textarea
          id="address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          className="mt-1 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
          rows={2}
          placeholder="Enter your delivery address"
        />
      </div>

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
          className="mt-1 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
          rows={2}
        />
      </div>
    </div>
  );

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
            className="mt-1 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-500"
          />
        </div>
      )}
    </div>
  );

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
  );

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
                disabled={step === 1 ? !deliveryAddress : isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                {step === 1 ? "Continue to Payment" : isSubmitting ? "Processing..." : `Pay KES ${total.toLocaleString()}`}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}