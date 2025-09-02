# Sinhala Integration Guide

Comprehensive guide for implementing Sinhala language support in the Digital Micro-Lending Management System.

## Table of Contents
- [Sinhala Language Support Overview](#sinhala-language-support-overview)
- [Font Configuration](#font-configuration)
- [Text Input and Display](#text-input-and-display)
- [Number and Currency Formatting](#number-and-currency-formatting)
- [Date and Time Formatting](#date-and-time-formatting)
- [Bilingual Interface Implementation](#bilingual-interface-implementation)
- [Database Storage Considerations](#database-storage-considerations)
- [Printing and PDF Generation](#printing-and-pdf-generation)
- [Mobile Device Support](#mobile-device-support)

## Sinhala Language Support Overview

### Unicode Support
```
Sinhala Unicode Range: U+0D80–U+0DFF
├── Basic Letters: U+0D82–U+0D96
├── Vowel Signs: U+0DCF–U+0DDF
├── Other Symbols: U+0DE6–U+0DEF
└── Numbers: U+0DE6–U+0DEF
```

### Character Encoding
```typescript
// Ensure UTF-8 encoding throughout the application
const sinhalaText = "සූක්ෂම් ණයදාන පද්ධතිය";
console.log(sinhalaText.length); // Proper character count
```

## Font Configuration

### 1. Web Font Setup
```css
/* styles/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Iskoola+Pota&display=swap');

:root {
  --font-sinhala: 'Noto Sans Sinhala', 'Iskoola Pota', sans-serif;
  --font-english: 'Inter', 'Arial', sans-serif;
}

.font-sinhala {
  font-family: var(--font-sinhala);
}

.font-english {
  font-family: var(--font-english);
}

/* Bilingual text support */
.bilingual {
  font-family: var(--font-sinhala), var(--font-english);
}
```

### 2. Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'sinhala': ['Noto Sans Sinhala', 'Iskoola Pota', 'sans-serif'],
        'english': ['Inter', 'Arial', 'sans-serif'],
        'bilingual': ['Noto Sans Sinhala', 'Inter', 'sans-serif']
      },
      fontSize: {
        'sinhala-sm': ['14px', { lineHeight: '1.6' }],
        'sinhala-base': ['16px', { lineHeight: '1.6' }],
        'sinhala-lg': ['18px', { lineHeight: '1.6' }],
        'sinhala-xl': ['20px', { lineHeight: '1.6' }],
        'sinhala-2xl': ['24px', { lineHeight: '1.5' }],
      }
    }
  }
}
```

## Text Input and Display

### 1. Sinhala Text Input Component
```typescript
// components/ui/SinhalaInput.tsx
import { useState, useRef, useEffect } from 'react';

interface SinhalaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  enableTransliteration?: boolean;
}

export function SinhalaInput({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  enableTransliteration = true 
}: SinhalaInputProps) {
  const [inputMode, setInputMode] = useState<'sinhala' | 'english'>('sinhala');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (enableTransliteration && inputMode === 'sinhala') {
      const transliterated = transliterateToSinhala(e.key);
      if (transliterated !== e.key) {
        e.preventDefault();
        const newValue = value + transliterated;
        onChange(newValue);
      }
    }

    // Toggle input mode with Ctrl+Space
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      setInputMode(mode => mode === 'sinhala' ? 'english' : 'sinhala');
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          font-bilingual text-sinhala-base
          ${inputMode === 'sinhala' ? 'direction-ltr' : ''}
          ${className}
        `}
        dir="ltr"
      />
      
      {enableTransliteration && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <button
            type="button"
            onClick={() => setInputMode(mode => mode === 'sinhala' ? 'english' : 'sinhala')}
            className="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            {inputMode === 'sinhala' ? 'සිං' : 'EN'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2. Transliteration Engine
```typescript
// lib/sinhala-transliteration.ts
const transliterationMap: Record<string, string> = {
  // Vowels
  'a': 'අ',
  'aa': 'ආ',
  'i': 'ඉ',
  'ii': 'ඊ',
  'u': 'උ',
  'uu': 'ඌ',
  'e': 'එ',
  'ee': 'ඒ',
  'o': 'ඔ',
  'oo': 'ඕ',
  'au': 'ඖ',
  
  // Consonants
  'ka': 'ක',
  'kha': 'ඛ',
  'ga': 'ග',
  'gha': 'ඝ',
  'nga': 'ඞ',
  'cha': 'ච',
  'chha': 'ඡ',
  'ja': 'ජ',
  'jha': 'ඣ',
  'nya': 'ඤ',
  'ta': 'ට',
  'tha': 'ඨ',
  'da': 'ඩ',
  'dha': 'ඪ',
  'na': 'ණ',
  'tha': 'ත',
  'thha': 'ථ',
  'da': 'ද',
  'dhha': 'ධ',
  'na': 'න',
  'pa': 'ප',
  'pha': 'ඵ',
  'ba': 'බ',
  'bha': 'භ',
  'ma': 'ම',
  'ya': 'ය',
  'ra': 'ර',
  'la': 'ල',
  'va': 'ව',
  'sha': 'ශ',
  'ssa': 'ෂ',
  'sa': 'ස',
  'ha': 'හ',
  'lla': 'ළ',
  'fa': 'ෆ'
};

export function transliterateToSinhala(input: string): string {
  let result = '';
  let i = 0;
  
  while (i < input.length) {
    let found = false;
    
    // Try to match longer combinations first
    for (let len = 3; len >= 1; len--) {
      const substr = input.substr(i, len);
      if (transliterationMap[substr]) {
        result += transliterationMap[substr];
        i += len;
        found = true;
        break;
      }
    }
    
    if (!found) {
      result += input[i];
      i++;
    }
  }
  
  return result;
}

export function isValidSinhalaText(text: string): boolean {
  const sinhalaRegex = /^[\u0D80-\u0DFF\s\d.,!?'"()/-]*$/;
  return sinhalaRegex.test(text);
}

export function getSinhalaTextLength(text: string): number {
  // Proper character count for Sinhala text (considering combining characters)
  return [...text].length;
}
```

### 3. Bilingual Text Display
```typescript
// components/ui/BilingualText.tsx
interface BilingualTextProps {
  sinhala: string;
  english: string;
  primaryLanguage?: 'sinhala' | 'english';
  showBoth?: boolean;
  className?: string;
}

export function BilingualText({
  sinhala,
  english,
  primaryLanguage = 'sinhala',
  showBoth = true,
  className = ''
}: BilingualTextProps) {
  if (!showBoth) {
    return (
      <span className={`${primaryLanguage === 'sinhala' ? 'font-sinhala' : 'font-english'} ${className}`}>
        {primaryLanguage === 'sinhala' ? sinhala : english}
      </span>
    );
  }

  return (
    <div className={className}>
      <div className="font-sinhala text-sinhala-base">
        {sinhala}
      </div>
      <div className="font-english text-sm text-gray-600">
        {english}
      </div>
    </div>
  );
}
```

## Number and Currency Formatting

### 1. Sinhala Number System
```typescript
// lib/sinhala-numbers.ts
const sinhalaDigits = ['෦', '෧', '෨', '෩', '෪', '෫', '෬', '෭', '෮', '෯'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function convertToSinhalaNumbers(input: string | number): string {
  const str = input.toString();
  return str.split('').map(digit => {
    const index = englishDigits.indexOf(digit);
    return index !== -1 ? sinhalaDigits[index] : digit;
  }).join('');
}

export function convertToEnglishNumbers(input: string): string {
  return input.split('').map(digit => {
    const index = sinhalaDigits.indexOf(digit);
    return index !== -1 ? englishDigits[index] : digit;
  }).join('');
}

export function formatSinhalaNumber(
  number: number,
  options: {
    useSinhalaDigits?: boolean;
    includeCommas?: boolean;
    decimalPlaces?: number;
  } = {}
): string {
  const {
    useSinhalaDigits = true,
    includeCommas = true,
    decimalPlaces = 2
  } = options;

  let formatted = number.toFixed(decimalPlaces);
  
  if (includeCommas) {
    formatted = formatWithCommas(formatted);
  }

  if (useSinhalaDigits) {
    formatted = convertToSinhalaNumbers(formatted);
  }

  return formatted;
}

function formatWithCommas(str: string): string {
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}
```

### 2. Sri Lankan Currency Formatting
```typescript
// lib/lkr-formatter.ts
export interface CurrencyFormatOptions {
  language: 'sinhala' | 'english' | 'both';
  showCurrencySymbol: boolean;
  useSinhalaDigits: boolean;
  precision: number;
}

export function formatLKR(
  amount: number,
  options: Partial<CurrencyFormatOptions> = {}
): string {
  const {
    language = 'both',
    showCurrencySymbol = true,
    useSinhalaDigits = true,
    precision = 2
  } = options;

  const formatted = formatSinhalaNumber(amount, {
    useSinhalaDigits: language === 'sinhala' && useSinhalaDigits,
    includeCommas: true,
    decimalPlaces: precision
  });

  if (language === 'sinhala') {
    const currencySymbol = showCurrencySymbol ? 'රු. ' : '';
    return `${currencySymbol}${formatted}`;
  } else if (language === 'english') {
    const currencySymbol = showCurrencySymbol ? 'LKR ' : '';
    return `${currencySymbol}${formatSinhalaNumber(amount, { useSinhalaDigits: false, includeCommas: true, decimalPlaces: precision })}`;
  } else {
    const sinhalaFormat = `රු. ${formatted}`;
    const englishFormat = `LKR ${formatSinhalaNumber(amount, { useSinhalaDigits: false, includeCommas: true, decimalPlaces: precision })}`;
    return `${sinhalaFormat} (${englishFormat})`;
  }
}

// Number word conversion for amounts
const sinhalaNumberWords = {
  1: 'එක',
  2: 'දෙක',
  3: 'තුන',
  4: 'හතර',
  5: 'පහ',
  6: 'හය',
  7: 'හත',
  8: 'අට',
  9: 'නවය',
  10: 'දහය',
  100: 'සියය',
  1000: 'දහස',
  100000: 'ලක්ෂය',
  10000000: 'කෝටිය'
};

export function amountToSinhalaWords(amount: number): string {
  // Convert numeric amount to Sinhala words
  // This is a simplified implementation
  if (amount === 0) return 'බිංදුව';
  
  // Implementation would be more complex for full number-to-word conversion
  return amount.toLocaleString('si-LK');
}
```

### 3. Currency Input Component
```typescript
// components/ui/CurrencyInput.tsx
import { useState } from 'react';
import { formatLKR } from '@/lib/lkr-formatter';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  language?: 'sinhala' | 'english' | 'both';
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = 'Amount / මුදල',
  className = '',
  language = 'both'
}: CurrencyInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.]/g, '');
    setInputValue(raw);
    
    const numValue = parseFloat(raw) || 0;
    onChange(numValue);
  };

  const displayValue = focused ? inputValue : formatLKR(value, { 
    language: 'english',
    showCurrencySymbol: false
  });

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        {language === 'sinhala' ? 'රු.' : language === 'english' ? 'LKR' : 'LKR / රු.'}
      </div>
      
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`
          pl-16 pr-4 py-2 font-bilingual text-right
          border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500
          ${className}
        `}
      />
      
      {!focused && value > 0 && (
        <div className="text-xs text-gray-500 mt-1 font-sinhala">
          {formatLKR(value, { language: 'sinhala' })}
        </div>
      )}
    </div>
  );
}
```

## Date and Time Formatting

### 1. Sinhala Date Formatter
```typescript
// lib/sinhala-date.ts
const sinhalaMonths = [
  'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
  'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'
];

const sinhalaDays = [
  'ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'
];

export function formatSinhalaDate(
  date: Date,
  format: 'full' | 'short' | 'numeric' = 'full'
): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const dayOfWeek = date.getDay();

  switch (format) {
    case 'full':
      return `${sinhalaDays[dayOfWeek]}, ${convertToSinhalaNumbers(day)} ${sinhalaMonths[month]} ${convertToSinhalaNumbers(year)}`;
    
    case 'short':
      return `${convertToSinhalaNumbers(day)} ${sinhalaMonths[month]} ${convertToSinhalaNumbers(year)}`;
    
    case 'numeric':
      return `${convertToSinhalaNumbers(year)}-${convertToSinhalaNumbers(month + 1).padStart(2, '෦')}-${convertToSinhalaNumbers(day).padStart(2, '෦')}`;
    
    default:
      return formatSinhalaDate(date, 'full');
  }
}

export function formatSinhalaTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'ප.ව.' : 'පෙ.ව.';
  const displayHours = hours % 12 || 12;
  
  return `${convertToSinhalaNumbers(displayHours)}:${convertToSinhalaNumbers(minutes).padStart(2, '෦')} ${ampm}`;
}

export function formatBilingualDate(date: Date): string {
  const englishDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const sinhalaDate = formatSinhalaDate(date, 'full');
  
  return `${sinhalaDate}\n${englishDate}`;
}
```

### 2. Date Input Component
```typescript
// components/ui/DateInput.tsx
import { useState } from 'react';
import { formatSinhalaDate } from '@/lib/sinhala-date';

interface DateInputProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  className?: string;
}

export function DateInput({ value, onChange, label, className = '' }: DateInputProps) {
  const [showSinhala, setShowSinhala] = useState(true);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onChange(newDate);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 font-bilingual">
          {label}
        </label>
      )}
      
      <input
        type="date"
        value={value.toISOString().split('T')[0]}
        onChange={handleDateChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      
      <div className="mt-1 text-sm">
        <button
          type="button"
          onClick={() => setShowSinhala(!showSinhala)}
          className="text-blue-600 hover:text-blue-800 font-bilingual"
        >
          {showSinhala ? formatSinhalaDate(value, 'short') : value.toLocaleDateString()}
        </button>
      </div>
    </div>
  );
}
```

## Bilingual Interface Implementation

### 1. Language Context
```typescript
// contexts/LanguageContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'sinhala' | 'english' | 'both';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentLocale: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('both');

  const translations = {
    sinhala: {
      'app.title': 'සූක්ෂම් ණයදාන පද්ධතිය',
      'navigation.dashboard': 'උපකරණ පුවරුව',
      'navigation.customers': 'ගනුම්කරුවන්',
      'navigation.loans': 'ණය',
      'navigation.payments': 'ගෙවීම්',
      'navigation.reports': 'වාර්තා',
      'customer.name': 'නම',
      'customer.phone': 'දුරකථන අංකය',
      'customer.address': 'ලිපිනය',
      'loan.amount': 'ණය මුදල',
      'loan.interest': 'පොලී අනුපාතය',
      'loan.duration': 'කාලසීමාව',
      'payment.amount': 'ගෙවන මුදල',
      'payment.date': 'ගෙවන දිනය',
      'button.save': 'සුරකින්න',
      'button.cancel': 'අවලංගු කරන්න',
      'button.edit': 'සංස්කරණය කරන්න',
      'button.delete': 'මකන්න'
    },
    english: {
      'app.title': 'Micro Lending System',
      'navigation.dashboard': 'Dashboard',
      'navigation.customers': 'Customers',
      'navigation.loans': 'Loans',
      'navigation.payments': 'Payments',
      'navigation.reports': 'Reports',
      'customer.name': 'Name',
      'customer.phone': 'Phone Number',
      'customer.address': 'Address',
      'loan.amount': 'Loan Amount',
      'loan.interest': 'Interest Rate',
      'loan.duration': 'Duration',
      'payment.amount': 'Payment Amount',
      'payment.date': 'Payment Date',
      'button.save': 'Save',
      'button.cancel': 'Cancel',
      'button.edit': 'Edit',
      'button.delete': 'Delete'
    }
  };

  const t = (key: string): string => {
    if (language === 'both') {
      const sinhala = translations.sinhala[key] || key;
      const english = translations.english[key] || key;
      return `${sinhala} / ${english}`;
    }
    
    return translations[language]?.[key] || translations.english[key] || key;
  };

  const currentLocale = language === 'sinhala' ? 'si-LK' : 'en-US';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
```

### 2. Language Switcher Component
```typescript
// components/ui/LanguageSwitcher.tsx
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('sinhala')}
        className={`px-3 py-1 rounded text-sm ${
          language === 'sinhala' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        සිංහල
      </button>
      
      <button
        onClick={() => setLanguage('english')}
        className={`px-3 py-1 rounded text-sm ${
          language === 'english' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        English
      </button>
      
      <button
        onClick={() => setLanguage('both')}
        className={`px-3 py-1 rounded text-sm ${
          language === 'both' 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        Both / දෙකම
      </button>
    </div>
  );
}
```

## Database Storage Considerations

### 1. Firestore Schema for Bilingual Data
```typescript
// lib/bilingual-schema.ts
interface BilingualText {
  sinhala: string;
  english: string;
}

interface CustomerDocument {
  id: string;
  name: BilingualText;
  address: BilingualText;
  phone: string;
  notes?: BilingualText;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface LoanDocument {
  id: string;
  customerId: string;
  amount: number;
  description?: BilingualText;
  terms?: BilingualText;
  createdAt: Timestamp;
}

// Utility functions for bilingual text
export function createBilingualText(sinhala: string, english: string): BilingualText {
  return { sinhala: sinhala.trim(), english: english.trim() };
}

export function getBilingualText(
  text: BilingualText | string,
  language: 'sinhala' | 'english' | 'both' = 'both'
): string {
  if (typeof text === 'string') return text;
  
  switch (language) {
    case 'sinhala':
      return text.sinhala;
    case 'english':
      return text.english;
    case 'both':
      return `${text.sinhala} / ${text.english}`;
    default:
      return text.english;
  }
}

export function searchBilingualText(text: BilingualText, query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    text.sinhala.toLowerCase().includes(lowerQuery) ||
    text.english.toLowerCase().includes(lowerQuery)
  );
}
```

### 2. Firestore Indexing for Sinhala Text
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "name.sinhala",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "customers", 
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "name.english",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

## Printing and PDF Generation

### 1. Bilingual PDF Generation
```typescript
// lib/pdf-generator.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export async function generateBilingualReceipt(
  data: ReceiptData,
  language: 'sinhala' | 'english' | 'both' = 'both'
): Promise<Blob> {
  const doc = new jsPDF();
  
  // Load Sinhala font for PDF
  const sinhalaFontBase64 = await loadSinhalaFont();
  doc.addFileToVFS('NotoSansSinhala.ttf', sinhalaFontBase64);
  doc.addFont('NotoSansSinhala.ttf', 'NotoSansSinhala', 'normal');

  // Set title
  if (language === 'sinhala' || language === 'both') {
    doc.setFont('NotoSansSinhala');
    doc.setFontSize(18);
    doc.text('සූක්ෂම් ණයදාන පද්ධතිය', 20, 20);
    doc.text('ගෙවීම් රිසිට්පත', 20, 35);
  }

  if (language === 'english' || language === 'both') {
    doc.setFont('helvetica');
    doc.setFontSize(16);
    const yPos = language === 'both' ? 50 : 20;
    doc.text('Micro Lending System', 20, yPos);
    doc.text('Payment Receipt', 20, yPos + 15);
  }

  // Add receipt content
  const startY = language === 'both' ? 80 : 60;
  
  if (language === 'sinhala' || language === 'both') {
    doc.setFont('NotoSansSinhala');
    doc.setFontSize(12);
    doc.text(`ගනුම්කරු: ${data.customerName}`, 20, startY);
    doc.text(`මුදල: රු. ${formatLKR(data.amount, { language: 'sinhala' })}`, 20, startY + 15);
    doc.text(`දිනය: ${formatSinhalaDate(data.date)}`, 20, startY + 30);
  }

  if (language === 'english' || language === 'both') {
    doc.setFont('helvetica');
    doc.setFontSize(12);
    const yOffset = language === 'both' ? 50 : 0;
    doc.text(`Customer: ${data.customerName}`, 20, startY + yOffset);
    doc.text(`Amount: ${formatLKR(data.amount, { language: 'english' })}`, 20, startY + 15 + yOffset);
    doc.text(`Date: ${data.date.toLocaleDateString()}`, 20, startY + 30 + yOffset);
  }

  return doc.output('blob');
}

async function loadSinhalaFont(): Promise<string> {
  // Load Sinhala font file and convert to base64
  // This would typically be loaded from a CDN or local file
  return ''; // Font base64 data would go here
}
```

### 2. Print-Friendly Components
```typescript
// components/ui/PrintableReceipt.tsx
import { useLanguage } from '@/contexts/LanguageContext';
import { formatLKR } from '@/lib/lkr-formatter';
import { formatSinhalaDate } from '@/lib/sinhala-date';

interface PrintableReceiptProps {
  receiptData: ReceiptData;
}

export function PrintableReceipt({ receiptData }: PrintableReceiptProps) {
  const { language } = useLanguage();

  return (
    <div className="print:block hidden">
      <style jsx>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          
          .receipt-content {
            font-family: 'Noto Sans Sinhala', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
          }
          
          .sinhala-text {
            font-family: 'Noto Sans Sinhala', sans-serif;
          }
          
          .english-text {
            font-family: Arial, sans-serif;
          }
        }
      `}</style>
      
      <div className="receipt-content">
        <div className="text-center mb-6">
          <h1 className="sinhala-text text-xl font-bold">
            සූක්ෂම් ණයදාන පද්ධතිය
          </h1>
          <h2 className="english-text text-lg">
            Micro Lending System
          </h2>
          <div className="sinhala-text text-lg mt-2">
            ගෙවීම් රිසිට්පත / Payment Receipt
          </div>
        </div>

        <div className="mb-4">
          <div className="sinhala-text">
            රිසිට්පත් අංකය: {receiptData.receiptNumber}
          </div>
          <div className="english-text">
            Receipt No: {receiptData.receiptNumber}
          </div>
        </div>

        <div className="mb-4">
          <div className="sinhala-text">
            ගනුම්කරු: {receiptData.customerName}
          </div>
          <div className="english-text">
            Customer: {receiptData.customerName}
          </div>
        </div>

        <div className="mb-4">
          <div className="sinhala-text">
            මුදල: {formatLKR(receiptData.amount, { language: 'sinhala' })}
          </div>
          <div className="english-text">
            Amount: {formatLKR(receiptData.amount, { language: 'english' })}
          </div>
        </div>

        <div className="mb-6">
          <div className="sinhala-text">
            දිනය: {formatSinhalaDate(receiptData.date)}
          </div>
          <div className="english-text">
            Date: {receiptData.date.toLocaleDateString()}
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="sinhala-text">
            ගෙවීම සඳහා ස්තූතියි!
          </div>
          <div className="english-text">
            Thank you for your payment!
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Mobile Device Support

### 1. Mobile Keyboard Configuration
```typescript
// components/ui/MobileKeyboard.tsx
import { useEffect } from 'react';

interface MobileKeyboardProps {
  inputRef: React.RefObject<HTMLInputElement>;
  enableSinhala: boolean;
}

export function MobileKeyboard({ inputRef, enableSinhala }: MobileKeyboardProps) {
  useEffect(() => {
    if (inputRef.current && enableSinhala) {
      // Configure mobile input for Sinhala
      inputRef.current.setAttribute('inputmode', 'text');
      inputRef.current.setAttribute('lang', 'si');
      
      // Add Sinhala keyboard hints for mobile browsers
      if ('virtualKeyboard' in navigator) {
        (navigator as any).virtualKeyboard.overlaysContent = true;
      }
    }
  }, [inputRef, enableSinhala]);

  return null;
}
```

### 2. Touch-Friendly Sinhala Input
```typescript
// components/ui/TouchSinhalaInput.tsx
import { useState, useRef } from 'react';
import { MobileKeyboard } from './MobileKeyboard';

interface TouchSinhalaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TouchSinhalaInput({ value, onChange, placeholder }: TouchSinhalaInputProps) {
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = () => {
    setIsActive(true);
    // Zoom prevention on mobile
    if (inputRef.current) {
      inputRef.current.style.fontSize = '16px';
    }
  };

  const handleBlur = () => {
    setIsActive(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 text-base font-bilingual
          border-2 rounded-lg transition-all
          ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          focus:outline-none focus:ring-0
        `}
        style={{ fontSize: '16px' }} // Prevent zoom on iOS
      />
      
      <MobileKeyboard inputRef={inputRef} enableSinhala={true} />
    </div>
  );
}
```

## Implementation Checklist

### Font and Typography
- [ ] Configure Sinhala web fonts (Noto Sans Sinhala)
- [ ] Set up Tailwind CSS with Sinhala font classes
- [ ] Implement proper line height and spacing for Sinhala text
- [ ] Test font rendering across different browsers

### Input and Display
- [ ] Create Sinhala text input component with transliteration
- [ ] Implement bilingual text display components
- [ ] Add language switcher functionality
- [ ] Configure mobile keyboard support

### Number and Currency
- [ ] Implement Sinhala digit conversion
- [ ] Create LKR currency formatter
- [ ] Build touch-friendly currency input
- [ ] Add number-to-words conversion for amounts

### Date and Time
- [ ] Develop Sinhala date formatting utilities
- [ ] Create bilingual date input component
- [ ] Implement Sinhala calendar integration
- [ ] Add time formatting in Sinhala

### Database Integration
- [ ] Design bilingual data schema for Firestore
- [ ] Implement search functionality for Sinhala text
- [ ] Configure proper indexing for Sinhala content
- [ ] Add validation for Sinhala text inputs

### Printing and PDFs
- [ ] Set up Sinhala font loading for PDF generation
- [ ] Create bilingual receipt templates
- [ ] Implement print-friendly CSS styles
- [ ] Test printing across different devices

### Mobile Optimization
- [ ] Configure mobile keyboards for Sinhala input
- [ ] Implement touch-friendly input components
- [ ] Add viewport zoom prevention
- [ ] Test Sinhala rendering on mobile devices

### Testing and Validation
- [ ] Test Sinhala text input and display
- [ ] Validate number and currency formatting
- [ ] Check PDF generation with Sinhala content
- [ ] Test across different mobile devices and browsers

This comprehensive Sinhala integration guide ensures proper support for Sri Lankan users with authentic local language capabilities throughout the micro-lending system.