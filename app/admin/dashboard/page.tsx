"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
import { NavHeader } from "@/components/nav-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersManagement } from "@/components/admin/users-management"
import { ApprovalRulesManagement } from "@/components/admin/approval-rules-management"
import { AllExpenses } from "@/components/admin/all-expenses"
import { CurrencyConverter } from "@/components/currency-converter"
import { Users, Settings, Receipt, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
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
              src="/modern-expense-management-dashboard-with-charts-an.jpg"
              alt="Admin Dashboard"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-white/90 text-lg">Manage users, roles, and approval workflows</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users & Roles
            </TabsTrigger>
            <TabsTrigger value="approval" className="gap-2">
              <Settings className="h-4 w-4" />
              Approval Rules
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="h-4 w-4" />
              All Expenses
            </TabsTrigger>
            <TabsTrigger value="currency" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Currency
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="approval">
            <ApprovalRulesManagement />
          </TabsContent>

          <TabsContent value="expenses">
            <AllExpenses />
          </TabsContent>

          <TabsContent value="currency">
            <CurrencyConverter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
