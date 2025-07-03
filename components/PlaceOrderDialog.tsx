"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ordersApi } from "@/lib/api"
import { MpesaPaymentDialog } from "@/components/MpesaPaymentDialog"
import { PaymentSuccessDialog } from "./PaymentSuccessDialog"

interface PlaceOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: any
  onOrderPlaced: () => void
}

export function PlaceOrderDialog({ open, onOpenChange, currentUser, onOrderPlaced }: PlaceOrderDialogProps) {
  const [formData, setFormData] = useState({
    quantity: "1",
    deliveryAddress: currentUser?.address || "",
    preferredDeliveryTime: "",
    specialInstructions: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showMpesaDialog, setShowMpesaDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [orderDetails, setOrderDetails] = useState({
    reference: "",
    amount: 0,
    quantity: 0,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate form
    if (!formData.quantity || !formData.deliveryAddress || !formData.preferredDeliveryTime) {
      setError("Please fill all required fields")
      return
    }
    setShowMpesaDialog(true)
  }

  const handleMpesaPayment = async (phoneNumber: string): Promise<{ success: boolean; reference?: string }> => {
    setLoading(true)
    setError("")

    try {
      // First initiate M-Pesa payment
      const amount = Number(formData.quantity) * 25
      const paymentResponse = await ordersApi.initiateMpesaPayment({
        phoneNumber,
        amount,
      })

      if (paymentResponse.success) {
        // Then create the order
        const orderData = {
          userId: currentUser.id,
          quantity: Number(formData.quantity),
          deliveryAddress: formData.deliveryAddress,
          preferredDeliveryTime: formData.preferredDeliveryTime,
          specialInstructions: formData.specialInstructions,
          totalAmount: amount,
          paymentMethod: "mpesa",
          paymentReference: paymentResponse.reference,
        }

        await ordersApi.create(orderData)

        // Set order details for success modal
        setOrderDetails({
          reference: paymentResponse.reference || "",
          amount,
          quantity: Number(formData.quantity),
        })

        // Show success dialog
        setShowSuccessDialog(true)
        setShowMpesaDialog(false)

        return { success: true, reference: paymentResponse.reference }
      } else {
        setError(paymentResponse.error || "Payment initiation failed")
        return { success: false }
      }
    } catch (error: any) {
      setError(error.message || "Failed to process payment and place order")
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false)
    onOpenChange(false)
    onOrderPlaced()

    // Reset form
    setFormData({
      quantity: "1",
      deliveryAddress: currentUser?.address || "",
      preferredDeliveryTime: "",
      specialInstructions: "",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Place New Order</DialogTitle>
            <DialogDescription>Order premium distilled water for delivery</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Containers)</Label>
              <Select
                value={formData.quantity}
                onValueChange={(value) => handleInputChange("quantity", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quantity" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 10, 15, 20, 25, 30].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} container{num > 1 ? "s" : ""} (Ksh {num * 25})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
              <Textarea
                id="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                required
                placeholder="Enter delivery address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredDeliveryTime">Preferred Delivery Time</Label>
              <Select
                value={formData.preferredDeliveryTime}
                onValueChange={(value) => handleInputChange("preferredDeliveryTime", value)}
                required
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
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                placeholder="Any special delivery instructions..."
                rows={2}
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.quantity || !formData.deliveryAddress || !formData.preferredDeliveryTime}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <MpesaPaymentDialog
        open={showMpesaDialog}
        onOpenChange={setShowMpesaDialog}
        onPaymentInitiated={handleMpesaPayment}
        loading={loading}
      />

      <PaymentSuccessDialog
        open={showSuccessDialog}
        onOpenChange={handleSuccessDialogClose}
        orderDetails={orderDetails}
      />
    </>
  )
}