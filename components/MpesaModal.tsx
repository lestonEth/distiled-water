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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, Loader2 } from "lucide-react"

interface MpesaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onSuccess: (transactionId: string) => void
}

export function MpesaModal({ open, onOpenChange, amount, onSuccess }: MpesaModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"input" | "processing" | "confirm">("input")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (cleanPhone.length < 10) {
      setError("Please enter a valid phone number")
      return
    }

    setLoading(true)
    setStep("processing")

    // Simulate M-Pesa API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setStep("confirm")
    } catch (error) {
      setError("Failed to initiate M-Pesa payment. Please try again.")
      setStep("input")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setLoading(true)

    // Simulate payment confirmation
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const transactionId = `MP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      onSuccess(transactionId)
    } catch (error) {
      setError("Payment confirmation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setPhoneNumber("")
    setError("")
    setStep("input")
    setLoading(false)
    onOpenChange(false)
  }

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join("-")
    }
    return value
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>M-Pesa Payment</DialogTitle>
              <DialogDescription>Pay ${amount} using M-Pesa mobile money</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === "input" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="254-XXX-XXXX"
                required
                className="text-lg"
              />
              <p className="text-sm text-gray-600">Enter your M-Pesa registered phone number</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Payment Details</h4>
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span>AquaPure Water Delivery</span>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Send Payment Request"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Processing Payment Request</h3>
            <p className="text-gray-600 mb-4">
              We've sent a payment request to your phone number ending in <strong>{phoneNumber.slice(-4)}</strong>
            </p>
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertDescription>
                Please check your phone and enter your M-Pesa PIN to complete the payment.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === "confirm" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Confirm Payment</h3>
            <p className="text-gray-600 mb-6">
              Did you complete the M-Pesa payment of <strong>${amount}</strong> on your phone?
            </p>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                No, Try Again
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Yes, Payment Complete"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
