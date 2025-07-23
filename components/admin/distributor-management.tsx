"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserCheck, Plus, Phone, Mail, MapPin, RefreshCw } from "lucide-react"
import { dashboardService } from "@/lib/dashboard-services"
import type { Distributor } from "@/lib/types"

export function DistributorManagement() {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDistributor, setNewDistributor] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    area: "",
  })

  useEffect(() => {
    loadDistributors()
  }, [])

  const loadDistributors = async () => {
    try {
      setLoading(true)
      const distributorsData = await dashboardService.getDistributors()
      setDistributors(distributorsData)
    } catch (error) {
      console.error("Error loading distributors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDistributor = async () => {
    try {
      const distributorData = {
        ...newDistributor,
        isActive: true,
        assignedOrders: [],
        completedOrders: 0,
        rating: 0,
      }
      const success = await dashboardService.addDistributor(distributorData)
      if (success) {
        await loadDistributors()
        setShowAddModal(false)
        setNewDistributor({ name: "", email: "", phone: "", address: "", area: "" })
        alert("Distributor added successfully!")
      } else {
        alert("Failed to add distributor")
      }
    } catch (error) {
      console.error("Error adding distributor:", error)
      alert("Error adding distributor")
    }
  }

  const filteredDistributors = distributors.filter(
    (distributor) =>
      distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.area.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading distributors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Distributors</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search distributors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
            />
          </div>
          <Button
            onClick={loadDistributors}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50 text-gray-700 bg-transparent"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Distributor
          </Button>
        </div>
      </div>

      {/* Distributors Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900">
            Distributors ({filteredDistributors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDistributors.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No distributors found</p>
              <p className="text-gray-400 text-sm mt-1">Add your first distributor to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Contact</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Area</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Orders</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistributors.map((distributor) => (
                    <TableRow key={distributor.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                            <UserCheck className="h-5 w-5 text-pink-600" />
                          </div>
                          <span className="font-medium text-gray-900">{distributor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {distributor.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {distributor.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-900">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {distributor.area}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            distributor.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-100 border-0 font-medium"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100 border-0 font-medium"
                          }
                        >
                          {distributor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            Total: {distributor.assignedOrders?.length || 0}
                          </div>
                          <div className="text-green-600 font-medium">Completed: {distributor.completedOrders}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(distributor.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Distributor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white border border-gray-200 shadow-xl">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-900">Add New Distributor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Input
                placeholder="Full Name"
                value={newDistributor.name}
                onChange={(e) => setNewDistributor({ ...newDistributor, name: e.target.value })}
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={newDistributor.email}
                onChange={(e) => setNewDistributor({ ...newDistributor, email: e.target.value })}
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
              />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={newDistributor.phone}
                onChange={(e) => setNewDistributor({ ...newDistributor, phone: e.target.value })}
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
              />
              <Input
                placeholder="Service Area (e.g., Nairobi CBD)"
                value={newDistributor.area}
                onChange={(e) => setNewDistributor({ ...newDistributor, area: e.target.value })}
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
              />
              <Input
                placeholder="Full Address"
                value={newDistributor.address}
                onChange={(e) => setNewDistributor({ ...newDistributor, address: e.target.value })}
                className="border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
              />
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewDistributor({ name: "", email: "", phone: "", address: "", area: "" })
                  }}
                  className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDistributor}
                  disabled={!newDistributor.name || !newDistributor.email || !newDistributor.phone}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                >
                  Add Distributor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
