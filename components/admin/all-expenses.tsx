"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"
import { Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AllExpenses() {
  const { company } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const { toast } = useToast()

  const loadExpenses = () => {
    if (company) {
      const allExpenses = db.expenses.getByCompany(company.id)
      setExpenses(allExpenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [company])

  const handleApprove = (expenseId: string) => {
    const updated = db.expenses.update(expenseId, { status: "approved" })
    if (updated) {
      toast({
        title: "Expense Approved",
        description: "The expense has been approved successfully.",
      })
      loadExpenses()
    }
  }

  const handleReject = (expenseId: string) => {
    const updated = db.expenses.update(expenseId, { status: "rejected" })
    if (updated) {
      toast({
        title: "Expense Rejected",
        description: "The expense has been rejected.",
        variant: "destructive",
      })
      loadExpenses()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Expenses</CardTitle>
        <CardDescription>View all expenses submitted across your company</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No expenses submitted yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.employeeName}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="capitalize">{expense.category}</TableCell>
                  <TableCell>{formatCurrency(expense.amountInCompanyCurrency, company?.currency || "USD")}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell className="text-right">
                    {expense.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                          onClick={() => handleApprove(expense.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                          onClick={() => handleReject(expense.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
