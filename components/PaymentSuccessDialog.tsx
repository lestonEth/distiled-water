"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface OrderDetails {
    reference: string
    amount: number
    quantity: number
}

interface PaymentSuccessDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderDetails: OrderDetails
}

export function PaymentSuccessDialog({ open, onOpenChange, orderDetails }: PaymentSuccessDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <div className="text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-center">Payment Successful!</DialogTitle>
                        <DialogDescription className="text-center">
                            Your order has been confirmed and will be delivered soon.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Order Reference:</span>
                            <span className="text-sm font-medium">{orderDetails.reference}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Quantity:</span>
                            <span className="text-sm font-medium">
                                {orderDetails.quantity} container{orderDetails.quantity > 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Amount Paid:</span>
                            <span className="text-sm font-medium">KES {orderDetails.amount}</span>
                        </div>
                    </div>
                    <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}