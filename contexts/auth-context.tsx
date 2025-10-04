"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Company } from "@/lib/types"
import { db, initializeDefaultAdmin } from "@/lib/db"

interface AuthContextType {
  user: User | null
  company: Company | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (
    email: string,
    password: string,
    name: string,
    companyName: string,
    currency: string,
    role: "employee" | "manager",
  ) => Promise<boolean>
  logout: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeDefaultAdmin()

    // Check for existing session
    const currentUser = db.auth.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      const userCompany = db.companies.getById(currentUser.companyId)
      setCompany(userCompany || null)
    }
    setIsLoading(false)
  }, [])

  const refreshUser = () => {
    const currentUser = db.auth.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      const userCompany = db.companies.getById(currentUser.companyId)
      setCompany(userCompany || null)
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string,
    companyName: string,
    currency: string,
    role: "employee" | "manager",
  ): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = db.users.getByEmail(email)
      if (existingUser) {
        return false
      }

      let companyId: string
      let newCompany: Company | undefined

      if (role === "employee" || role === "manager") {
        // For employees and managers, check if default company exists
        const defaultCompany = db.companies.getById("default-company")
        if (defaultCompany) {
          companyId = defaultCompany.id
        } else {
          // Create new company if it doesn't exist
          companyId = `company-${Date.now()}`
          newCompany = {
            id: companyId,
            name: companyName,
            currency,
            createdAt: new Date().toISOString(),
            adminId: "default-admin",
          }
        }
      } else {
        // For admin role (shouldn't happen in normal signup)
        companyId = `company-${Date.now()}`
        newCompany = {
          id: companyId,
          name: companyName,
          currency,
          createdAt: new Date().toISOString(),
          adminId: "",
        }
      }

      const userId = `user-${Date.now()}`
      const newUser: User = {
        id: userId,
        email,
        name,
        role, // Use the role from signup form
        companyId,
        createdAt: new Date().toISOString(),
      }

      // Save to database
      if (newCompany) {
        db.companies.create(newCompany)
      }
      db.users.create(newUser)

      // Set current user
      db.auth.setCurrentUser(userId)
      setUser(newUser)
      const userCompany = db.companies.getById(companyId)
      setCompany(userCompany || null)

      return true
    } catch (error) {
      console.error("Signup failed:", error)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (email === "admin@msu.com" && password === "msumsu") {
        const adminUser = db.users.getByEmail("admin")
        if (adminUser) {
          db.auth.setCurrentUser(adminUser.id)
          setUser(adminUser)
          const userCompany = db.companies.getById(adminUser.companyId)
          setCompany(userCompany || null)
          return true
        }
      }

      const user = db.users.getByEmail(email)
      if (!user) {
        return false
      }

      // In a real app, verify password here
      db.auth.setCurrentUser(user.id)
      setUser(user)

      const userCompany = db.companies.getById(user.companyId)
      setCompany(userCompany || null)

      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    db.auth.logout()
    setUser(null)
    setCompany(null)
  }

  return (
    <AuthContext.Provider value={{ user, company, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
