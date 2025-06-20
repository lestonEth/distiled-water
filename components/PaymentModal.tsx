"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Smartphone } from "lucide-react"
import { MpesaModal } from "./MpesaModal"
import { SuccessModal } from "./SuccessModal"
import { ordersApi } from "@/lib/api"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  features: string[]
  inStock: boolean
}

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
}

export function PaymentModal({ open, onOpenChange, product }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa" | null>(null)
  const [showMpesaModal, setShowMpesaModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderData, setOrderData] = useState({
    quantity: 1,
    deliveryAddress: "",
    preferredDeliveryTime: "",
    specialInstructions: "",
  })
  const [loading, setLoading] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
  const totalAmount = product.price * orderData.quantity

  const handleInputChange = (field: string, value: string | number) => {
    setOrderData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentMethodSelect = (method: "cash" | "mpesa") => {
    setPaymentMethod(method)
    if (method === "mpesa") {
      setShowMpesaModal(true)
    } else {
      handleCashPayment()
    }
  }

  const handleCashPayment = async () => {
    setLoading(true)
    try {
      const order = {
        userId: currentUser.id,
        productId: product.id,
        productName: product.name,
        quantity: orderData.quantity,
        deliveryAddress: orderData.deliveryAddress || currentUser.address,
        preferredDeliveryTime: orderData.preferredDeliveryTime,
        specialInstructions: orderData.specialInstructions,
        totalAmount,
        paymentMethod: "cash",
        paymentStatus: "pending",
      }

      await ordersApi.create(order)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Failed to create order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMpesaSuccess = async (transactionId: string) => {
    setLoading(true)
    try {
      const order = {
        userId: currentUser.id,
        productId: product.id,
        productName: product.name,
        quantity: orderData.quantity,
        deliveryAddress: orderData.deliveryAddress || currentUser.address,
        preferredDeliveryTime: orderData.preferredDeliveryTime,
        specialInstructions: orderData.specialInstructions,
        totalAmount,
        paymentMethod: "mpesa",
        paymentStatus: "completed",
        transactionId,
      }

      await ordersApi.create(order)
      setShowMpesaModal(false)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Failed to create order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPaymentMethod(null)
    setOrderData({
      quantity: 1,
      deliveryAddress: "",
      preferredDeliveryTime: "",
      specialInstructions: "",
    })
    onOpenChange(false)
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    handleClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-12 h-12 rounded mr-3" />
              Order {product.name}
            </DialogTitle>
            <DialogDescription>Complete your order details and choose your payment method</DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Order Details</h3>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Select
                  value={orderData.quantity.toString()}
                  onValueChange={(value) => handleInputChange("quantity", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} container{num > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  value={orderData.deliveryAddress}
                  onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                  placeholder={currentUser.address || "Enter delivery address"}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredDeliveryTime">Preferred Delivery Time</Label>
                <Select
                  value={orderData.preferredDeliveryTime}
                  onValueChange={(value) => handleInputChange("preferredDeliveryTime", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                    <SelectItem value="anytime">Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  value={orderData.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  placeholder="Any special delivery instructions..."
                  rows={2}
                />
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Method</h3>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal:</span>
                  <span>
                    ${product.price} × {orderData.quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">${totalAmount}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Card
                  className={`cursor-pointer transition-all ${
                    paymentMethod === "cash" ? "ring-2 ring-blue-500" : "hover:shadow-md"
                  }`}
                  onClick={() => handlePaymentMethodSelect("cash")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold">Cash on Delivery</h4>
                        <p className="text-sm text-gray-600">Pay when your order arrives</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    paymentMethod === "mpesa" ? "ring-2 ring-blue-500" : "hover:shadow-md"
                  }`}
                  onClick={() => handlePaymentMethodSelect("mpesa")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-6 w-6 text-green-600" />
                      <div>
                        <h4 className="font-semibold">M-Pesa Payment</h4>
                        <p className="text-sm text-gray-600">Pay instantly with M-Pesa</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Instant</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MpesaModal
        open={showMpesaModal}
        onOpenChange={setShowMpesaModal}
        amount={totalAmount}
        onSuccess={handleMpesaSuccess}
      />

      <SuccessModal
        open={showSuccessModal}
        onOpenChange={handleSuccessClose}
        paymentMethod={paymentMethod}
        orderAmount={totalAmount}
      />
    </>
  )
}
