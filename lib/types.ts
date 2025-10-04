// Core data types for the expense management system

export type UserRole = "admin" | "manager" | "employee"

export type ExpenseStatus = "pending" | "approved" | "rejected"

export type ExpenseCategory = "travel" | "meals" | "accommodation" | "supplies" | "entertainment" | "other"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  managerId?: string // ID of the manager (if employee)
  createdAt: string
}

export interface Company {
  id: string
  name: string
  currency: string
  createdAt: string
  adminId: string
}

export interface ExpenseLine {
  description: string
  amount: number
  category: ExpenseCategory
}

export interface Expense {
  id: string
  employeeId: string
  employeeName: string
  companyId: string
  amount: number
  currency: string
  amountInCompanyCurrency: number // Converted amount
  category: ExpenseCategory
  description: string
  date: string
  receiptUrl?: string
  status: ExpenseStatus
  lines?: ExpenseLine[] // For OCR-parsed expenses
  merchantName?: string // From OCR
  createdAt: string
  updatedAt: string
  currentApproverIndex: number
  approvalHistory: ApprovalAction[]
}

export interface ApprovalAction {
  approverId: string
  approverName: string
  action: "approved" | "rejected"
  comment?: string
  timestamp: string
}

export interface ApprovalRule {
  id: string
  companyId: string
  name: string
  isManagerApprover: boolean // If true, manager must approve first
  approvers: ApprovalStep[]
  conditionalRule?: ConditionalRule
  createdAt: string
}

export interface ApprovalStep {
  userId: string
  userName: string
  order: number
}

export interface ConditionalRule {
  type: "percentage" | "specific" | "hybrid"
  percentageThreshold?: number // e.g., 60 means 60% must approve
  specificApproverIds?: string[] // If any of these approve, auto-approve
}

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface Country {
  name: string
  currencies: Record<string, Currency>
}
