"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Shield, Package, CheckCircle, XCircle, LogOut, FlaskRoundIcon as Flask } from "lucide-react"

export default function TesterPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [containers, setContainers] = useState<any[]>([])
  const [selectedContainer, setSelectedContainer] = useState<any>(null)
  const [testDialog, setTestDialog] = useState(false)
  const [testNotes, setTestNotes] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/auth/login")
      return
    }

    const userData = JSON.parse(user)
    if (userData.userType !== "tester") {
      router.push("/dashboard")
      return
    }

    setCurrentUser(userData)
    loadContainers()
  }, [router])

  const loadContainers = () => {
    // Generate some sample containers if none exist
    let containers = JSON.parse(localStorage.getItem("containers") || "[]")

    if (containers.length === 0) {
      // Create sample containers
      const sampleContainers = Array.from({ length: 10 }, (_, i) => ({
        id: `CONT-${Date.now()}-${i + 1}`,
        weight: Math.floor(Math.random() * 10) + 15, // 15-25L
        manufactureDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        approved: null,
        testerId: null,
        testNotes: "",
        createdAt: new Date().toISOString(),
      }))

      containers = sampleContainers
      localStorage.setItem("containers", JSON.stringify(containers))
    }

    setContainers(containers)
  }

  const handleTestContainer = (container: any) => {
    setSelectedContainer(container)
    setTestNotes("")
    setTestDialog(true)
  }

  const submitTest = (approved: boolean) => {
    if (!selectedContainer) return

    const updatedContainers = containers.map((container) => {
      if (container.id === selectedContainer.id) {
        return {
          ...container,
          approved,
          testerId: currentUser.id,
          testNotes,
          testedAt: new Date().toISOString(),
        }
      }
      return container
    })

    setContainers(updatedContainers)
    localStorage.setItem("containers", JSON.stringify(updatedContainers))
    setTestDialog(false)
    setSelectedContainer(null)
    setTestNotes("")
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  const pendingContainers = containers.filter((c) => c.approved === null)
  const approvedContainers = containers.filter((c) => c.approved === true)
  const rejectedContainers = containers.filter((c) => c.approved === false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Flask className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Quality Tester Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {currentUser.name}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Containers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{containers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
              <Shield className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingContainers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedContainers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedContainers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Container Testing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Container Quality Testing</CardTitle>
            <CardDescription>Test and approve/reject water containers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container ID</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Manufacture Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {containers.map((container) => (
                  <TableRow key={container.id}>
                    <TableCell className="font-mono">{container.id}</TableCell>
                    <TableCell>{container.weight}L</TableCell>
                    <TableCell>{new Date(container.manufactureDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(container.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          container.approved === null
                            ? "bg-yellow-100 text-yellow-800"
                            : container.approved
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {container.approved === null ? "PENDING" : container.approved ? "APPROVED" : "REJECTED"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {container.approved === null ? (
                        <Button size="sm" onClick={() => handleTestContainer(container)}>
                          <Flask className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Tested on {new Date(container.testedAt).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Test Dialog */}
      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Container</DialogTitle>
            <DialogDescription>Container ID: {selectedContainer?.id}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="testNotes">Test Notes</Label>
              <Textarea
                id="testNotes"
                value={testNotes}
                onChange={(e) => setTestNotes(e.target.value)}
                placeholder="Enter your test observations and notes..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setTestDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => submitTest(false)}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => submitTest(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
