import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as paymentService from '@/services/payments';
import type { Payment } from '@/types';

interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  setPayments: (payments: Payment[]) => void;
  setCurrentPayment: (payment: Payment | null) => void;
  setLoading: (loading: boolean) => void;
  fetchPayments: () => Promise<void>;
  fetchPaymentsByLoan: (loanId: string) => Promise<void>;
  fetchPayment: (id: string) => Promise<Payment | null>;
  createPayment: (payment: any) => Promise<Payment>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  searchPayments: (query: string) => Promise<void>;
}

export const usePaymentsStore = create<PaymentState>()(
  devtools(
    (set, get) => ({
      payments: [],
      currentPayment: null,
      loading: false,
      setPayments: (payments) => set({ payments }),
      setCurrentPayment: (payment) => set({ currentPayment: payment }),
      setLoading: (loading) => set({ loading }),
      fetchPayments: async () => {
        try {
          set({ loading: true });
          const payments = await paymentService.getAllPayments();
          set({ payments, loading: false });
        } catch (error) {
          console.error('Error fetching payments:', error);
          set({ loading: false });
        }
      },
      fetchPaymentsByLoan: async (loanId: string) => {
        try {
          set({ loading: true });
          const payments = await paymentService.getPaymentsByLoan(loanId);
          set({ payments, loading: false });
        } catch (error) {
          console.error('Error fetching payments by loan:', error);
          set({ loading: false });
        }
      },
      fetchPayment: async (id: string) => {
        try {
          set({ loading: true });
          const payment = await paymentService.getPaymentById(id);
          set({ currentPayment: payment, loading: false });
          return payment;
        } catch (error) {
          console.error('Error fetching payment:', error);
          set({ loading: false });
          return null;
        }
      },
      createPayment: async (paymentData: any): Promise<Payment> => {
        try {
          set({ loading: true });
          const paymentId = await paymentService.createPayment(paymentData);
          const payment = await paymentService.getPaymentById(paymentId);
          if (payment) {
            const { payments } = get();
            set({ 
              payments: [payment, ...payments],
              currentPayment: payment,
              loading: false 
            });
            return payment;
          }
          throw new Error('Failed to retrieve created payment');
        } catch (error) {
          console.error('Error creating payment:', error);
          set({ loading: false });
          throw error;
        }
      },
      updatePayment: async (id: string, updates: Partial<Payment>) => {
        try {
          set({ loading: true });
          await paymentService.updatePayment(id, updates);
          const { payments } = get();
          const updatedPayments = payments.map(p => 
            p.id === id ? { ...p, ...updates } : p
          );
          set({ payments: updatedPayments, loading: false });
        } catch (error) {
          console.error('Error updating payment:', error);
          set({ loading: false });
          throw error;
        }
      },
      deletePayment: async (id: string) => {
        try {
          set({ loading: true });
          await paymentService.deletePayment(id);
          const { payments } = get();
          const filteredPayments = payments.filter(p => p.id !== id);
          set({ payments: filteredPayments, loading: false });
        } catch (error) {
          console.error('Error deleting payment:', error);
          set({ loading: false });
          throw error;
        }
      },
      searchPayments: async (query: string) => {
        try {
          set({ loading: true });
          const payments = await paymentService.searchPayments(query);
          set({ payments, loading: false });
        } catch (error) {
          console.error('Error searching payments:', error);
          set({ loading: false });
        }
      },
    }),
    {
      name: 'payments-store',
    }
  )
);
