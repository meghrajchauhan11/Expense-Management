// OCR utilities for receipt scanning

import type { ExpenseCategory, ExpenseLine } from "./types"

export interface OCRResult {
  amount?: number
  date?: string
  merchantName?: string
  category?: ExpenseCategory
  description?: string
  lines?: ExpenseLine[]
  rawText: string
}

// Simulate OCR processing (in production, use Tesseract.js or cloud OCR service)
export async function processReceiptImage(imageFile: File): Promise<OCRResult> {
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // In a real implementation, this would use Tesseract.js or a cloud OCR API
      // For demo purposes, we'll return mock data
      const mockResult: OCRResult = {
        amount: Math.floor(Math.random() * 500) + 20,
        date: new Date().toISOString().split("T")[0],
        merchantName: "Sample Restaurant",
        category: "meals",
        description: "Business lunch meeting",
        lines: [
          {
            description: "Main course",
            amount: Math.floor(Math.random() * 30) + 15,
            category: "meals",
          },
          {
            description: "Beverages",
            amount: Math.floor(Math.random() * 15) + 5,
            category: "meals",
          },
        ],
        rawText: "SAMPLE RESTAURANT\n123 Main St\nDate: " + new Date().toLocaleDateString() + "\nTotal: $XX.XX",
      }

      resolve(mockResult)
    }, 2000)
  })
}

// Extract amount from text using regex
export function extractAmount(text: string): number | undefined {
  const patterns = [/total[:\s]*\$?(\d+\.?\d*)/i, /amount[:\s]*\$?(\d+\.?\d*)/i, /\$(\d+\.?\d*)/, /(\d+\.\d{2})/]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const amount = Number.parseFloat(match[1])
      if (!Number.isNaN(amount) && amount > 0) {
        return amount
      }
    }
  }

  return undefined
}

// Extract date from text
export function extractDate(text: string): string | undefined {
  const patterns = [
    /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/,
    /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})[,\s]+(\d{4})/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        const date = new Date(match[0])
        if (!Number.isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      } catch {
        continue
      }
    }
  }

  return undefined
}

// Detect category from merchant name or text
export function detectCategory(text: string): ExpenseCategory {
  const lowerText = text.toLowerCase()

  if (
    lowerText.includes("restaurant") ||
    lowerText.includes("cafe") ||
    lowerText.includes("food") ||
    lowerText.includes("dining")
  ) {
    return "meals"
  }

  if (
    lowerText.includes("hotel") ||
    lowerText.includes("inn") ||
    lowerText.includes("resort") ||
    lowerText.includes("lodging")
  ) {
    return "accommodation"
  }

  if (
    lowerText.includes("uber") ||
    lowerText.includes("lyft") ||
    lowerText.includes("taxi") ||
    lowerText.includes("airline") ||
    lowerText.includes("flight")
  ) {
    return "travel"
  }

  if (lowerText.includes("office") || lowerText.includes("supplies") || lowerText.includes("stationery")) {
    return "supplies"
  }

  return "other"
}
