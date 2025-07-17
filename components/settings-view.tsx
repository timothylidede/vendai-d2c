"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Bell, MapPin, CreditCard, Shield, User, Phone, Save, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { userProfileService, userSettingsService } from "@/lib/firebase-services"

interface SettingsViewProps {
  onBack: () => void
  onProductManagement?: () => void
}

export function SettingsView({ onBack, onProductManagement }: SettingsViewProps) {
  const { user } = useAuth()

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    deliveryAlerts: true,
    weeklyDeals: true,
  })

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  const [deliveryPreferences, setDeliveryPreferences] = useState({
    preferredTime: "anytime",
    specialInstructions: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load user data from Firebase
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return

      try {
        setLoading(true)

        // Load profile data
        const profileData = await userProfileService.getUserProfile(user.uid)
        if (profileData) {
          setProfile({
            name: profileData.name || user.displayName || "",
            email: profileData.email || user.email || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
            city: profileData.city || "",
            postalCode: profileData.postalCode || "",
          })
        } else {
          // Set defaults from auth
          setProfile({
            name: user.displayName || "",
            email: user.email || "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
          })
        }

        // Load settings data
        const settingsData = await userSettingsService.getUserSettings(user.uid)
        if (settingsData) {
          setNotifications(settingsData.notifications || notifications)
          setDeliveryPreferences(settingsData.deliveryPreferences || deliveryPreferences)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const handleSaveProfile = async () => {
    if (!user?.uid) return

    try {
      setSaving(true)
      await userProfileService.updateUserProfile(user.uid, profile)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user?.uid) return

    try {
      setSaving(true)
      await userSettingsService.updateUserSettings(user.uid, {
        notifications,
        deliveryPreferences,
      })
      alert("Settings updated successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to update settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold text-gradient">Settings</h2>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-medium">Profile Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">City</label>
              <Input
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Address</label>
              <Input
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="mt-4 bg-white text-black hover:bg-gray-200">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-medium">Delivery Preferences</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Preferred Delivery Time</label>
              <select
                value={deliveryPreferences.preferredTime}
                onChange={(e) => setDeliveryPreferences({ ...deliveryPreferences, preferredTime: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Special Instructions</label>
              <textarea
                value={deliveryPreferences.specialInstructions}
                onChange={(e) =>
                  setDeliveryPreferences({ ...deliveryPreferences, specialInstructions: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white h-20 resize-none"
                placeholder="e.g., Leave at gate, Call before delivery..."
              />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium">Notifications</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">
                  {key === "orderUpdates" && "Order Updates"}
                  {key === "promotions" && "Promotions & Offers"}
                  {key === "deliveryAlerts" && "Delivery Alerts"}
                  {key === "weeklyDeals" && "Weekly Deals"}
                </span>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !value })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={handleSaveSettings} disabled={saving} className="mt-4 bg-white text-black hover:bg-gray-200">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium">Payment Methods</h3>
          </div>
          <div className="space-y-3">
            <div className="glass-effect rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">M-Pesa</p>
                  <p className="text-xs text-gray-400">{profile.phone || "+254 712 *** 678"}</p>
                </div>
              </div>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Primary</span>
            </div>
            <div className="glass-effect rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Visa Card</p>
                  <p className="text-xs text-gray-400">**** **** **** 1234</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-xs hover:bg-white/10">
                Edit
              </Button>
            </div>
            <Button variant="ghost" className="w-full border border-white/10 hover:bg-white/5">
              Add Payment Method
            </Button>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-medium">Security</h3>
          </div>
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start hover:bg-white/10">
              Change Password
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-white/10">
              Two-Factor Authentication
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-white/10">
              Login History
            </Button>
          </div>
        </motion.div>

        {/* Product Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium">Product Management</h3>
          </div>
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-white/10"
              onClick={() => {
                onProductManagement?.()
              }}
            >
              Manage Products
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-white/10">
              Import Products
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-white/10">
              Export Catalog
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
