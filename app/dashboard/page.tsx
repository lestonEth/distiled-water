"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Droplets, Package, Truck, Star, Plus, LogOut, User } from "lucide-react"
import { PlaceOrderDialog } from "@/components/PlaceOrderDialog"
import { FeedbackDialog } from "@/components/FeedbackDialog"
import { ordersApi, feedbackApi } from "@/lib/api"

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(user)
    setCurrentUser(userData)
    loadOrders(userData.id)
    loadFeedback(userData.id)
  }, [router])

  const loadOrders = async (userId: string) => {
    try {
      const userOrders = await ordersApi.getByUser(userId)
      setOrders(userOrders)
    } catch (error) {
      console.error("Failed to load orders:", error)
    }
  }

  const loadFeedback = async (userId: string) => {
    try {
      const allFeedback = await feedbackApi.getAll()
      // Only feedback by this user
      setFeedback(allFeedback.filter((f: any) => f.userId === userId))
    } catch (error) {
      console.error("Failed to load feedback:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "in_transit":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">AquaPure Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">{currentUser.name}</span>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter((order) => order.status === "pending").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter((order) => order.status === "in_transit").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Star className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter((order) => order.status === "delivered").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowOrderDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Place New Order
            </Button>
          </div>

          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-4">Start by placing your first order</p>
                  <Button onClick={() => setShowOrderDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                          <CardDescription>Placed on {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p>
                            <strong>Quantity:</strong> {order.quantity} containers
                          </p>
                          <p>
                            <strong>Total Amount:</strong> ${order.totalAmount}
                          </p>
                          <p>
                            <strong>Delivery Address:</strong> {order.deliveryAddress}
                          </p>
                        </div>
                        <div>
                          <p>
                            <strong>Preferred Time:</strong> {order.preferredDeliveryTime}
                          </p>
                          {order.transporterId && (
                            <p>
                              <strong>Transporter:</strong> Assigned
                            </p>
                          )}
                          {order.status === "delivered" && (
                            feedback.some(f => f.orderId === order.id) ? (
                              <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded mt-2">Feedback submitted</span>
                            ) : (
                              <Button
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowFeedbackDialog(true)
                                }}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Leave Feedback
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>Name:</strong> {currentUser.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {currentUser.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {currentUser.phone}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Address:</strong> {currentUser.address}
                    </p>
                    <p>
                      <strong>User Type:</strong> {currentUser.userType}
                    </p>
                    <p>
                      <strong>Member Since:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PlaceOrderDialog
        open={showOrderDialog}
        onOpenChange={setShowOrderDialog}
        currentUser={currentUser}
        onOrderPlaced={() => {
          loadOrders(currentUser.id)
        }}
      />

      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={(open) => {
          setShowFeedbackDialog(open)
          if (!open && currentUser) {
            loadFeedback(currentUser.id)
          }
        }}
        order={selectedOrder}
        currentUser={currentUser}
      />
    </div>
  )
}
