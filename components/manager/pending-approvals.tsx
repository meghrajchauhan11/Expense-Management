"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/db"
import type { Expense, ApprovalRule } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/currency"
import { CheckCircle, XCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function PendingApprovals() {
  const { user, company } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [comment, setComment] = useState("")
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPendingExpenses()
  }, [user, company])

  const loadPendingExpenses = () => {
    if (!user || !company) return

    // Get expenses pending for this user
    const pending = db.expenses.getPendingForApprover(user.id, company.id)

    // Also check for manager-specific approvals
    const rule = db.approvalRules.getByCompany(company.id)
    if (rule?.isManagerApprover && user.role === "manager") {
      // Get expenses from employees managed by this user
      const allPending = db.expenses.getByStatus(company.id, "pending")
      const managedEmployees = db.users.getByCompany(company.id).filter((u) => u.managerId === user.id)
      const managerPending = allPending.filter(
        (expense) =>
          managedEmployees.some((emp) => emp.id === expense.employeeId) && expense.currentApproverIndex === 0,
      )
      setExpenses([...pending, ...managerPending])
    } else {
      setExpenses(pending)
    }
  }

  const checkConditionalApproval = (expense: Expense, rule: ApprovalRule): boolean => {
    if (!rule.conditionalRule) return false

    const { type, percentageThreshold, specificApproverIds } = rule.conditionalRule

    // Check specific approver rule
    if ((type === "specific" || type === "hybrid") && specificApproverIds) {
      const hasSpecificApproval = expense.approvalHistory.some(
        (action) => action.action === "approved" && specificApproverIds.includes(action.approverId),
      )
      if (hasSpecificApproval) return true
    }

    // Check percentage rule
    if ((type === "percentage" || type === "hybrid") && percentageThreshold) {
      const totalApprovers = rule.approvers.length
      const approvedCount = expense.approvalHistory.filter((action) => action.action === "approved").length + 1 // +1 for current approval
      const approvalPercentage = (approvedCount / totalApprovers) * 100

      if (approvalPercentage >= percentageThreshold) return true
    }

    return false
  }

  const handleApproval = async (approve: boolean) => {
    if (!selectedExpense || !user || !company) return

    const rule = db.approvalRules.getByCompany(company.id)
    if (!rule) {
      toast({
        title: "Error",
        description: "No approval rules configured for this company.",
        variant: "destructive",
      })
      return
    }

    // Add approval action to history
    const approvalAction = {
      approverId: user.id,
      approverName: user.name,
      action: approve ? ("approved" as const) : ("rejected" as const),
      comment: comment || undefined,
      timestamp: new Date().toISOString(),
    }

    const updatedHistory = [...selectedExpense.approvalHistory, approvalAction]

    if (!approve) {
      // Rejected - update status
      db.expenses.update(selectedExpense.id, {
        status: "rejected",
        approvalHistory: updatedHistory,
      })

      toast({
        title: "Expense rejected",
        description: "The expense has been rejected.",
      })
    } else {
      // Check conditional approval
      const autoApproved = checkConditionalApproval(selectedExpense, rule)

      if (autoApproved) {
        db.expenses.update(selectedExpense.id, {
          status: "approved",
          approvalHistory: updatedHistory,
        })

        toast({
          title: "Expense approved",
          description: "The expense has been auto-approved based on conditional rules.",
        })
      } else {
        // Check if there are more approvers
        const nextIndex = selectedExpense.currentApproverIndex + 1

        if (nextIndex >= rule.approvers.length) {
          // No more approvers - approve
          db.expenses.update(selectedExpense.id, {
            status: "approved",
            approvalHistory: updatedHistory,
            currentApproverIndex: nextIndex,
          })

          toast({
            title: "Expense approved",
            description: "The expense has been fully approved.",
          })
        } else {
          // Move to next approver
          db.expenses.update(selectedExpense.id, {
            approvalHistory: updatedHistory,
            currentApproverIndex: nextIndex,
          })

          toast({
            title: "Approval recorded",
            description: "The expense has been moved to the next approver.",
          })
        }
      }
    }

    // Reset and reload
    setSelectedExpense(null)
    setComment("")
    setActionType(null)
    loadPendingExpenses()
  }

  const openApprovalDialog = (expense: Expense, type: "approve" | "reject") => {
    setSelectedExpense(expense)
    setActionType(type)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Review and approve or reject expense claims</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No expenses pending your approval</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Expense Details</DialogTitle>
                            <DialogDescription>Review complete information about this expense</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Employee</p>
                                <p className="text-lg font-semibold">{expense.employeeName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className="text-lg font-semibold">
                                  {formatCurrency(expense.amountInCompanyCurrency, company?.currency || "USD")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                <p className="text-lg font-semibold capitalize">{expense.category}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Date</p>
                                <p className="text-lg font-semibold">{new Date(expense.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Description</p>
                              <p className="mt-1">{expense.description}</p>
                            </div>
                            {expense.receiptUrl && (
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Receipt</p>
                                <img
                                  src={expense.receiptUrl || "/placeholder.svg"}
                                  alt="Receipt"
                                  className="rounded-lg border max-h-64 object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => openApprovalDialog(expense, "approve")}>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openApprovalDialog(expense, "reject")}>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog
          open={actionType !== null}
          onOpenChange={(open) => {
            if (!open) {
              setActionType(null)
              setSelectedExpense(null)
              setComment("")
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{actionType === "approve" ? "Approve" : "Reject"} Expense</DialogTitle>
              <DialogDescription>
                {actionType === "approve"
                  ? "Confirm approval of this expense claim"
                  : "Provide a reason for rejecting this expense"}
              </DialogDescription>
            </DialogHeader>
            {selectedExpense && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="font-medium">{selectedExpense.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(selectedExpense.amountInCompanyCurrency, company?.currency || "USD")} •{" "}
                    {selectedExpense.employeeName}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment (Optional)</Label>
                  <Textarea
                    id="comment"
                    placeholder={
                      actionType === "approve" ? "Add any notes..." : "Explain why this expense is being rejected..."
                    }
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setActionType(null)
                  setSelectedExpense(null)
                  setComment("")
                }}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "approve" ? "default" : "destructive"}
                onClick={() => handleApproval(actionType === "approve")}
              >
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
