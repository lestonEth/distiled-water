"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, Shield, Truck, Users, Star, CheckCircle, ArrowRight, Play, ShoppingCart } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    try {
      const currentUser = localStorage.getItem("currentUser")
      setIsLoggedIn(!!currentUser)
    } catch (error) {
      console.error("Error checking login status:", error)
      setIsLoggedIn(false)
    }
  }, [])

  const products = [
    {
      id: 1,
      name: "Premium Distilled Water - 20L",
      price: 25,
      image: "https://tiimg.tistatic.com/fp/1/006/211/20l-mineral-water-can-132.jpg",
      description: "Ultra-pure distilled water in 20L containers. Perfect for drinking, cooking, and medical use.",
      features: ["99.9% Pure", "Laboratory Tested", "BPA-Free Container", "Long Shelf Life"],
      inStock: true,
    },
    {
      id: 2,
      name: "Family Pack - 5L x 4 Bottles",
      price: 45,
      image: "https://www.gobeba.com/wp-content/uploads/2021/11/MK-H2O-1.png",
      description: "Convenient family pack with 4 bottles of 5L distilled water. Ideal for households.",
      features: ["Convenient Size", "Family Friendly", "Easy Storage", "Cost Effective"],
      inStock: true,
    },
    {
      id: 3,
      name: "Industrial Grade - 50L",
      price: 85,
      image: "https://m.media-amazon.com/images/I/61bLkMDLtBL._UF894,1000_QL80_.jpg",
      description: "High-capacity industrial grade distilled water for commercial and industrial applications.",
      features: ["Industrial Grade", "High Volume", "Commercial Use", "Bulk Pricing"],
      inStock: true,
    },
    {
      id: 4,
      name: "Medical Grade - 10L",
      price: 35,
      image: "https://zoros.co.ke/wp-content/uploads/2015/04/zoros-cool-purified-drinking-water-10l.jpg",
      description: "Medical grade distilled water meeting pharmaceutical standards for medical facilities.",
      features: ["Medical Grade", "Pharmaceutical Standard", "Sterile Packaging", "Quality Certified"],
      inStock: false,
    },
  ]

  const handleNavigation = (path: string) => {
    try {
      router.push(path)
    } catch (error) {
      console.error("Navigation error:", error)
      window.location.href = path
    }
  }

  const scrollToSection = (sectionId: string) => {
    try {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } catch (error) {
      console.error("Scroll error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Droplets className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-2xl font-bold text-gray-800">AquaPure</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("products")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Reviews
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Button onClick={() => handleNavigation("/auth/login")} variant="ghost">
                  Sign In
                </Button>
                <Button onClick={() => handleNavigation("/auth/register")} className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </>
            ) : (
              <Button onClick={() => handleNavigation("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
                Dashboard
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Banner */}
      <section className="pt-20 pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://media.istockphoto.com/id/477571259/photo/crystal-clear-water-whit-two-ripples.jpg?s=612x612&w=0&k=20&c=llvZVT4jlKWjAs9jNyT8dfgP5DaA_6duqJE1qQ3NVQc=')",
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white py-20">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-600/80 text-white hover:bg-blue-600/80 border-blue-400">
                  🚀 Premium Water Delivery Platform
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Pure Water,
                  <span className="text-blue-400"> Delivered Fresh</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
                  Experience the finest quality distilled water with our comprehensive management system. From order
                  placement to quality testing and delivery tracking - all in one platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => scrollToSection("products")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-xl"
                >
                  Shop Now
                  <ShoppingCart className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 rounded-xl border-2 border-white text-white hover:bg-white hover:text-gray-900"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-300">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-sm text-gray-300">Purity Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-300">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Water Products</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of high-quality distilled water products, each tested for purity and safety.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => handleNavigation("/auth/register")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
            >
              Register to Order
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose AquaPure?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform ensures the highest quality water delivery with complete transparency and
              control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gray-50">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Smart User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Comprehensive user registration and profile management system with role-based access control.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gray-50">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Droplets className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Easy Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Streamlined order placement, real-time tracking, and management for seamless customer experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gray-50">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Quality Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Rigorous quality control and testing protocols ensure every container meets our premium standards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gray-50">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Real-time Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Advanced delivery tracking and transporter management for reliable, on-time deliveries.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent process from order to delivery
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Product</h3>
                  <p className="text-gray-600">
                    Browse our premium water products and select the perfect option for your needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h3>
                  <p className="text-gray-600">
                    Pay securely using cash on delivery or M-Pesa mobile payment for instant processing.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Testing</h3>
                  <p className="text-gray-600">
                    Our certified testers ensure every container meets strict quality standards before approval.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                  <p className="text-gray-600">
                    Track your order in real-time as our professional transporters deliver to your doorstep.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://extension.psu.edu/media/catalog/product/8/2/8249e13e630b992cc6fa8ec8740fab7f.jpeg?quality=80&bg-color=248,248,248&fit=bounds&height=427&width=640&canvas=640:427"
                alt="Delivery process illustration"
                className="rounded-2xl shadow-2xl h-full w-full object-cover"
              />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <img
                    src="/placeholder.svg?height=50&width=50"
                    alt="Customer avatar"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "Exceptional service! The water quality is outstanding and the delivery is always on time. The
                  tracking system gives me complete peace of mind."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <img
                    src="/placeholder.svg?height=50&width=50"
                    alt="Customer avatar"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "As a business owner, I need reliable water supply. AquaPure has never let me down. Their quality
                  testing process is thorough and professional."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <img
                    src="/placeholder.svg?height=50&width=50"
                    alt="Customer avatar"
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">Emily Rodriguez</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The user interface is so intuitive! I can easily place orders, track deliveries, and manage
                  everything from my dashboard. Highly recommended!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Experience Pure Water Delivery?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers who trust AquaPure for their water needs. Start your journey to
              premium water delivery today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => handleNavigation("/auth/register")}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => handleNavigation("/auth/login")}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 rounded-xl"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">Quick Access by Role</h3>
            <p className="text-gray-400">Access your specific dashboard based on your role</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Button
              onClick={() => handleNavigation("/auth/login?role=user")}
              variant="outline"
              className="h-20 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <div>Customer Portal</div>
              </div>
            </Button>
            <Button
              onClick={() => handleNavigation("/auth/login?role=admin")}
              variant="outline"
              className="h-20 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <div>Admin Panel</div>
              </div>
            </Button>
            <Button
              onClick={() => handleNavigation("/auth/login?role=tester")}
              variant="outline"
              className="h-20 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <div className="text-center">
                <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                <div>Quality Tester</div>
              </div>
            </Button>
            <Button
              onClick={() => handleNavigation("/auth/login?role=transporter")}
              variant="outline"
              className="h-20 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2" />
                <div>Transporter Hub</div>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Droplets className="h-8 w-8 text-blue-400 mr-3" />
                <span className="text-2xl font-bold text-white">AquaPure</span>
              </div>
              <p className="text-gray-400">
                Premium distilled water management system delivering pure water with complete transparency.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">Water Delivery</button>
                </li>
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">Quality Testing</button>
                </li>
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">Order Management</button>
                </li>
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">Real-time Tracking</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">About Us</button>
                </li>
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">Contact</button>
                </li>
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">Careers</button>
                </li>
                <li>
                  <button className="hover:text-blue-400 transition-colors text-left">Support</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📧 support@aquapure.com</li>
                <li>📞 1-800-AQUAPURE</li>
                <li>📍 123 Water St, Pure City</li>
                <li>🕒 24/7 Customer Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AquaPure. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Simple ProductCard component to avoid import issues
function ProductCard({ product }: { product: any }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleBuyNow = () => {
    try {
      const currentUser = localStorage.getItem("currentUser")
      if (!currentUser) {
        window.location.href = "/auth/login"
        return
      }
      setShowPaymentModal(true)
    } catch (error) {
      console.error("Error handling buy now:", error)
      window.location.href = "/auth/login"
    }
  }

  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={product.image || "/placeholder.svg?height=300&width=300"}
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
              {product.features.map((feature: string, index: number) => (
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

      {/* Simple modal placeholder */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Order {product.name}</h3>
            <p className="text-gray-600 mb-4">Please register or login to complete your order.</p>
            <div className="flex space-x-3">
              <Button onClick={() => setShowPaymentModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => (window.location.href = "/auth/register")} className="flex-1">
                Register Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
