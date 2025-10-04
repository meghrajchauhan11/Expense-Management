// Client-side database layer using localStorage

import type { User, Company, Expense, ApprovalRule, UserRole, ExpenseStatus } from "./types"

const STORAGE_KEYS = {
  USERS: "expense_manager_users",
  COMPANIES: "expense_manager_companies",
  EXPENSES: "expense_manager_expenses",
  APPROVAL_RULES: "expense_manager_approval_rules",
  CURRENT_USER: "expense_manager_current_user",
} as const

// Helper functions for localStorage
function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// Utility function to initialize default admin user on first load
export function initializeDefaultAdmin(): void {
  if (typeof window === "undefined") return

  const users = getFromStorage<User>(STORAGE_KEYS.USERS)
  const companies = getFromStorage<Company>(STORAGE_KEYS.COMPANIES)

  // Check if default admin already exists
  const defaultAdmin = users.find((u) => u.email === "admin")
  if (defaultAdmin) return

  // Create default company
  const defaultCompanyId = "default-company"
  const defaultCompany: Company = {
    id: defaultCompanyId,
    name: "Default Company",
    currency: "USD",
    createdAt: new Date().toISOString(),
    adminId: "default-admin",
  }

  // Create default admin user
  const defaultUser: User = {
    id: "default-admin",
    email: "admin",
    name: "System Administrator",
    role: "admin",
    companyId: defaultCompanyId,
    createdAt: new Date().toISOString(),
  }

  // Save to storage
  companies.push(defaultCompany)
  users.push(defaultUser)
  saveToStorage(STORAGE_KEYS.COMPANIES, companies)
  saveToStorage(STORAGE_KEYS.USERS, users)
}

// User operations
export const db = {
  users: {
    getAll: (): User[] => getFromStorage<User>(STORAGE_KEYS.USERS),

    getById: (id: string): User | undefined => {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      return users.find((u) => u.id === id)
    },

    getByEmail: (email: string): User | undefined => {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      return users.find((u) => u.email === email)
    },

    getByCompany: (companyId: string): User[] => {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      return users.filter((u) => u.companyId === companyId)
    },

    getByRole: (companyId: string, role: UserRole): User[] => {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      return users.filter((u) => u.companyId === companyId && u.role === role)
    },

    create: (user: User): User => {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      users.push(user)
      saveToStorage(STORAGE_KEYS.USERS, users)
      return user
    },

    update: (id: string, updates: Partial<User>): User | undefined => {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      const index = users.findIndex((u) => u.id === id)
      if (index === -1) return undefined
      users[index] = { ...users[index], ...updates }
      saveToStorage(STORAGE_KEYS.USERS, users)
      return users[index]
    },

    delete: (id: string): boolean => {
      const users = getFromStorage<User>(STORAGE_KEYS.USERS)
      const filtered = users.filter((u) => u.id !== id)
      if (filtered.length === users.length) return false
      saveToStorage(STORAGE_KEYS.USERS, filtered)
      return true
    },
  },

  companies: {
    getAll: (): Company[] => getFromStorage<Company>(STORAGE_KEYS.COMPANIES),

    getById: (id: string): Company | undefined => {
      const companies = getFromStorage<Company>(STORAGE_KEYS.COMPANIES)
      return companies.find((c) => c.id === id)
    },

    create: (company: Company): Company => {
      const companies = getFromStorage<Company>(STORAGE_KEYS.COMPANIES)
      companies.push(company)
      saveToStorage(STORAGE_KEYS.COMPANIES, companies)
      return company
    },

    update: (id: string, updates: Partial<Company>): Company | undefined => {
      const companies = getFromStorage<Company>(STORAGE_KEYS.COMPANIES)
      const index = companies.findIndex((c) => c.id === id)
      if (index === -1) return undefined
      companies[index] = { ...companies[index], ...updates }
      saveToStorage(STORAGE_KEYS.COMPANIES, companies)
      return companies[index]
    },
  },

  expenses: {
    getAll: (): Expense[] => getFromStorage<Expense>(STORAGE_KEYS.EXPENSES),

    getById: (id: string): Expense | undefined => {
      const expenses = getFromStorage<Expense>(STORAGE_KEYS.EXPENSES)
      return expenses.find((e) => e.id === id)
    },

    getByEmployee: (employeeId: string): Expense[] => {
      const expenses = getFromStorage<Expense>(STORAGE_KEYS.EXPENSES)
      return expenses.filter((e) => e.employeeId === employeeId)
    },

    getByCompany: (companyId: string): Expense[] => {
      const expenses = getFromStorage<Expense>(STORAGE_KEYS.EXPENSES)
      return expenses.filter((e) => e.companyId === companyId)
    },

    getByStatus: (companyId: string, status: ExpenseStatus): Expense[] => {
      const expenses = getFromStorage<Expense>(STORAGE_KEYS.EXPENSES)
      return expenses.filter((e) => e.companyId === companyId && e.status === status)
    },

    getPendingForApprover: (approverId: string, companyId: string): Expense[] => {
      const expenses = getFromStorage<Expense>(STORAGE_KEYS.EXPENSES)
      const rules = getFromStorage<ApprovalRule>(STORAGE_KEYS.APPROVAL_RULES)
      const companyRule = rules.find((r) => r.companyId === companyId)

      if (!companyRule) return []

      return expenses.filter((expense) => {
        if (expense.status !== "pending") return false
        if (expense.companyId !== companyId) return false

        // Check if this approver is next in line
        const currentStep = companyRule.approvers[expense.currentApproverIndex]
        return currentStep?.userId === approverId
      })
    },

    create: (expense: Expense): Expense => {
      const expenses = getFromStorage<Expense>(STORAGE_KEYS.EXPENSES)
      expenses.push(expense)
      saveToStorage(STORAGE_KEYS.EXPENSES, expenses)
      return expense
    },

    update: (id: string, updates: Partial<Expense>): Expense | undefined => {
      const expenses = getFromStorage<Expense>(STORAGE_KEYS.EXPENSES)
      const index = expenses.findIndex((e) => e.id === id)
      if (index === -1) return undefined
      expenses[index] = { ...expenses[index], ...updates, updatedAt: new Date().toISOString() }
      saveToStorage(STORAGE_KEYS.EXPENSES, expenses)
      return expenses[index]
    },
  },

  approvalRules: {
    getAll: (): ApprovalRule[] => getFromStorage<ApprovalRule>(STORAGE_KEYS.APPROVAL_RULES),

    getByCompany: (companyId: string): ApprovalRule | undefined => {
      const rules = getFromStorage<ApprovalRule>(STORAGE_KEYS.APPROVAL_RULES)
      return rules.find((r) => r.companyId === companyId)
    },

    create: (rule: ApprovalRule): ApprovalRule => {
      const rules = getFromStorage<ApprovalRule>(STORAGE_KEYS.APPROVAL_RULES)
      rules.push(rule)
      saveToStorage(STORAGE_KEYS.APPROVAL_RULES, rules)
      return rule
    },

    update: (id: string, updates: Partial<ApprovalRule>): ApprovalRule | undefined => {
      const rules = getFromStorage<ApprovalRule>(STORAGE_KEYS.APPROVAL_RULES)
      const index = rules.findIndex((r) => r.id === id)
      if (index === -1) return undefined
      rules[index] = { ...rules[index], ...updates }
      saveToStorage(STORAGE_KEYS.APPROVAL_RULES, rules)
      return rules[index]
    },
  },

  auth: {
    getCurrentUser: (): User | null => {
      if (typeof window === "undefined") return null
      const userId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
      if (!userId) return null
      return db.users.getById(userId) || null
    },

    setCurrentUser: (userId: string): void => {
      if (typeof window === "undefined") return
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId)
    },

    logout: (): void => {
      if (typeof window === "undefined") return
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    },
  },
}

// Utility function to generate IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
