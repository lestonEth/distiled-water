"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ordersApi } from "@/lib/api"

interface PlaceOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: any
  onOrderPlaced: () => void
}

export function PlaceOrderDialog({ open, onOpenChange, currentUser, onOrderPlaced }: PlaceOrderDialogProps) {
  const [formData, setFormData] = useState({
    quantity: "",
    deliveryAddress: currentUser?.address || "",
    preferredDeliveryTime: "",
    specialInstructions: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const orderData = {
        userId: currentUser.id,
        quantity: Number.parseInt(formData.quantity),
        deliveryAddress: formData.deliveryAddress,
        preferredDeliveryTime: formData.preferredDeliveryTime,
        specialInstructions: formData.specialInstructions,
        totalAmount: Number.parseInt(formData.quantity) * 25, // $25 per container
      }

      await ordersApi.create(orderData)

      onOrderPlaced()
      onOpenChange(false)

      // Reset form
      setFormData({
        quantity: "",
        deliveryAddress: currentUser?.address || "",
        preferredDeliveryTime: "",
        specialInstructions: "",
      })
    } catch (error: any) {
      setError(error.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place New Order</DialogTitle>
          <DialogDescription>Order premium distilled water for delivery</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Containers)</Label>
            <Select value={formData.quantity} onValueChange={(value) => handleInputChange("quantity", value)}>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.quantity}>
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
