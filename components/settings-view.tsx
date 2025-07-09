"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Bell, MapPin, CreditCard, Shield, User, Phone, Save, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SettingsViewProps {
  onBack: () => void
  onProductManagement?: () => void
}

export function SettingsView({ onBack, onProductManagement }: SettingsViewProps) {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    deliveryAlerts: true,
    weeklyDeals: true,
  })

  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+254 712 345 678",
    address: "123 Nairobi Street, Westlands",
    city: "Nairobi",
    postalCode: "00100",
  })

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

          <Button className="mt-4 bg-white text-black hover:bg-gray-200">
            <Save className="h-4 w-4 mr-2" />
            Save Profile
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
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Special Instructions</label>
              <textarea
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
                  <p className="text-xs text-gray-400">+254 712 *** 678</p>
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
                // You'll need to pass this as a prop from the parent
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
