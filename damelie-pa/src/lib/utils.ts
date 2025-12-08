import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(d);
}

export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d < new Date();
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export const PROJECT_STATUSES = {
  LEAD: { label: "Lead", color: "bg-slate-100 text-slate-700" },
  NEGOTIATION: { label: "Negotiation", color: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  ON_HOLD: { label: "On Hold", color: "bg-orange-100 text-orange-700" },
  CLOSED_WON: { label: "Closed (Won)", color: "bg-blue-100 text-blue-700" },
  CLOSED_LOST: { label: "Closed (Lost)", color: "bg-red-100 text-red-700" },
} as const;

export const TASK_STATUSES = {
  OPEN: { label: "Open", color: "bg-slate-100 text-slate-700" },
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  AWAITING_PRICE: { label: "Awaiting Price", color: "bg-purple-100 text-purple-700" },
  AWAITING_CLIENT: { label: "Awaiting Client", color: "bg-cyan-100 text-cyan-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  COMPLETE: { label: "Complete", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
} as const;

export const TASK_PRIORITIES = {
  URGENT_PAYMENT: { label: "Urgent - Payment", color: "bg-red-100 text-red-700", order: 1 },
  BOQ_OFFER: { label: "BoQ / Offer", color: "bg-orange-100 text-orange-700", order: 2 },
  REPORT: { label: "Report", color: "bg-blue-100 text-blue-700", order: 3 },
  OPPORTUNITY: { label: "Opportunity", color: "bg-emerald-100 text-emerald-700", order: 4 },
  NORMAL: { label: "Normal", color: "bg-slate-100 text-slate-700", order: 5 },
} as const;

export const MEETING_TYPES = {
  MEETING: { label: "Meeting", icon: "Users" },
  SITE_VISIT: { label: "Site Visit", icon: "Building" },
  CALL: { label: "Call", icon: "Phone" },
} as const;

export const FINANCIAL_ENTRY_TYPES = {
  BUDGET: { label: "Budget", color: "text-slate-600" },
  INVOICE_SENT: { label: "Invoice Sent", color: "text-amber-600" },
  INVOICE_PAID: { label: "Invoice Paid", color: "text-emerald-600" },
  COST: { label: "Cost", color: "text-red-600" },
  ESTIMATE: { label: "Estimate", color: "text-blue-600" },
} as const;

