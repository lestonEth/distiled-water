"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, CreditCard, Smartphone } from "lucide-react"

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethod: "cash" | "mpesa" | null
  orderAmount: number
}

export function SuccessModal({ open, onOpenChange, paymentMethod, orderAmount }: SuccessModalProps) {
  const handleViewOrders = () => {
    onOpenChange(false)
    window.location.href = "/dashboard"
  }

  const handleContinueShopping = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-2xl">Order Placed Successfully!</DialogTitle>
          <DialogDescription>Your order has been confirmed and will be processed shortly.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Order Amount:</span>
                <span className="font-semibold">${orderAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Payment Method:</span>
                <div className="flex items-center space-x-1">
                  {paymentMethod === "mpesa" ? (
                    <>
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">M-Pesa</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-600">Cash on Delivery</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-green-600">
                  {paymentMethod === "mpesa" ? "Paid" : "Pending Payment"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your order will be reviewed by our admin team</li>
              <li>• Quality testing will be performed on your containers</li>
              <li>• A transporter will be assigned for delivery</li>
              <li>• You'll receive updates on your order status</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={handleContinueShopping} className="w-full sm:w-auto">
            Continue Shopping
          </Button>
          <Button onClick={handleViewOrders} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            View My Orders
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
