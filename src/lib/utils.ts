import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in LKR
 */
export function formatCurrency(amount: number, locale: string = 'en-LK'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(number: number, locale: string = 'en-LK'): string {
  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date | string, locale: string = 'en-LK', options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string, locale: string = 'en-LK'): string {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string, locale: string = 'en'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-count, interval.label as any);
    }
  }

  return 'just now';
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generate a unique receipt number
 */
export function generateReceiptNumber(prefix: string = 'RCP'): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${prefix}${year}${month}${day}${random}`;
}

/**
 * Generate a unique loan number
 */
export function generateLoanNumber(prefix: string = 'LN'): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  
  return `${prefix}${year}${month}${day}${random}`;
}

/**
 * Generate a unique customer ID
 */
export function generateCustomerId(prefix: string = 'C'): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  
  return `${prefix}${year}${month}${random}`;
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: Date | string): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/**
 * Generate a random ID
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * Validate Sri Lankan NIC number
 */
export function validateNIC(nic: string): boolean {
  // Old format: 9 digits + V (e.g., 123456789V)
  const oldFormat = /^[0-9]{9}[VvXx]$/;
  
  // New format: 12 digits (e.g., 123456789012)
  const newFormat = /^[0-9]{12}$/;
  
  return oldFormat.test(nic) || newFormat.test(nic);
}

/**
 * Validate Sri Lankan phone number
 */
export function validatePhone(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check for valid Sri Lankan mobile formats
  // 07X XXXXXXX (10 digits starting with 07)
  // +947X XXXXXXX (12 digits starting with +947)
  // 947X XXXXXXX (11 digits starting with 947)
  
  if (cleaned.length === 10 && cleaned.startsWith('07')) {
    return true;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('947')) {
    return true;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('947')) {
    return true;
  }
  
  return false;
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10 && cleaned.startsWith('07')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Sri Lankan phone number formatting
  if (cleaned.startsWith('94')) {
    // International format: +94 77 123 4567
    const number = cleaned.substring(2);
    if (number.length === 9) {
      return `+94 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
  } else if (cleaned.startsWith('0')) {
    // Local format: 077 123 4567
    if (cleaned.length === 10) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
  }
  
  // Return original if formatting fails
  return phoneNumber;
}

/**
 * Calculate loan installment amount
 */
export function calculateInstallment(
  principal: number,
  interestRate: number,
  term: number,
  method: 'flat' | 'reducing' = 'flat'
): number {
  if (method === 'flat') {
    const totalInterest = (principal * interestRate * term) / 100;
    return (principal + totalInterest) / term;
  } else {
    // Reducing balance method
    const monthlyRate = interestRate / 100;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
           (Math.pow(1 + monthlyRate, term) - 1);
  }
}

/**
 * Calculate total loan amount
 */
export function calculateTotalAmount(
  principal: number,
  interestRate: number,
  term: number,
  method: 'flat' | 'reducing' = 'flat'
): number {
  if (method === 'flat') {
    const totalInterest = (principal * interestRate * term) / 100;
    return principal + totalInterest;
  } else {
    const installment = calculateInstallment(principal, interestRate, term, method);
    return installment * term;
  }
}

/**
 * Calculate outstanding balance
 */
export function calculateOutstandingBalance(
  principal: number,
  interestRate: number,
  term: number,
  paidInstallments: number,
  method: 'flat' | 'reducing' = 'flat'
): number {
  if (method === 'flat') {
    const installmentAmount = calculateInstallment(principal, interestRate, term, method);
    const totalAmount = installmentAmount * term;
    const paidAmount = installmentAmount * paidInstallments;
    return totalAmount - paidAmount;
  } else {
    // For reducing balance, calculate remaining principal
    const monthlyRate = interestRate / 100;
    const installment = calculateInstallment(principal, interestRate, term, method);
    
    let balance = principal;
    for (let i = 0; i < paidInstallments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = installment - interestPayment;
      balance -= principalPayment;
    }
    
    return Math.max(0, balance);
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(str: string): string {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a range of numbers
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}
