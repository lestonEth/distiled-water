"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, CheckCircle } from "lucide-react"
import { PaymentModal } from "./PaymentModal"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  features: string[]
  inStock: boolean
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleBuyNow = () => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login"
      return
    }
    setShowPaymentModal(true)
  }

  return (
    <>
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white">
        <CardHeader className="p-0">
          <div className="relative">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
                <Badge variant="destructive" className="text-white">
                  Out of Stock
                </Badge>
              </div>
            )}
            {product.inStock && <Badge className="absolute top-4 right-4 bg-green-600 text-white">In Stock</Badge>}
          </div>
        </CardHeader>
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
            <CardDescription className="text-gray-600 mb-4">{product.description}</CardDescription>

            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Features:</h4>
              <ul className="space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl font-bold text-blue-600">${product.price}</div>
              <div className="text-sm text-gray-500">per container</div>
            </div>

            <Button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.inStock ? "Buy Now" : "Out of Stock"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} product={product} />
    </>
  )
}
