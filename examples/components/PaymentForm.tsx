import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { InterestCalculator } from '@/lib/interest-calculator';
import { formatLKR } from '@/lib/lkr-formatter';
import { CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface PaymentFormProps {
  customerId: string;
  loanId: string;
  expectedAmount: number;
  dueDate: Date;
  onPaymentComplete: (payment: PaymentRecord) => void;
  onCancel: () => void;
  className?: string;
}

interface PaymentRecord {
  customerId: string;
  loanId: string;
  amount: number;
  paymentType: 'full' | 'partial' | 'advance';
  collectedAt: Date;
  collectedBy: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes: string;
  receiptNumber: string;
}

/**
 * Payment Form Component
 * 
 * Mobile-optimized payment collection form for field agents with
 * real-time calculations, validation, and receipt generation.
 * 
 * Features:
 * - Touch-friendly interface for tablets
 * - Real-time payment calculations
 * - GPS location capture
 * - Offline capability
 * - Bilingual support
 * - Digital receipt generation
 * - Payment method selection
 * 
 * @example
 * <PaymentForm
 *   customerId="cust_123"
 *   loanId="loan_456"
 *   expectedAmount={5000}
 *   dueDate={new Date()}
 *   onPaymentComplete={handlePayment}
 *   onCancel={handleCancel}
 * />
 */
export function PaymentForm({
  customerId,
  loanId,
  expectedAmount,
  dueDate,
  onPaymentComplete,
  onCancel,
  className = ''
}: PaymentFormProps) {
  const { t, language } = useLanguage();
  const [amount, setAmount] = useState(expectedAmount);
  const [paymentType, setPaymentType] = useState<'full' | 'partial' | 'advance'>('full');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital'>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [calculations, setCalculations] = useState<any>(null);

  useEffect(() => {
    // Get current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position.coords);
        },
        (error) => {
          console.warn('Could not get location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Calculate payment breakdown
    const calc = InterestCalculator.calculatePaymentBreakdown(
      amount,
      expectedAmount,
      dueDate
    );
    setCalculations(calc);
  }, [amount, expectedAmount, dueDate]);

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    
    if (newAmount === expectedAmount) {
      setPaymentType('full');
    } else if (newAmount < expectedAmount) {
      setPaymentType('partial');
    } else {
      setPaymentType('advance');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentRecord: PaymentRecord = {
        customerId,
        loanId,
        amount,
        paymentType,
        collectedAt: new Date(),
        collectedBy: getCurrentAgent().id, // Replace with actual agent ID
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : undefined,
        notes,
        receiptNumber: generateReceiptNumber()
      };

      await processPayment(paymentRecord);
      onPaymentComplete(paymentRecord);
    } catch (error) {
      console.error('Payment processing failed:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAY${timestamp}${random}`;
  };

  const getCurrentAgent = () => ({
    id: 'agent_001', // Replace with actual agent context
    name: 'Sample Agent'
  });

  const processPayment = async (payment: PaymentRecord) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Payment processed:', payment);
  };

  const quickAmountButtons = [
    { label: '25%', value: Math.round(expectedAmount * 0.25) },
    { label: '50%', value: Math.round(expectedAmount * 0.5) },
    { label: '75%', value: Math.round(expectedAmount * 0.75) },
    { label: language === 'sinhala' ? 'සම්පූර්ණ' : 'Full', value: expectedAmount }
  ];

  return (
    <div className={`max-w-2xl mx-auto bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <h2 className="text-xl font-bold font-bilingual">
          {language === 'sinhala' ? 'ගෙවීම් එකතුව' :
           language === 'english' ? 'Payment Collection' :
           'ගෙවීම් එකතුව / Payment Collection'}
        </h2>
        <p className="text-blue-100 mt-1 font-bilingual">
          {language === 'sinhala' ? 'අපේක්ෂිත මුදල:' :
           language === 'english' ? 'Expected Amount:' :
           'අපේක්ෂිත මුදල: / Expected Amount:'} {formatLKR(expectedAmount, { language })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-bilingual">
            {language === 'sinhala' ? 'ගෙවන මුදල' :
             language === 'english' ? 'Payment Amount' :
             'ගෙවන මුදල / Payment Amount'}
            <span className="text-red-500">*</span>
          </label>
          
          <CurrencyInput
            value={amount}
            onChange={handleAmountChange}
            className="w-full text-lg p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            language={language}
          />

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {quickAmountButtons.map((button, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAmountChange(button.value)}
                className={`p-2 text-sm rounded-md font-bilingual transition-colors ${
                  amount === button.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Type Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 font-bilingual">
              {language === 'sinhala' ? 'ගෙවීම් වර්ගය' :
               language === 'english' ? 'Payment Type' :
               'ගෙවීම් වර්ගය / Payment Type'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              paymentType === 'full' ? 'bg-green-100 text-green-800' :
              paymentType === 'partial' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {paymentType === 'full' && (language === 'sinhala' ? 'සම්පූර්ණ ගෙවීම' : 'Full Payment')}
              {paymentType === 'partial' && (language === 'sinhala' ? 'අර්ධ ගෙවීම' : 'Partial Payment')}
              {paymentType === 'advance' && (language === 'sinhala' ? 'අතිරේක ගෙවීම' : 'Advance Payment')}
            </span>
          </div>

          {calculations && (
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="font-bilingual">
                  {language === 'sinhala' ? 'මූලධනය:' :
                   language === 'english' ? 'Principal:' :
                   'මූලධනය: / Principal:'}
                </span>
                <span>{formatLKR(calculations.principal, { language })}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bilingual">
                  {language === 'sinhala' ? 'පොලිය:' :
                   language === 'english' ? 'Interest:' :
                   'පොලිය: / Interest:'}
                </span>
                <span>{formatLKR(calculations.interest, { language })}</span>
              </div>
              {calculations.penalty > 0 && (
                <div className="flex justify-between text-red-600">
                  <span className="font-bilingual">
                    {language === 'sinhala' ? 'දඩය:' :
                     language === 'english' ? 'Penalty:' :
                     'දඩය: / Penalty:'}
                  </span>
                  <span>{formatLKR(calculations.penalty, { language })}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 font-bilingual">
            {language === 'sinhala' ? 'ගෙවීම් ක්‍රමය' :
             language === 'english' ? 'Payment Method' :
             'ගෙවීම් ක්‍රමය / Payment Method'}
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors font-bilingual ${
                paymentMethod === 'cash'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <CurrencyDollarIcon className="h-5 w-5" />
              <span>
                {language === 'sinhala' ? 'මුදල්' :
                 language === 'english' ? 'Cash' :
                 'මුදල් / Cash'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('digital')}
              className={`p-4 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors font-bilingual ${
                paymentMethod === 'digital'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 3a1 1 0 011-1h6a1 1 0 010 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 010 2H7a1 1 0 01-1-1z" />
              </svg>
              <span>
                {language === 'sinhala' ? 'ඩිජිටල්' :
                 language === 'english' ? 'Digital' :
                 'ඩිජිටල් / Digital'}
              </span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-bilingual">
            {language === 'sinhala' ? 'සටහන් (විකල්පය)' :
             language === 'english' ? 'Notes (Optional)' :
             'සටහන් (විකල්පය) / Notes (Optional)'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md font-bilingual"
            placeholder={
              language === 'sinhala' ? 'මෙම ගෙවීම සම්බන්ධ කිසියම් සටහන්...' :
              language === 'english' ? 'Any notes about this payment...' :
              'මෙම ගෙවීම සම්බන්ධ කිසියම් සටහන් / Any notes about this payment...'
            }
          />
        </div>

        {/* Location Status */}
        {location && (
          <div className="flex items-center text-sm text-green-600">
            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="font-bilingual">
              {language === 'sinhala' ? 'ස්ථානය සටහන් කර ඇත' :
               language === 'english' ? 'Location recorded' :
               'ස්ථානය සටහන් කර ඇත / Location recorded'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bilingual"
          >
            {language === 'sinhala' ? 'අවලංගු කරන්න' :
             language === 'english' ? 'Cancel' :
             'අවලංගු කරන්න / Cancel'}
          </button>

          <button
            type="submit"
            disabled={loading || amount <= 0}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bilingual"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {language === 'sinhala' ? 'ගෙවීම් සැකසෙමින්...' :
                 language === 'english' ? 'Processing Payment...' :
                 'ගෙවීම් සැකසෙමින්... / Processing Payment...'}
              </div>
            ) : (
              <>
                {language === 'sinhala' ? 'ගෙවීම එකතු කරන්න' :
                 language === 'english' ? 'Collect Payment' :
                 'ගෙවීම එකතු කරන්න / Collect Payment'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;