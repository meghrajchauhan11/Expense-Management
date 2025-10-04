"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db, generateId } from "@/lib/db"
import type { Expense } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { processReceiptImage } from "@/lib/ocr"
import { convertCurrency } from "@/lib/currency"
import { Scan, Loader2, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function OCRExpenseScanner() {
  const { user, company } = useAuth()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<any>(null)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReceiptFile(file)
      setIsScanning(true)

      try {
        const result = await processReceiptImage(file)
        setScannedData(result)

        toast({
          title: "Receipt scanned",
          description: "Expense details have been extracted from your receipt.",
        })
      } catch (error) {
        toast({
          title: "Scan failed",
          description: "Failed to process receipt. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsScanning(false)
      }
    }
  }

  const handleSubmit = async () => {
    if (!scannedData || !user || !company) return

    setIsScanning(true)

    try {
      const amountInCompanyCurrency =
        company.currency === "USD"
          ? scannedData.amount
          : await convertCurrency(scannedData.amount, "USD", company.currency)

      const receiptUrl = receiptFile ? URL.createObjectURL(receiptFile) : undefined

      const newExpense: Expense = {
        id: generateId(),
        employeeId: user.id,
        employeeName: user.name,
        companyId: company.id,
        amount: scannedData.amount,
        currency: "USD",
        amountInCompanyCurrency,
        category: scannedData.category,
        description: scannedData.description,
        date: scannedData.date,
        receiptUrl,
        merchantName: scannedData.merchantName,
        lines: scannedData.lines,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        currentApproverIndex: 0,
        approvalHistory: [],
      }

      db.expenses.create(newExpense)

      toast({
        title: "Expense submitted",
        description: "Your scanned expense has been submitted for approval.",
      })

      // Reset
      setScannedData(null)
      setReceiptFile(null)
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Receipt</CardTitle>
        <CardDescription>Upload a receipt image to automatically extract expense details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="receipt-scan">Receipt Image</Label>
          <div className="flex items-center gap-4">
            <Input
              id="receipt-scan"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isScanning}
              className="flex-1"
            />
            {isScanning && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a clear image of your receipt. The system will automatically extract expense details.
          </p>
        </div>

        {scannedData && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Receipt processed successfully</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Merchant</p>
                <p className="text-lg font-semibold">{scannedData.merchantName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">${scannedData.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg font-semibold">{new Date(scannedData.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <Badge className="capitalize">{scannedData.category}</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1">{scannedData.description}</p>
            </div>

            {scannedData.lines && scannedData.lines.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Line Items</p>
                <div className="space-y-2">
                  {scannedData.lines.map((line: any, index: number) => (
                    <div key={index} className="flex justify-between items-center rounded border p-2 bg-background">
                      <span className="text-sm">{line.description}</span>
                      <span className="text-sm font-medium">${line.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {receiptFile && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Receipt Preview</p>
                <img
                  src={URL.createObjectURL(receiptFile) || "/placeholder.svg"}
                  alt="Receipt"
                  className="rounded-lg border max-h-64 object-contain"
                />
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full" disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Submit Scanned Expense
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
