import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BilingualText } from '@/components/ui/BilingualText';
import { SinhalaInput } from '@/components/ui/SinhalaInput';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { z } from 'zod';

// Validation schema
const customerSchema = z.object({
  name: z.object({
    sinhala: z.string().min(1, 'Sinhala name is required'),
    english: z.string().min(1, 'English name is required')
  }),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  address: z.object({
    sinhala: z.string().min(1, 'Sinhala address is required'),
    english: z.string().min(1, 'English address is required')
  }),
  nic: z.string().regex(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/, 'Invalid NIC format'),
  initialLoanAmount: z.number().min(1000, 'Minimum loan amount is LKR 1,000'),
  guarantorName: z.string().optional(),
  guarantorPhone: z.string().optional(),
  emergencyContact: z.string().optional(),
  occupation: z.string().optional(),
  monthlyIncome: z.number().optional()
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  className?: string;
}

/**
 * Customer Form Component
 * 
 * Comprehensive form for adding and editing customers with bilingual support,
 * validation, and mobile-optimized interface.
 * 
 * Features:
 * - Bilingual input fields (Sinhala/English)
 * - Real-time validation with Zod
 * - Mobile-friendly design
 * - Auto-transliteration for Sinhala
 * - NIC validation for Sri Lankan format
 * - Phone number formatting
 * 
 * @example
 * <CustomerForm 
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   isEditing={false}
 * />
 */
export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  className = ''
}: CustomerFormProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<CustomerFormData>({
    name: { sinhala: '', english: '' },
    phone: '',
    address: { sinhala: '', english: '' },
    nic: '',
    initialLoanAmount: 0,
    guarantorName: '',
    guarantorPhone: '',
    emergencyContact: '',
    occupation: '',
    monthlyIncome: 0,
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const validateField = (field: keyof CustomerFormData, value: any) => {
    try {
      const fieldSchema = customerSchema.shape[field];
      fieldSchema.parse(value);
      setErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: error.errors[0]?.message || 'Invalid value' 
        }));
      }
    }
  };

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleBilingualChange = (field: 'name' | 'address', lang: 'sinhala' | 'english', value: string) => {
    const newValue = { ...formData[field], [lang]: value };
    setFormData(prev => ({ ...prev, [field]: newValue }));
    validateField(field, newValue);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = customerSchema.parse(formData);
      setLoading(true);
      await onSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${step > i + 1 ? 'bg-green-500 text-white' : 
              step === i + 1 ? 'bg-blue-500 text-white' : 
              'bg-gray-200 text-gray-600'}
          `}>
            {step > i + 1 ? '✓' : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 ${
              step > i + 1 ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 font-bilingual mb-4">
        {language === 'sinhala' ? 'පුද්ගලික තොරතුරු' :
         language === 'english' ? 'Personal Information' :
         'පුද්ගලික තොරතුරු / Personal Information'}
      </h3>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'නම (සිංහල)' :
             language === 'english' ? 'Name (Sinhala)' :
             'නම (සිංහල) / Name (Sinhala)'}
            <span className="text-red-500">*</span>
          </label>
          <SinhalaInput
            value={formData.name.sinhala}
            onChange={(value) => handleBilingualChange('name', 'sinhala', value)}
            placeholder="සම්පූර්ණ නම ඇතුළත් කරන්න"
            className={`w-full p-3 border rounded-md ${
              errors['name.sinhala'] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors['name.sinhala'] && (
            <p className="text-red-500 text-sm mt-1">{errors['name.sinhala']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'නම (ඉංග්‍රීසි)' :
             language === 'english' ? 'Name (English)' :
             'නම (ඉංග්‍රීසි) / Name (English)'}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name.english}
            onChange={(e) => handleBilingualChange('name', 'english', e.target.value)}
            placeholder="Enter full name"
            className={`w-full p-3 border rounded-md ${
              errors['name.english'] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors['name.english'] && (
            <p className="text-red-500 text-sm mt-1">{errors['name.english']}</p>
          )}
        </div>
      </div>

      {/* Phone and NIC */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'දුරකථන අංකය' :
             language === 'english' ? 'Phone Number' :
             'දුරකථන අංකය / Phone Number'}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="0771234567"
            className={`w-full p-3 border rounded-md ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formData.phone && (
            <p className="text-sm text-gray-500 mt-1">
              Formatted: {formatPhoneNumber(formData.phone)}
            </p>
          )}
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'ජාතික හැඳුනුම්පත් අංකය' :
             language === 'english' ? 'National ID (NIC)' :
             'ජාතික හැඳුනුම්පත් අංකය / National ID (NIC)'}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nic}
            onChange={(e) => handleInputChange('nic', e.target.value.toUpperCase())}
            placeholder="991234567V or 199912345678"
            className={`w-full p-3 border rounded-md ${
              errors.nic ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.nic && (
            <p className="text-red-500 text-sm mt-1">{errors.nic}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 font-bilingual mb-4">
        {language === 'sinhala' ? 'ලිපිනය සහ සම්බන්ධතා' :
         language === 'english' ? 'Address and Contacts' :
         'ලිපිනය සහ සම්බන්ධතා / Address and Contacts'}
      </h3>

      {/* Address Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'ලිපිනය (සිංහල)' :
             language === 'english' ? 'Address (Sinhala)' :
             'ලිපිනය (සිංහල) / Address (Sinhala)'}
            <span className="text-red-500">*</span>
          </label>
          <SinhalaInput
            value={formData.address.sinhala}
            onChange={(value) => handleBilingualChange('address', 'sinhala', value)}
            placeholder="සම්පූර්ණ ලිපිනය ඇතුළත් කරන්න"
            className={`w-full p-3 border rounded-md ${
              errors['address.sinhala'] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors['address.sinhala'] && (
            <p className="text-red-500 text-sm mt-1">{errors['address.sinhala']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'ලිපිනය (ඉංග්‍රීසි)' :
             language === 'english' ? 'Address (English)' :
             'ලිපිනය (ඉංග්‍රීසි) / Address (English)'}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address.english}
            onChange={(e) => handleBilingualChange('address', 'english', e.target.value)}
            placeholder="Enter complete address"
            className={`w-full p-3 border rounded-md ${
              errors['address.english'] ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors['address.english'] && (
            <p className="text-red-500 text-sm mt-1">{errors['address.english']}</p>
          )}
        </div>
      </div>

      {/* Emergency Contact and Guarantor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'හදිසි සම්බන්ධතාව' :
             language === 'english' ? 'Emergency Contact' :
             'හදිසි සම්බන්ධතාව / Emergency Contact'}
          </label>
          <input
            type="tel"
            value={formData.emergencyContact || ''}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder="0771234567"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'වෘත්තිය' :
             language === 'english' ? 'Occupation' :
             'වෘත්තිය / Occupation'}
          </label>
          <input
            type="text"
            value={formData.occupation || ''}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            placeholder="රැකියාව ඇතුළත් කරන්න / Enter occupation"
            className="w-full p-3 border border-gray-300 rounded-md font-bilingual"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 font-bilingual mb-4">
        {language === 'sinhala' ? 'ණය තොරතුරු' :
         language === 'english' ? 'Loan Information' :
         'ණය තොරතුරු / Loan Information'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'මූලික ණය මුදල' :
             language === 'english' ? 'Initial Loan Amount' :
             'මූලික ණය මුදල / Initial Loan Amount'}
            <span className="text-red-500">*</span>
          </label>
          <CurrencyInput
            value={formData.initialLoanAmount}
            onChange={(value) => handleInputChange('initialLoanAmount', value)}
            className={`w-full ${
              errors.initialLoanAmount ? 'border-red-500' : ''
            }`}
          />
          {errors.initialLoanAmount && (
            <p className="text-red-500 text-sm mt-1">{errors.initialLoanAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'මාසික ආදායම' :
             language === 'english' ? 'Monthly Income' :
             'මාසික ආදායම / Monthly Income'}
          </label>
          <CurrencyInput
            value={formData.monthlyIncome || 0}
            onChange={(value) => handleInputChange('monthlyIncome', value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'ප්‍රතිපාදන්කරුගේ නම' :
             language === 'english' ? 'Guarantor Name' :
             'ප්‍රතිපාදන්කරුගේ නම / Guarantor Name'}
          </label>
          <input
            type="text"
            value={formData.guarantorName || ''}
            onChange={(e) => handleInputChange('guarantorName', e.target.value)}
            placeholder="ප්‍රතිපාදන්කරුගේ නම / Guarantor name"
            className="w-full p-3 border border-gray-300 rounded-md font-bilingual"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'ප්‍රතිපාදන්කරුගේ දුරකථන අංකය' :
             language === 'english' ? 'Guarantor Phone' :
             'ප්‍රතිපාදන්කරුගේ දුරකථන අංකය / Guarantor Phone'}
          </label>
          <input
            type="tel"
            value={formData.guarantorPhone || ''}
            onChange={(e) => handleInputChange('guarantorPhone', e.target.value)}
            placeholder="0771234567"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 font-bilingual">
          {isEditing 
            ? (language === 'sinhala' ? 'ගනුම්කරු සංස්කරණය' :
               language === 'english' ? 'Edit Customer' :
               'ගනුම්කරු සංස්කරණය / Edit Customer')
            : (language === 'sinhala' ? 'නව ගනුම්කරුවෙකු එකතු කරන්න' :
               language === 'english' ? 'Add New Customer' :
               'නව ගනුම්කරුවෙකු එකතු කරන්න / Add New Customer')
          }
        </h2>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-bilingual"
              >
                {language === 'sinhala' ? 'පෙර' :
                 language === 'english' ? 'Previous' :
                 'පෙර / Previous'}
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-bilingual"
            >
              {language === 'sinhala' ? 'අවලංගු කරන්න' :
               language === 'english' ? 'Cancel' :
               'අවලංගු කරන්න / Cancel'}
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bilingual"
              >
                {language === 'sinhala' ? 'ඊළඟ' :
                 language === 'english' ? 'Next' :
                 'ඊළඟ / Next'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-bilingual"
              >
                {loading 
                  ? (language === 'sinhala' ? 'සුරකිමින්...' :
                     language === 'english' ? 'Saving...' :
                     'සුරකිමින්... / Saving...')
                  : (language === 'sinhala' ? 'සුරකින්න' :
                     language === 'english' ? 'Save Customer' :
                     'සුරකින්න / Save Customer')
                }
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;