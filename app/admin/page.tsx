"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Package, Truck, Star, LogOut, XCircle, Printer, PieChart } from "lucide-react"
import { ordersApi, usersApi } from "@/lib/api"
import { BarChart, DonutChart } from "@tremor/react"
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"

export default function AdminPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [containers, setContainers] = useState<any[]>([])
  const [feedback, setFeedback] = useState<any[]>([])
  const [transporters, setTransporters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Refs for printing
  const ordersTableRef = useRef<HTMLDivElement>(null)
  const usersTableRef = useRef<HTMLDivElement>(null)
  const containersTableRef = useRef<HTMLDivElement>(null)
  const feedbackTableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.userType !== "admin") {
      router.push("/dashboard")
      return
    }

    setCurrentUser(userData)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch all data from API
      const [allOrders, allUsers, allContainers, allFeedback] = await Promise.all([
        ordersApi.getAll(),
        usersApi.getAll(),
        fetch('/api/containers').then(res => res.json()),
        fetch('/api/feedback').then(res => res.json())
      ])

      setOrders(allOrders)
      setUsers(allUsers)
      setContainers(allContainers)
      setFeedback(allFeedback)

      // Filter transporters from users
      const transporterUsers = allUsers.filter((user: any) => user.userType === "transporter")
      setTransporters(transporterUsers)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderAction = async (orderId: string, action: "approve" | "reject", transporterId?: string) => {
    try {
      const updateData = {
        status: action === "approve" ? "approved" : "rejected",
        transporterId: transporterId || null,
        updatedAt: new Date().toISOString(),
      }

      await ordersApi.update(orderId, updateData)

      // Reload orders to get updated data
      await loadData()
    } catch (error) {
      console.error("Failed to update order:", error)
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

  // Print handlers for each table
  const handlePrintOrders = useReactToPrint({
    content: () => ordersTableRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
      }
    `,
    documentTitle: "Orders Report"
  })

  const handlePrintUsers = useReactToPrint({
    content: () => usersTableRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
      }
    `,
    documentTitle: "Users Report"
  })

  const handlePrintContainers = useReactToPrint({
    content: () => containersTableRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
      }
    `,
    documentTitle: "Containers Report"
  })

  const handlePrintFeedback = useReactToPrint({
    content: () => feedbackTableRef.current,
    pageStyle: `
      @page { size: auto; margin: 5mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
        .no-print { display: none !important; }
        .print-table { width: 100%; border-collapse: collapse; }
        .print-table th, .print-table td { border: 1px solid #ddd; padding: 8px; }
        .print-table th { background-color: #f2f2f2; }
      }
    `,
    documentTitle: "Feedback Report"
  })

  // Prepare data for charts
  const orderStatusData = orders.reduce((acc, order) => {
    const status = order.status === "in_transit" ? "in transit" : order.status
    const existing = acc.find((item: any) => item.name === status)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: status, value: 1 })
    }
    return acc
  }, [] as { name: string, value: number }[])

  const userTypeData = users.reduce((acc, user) => {
    const type = user.userType
    const existing = acc.find((item: any) => item.name === type)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: type, value: 1 })
    }
    return acc
  }, [] as { name: string, value: number }[])

  const monthlyOrderData = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt)
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`
    const existing = acc.find((item: any) => item.month === monthYear)
    if (existing) {
      existing.orders += 1
      existing.revenue += order.totalAmount
    } else {
      acc.push({ month: monthYear, orders: 1, revenue: order.totalAmount })
    }
    return acc
  }, [] as { month: string, orders: number, revenue: number }[]).slice(-6) // Last 6 months

  if (!currentUser) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-red-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transporters</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transporters.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Feedback</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedback.length}</div>
            </CardContent>
          </Card>
        </div>



        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="containers">Container Management</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>Approve or reject orders and assign transporters</CardDescription>
                  </div>
                  <Button onClick={handlePrintOrders} variant="outline" size="sm" className="no-print">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={ordersTableRef}>
                  <div className="hidden print:block mb-4">
                    <h2 className="text-xl font-bold">Orders Report</h2>
                    <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <Table className="print-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Transporter</TableHead>
                        <TableHead className="no-print">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => {
                        const customer = users.find((u) => u.id === order.userId)
                        const transporter = transporters.find((t) => t.id === order.transporterId)

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono">#{order.id.slice(-8)}</TableCell>
                            <TableCell>{customer?.name || "Unknown"}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>Ksh {order.totalAmount}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {order.status === "pending" ? (
                                <Select onValueChange={(value) => handleOrderAction(order.id, "approve", value)}>
                                  <SelectTrigger className="w-40 no-print">
                                    <SelectValue placeholder="Assign transporter" />
                                  </SelectTrigger>
                                  <SelectContent className="no-print">
                                    {transporters.map((transporter) => (
                                      <SelectItem key={transporter.id} value={transporter.id}>
                                        {transporter.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                transporter?.name || "Not assigned"
                              )}
                            </TableCell>
                            <TableCell className="no-print">
                              {order.status === "pending" && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOrderAction(order.id, "reject")}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all system users</CardDescription>
                  </div>
                  <Button onClick={handlePrintUsers} variant="outline" size="sm" className="no-print">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={usersTableRef}>
                  <div className="hidden print:block mb-4">
                    <h2 className="text-xl font-bold">Users Report</h2>
                    <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                  </div>
                  <Table className="print-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>User Type</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.userType.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="containers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Container Management</CardTitle>
                    <CardDescription>View all water containers and their status</CardDescription>
                  </div>
                  <Button onClick={handlePrintContainers} variant="outline" size="sm" className="no-print">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={containersTableRef}>
                  {containers.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No containers registered yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden print:block mb-4">
                        <h2 className="text-xl font-bold">Containers Report</h2>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                      </div>
                      <Table className="print-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Container ID</TableHead>
                            <TableHead>Weight</TableHead>
                            <TableHead>Manufacture Date</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tested By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {containers.map((container) => (
                            <TableRow key={container.id}>
                              <TableCell className="font-mono">{container.id}</TableCell>
                              <TableCell>{container.weight}L</TableCell>
                              <TableCell>{new Date(container.manufactureDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(container.expiryDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    container.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {container.approved ? "APPROVED" : "PENDING"}
                                </Badge>
                              </TableCell>
                              <TableCell>{container.testerId || "Not tested"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Customer Feedback</CardTitle>
                    <CardDescription>View all customer feedback and ratings</CardDescription>
                  </div>
                  <Button onClick={handlePrintFeedback} variant="outline" size="sm" className="no-print">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={feedbackTableRef}>
                  {feedback.length === 0 ? (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No feedback received yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden print:block mb-4">
                        <h2 className="text-xl font-bold">Feedback Report</h2>
                        <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                      </div>

                      {/* Printable version for reports */}
                      <div className="hidden print:block">
                        <Table className="print-table">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Comment</TableHead>
                              <TableHead>Transporter</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {feedback.map((item) => {
                              const customer = users.find((u) => u.id === item.userId)
                              const transporter = users.find((u) => u.id === item.transporterId)

                              return (
                                <TableRow key={item.id}>
                                  <TableCell>{customer?.name || "Unknown Customer"}</TableCell>
                                  <TableCell>#{item.orderId.slice(-8)}</TableCell>
                                  <TableCell>
                                    {item.rating}/5
                                  </TableCell>
                                  <TableCell>{item.comment}</TableCell>
                                  <TableCell>{transporter?.name || "Unknown"}</TableCell>
                                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Regular display version */}
                      <div className="space-y-4 print:hidden">
                        {feedback.map((item) => {
                          const customer = users.find((u) => u.id === item.userId)
                          const transporter = users.find((u) => u.id === item.transporterId)

                          return (
                            <Card key={item.id}>
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <p className="font-medium">{customer?.name || "Unknown Customer"}</p>
                                    <p className="text-sm text-gray-500">Order #{item.orderId.slice(-8)}</p>
                                  </div>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < item.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                          }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">({item.rating}/5)</span>
                                  </div>
                                </div>
                                <p className="text-gray-700 mb-2">{item.comment}</p>
                                <div className="text-sm text-gray-500">
                                  <p>Transporter: {transporter?.name || "Unknown"}</p>
                                  <p>Date: {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb- mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={orderStatusData}
                category="value"
                index="name"
                colors={["yellow", "blue", "purple", "green", "red"]}
                className="mt-6 h-64"
                showAnimation={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Types</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                data={userTypeData}
                category="value"
                index="name"
                colors={["blue", "green", "orange", "red"]}
                className="mt-6 h-64"
                showAnimation={true}
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Orders & Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={monthlyOrderData}
                categories={["orders", "revenue"]}
                index="month"
                colors={["blue", "green"]}
                yAxisWidth={48}
                showAnimation={true}
                className="mt-6 h-80"
              />
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}