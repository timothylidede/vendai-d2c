"use client";

declare global {
  interface Window {
    google?: any;
  }
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Navigation, Smartphone, AlertCircle, Search, CheckCircle, Loader2, Phone } from "lucide-react";

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

export function CheckoutModal({ show, onClose, cart, onCheckoutComplete, user }: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Payment states
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  
  // Search states
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

  // Dummy M-Pesa C2B Integration
  const initiateMpesaPayment = async () => {
    setPaymentStatus('processing');
    setPaymentMessage('Initiating M-Pesa payment...');
    
    try {
      // Simulate API call to initiate STK push
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate dummy checkout request ID
      const requestId = `CHK${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      setCheckoutRequestId(requestId);
      
      setPaymentMessage('STK push sent to your phone. Please enter your M-Pesa PIN to complete payment.');
      
      // Simulate payment processing
      setTimeout(async () => {
        setPaymentMessage('Processing payment...');
        
        // Simulate random success/failure (80% success rate)
        const success = Math.random() > 0.2;
        
        if (success) {
          setPaymentStatus('success');
          setPaymentMessage('Payment successful! Your order has been confirmed.');
          
          // Create order data
          const orderData = {
            id: `ORDER${Date.now()}`,
            userId: user?.uid || 'demo_user',
            items: cart,
            total,
            status: "confirmed",
            paymentStatus: "completed",
            paymentMethod: "mpesa",
            deliveryAddress: {
              address: deliveryAddress,
              location: selectedLocation,
              notes: deliveryNotes,
            },
            deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            mpesaTransactionId: `TXN${Date.now()}`,
            checkoutRequestId: requestId,
          };
          
          // Complete checkout after 2 seconds
          setTimeout(() => {
            onCheckoutComplete(orderData);
            resetModal();
            onClose();
          }, 2000);
          
        } else {
          setPaymentStatus('failed');
          setPaymentMessage('Payment failed. Please try again or check your M-Pesa balance.');
        }
      }, 5000);
      
    } catch (error) {
      setPaymentStatus('failed');
      setPaymentMessage('Payment failed. Please try again.');
    }
  };

  const resetModal = () => {
    setStep(1);
    setPaymentStatus('idle');
    setPaymentMessage('');
    setCheckoutRequestId('');
    setSelectedLocation(null);
    setDeliveryAddress("");
    setDeliveryNotes("");
    setSearchQuery("");
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

    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsSubmitting(true);
    await initiateMpesaPayment();
    setIsSubmitting(false);
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format for Kenya numbers
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
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
            <input
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search for places, restaurants, landmarks..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg focus:border-purple-500 focus:outline-none"
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
              <button
                onClick={getCurrentLocation}
                disabled={isLoadingLocation || !isMapLoaded}
                className="absolute top-3 right-3 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-2 h-auto shadow-lg rounded-lg flex items-center gap-1 disabled:opacity-50"
              >
                <Navigation className="h-3 w-3" />
                {isLoadingLocation ? "Getting..." : "Current Location"}
              </button>
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
          <label className="block text-sm font-medium text-white mb-2">
            Delivery Address
          </label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg p-3 focus:border-purple-500 focus:outline-none"
            rows={2}
            placeholder="Enter your delivery address"
          />
        </div>

        {/* Delivery Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Delivery Notes (Optional)
          </label>
          <textarea
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Building name, floor, apartment number, etc."
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg p-3 focus:border-purple-500 focus:outline-none"
            rows={2}
          />
        </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Smartphone className="h-5 w-5 mr-2 text-green-400" />
          M-Pesa Payment
        </h3>

        {/* M-Pesa Info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-8 w-8 text-green-400" />
            <div>
              <p className="font-medium text-white">Pay with M-Pesa</p>
              <p className="text-sm text-gray-400">Secure mobile money payment</p>
            </div>
          </div>
        </div>

        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            M-Pesa Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="0712345678 or 254712345678"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Enter the phone number registered with M-Pesa
          </p>
        </div>

        {/* Payment Status */}
        {paymentStatus !== 'idle' && (
          <div className={`p-4 rounded-lg border ${
            paymentStatus === 'processing' ? 'bg-blue-500/10 border-blue-500/20' :
            paymentStatus === 'success' ? 'bg-green-500/10 border-green-500/20' :
            'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="flex items-center space-x-3">
              {paymentStatus === 'processing' && <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
              {paymentStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
              {paymentStatus === 'failed' && <AlertCircle className="h-5 w-5 text-red-400" />}
              <div>
                <p className={`font-medium ${
                  paymentStatus === 'processing' ? 'text-blue-400' :
                  paymentStatus === 'success' ? 'text-green-400' :
                  'text-red-400'
                }`}>
                  {paymentStatus === 'processing' ? 'Processing Payment' :
                   paymentStatus === 'success' ? 'Payment Successful' :
                   'Payment Failed'}
                </p>
                <p className="text-sm text-gray-300">{paymentMessage}</p>
                {checkoutRequestId && (
                  <p className="text-xs text-gray-400 mt-1">
                    Request ID: {checkoutRequestId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="font-medium text-white mb-2">Payment Instructions:</h4>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. Click "Pay with M-Pesa" below</li>
            <li>2. Check your phone for the M-Pesa STK push</li>
            <li>3. Enter your M-Pesa PIN to complete payment</li>
            <li>4. You'll receive a confirmation SMS</li>
          </ol>
        </div>
      </div>
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
              <h2 className="text-2xl font-bold text-white">
                {step === 1 ? "Delivery Details" : "M-Pesa Payment"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center mb-8">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-3 ${step >= 2 ? "bg-purple-500" : "bg-white/10"}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"
              }`}>
                2
              </div>
            </div>

            {/* Step Content */}
            {step === 1 ? renderStep1() : renderStep2()}

            {/* Order Summary */}
            <div className="mt-8">{renderOrderSummary()}</div>

            {/* Actions */}
            <div className="flex space-x-3 mt-8">
              {step === 2 && paymentStatus === 'idle' && (
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
              )}
              
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!deliveryAddress}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Continue to Payment
                </button>
              )}
              
              {step === 2 && paymentStatus === 'idle' && (
                <button
                  onClick={handleCheckout}
                  disabled={!phoneNumber || phoneNumber.length < 10}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  Pay KES {total.toLocaleString()} with M-Pesa
                </button>
              )}
              
              {step === 2 && paymentStatus === 'failed' && (
                <button
                  onClick={() => setPaymentStatus('idle')}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Try Again
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}