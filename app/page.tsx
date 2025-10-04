"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Receipt, Users, CheckCircle, TrendingUp, Zap, ArrowRight, Scan, Globe } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      setShouldRedirect(true)
      // Redirect based on role
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "manager") {
        router.push("/manager/dashboard")
      } else {
        router.push("/employee/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading || shouldRedirect) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:75px_75px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Expense Management Made Simple
            </h1>
            <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
              Streamline your company's expense reimbursement process with automated workflows, multi-level approvals,
              and intelligent receipt scanning. Say goodbye to manual paperwork and hello to efficiency.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="mt-16 flow-root sm:mt-24">
            <div className="relative rounded-xl bg-muted/50 p-2 ring-1 ring-inset ring-border lg:rounded-2xl lg:p-4">
              <img
                src="/modern-expense-management-dashboard-with-charts-an.jpg"
                alt="Expense Management Dashboard"
                className="rounded-md shadow-2xl ring-1 ring-border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to manage expenses
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Powerful features designed to simplify expense management for teams of all sizes
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <Card className="relative overflow-hidden p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Scan className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">OCR Receipt Scanning</h3>
                <p className="mt-2 text-muted-foreground">
                  Simply scan receipts and let AI automatically extract amounts, dates, merchants, and line items. No
                  more manual data entry.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="relative overflow-hidden p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Smart Approval Workflows</h3>
                <p className="mt-2 text-muted-foreground">
                  Configure sequential or conditional approval rules with percentage-based or specific approver logic
                  for maximum flexibility.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="relative overflow-hidden p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Multi-Currency Support</h3>
                <p className="mt-2 text-muted-foreground">
                  Submit expenses in any currency with automatic conversion to your company's default currency using
                  real-time exchange rates.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="relative overflow-hidden p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Role-Based Access</h3>
                <p className="mt-2 text-muted-foreground">
                  Granular permissions for admins, managers, and employees ensure everyone sees exactly what they need.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="relative overflow-hidden p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Real-Time Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Monitor expense status in real-time with detailed history, approval chains, and comprehensive
                  reporting.
                </p>
              </Card>

              {/* Feature 6 */}
              <Card className="relative overflow-hidden p-8 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">Lightning Fast</h3>
                <p className="mt-2 text-muted-foreground">
                  Built with modern technology for instant updates and seamless user experience across all devices.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mt-6 text-xl font-semibold">Submit Expenses</h3>
                <p className="mt-2 text-muted-foreground">
                  Employees scan receipts or manually enter expense details. OCR automatically extracts all relevant
                  information.
                </p>
                <img
                  src="/mobile-phone-scanning-receipt-with-ocr.jpg"
                  alt="Submit Expenses"
                  className="mt-6 rounded-lg shadow-md ring-1 ring-border"
                />
              </div>

              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="mt-6 text-xl font-semibold">Approval Flow</h3>
                <p className="mt-2 text-muted-foreground">
                  Expenses route through configured approval workflows. Managers review and approve with comments.
                </p>
                <img
                  src="/approval-workflow-diagram-with-checkmarks.jpg"
                  alt="Approval Flow"
                  className="mt-6 rounded-lg shadow-md ring-1 ring-border"
                />
              </div>

              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mt-6 text-xl font-semibold">Get Reimbursed</h3>
                <p className="mt-2 text-muted-foreground">
                  Once approved, expenses are processed for reimbursement. Track everything in real-time.
                </p>
                <img
                  src="/successful-payment-confirmation-with-checkmark.jpg"
                  alt="Get Reimbursed"
                  className="mt-6 rounded-lg shadow-md ring-1 ring-border"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to streamline your expenses?
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Join companies that have simplified their expense management process
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ExpenseManager</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 ExpenseManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
