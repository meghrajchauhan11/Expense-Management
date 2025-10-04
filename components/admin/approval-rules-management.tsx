"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db, generateId } from "@/lib/db"
import type { ApprovalRule, ApprovalStep, ConditionalRule, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, X } from "lucide-react"

export function ApprovalRulesManagement() {
  const { company } = useAuth()
  const [rule, setRule] = useState<ApprovalRule | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isManagerApprover, setIsManagerApprover] = useState(false)
  const [approvers, setApprovers] = useState<ApprovalStep[]>([])
  const [useConditional, setUseConditional] = useState(false)
  const [conditionalType, setConditionalType] = useState<"percentage" | "specific" | "hybrid">("percentage")
  const [percentageThreshold, setPercentageThreshold] = useState(60)
  const [specificApprovers, setSpecificApprovers] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (company) {
      const companyUsers = db.users.getByCompany(company.id)
      setUsers(companyUsers.filter((u) => u.role === "manager" || u.role === "admin"))

      const existingRule = db.approvalRules.getByCompany(company.id)
      if (existingRule) {
        setRule(existingRule)
        setIsManagerApprover(existingRule.isManagerApprover)
        setApprovers(existingRule.approvers)
        if (existingRule.conditionalRule) {
          setUseConditional(true)
          setConditionalType(existingRule.conditionalRule.type)
          setPercentageThreshold(existingRule.conditionalRule.percentageThreshold || 60)
          setSpecificApprovers(existingRule.conditionalRule.specificApproverIds || [])
        }
      }
    }
  }, [company])

  const addApprover = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const newApprover: ApprovalStep = {
      userId: user.id,
      userName: user.name,
      order: approvers.length,
    }

    setApprovers([...approvers, newApprover])
  }

  const removeApprover = (index: number) => {
    const updated = approvers.filter((_, i) => i !== index)
    // Reorder
    const reordered = updated.map((a, i) => ({ ...a, order: i }))
    setApprovers(reordered)
  }

  const moveApprover = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= approvers.length) return

    const updated = [...approvers]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    // Reorder
    const reordered = updated.map((a, i) => ({ ...a, order: i }))
    setApprovers(reordered)
  }

  const handleSave = () => {
    if (!company) return

    const conditionalRule: ConditionalRule | undefined = useConditional
      ? {
          type: conditionalType,
          percentageThreshold:
            conditionalType === "percentage" || conditionalType === "hybrid" ? percentageThreshold : undefined,
          specificApproverIds:
            conditionalType === "specific" || conditionalType === "hybrid" ? specificApprovers : undefined,
        }
      : undefined

    if (rule) {
      // Update existing rule
      db.approvalRules.update(rule.id, {
        isManagerApprover,
        approvers,
        conditionalRule,
      })
    } else {
      // Create new rule
      const newRule: ApprovalRule = {
        id: generateId(),
        companyId: company.id,
        name: "Default Approval Rule",
        isManagerApprover,
        approvers,
        conditionalRule,
        createdAt: new Date().toISOString(),
      }
      db.approvalRules.create(newRule)
      setRule(newRule)
    }

    toast({
      title: "Approval rules saved",
      description: "Your approval workflow has been updated.",
    })
  }

  const availableUsers = users.filter((u) => !approvers.some((a) => a.userId === u.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Rules</CardTitle>
        <CardDescription>Configure how expenses are approved in your company</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manager Approval */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manager-approver"
              checked={isManagerApprover}
              onCheckedChange={(checked) => setIsManagerApprover(checked as boolean)}
            />
            <Label htmlFor="manager-approver" className="text-sm font-medium">
              Require manager approval first
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            If enabled, expenses will first go to the employee's assigned manager before other approvers
          </p>
        </div>

        {/* Sequential Approvers */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Sequential Approvers</Label>
            <p className="text-sm text-muted-foreground">
              Define the order of approvers. Each approver must approve before moving to the next.
            </p>
          </div>

          <div className="space-y-2">
            {approvers.map((approver, index) => (
              <div key={approver.userId} className="flex items-center gap-2 rounded-lg border p-3">
                <Badge variant="outline" className="font-mono">
                  {index + 1}
                </Badge>
                <span className="flex-1 font-medium">{approver.userName}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveApprover(index, "up")} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveApprover(index, "down")}
                    disabled={index === approvers.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeApprover(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {availableUsers.length > 0 && (
            <Select onValueChange={addApprover}>
              <SelectTrigger>
                <SelectValue placeholder="Add an approver" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Conditional Rules */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-conditional"
              checked={useConditional}
              onCheckedChange={(checked) => setUseConditional(checked as boolean)}
            />
            <Label htmlFor="use-conditional" className="text-base font-semibold">
              Use conditional approval rules
            </Label>
          </div>

          {useConditional && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select
                  value={conditionalType}
                  onValueChange={(value) => setConditionalType(value as "percentage" | "specific" | "hybrid")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage Rule</SelectItem>
                    <SelectItem value="specific">Specific Approver Rule</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(conditionalType === "percentage" || conditionalType === "hybrid") && (
                <div className="space-y-2">
                  <Label htmlFor="percentage">Approval Percentage Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={percentageThreshold}
                      onChange={(e) => setPercentageThreshold(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">% of approvers must approve</span>
                  </div>
                </div>
              )}

              {(conditionalType === "specific" || conditionalType === "hybrid") && (
                <div className="space-y-2">
                  <Label>Specific Approvers (Any one approves = Auto-approve)</Label>
                  <Select
                    onValueChange={(userId) => {
                      if (!specificApprovers.includes(userId)) {
                        setSpecificApprovers([...specificApprovers, userId])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add specific approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => !specificApprovers.includes(u.id))
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {specificApprovers.map((userId) => {
                      const user = users.find((u) => u.id === userId)
                      return (
                        <Badge key={userId} variant="secondary">
                          {user?.name}
                          <button
                            onClick={() => setSpecificApprovers(specificApprovers.filter((id) => id !== userId))}
                            className="ml-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Approval Rules
        </Button>
      </CardContent>
    </Card>
  )
}
