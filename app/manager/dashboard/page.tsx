"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import { NavHeader } from "@/components/nav-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubmitExpense } from "@/components/employee/submit-expense"
import { ExpenseHistory } from "@/components/employee/expense-history"
import { PendingApprovals } from "@/components/manager/pending-approvals"
import { OCRExpenseScanner } from "@/components/employee/ocr-expense-scanner"
import { CheckCircle, Receipt, Scan, History } from "lucide-react"

export default function ManagerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "manager" && user.role !== "admin"))) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader />
      <main className="container py-8">
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
            <Image
              src="/approval-workflow-diagram-with-checkmarks.jpg"
              alt="Manager Dashboard"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
            <p className="text-white/90 text-lg">Approve expenses and manage your own claims</p>
          </div>
        </div>

        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="approvals" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="submit" className="gap-2">
              <Receipt className="h-4 w-4" />
              Submit Expense
            </TabsTrigger>
            <TabsTrigger value="scan" className="gap-2">
              <Scan className="h-4 w-4" />
              Scan Receipt
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              My Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals">
            <PendingApprovals />
          </TabsContent>

          <TabsContent value="submit">
            <SubmitExpense />
          </TabsContent>

          <TabsContent value="scan">
            <OCRExpenseScanner />
          </TabsContent>

          <TabsContent value="history">
            <ExpenseHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
