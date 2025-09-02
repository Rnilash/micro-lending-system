import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { getCustomerById, updateCustomer, type UpdateCustomerData } from '@/services/customers';
import { getAgents } from '@/services/users';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import {
    ArrowLeftIcon,
    BriefcaseIcon,
    CurrencyDollarIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    PhoneIcon,
    UserGroupIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateCustomerData>({
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
    agentId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch customer data
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id as string),
    enabled: !!id,
  });

  // Fetch agents for assignment (admin only)
  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: getAgents,
    enabled: user?.role === 'admin',
  });

  // Update form data when customer is loaded
  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        nic: customer.nic || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          district: customer.address?.district || '',
          postalCode: customer.address?.postalCode || '',
        },
        emergencyContact: {
          name: customer.emergencyContact?.name || '',
          phone: customer.emergencyContact?.phone || '',
          relationship: customer.emergencyContact?.relationship || '',
        },
        occupation: customer.occupation || '',
        monthlyIncome: customer.monthlyIncome || 0,
        agentId: (customer as { agentId?: string }).agentId || '',
      });
    }
  }, [customer]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateCustomerData) => updateCustomer(id as string, data),
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Customer Updated',
        message: 'Customer information has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      router.push(`/customers/${id}`);
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update customer information.',
      });
    },
  });

  const handleInputChange = (field: string, value: string | number | undefined) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev as Record<string, any>)[keys[0]],
          [keys[1]]: value,
        },
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.nic?.trim()) newErrors.nic = 'NIC is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address?.street?.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address?.city?.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address?.district?.trim()) newErrors['address.district'] = 'District is required';
    if (!formData.address?.postalCode?.trim()) newErrors['address.postalCode'] = 'Postal code is required';
    if (!formData.emergencyContact?.name?.trim()) newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    if (!formData.emergencyContact?.phone?.trim()) newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
    if (!formData.emergencyContact?.relationship?.trim()) newErrors['emergencyContact.relationship'] = 'Relationship is required';
    if (!formData.occupation?.trim()) newErrors.occupation = 'Occupation is required';
    if (!formData.monthlyIncome || formData.monthlyIncome <= 0) newErrors.monthlyIncome = 'Monthly income is required';

    // NIC validation (Sri Lankan format)
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center h-64">
              <Loading />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !customer) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Customer not found</h3>
              <p className="mt-1 text-sm text-gray-500">
                The customer you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push('/customers')}>
                  Back to Customers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/customers/${id}`)}
                  className="flex items-center space-x-2 hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to Customer</span>
                </Button>
              </div>
              
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Edit Customer: {customer.firstName} {customer.lastName}
                </h1>
                <p className="text-gray-600 text-lg">Update customer information</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-medium animate-fade-in rounded-lg border border-gray-200">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <UserIcon className="h-6 w-6 mr-3" />
                    Personal Information
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Update basic customer details</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      error={errors.firstName}
                      required
                      leftIcon={<UserIcon className="h-4 w-4" />}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    <Input
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      error={errors.lastName}
                      required
                      leftIcon={<UserIcon className="h-4 w-4" />}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="NIC Number"
                      value={formData.nic}
                      onChange={(e) => handleInputChange('nic', e.target.value)}
                      error={errors.nic}
                      placeholder="123456789V or 123456789012"
                      required
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    <Input
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={errors.phone}
                      placeholder="+94771234567 or 0771234567"
                      required
                      leftIcon={<PhoneIcon className="h-4 w-4" />}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    placeholder="john@example.com"
                    leftIcon={<EnvelopeIcon className="h-4 w-4" />}
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                </div>
              </Card>

              {/* Address Information */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-medium animate-fade-in rounded-lg border border-gray-200">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <MapPinIcon className="h-6 w-6 mr-3" />
                    Address Information
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Update address details</p>
                </div>
                <div className="p-6 space-y-6">
                  <Input
                    label="Street Address"
                    value={formData.address?.street || ''}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    error={errors['address.street']}
                    required
                    leftIcon={<MapPinIcon className="h-4 w-4" />}
                    className="transition-all duration-200 focus:scale-[1.02]"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="City"
                      value={formData.address?.city || ''}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      error={errors['address.city']}
                      required
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={`
                          w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 focus:scale-[1.02] bg-white
                          ${errors['address.district'] ? 'border-red-300' : 'border-gray-300'}
                        `}
                        value={formData.address?.district || ''}
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
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                          {errors['address.district']}
                        </p>
                      )}
                    </div>
                    
                    <Input
                      label="Postal Code"
                      value={formData.address?.postalCode || ''}
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                      error={errors['address.postalCode']}
                      required
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </Card>

              {/* Emergency Contact */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-medium animate-fade-in rounded-lg border border-gray-200">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <UserGroupIcon className="h-6 w-6 mr-3" />
                    Emergency Contact
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Update emergency contact information</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Contact Name"
                      value={formData.emergencyContact?.name || ''}
                      onChange={(e) => handleInputChange('emergencyContact.name', e.target.value)}
                      error={errors['emergencyContact.name']}
                      required
                      leftIcon={<UserIcon className="h-4 w-4" />}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    <Input
                      label="Contact Phone"
                      value={formData.emergencyContact?.phone || ''}
                      onChange={(e) => handleInputChange('emergencyContact.phone', e.target.value)}
                      error={errors['emergencyContact.phone']}
                      required
                      leftIcon={<PhoneIcon className="h-4 w-4" />}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    <Input
                      label="Relationship"
                      value={formData.emergencyContact?.relationship || ''}
                      onChange={(e) => handleInputChange('emergencyContact.relationship', e.target.value)}
                      error={errors['emergencyContact.relationship']}
                      placeholder="e.g., Spouse, Parent, Sibling"
                      required
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </Card>

              {/* Employment Information */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-medium animate-fade-in rounded-lg border border-gray-200">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg">
                  <h2 className="text-xl font-semibold text-white flex items-center">
                    <BriefcaseIcon className="h-6 w-6 mr-3" />
                    Employment Information
                  </h2>
                  <p className="text-primary-100 text-sm mt-1">Update employment and income details</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      error={errors.occupation}
                      required
                      leftIcon={<BriefcaseIcon className="h-4 w-4" />}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                    <Input
                      label="Monthly Income (LKR)"
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
                      error={errors.monthlyIncome}
                      min="0"
                      step="1000"
                      required
                      leftIcon={<CurrencyDollarIcon className="h-4 w-4" />}
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </Card>

              {/* Assignment (for Admin users) */}
              {user.role === 'admin' && (
                <Card className="bg-white/90 backdrop-blur-sm shadow-medium animate-fade-in rounded-lg border border-gray-200">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-t-lg">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <UserGroupIcon className="h-6 w-6 mr-3" />
                      Assignment
                    </h2>
                    <p className="text-primary-100 text-sm mt-1">Assign customer to an agent</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assign to Agent
                        </label>
                        <select
                          className={`
                            w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 focus:scale-[1.02] bg-white
                            ${errors.agentId ? 'border-red-300' : 'border-gray-300'}
                          `}
                          value={formData.agentId || ''}
                          onChange={(e) => handleInputChange('agentId', e.target.value || undefined)}
                        >
                          <option value="">No agent assigned</option>
                          {agents?.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.profile ? `${agent.profile.firstName} ${agent.profile.lastName}` : agent.name}
                            </option>
                          ))}
                        </select>
                        {errors.agentId && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            {errors.agentId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/customers/${id}`)}
                  className="w-full sm:w-auto px-8 py-3 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
