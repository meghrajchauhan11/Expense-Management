// Approval workflow logic utilities

import type { Expense, ApprovalRule, User } from "./types"
import { db } from "./db"

export function getNextApprover(expense: Expense, rule: ApprovalRule): User | null {
  // Check if manager approval is required first
  if (rule.isManagerApprover && expense.currentApproverIndex === 0) {
    const employee = db.users.getById(expense.employeeId)
    if (employee?.managerId) {
      const manager = db.users.getById(employee.managerId)
      return manager || null
    }
  }

  // Get next approver from the sequential list
  const nextStep = rule.approvers[expense.currentApproverIndex]
  if (!nextStep) return null

  return db.users.getById(nextStep.userId) || null
}

export function shouldAutoApprove(expense: Expense, rule: ApprovalRule, currentApproverId: string): boolean {
  if (!rule.conditionalRule) return false

  const { type, percentageThreshold, specificApproverIds } = rule.conditionalRule

  // Check specific approver rule
  if ((type === "specific" || type === "hybrid") && specificApproverIds) {
    if (specificApproverIds.includes(currentApproverId)) {
      return true
    }
  }

  // Check percentage rule
  if ((type === "percentage" || type === "hybrid") && percentageThreshold) {
    const totalApprovers = rule.approvers.length
    const approvedCount = expense.approvalHistory.filter((action) => action.action === "approved").length + 1 // +1 for current approval
    const approvalPercentage = (approvedCount / totalApprovers) * 100

    if (approvalPercentage >= percentageThreshold) {
      return true
    }
  }

  return false
}

export function isApprovalComplete(expense: Expense, rule: ApprovalRule): boolean {
  // Check if all sequential approvers have approved
  const allApproved = expense.approvalHistory.filter((action) => action.action === "approved").length
  return allApproved >= rule.approvers.length
}

export function getApprovalProgress(
  expense: Expense,
  rule: ApprovalRule,
): {
  current: number
  total: number
  percentage: number
} {
  const current = expense.approvalHistory.filter((action) => action.action === "approved").length
  const total = rule.approvers.length
  const percentage = total > 0 ? (current / total) * 100 : 0

  return { current, total, percentage }
}
