# Expense Manager

A comprehensive expense management system with multi-level approval workflows, OCR receipt scanning, and currency conversion.

## Features

### Authentication & User Management
- Company creation on first signup with automatic currency selection
- Role-based access control (Admin, Manager, Employee)
- Manager-employee relationship management

### Expense Submission
- Manual expense entry with multiple currencies
- OCR receipt scanning for automatic data extraction
- Support for expense categories (Travel, Meals, Accommodation, Supplies, Entertainment, Other)
- Receipt upload and storage
- Automatic currency conversion to company default currency

### Approval Workflows
- Sequential multi-level approvals
- Manager-first approval option
- Conditional approval rules:
  - Percentage-based (e.g., 60% of approvers must approve)
  - Specific approver (e.g., CFO approval auto-approves)
  - Hybrid rules (combination of both)
- Approval history tracking with comments

### Currency Management
- Support for multiple currencies
- Real-time currency conversion using live exchange rates
- Built-in currency converter tool
- Automatic conversion to company default currency for reporting

### Role-Based Dashboards

#### Admin Dashboard
- User and role management
- Approval workflow configuration
- View all company expenses
- Currency converter

#### Manager Dashboard
- Approve/reject pending expenses
- Submit personal expenses
- OCR receipt scanning
- View expense history

#### Employee Dashboard
- Submit expense claims
- OCR receipt scanning
- Track expense status
- View approval history

## Getting Started

1. Sign up with your email and company details
2. Select your country and currency
3. As an admin, add employees and managers
4. Configure approval workflows
5. Start submitting and approving expenses

## Technology Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Client-side storage (localStorage)
- Currency conversion APIs

## APIs Used

- Countries & Currencies: https://restcountries.com/v3.1/all
- Exchange Rates: https://api.exchangerate-api.com/v4/latest/

## Notes

This is a demo application using client-side storage. For production use, integrate with a real database (Supabase, Neon, etc.) and implement proper authentication.
