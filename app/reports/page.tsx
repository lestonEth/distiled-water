"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bar } from "react-chartjs-2"
import { useRef } from "react"

// Chart.js registration (if not already globally registered)
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function ReportsPage() {
    // Example data
    const orderStatusDistribution = 7
    const userTypes = 3
    const monthlyOrders = [12, 19, 8, 15, 22, 17, 25, 20, 18, 24, 21, 23]
    const monthlyRevenue = [1200, 1900, 800, 1500, 2200, 1700, 2500, 2000, 1800, 2400, 2100, 2300]
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    const chartData = {
        labels: months,
        datasets: [
            {
                label: "Orders",
                data: monthlyOrders,
                backgroundColor: "#2563eb",
            },
            {
                label: "Revenue ($)",
                data: monthlyRevenue,
                backgroundColor: "#22d3ee",
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: false },
        },
        scales: {
            y: { beginAtZero: true },
        },
    }

    // Print handler
    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4 print:bg-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                    <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                        Print Report
                    </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle>Order Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-bold text-blue-600 mb-2">{orderStatusDistribution}</div>
                            <CardDescription>Statuses (e.g., Pending, Delivered, Cancelled, etc.)</CardDescription>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle>User Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-bold text-cyan-600 mb-2">{userTypes}</div>
                            <CardDescription>Types (e.g., Customer, Admin, Transporter)</CardDescription>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardHeader>
                            <CardTitle>Monthly Orders & Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-gray-700 mb-2">Year to Date</div>
                            <div className="h-40">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Print-friendly summary */}
                <div className="mt-12 print:block hidden">
                    <h2 className="text-2xl font-bold mb-4">Summary</h2>
                    <ul className="list-disc ml-6 text-lg text-gray-800">
                        <li>Order Status Distribution: {orderStatusDistribution}</li>
                        <li>User Types: {userTypes}</li>
                        <li>See chart for Monthly Orders & Revenue</li>
                    </ul>
                </div>
            </div>
            {/* Print styles */}
            <style>{`
        @media print {
          body { background: white !important; }
          .print\:hidden { display: none !important; }
          .print\:block { display: block !important; }
          .print\:bg-white { background: white !important; }
        }
      `}</style>
        </div>
    )
} 