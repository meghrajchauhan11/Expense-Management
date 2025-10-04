// Currency conversion utilities

import type { Country } from "./types"

export async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies")
    const data = await response.json()
    return data.map((country: any) => ({
      name: country.name.common,
      currencies: country.currencies || {},
    }))
  } catch (error) {
    console.error("Failed to fetch countries:", error)
    return []
  }
}

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) return amount

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
    const data = await response.json()
    const rate = data.rates[toCurrency]

    if (!rate) {
      console.error(`No exchange rate found for ${toCurrency}`)
      return amount
    }

    return amount * rate
  } catch (error) {
    console.error("Failed to convert currency:", error)
    return amount
  }
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

// Common currencies for quick selection
export const COMMON_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
]
