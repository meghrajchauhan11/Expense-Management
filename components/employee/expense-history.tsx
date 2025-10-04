"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/currency"
import { Eye } from "lucide-react"

export function ExpenseHistory() {
  const { user, company } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  useEffect(() => {
    if (user) {
      const userExpenses = db.expenses.getByEmployee(user.id)
      setExpenses(userExpenses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }, [user])

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
        <CardTitle>Expense History</CardTitle>
        <CardDescription>View all your submitted expenses and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No expenses submitted yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell className="capitalize">{expense.category}</TableCell>
                  <TableCell>
                    {formatCurrency(expense.amount, expense.currency)}
                    {expense.currency !== company?.currency && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({formatCurrency(expense.amountInCompanyCurrency, company?.currency || "USD")})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedExpense(expense)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Expense Details</DialogTitle>
                          <DialogDescription>View complete information about this expense</DialogDescription>
                        </DialogHeader>
                        {selectedExpense && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className="text-lg font-semibold">
                                  {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                <p className="text-lg font-semibold capitalize">{selectedExpense.category}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                <p className="text-lg font-semibold">
                                  {new Date(selectedExpense.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <div className="mt-1">{getStatusBadge(selectedExpense.status)}</div>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Description</p>
                              <p className="mt-1">{selectedExpense.description}</p>
                            </div>
                            {selectedExpense.approvalHistory.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Approval History</p>
                                <div className="space-y-2">
                                  {selectedExpense.approvalHistory.map((action, index) => (
                                    <div key={index} className="rounded-lg border p-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{action.approverName}</span>
                                        <Badge variant={action.action === "approved" ? "default" : "destructive"}>
                                          {action.action}
                                        </Badge>
                                      </div>
                                      {action.comment && (
                                        <p className="mt-1 text-sm text-muted-foreground">{action.comment}</p>
                                      )}
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {new Date(action.timestamp).toLocaleString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedExpense.receiptUrl && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Receipt</p>
                                <img
                                  src={selectedExpense.receiptUrl || "/placeholder.svg"}
                                  alt="Receipt"
                                  className="rounded-lg border max-h-64 object-contain"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
