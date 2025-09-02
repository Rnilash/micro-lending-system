import type { Customer } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  searchTerm: string;
  filters: {
    status?: string;
    district?: string;
    agentId?: string;
  };
  pagination: {
    currentPage: number;
    hasMore: boolean;
    lastDoc: any;
  };
  setCustomers: (customers: Customer[]) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setLoading: (loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  fetchCustomers: () => Promise<void>;
  searchCustomers: (query: string) => Promise<void>;
  resetState: () => void;
}

const initialState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  searchTerm: '',
  filters: {},
  pagination: {
    currentPage: 1,
    hasMore: false,
    lastDoc: null,
  },
};

export const useCustomerStore = create<CustomerState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setCustomers: (customers) => set({ customers }),
      addCustomer: (customer) =>
        set((state) => ({
          customers: [customer, ...state.customers],
        })),
      updateCustomer: (id, updates) =>
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id ? { ...customer, ...updates } : customer
          ),
          selectedCustomer:
            state.selectedCustomer?.id === id
              ? { ...state.selectedCustomer, ...updates }
              : state.selectedCustomer,
        })),
      removeCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
          selectedCustomer:
            state.selectedCustomer?.id === id ? null : state.selectedCustomer,
        })),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setLoading: (loading) => set({ isLoading: loading }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilters: (filters) => set({ filters }),
      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),
      fetchCustomers: async () => {
        try {
          set({ isLoading: true });
          // Import and use customer service here
          const { getCustomers } = await import('@/services/customers');
          const result = await getCustomers();
          set({ customers: result.customers, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch customers:', error);
          set({ isLoading: false });
        }
      },
      searchCustomers: async (query: string) => {
        try {
          set({ isLoading: true });
          const { searchCustomers } = await import('@/services/customers');
          const customers = await searchCustomers(query);
          set({ customers, isLoading: false });
        } catch (error) {
          console.error('Failed to search customers:', error);
          set({ isLoading: false });
        }
      },
      resetState: () => set(initialState),
    }),
    {
      name: 'customer-store',
    }
  )
);

// Export with both names for compatibility
export const useCustomersStore = useCustomerStore;
