"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Package, Clock, LogOut, Play, CheckCircle } from "lucide-react"

export default function TransporterPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assignedOrders, setAssignedOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.userType !== "transporter") {
      router.push("/dashboard")
      return
    }

    setCurrentUser(userData)
    loadData()
  }, [router])

  const loadData = () => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")

    setUsers(allUsers)

    // Get orders assigned to this transporter
    const transporterOrders = allOrders.filter(
      (order: any) => order.transporterId === JSON.parse(localStorage.getItem("currentUser") || "{}").id,
    )

    setAssignedOrders(transporterOrders)
  }

  const updateOrderStatus = (orderId: string, status: string) => {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    const updatedOrders = allOrders.map((order: any) => {
      if (order.id === orderId) {
        const updates: any = { status, updatedAt: new Date().toISOString() }

        if (status === "in_transit") {
          updates.startTime = new Date().toISOString()
        } else if (status === "delivered") {
          updates.deliveredTime = new Date().toISOString()
        }

        return { ...order, ...updates }
      }
      return order
    })

    localStorage.setItem("orders", JSON.stringify(updatedOrders))
    setAssignedOrders(updatedOrders.filter((order: any) => order.transporterId === currentUser.id))
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  const pendingOrders = assignedOrders.filter((order) => order.status === "approved")
  const inTransitOrders = assignedOrders.filter((order) => order.status === "in_transit")
  const deliveredOrders = assignedOrders.filter((order) => order.status === "delivered")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-orange-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Transporter Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {currentUser.name}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Vehicle Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p>
                  <strong>Vehicle ID:</strong> {currentUser.vehicleId}
                </p>
              </div>
              <div>
                <p>
                  <strong>Vehicle Name:</strong> {currentUser.vehicleName}
                </p>
              </div>
              <div>
                <p>
                  <strong>Vehicle Size:</strong> {currentUser.vehicleSize}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assigned</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Pickup</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inTransitOrders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Orders</CardTitle>
            <CardDescription>Manage your delivery assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedOrders.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders assigned yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Delivery Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedOrders.map((order) => {
                    const customer = users.find((u) => u.id === order.userId)

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">#{order.id.slice(-8)}</TableCell>
                        <TableCell>{customer?.name || "Unknown"}</TableCell>
                        <TableCell>{order.quantity} containers</TableCell>
                        <TableCell className="max-w-xs truncate">{order.deliveryAddress}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.status === "approved" && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, "in_transit")}>
                              <Play className="h-4 w-4 mr-2" />
                              Start Delivery
                            </Button>
                          )}
                          {order.status === "in_transit" && (
                            <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivered")}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Delivered
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <span className="text-sm text-gray-500">
                              Delivered on {new Date(order.deliveredTime).toLocaleDateString()}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
