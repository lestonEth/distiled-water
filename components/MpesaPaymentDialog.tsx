// components/MpesaPaymentDialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'verifying'

export function MpesaPaymentDialog({
    open,
    onOpenChange,
    onPaymentInitiated,
    loading,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onPaymentInitiated: (phoneNumber: string) => Promise<{ success: boolean; reference?: string }>
    loading: boolean
}) {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [status, setStatus] = useState<PaymentStatus>('idle')
    const [error, setError] = useState("")
    const [paymentReference, setPaymentReference] = useState("")

    useEffect(() => {
        if (!open) {
            // Reset state when dialog closes
            setStatus('idle')
            setPhoneNumber("")
            setError("")
            setPaymentReference("")
        }
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('processing')
        setError("")

        try {
            const response = await onPaymentInitiated(phoneNumber)

            if (response.success) {
                setPaymentReference(response.reference || "")
                setStatus('verifying')
                // Simulate payment verification (replace with actual API polling)
                await verifyPayment(response.reference || "")
            } else {
                setStatus('failed')
                setError("Payment initiation failed. Please try again.")
            }
        } catch (err) {
            setStatus('failed')
            setError(err instanceof Error ? err.message : "Payment failed unexpectedly")
        }
    }

    const verifyPayment = async (reference: string) => {
        // In a real implementation, you would poll your backend to verify payment
        // This is a mock implementation that simulates verification
        try {
            await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate network delay

            // Mock verification - 80% chance of success
            const isSuccessful = Math.random() > 0.2

            if (isSuccessful) {
                setStatus('success')
            } else {
                setStatus('failed')
                setError("Payment verification failed. Please check your M-Pesa transactions.")
            }
        } catch (err) {
            setStatus('failed')
            setError("Failed to verify payment. Please contact support.")
        }
    }

    const handleClose = () => {
        onOpenChange(false)
    }

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-center">Payment Successful!</DialogTitle>
                            <DialogDescription className="text-center">
                                Your order has been confirmed
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Transaction reference: {paymentReference}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Thank you for your purchase
                            </p>
                        </div>
                        <Button onClick={handleClose} className="w-full mt-4">
                            Close
                        </Button>
                    </div>
                )

            case 'verifying':
                return (
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-center">Verifying Payment</DialogTitle>
                            <DialogDescription className="text-center">
                                Please wait while we confirm your payment
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                A push notification was sent to {phoneNumber}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This may take a few moments...
                            </p>
                        </div>
                    </div>
                )

            case 'failed':
                return (
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-center">Payment Failed</DialogTitle>
                            <DialogDescription className="text-center">
                                {error || "Payment could not be completed"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                            {paymentReference && (
                                <p className="text-sm text-muted-foreground">
                                    Reference: {paymentReference}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Please try again or contact support
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="w-full mt-4"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => setStatus('idle')}
                                className="w-full mt-4"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )

            default:
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>M-Pesa Payment</DialogTitle>
                            <DialogDescription>
                                Enter your M-Pesa phone number to receive a payment request
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="e.g. 254712345678"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    disabled={status !== 'idle'}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Ensure your phone number is registered with M-Pesa
                                </p>
                            </div>

                            {error && (
                                <p className="text-sm font-medium text-destructive">{error}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={status !== 'idle'}
                                className="w-full"
                            >
                                {status === 'processing' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Request Payment"
                                )}
                            </Button>
                        </form>
                    </>
                )
        }
    }

    return (
        <Dialog open={open} onOpenChange={status === 'verifying' ? undefined : onOpenChange}>
            <DialogContent>
                {renderContent()}
            </DialogContent>
        </Dialog>
    )
}