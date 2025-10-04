"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db, generateId } from "@/lib/db"
import type { User, UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Import useToast

export function UsersManagement() {
  const { user: currentUser, company, refreshUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { toast } = useToast() // Declare useToast

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("employee")
  const [managerId, setManagerId] = useState<string>("")

  useEffect(() => {
    loadUsers()
  }, [company])

  const loadUsers = () => {
    if (company) {
      const companyUsers = db.users.getByCompany(company.id)
      setUsers(companyUsers)
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setRole("employee")
    setManagerId("")
    setEditingUser(null)
  }

  const handleCreate = () => {
    if (!company || !currentUser) return

    // Check if email exists
    const existingUser = db.users.getByEmail(email)
    if (existingUser) {
      toast({
        title: "Error",
        description: "A user with this email already exists.",
        variant: "destructive",
      })
      return
    }

    const newUser: User = {
      id: generateId(),
      email,
      name,
      role,
      companyId: company.id,
      managerId: managerId || undefined,
      createdAt: new Date().toISOString(),
    }

    db.users.create(newUser)
    loadUsers()
    setIsCreateOpen(false)
    resetForm()

    toast({
      title: "User created",
      description: `${name} has been added to your company.`,
    })
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
    setManagerId(user.managerId || "")
  }

  const handleUpdate = () => {
    if (!editingUser) return

    db.users.update(editingUser.id, {
      name,
      email,
      role,
      managerId: managerId || undefined,
    })

    loadUsers()
    setEditingUser(null)
    resetForm()
    refreshUser()

    toast({
      title: "User updated",
      description: "User information has been updated successfully.",
    })
  }

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account.",
        variant: "destructive",
      })
      return
    }

    db.users.delete(userId)
    loadUsers()

    toast({
      title: "User deleted",
      description: "User has been removed from your company.",
    })
  }

  const managers = users.filter((u) => u.role === "manager" || u.role === "admin")

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "default"
      case "manager":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Users & Roles</CardTitle>
            <CardDescription>Manage employees, managers, and their relationships</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new employee or manager to your company</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">Role</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger id="create-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {role === "employee" && (
                  <div className="space-y-2">
                    <Label htmlFor="create-manager">Manager (Optional)</Label>
                    <Select value={managerId} onValueChange={setManagerId}>
                      <SelectTrigger id="create-manager">
                        <SelectValue placeholder="Select a manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No manager</SelectItem>
                        {managers.map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name} ({manager.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const manager = user.managerId ? users.find((u) => u.id === user.managerId) : null
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{manager ? manager.name : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingUser?.id === user.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingUser(null)
                            resetForm()
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user information and role</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-email">Email</Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-role">Role</Label>
                              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                                <SelectTrigger id="edit-role">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="employee">Employee</SelectItem>
                                  <SelectItem value="manager">Manager</SelectItem>
                                  {user.role === "admin" && <SelectItem value="admin">Admin</SelectItem>}
                                </SelectContent>
                              </Select>
                            </div>
                            {role === "employee" && (
                              <div className="space-y-2">
                                <Label htmlFor="edit-manager">Manager (Optional)</Label>
                                <Select value={managerId} onValueChange={setManagerId}>
                                  <SelectTrigger id="edit-manager">
                                    <SelectValue placeholder="Select a manager" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No manager</SelectItem>
                                    {managers
                                      .filter((m) => m.id !== user.id)
                                      .map((manager) => (
                                        <SelectItem key={manager.id} value={manager.id}>
                                          {manager.name} ({manager.role})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingUser(null)
                                resetForm()
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleUpdate}>Update User</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {user.id !== currentUser?.id && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
