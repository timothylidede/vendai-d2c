"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Shield, UserCog, User, RefreshCw, Users } from "lucide-react"
import { dashboardService } from "@/lib/dashboard-services"
import type { UserData } from "@/lib/types"

export function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersData = await dashboardService.getAllUsers(200)
      setUsers(usersData || [])
    } catch (error) {
      console.error("Error loading users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "distributor" | "customer") => {
    try {
      const success = await dashboardService.setUserRole(userId, newRole)
      if (success) {
        await loadUsers()
        alert(`User role updated to ${newRole}`)
      } else {
        alert("Failed to update user role")
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Error updating user role")
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />
      case "distributor":
        return <UserCog className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadge = (role?: string) => {
    const roleConfig = {
      admin: { bg: "bg-red-100", text: "text-red-800", label: "Admin" },
      distributor: { bg: "bg-blue-100", text: "text-blue-800", label: "Distributor" },
      customer: { bg: "bg-gray-100", text: "text-gray-800", label: "Customer" },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.customer

    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg} border-0 font-medium`}>
        <div className="flex items-center gap-1">
          {getRoleIcon(role)}
          {config.label}
        </div>
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Users</h2>
        <Button
          onClick={loadUsers}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 text-gray-700 bg-transparent"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-900">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-700 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Email</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Phone</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Provider</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Joined</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid} className="border-gray-100 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL || "/placeholder.svg"}
                              alt=""
                              className="w-10 h-10 rounded-full border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                              <span className="text-pink-600 text-sm font-semibold">
                                {(user.name || user.displayName || user.email || "U")[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {user.name || user.displayName || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900 font-medium">{user.email}</TableCell>
                      <TableCell className="text-gray-600">{user.phone || "N/A"}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300 text-gray-700 font-medium">
                          {user.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role || "customer"}
                          onValueChange={(newRole: "admin" | "distributor" | "customer") =>
                            handleRoleChange(user.uid, newRole)
                          }
                        >
                          <SelectTrigger className="w-32 border-gray-300 focus:border-pink-500 focus:ring-pink-500 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="distributor">Distributor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
