import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { CreateCustomerData } from '@/services/customers';
import { createCustomer } from '@/services/customers';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export default function NewCustomerPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();

  const [formData, setFormData] = useState<CreateCustomerData>({
    firstName: '',
    lastName: '',
    nic: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    occupation: '',
    monthlyIncome: 0,
    agentId: user?.role === 'agent' ? user.id! : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (customerId) => {
      addNotification({
        type: 'success',
        title: 'Customer Created',
        message: 'Customer has been successfully created.',
      });
      router.push(`/customers/${customerId}`);
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to create customer.',
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.nic.trim()) newErrors.nic = 'NIC is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.district.trim()) newErrors['address.district'] = 'District is required';
    if (!formData.address.postalCode.trim()) newErrors['address.postalCode'] = 'Postal code is required';
    if (!formData.emergencyContact.name.trim()) newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    if (!formData.emergencyContact.phone.trim()) newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
    if (!formData.emergencyContact.relationship.trim()) newErrors['emergencyContact.relationship'] = 'Relationship is required';
    if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
    if (formData.monthlyIncome <= 0) newErrors.monthlyIncome = 'Monthly income must be greater than 0';

    // NIC validation (Sri Lankan NIC format)
    const nicPattern = /^(\d{9}[vVxX]|\d{12})$/;
    if (formData.nic && !nicPattern.test(formData.nic)) {
      newErrors.nic = 'Invalid NIC format';
    }

    // Phone validation (Sri Lankan format)
    const phonePattern = /^(\+94|0)([1-9]\d{8})$/;
    if (formData.phone && !phonePattern.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Email validation (if provided)
    if (formData.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    // Agent validation for admin users
    if (user?.role === 'admin' && !formData.agentId) {
      newErrors.agentId = 'Agent is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev as any)[keys[0]],
          [keys[1]]: value,
        },
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-gray-600">Create a new customer profile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={errors.lastName}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="NIC Number"
                    value={formData.nic}
                    onChange={(e) => handleInputChange('nic', e.target.value)}
                    error={errors.nic}
                    placeholder="123456789V or 123456789012"
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    placeholder="+94771234567 or 0771234567"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    error={errors['address.street']}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="City"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    error={errors['address.city']}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors['address.district'] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    value={formData.address.district}
                    onChange={(e) => handleInputChange('address.district', e.target.value)}
                    required
                  >
                    <option value="">Select District</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Matale">Matale</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Hambantota">Hambantota</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Kilinochchi">Kilinochchi</option>
                    <option value="Mannar">Mannar</option>
                    <option value="Vavuniya">Vavuniya</option>
                    <option value="Mullaitivu">Mullaitivu</option>
                    <option value="Batticaloa">Batticaloa</option>
                    <option value="Ampara">Ampara</option>
                    <option value="Trincomalee">Trincomalee</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Puttalam">Puttalam</option>
                    <option value="Anuradhapura">Anuradhapura</option>
                    <option value="Polonnaruwa">Polonnaruwa</option>
                    <option value="Badulla">Badulla</option>
                    <option value="Moneragala">Moneragala</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kegalle">Kegalle</option>
                  </select>
                  {errors['address.district'] && (
                    <p className="mt-1 text-sm text-red-600">{errors['address.district']}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Postal Code"
                    value={formData.address.postalCode}
                    onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                    error={errors['address.postalCode']}
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Contact Name"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                    error={errors['emergencyContact.name']}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Contact Phone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                    error={errors['emergencyContact.phone']}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                    error={errors['emergencyContact.relationship']}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Employment Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Employment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Occupation"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    error={errors.occupation}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Monthly Income (LKR)"
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                    error={errors.monthlyIncome}
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Assignment (for Admin users) */}
          {user.role === 'admin' && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Assignment</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign to Agent <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.agentId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      value={formData.agentId}
                      onChange={(e) => handleInputChange('agentId', e.target.value)}
                      required
                    >
                      <option value="">Select Agent</option>
                      {/* TODO: Load agents from API */}
                    </select>
                    {errors.agentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.agentId}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending}
            >
              Create Customer
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
