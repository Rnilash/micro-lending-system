// Customer Form Component Example
// A complete customer registration form with validation and Sinhala support

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';

// Validation schema
const customerSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    fullNameSinhala: z.string().optional(),
    nicNumber: z.string().regex(/^[0-9]{9}[vVxX]|[0-9]{12}$/, 'Invalid NIC format'),
    dateOfBirth: z.date().max(new Date(), 'Date cannot be in future'),
    gender: z.enum(['male', 'female']),
    occupation: z.string().min(1, 'Occupation is required'),
    monthlyIncome: z.number().positive('Income must be positive'),
    dependents: z.number().min(0).max(20),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  }),
  contactInfo: z.object({
    primaryPhone: z.string().regex(/^\+94[0-9]{9}$/, 'Invalid phone format'),
    secondaryPhone: z.string().regex(/^\+94[0-9]{9}$/, 'Invalid phone format').optional(),
    email: z.string().email('Invalid email format').optional(),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      district: z.string().min(1, 'District is required'),
      province: z.string().min(1, 'Province is required'),
      postalCode: z.string().regex(/^[0-9]{5}$/, 'Invalid postal code'),
    }),
    emergencyContact: z.object({
      name: z.string().min(1, 'Emergency contact name is required'),
      relationship: z.string().min(1, 'Relationship is required'),
      phone: z.string().regex(/^\+94[0-9]{9}$/, 'Invalid phone format'),
    }).optional(),
  }),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: CustomerFormData, documents: File[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CustomerFormProps) {
  const { t } = useTranslation('forms');
  const [documents, setDocuments] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      personalInfo: {
        firstName: initialData?.personalInfo?.firstName || '',
        lastName: initialData?.personalInfo?.lastName || '',
        fullNameSinhala: initialData?.personalInfo?.fullNameSinhala || '',
        nicNumber: initialData?.personalInfo?.nicNumber || '',
        dateOfBirth: initialData?.personalInfo?.dateOfBirth || new Date(),
        gender: initialData?.personalInfo?.gender || 'male',
        occupation: initialData?.personalInfo?.occupation || '',
        monthlyIncome: initialData?.personalInfo?.monthlyIncome || 0,
        dependents: initialData?.personalInfo?.dependents || 0,
        maritalStatus: initialData?.personalInfo?.maritalStatus || 'single',
      },
      contactInfo: {
        primaryPhone: initialData?.contactInfo?.primaryPhone || '',
        secondaryPhone: initialData?.contactInfo?.secondaryPhone || '',
        email: initialData?.contactInfo?.email || '',
        address: {
          street: initialData?.contactInfo?.address?.street || '',
          city: initialData?.contactInfo?.address?.city || '',
          district: initialData?.contactInfo?.address?.district || '',
          province: initialData?.contactInfo?.address?.province || '',
          postalCode: initialData?.contactInfo?.address?.postalCode || '',
        },
      },
    },
  });

  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Moneragala', 'Ratnapura', 'Kegalle'
  ];

  const provinces = [
    'Western', 'Central', 'Southern', 'Northern', 'Eastern',
    'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
  ];

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof CustomerFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['personalInfo'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['contactInfo'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFormSubmit = async (data: CustomerFormData) => {
    try {
      await onSubmit(data, documents);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleDocumentUpload = (files: File[]) => {
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Progress Indicator */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('customerRegistration')}
          </h2>
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('personalInformation')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('firstName')}
                {...register('personalInfo.firstName')}
                error={errors.personalInfo?.firstName?.message}
                placeholder={t('enterFirstName')}
                required
              />
              
              <Input
                label={t('lastName')}
                {...register('personalInfo.lastName')}
                error={errors.personalInfo?.lastName?.message}
                placeholder={t('enterLastName')}
                required
              />
              
              <Input
                label={t('fullNameSinhala')}
                {...register('personalInfo.fullNameSinhala')}
                error={errors.personalInfo?.fullNameSinhala?.message}
                placeholder="සම්පූර්ණ නම සිංහලෙන්"
                className="font-noto-sans-sinhala"
              />
              
              <Input
                label={t('nicNumber')}
                {...register('personalInfo.nicNumber')}
                error={errors.personalInfo?.nicNumber?.message}
                placeholder="199012345678 or 123456789V"
                required
              />
              
              <Input
                label={t('dateOfBirth')}
                type="date"
                {...register('personalInfo.dateOfBirth', { valueAsDate: true })}
                error={errors.personalInfo?.dateOfBirth?.message}
                required
              />
              
              <Select
                label={t('gender')}
                {...register('personalInfo.gender')}
                error={errors.personalInfo?.gender?.message}
                options={[
                  { value: 'male', label: t('male') },
                  { value: 'female', label: t('female') },
                ]}
                required
              />
              
              <Input
                label={t('occupation')}
                {...register('personalInfo.occupation')}
                error={errors.personalInfo?.occupation?.message}
                placeholder={t('enterOccupation')}
                required
              />
              
              <Input
                label={t('monthlyIncome')}
                type="number"
                {...register('personalInfo.monthlyIncome', { valueAsNumber: true })}
                error={errors.personalInfo?.monthlyIncome?.message}
                placeholder="50000"
                min={0}
                required
              />
              
              <Input
                label={t('dependents')}
                type="number"
                {...register('personalInfo.dependents', { valueAsNumber: true })}
                error={errors.personalInfo?.dependents?.message}
                placeholder="0"
                min={0}
                max={20}
              />
              
              <Select
                label={t('maritalStatus')}
                {...register('personalInfo.maritalStatus')}
                error={errors.personalInfo?.maritalStatus?.message}
                options={[
                  { value: 'single', label: t('single') },
                  { value: 'married', label: t('married') },
                  { value: 'divorced', label: t('divorced') },
                  { value: 'widowed', label: t('widowed') },
                ]}
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('contactInformation')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('primaryPhone')}
                {...register('contactInfo.primaryPhone')}
                error={errors.contactInfo?.primaryPhone?.message}
                placeholder="+94 77 123 4567"
                required
              />
              
              <Input
                label={t('secondaryPhone')}
                {...register('contactInfo.secondaryPhone')}
                error={errors.contactInfo?.secondaryPhone?.message}
                placeholder="+94 11 234 5678"
              />
              
              <div className="md:col-span-2">
                <Input
                  label={t('email')}
                  type="email"
                  {...register('contactInfo.email')}
                  error={errors.contactInfo?.email?.message}
                  placeholder="customer@email.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label={t('streetAddress')}
                  {...register('contactInfo.address.street')}
                  error={errors.contactInfo?.address?.street?.message}
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <Input
                label={t('city')}
                {...register('contactInfo.address.city')}
                error={errors.contactInfo?.address?.city?.message}
                placeholder="Colombo"
                required
              />
              
              <Select
                label={t('district')}
                {...register('contactInfo.address.district')}
                error={errors.contactInfo?.address?.district?.message}
                options={districts.map(district => ({ value: district, label: district }))}
                required
              />
              
              <Select
                label={t('province')}
                {...register('contactInfo.address.province')}
                error={errors.contactInfo?.address?.province?.message}
                options={provinces.map(province => ({ value: province, label: province }))}
                required
              />
              
              <Input
                label={t('postalCode')}
                {...register('contactInfo.address.postalCode')}
                error={errors.contactInfo?.address?.postalCode?.message}
                placeholder="00100"
                required
              />
            </div>

            {/* Emergency Contact */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {t('emergencyContact')}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={t('emergencyContactName')}
                  {...register('contactInfo.emergencyContact.name')}
                  error={errors.contactInfo?.emergencyContact?.name?.message}
                  placeholder="John Doe"
                />
                
                <Input
                  label={t('relationship')}
                  {...register('contactInfo.emergencyContact.relationship')}
                  error={errors.contactInfo?.emergencyContact?.relationship?.message}
                  placeholder="Brother/Sister/Parent"
                />
                
                <Input
                  label={t('emergencyContactPhone')}
                  {...register('contactInfo.emergencyContact.phone')}
                  error={errors.contactInfo?.emergencyContact?.phone?.message}
                  placeholder="+94 77 123 4567"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Document Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('kycDocuments')}
            </h3>
            
            <div className="space-y-4">
              <FileUpload
                label={t('nicFrontCopy')}
                acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxSize={5 * 1024 * 1024} // 5MB
                onUpload={handleDocumentUpload}
                required
              />
              
              <FileUpload
                label={t('nicBackCopy')}
                acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxSize={5 * 1024 * 1024} // 5MB
                onUpload={handleDocumentUpload}
                required
              />
              
              <FileUpload
                label={t('incomeProof')}
                acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxSize={5 * 1024 * 1024} // 5MB
                onUpload={handleDocumentUpload}
                required
              />
              
              <FileUpload
                label={t('addressProof')}
                acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxSize={5 * 1024 * 1024} // 5MB
                onUpload={handleDocumentUpload}
                required
              />
              
              <FileUpload
                label={t('profilePhoto')}
                acceptedTypes={['image/jpeg', 'image/png']}
                maxSize={2 * 1024 * 1024} // 2MB
                onUpload={handleDocumentUpload}
                required
              />
            </div>

            {/* Document List */}
            {documents.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                  {t('uploadedDocuments')}
                </h4>
                <div className="space-y-2">
                  {documents.map((document, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">
                          {document.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(document.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 mt-8 border-t">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
              >
                {t('previous')}
              </Button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {t('cancel')}
            </Button>
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
              >
                {t('next')}
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isLoading}
              >
                {t('createCustomer')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;