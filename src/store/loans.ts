import * as loanService from '@/services/loans';
import type { Loan } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LoanState {
  loans: Loan[];
  currentLoan: Loan | null;
  selectedLoan: Loan | null;
  loading: boolean;
  isLoading: boolean;
  searchTerm: string;
  filters: {
    status?: string;
    customerId?: string;
    agentId?: string;
  };
  pagination: {
    currentPage: number;
    hasMore: boolean;
    lastDoc: any;
  };
  setLoans: (loans: Loan[]) => void;
  addLoan: (loan: Loan) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  removeLoan: (id: string) => void;
  setSelectedLoan: (loan: Loan | null) => void;
  setCurrentLoan: (loan: Loan | null) => void;
  setLoading: (loading: boolean) => void;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  fetchLoans: () => Promise<void>;
  fetchLoan: (id: string) => Promise<Loan | null>;
  createLoan: (loanData: any) => Promise<Loan>;
  searchLoans: (query: string) => Promise<void>;
  approveLoan: (id: string) => Promise<void>;
  rejectLoan: (id: string, reason: string) => Promise<void>;
  updateLoanStatus: (id: string, status: string) => Promise<void>;
  resetState: () => void;
}

const initialState = {
  loans: [],
  currentLoan: null,
  selectedLoan: null,
  loading: false,
  isLoading: false,
  searchTerm: '',
  filters: {},
  pagination: {
    currentPage: 1,
    hasMore: false,
    lastDoc: null,
  },
};

export const useLoansStore = create<LoanState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      setLoans: (loans) => set({ loans }),
      addLoan: (loan) =>
        set((state) => ({
          loans: [loan, ...state.loans],
        })),
      updateLoan: (id, updates) =>
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id ? { ...loan, ...updates } : loan
          ),
          selectedLoan:
            state.selectedLoan?.id === id
              ? { ...state.selectedLoan, ...updates }
              : state.selectedLoan,
        })),
      removeLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter((loan) => loan.id !== id),
          selectedLoan:
            state.selectedLoan?.id === id ? null : state.selectedLoan,
        })),
      setSelectedLoan: (loan) => set({ selectedLoan: loan }),
      setCurrentLoan: (loan) => set({ currentLoan: loan }),
      setLoading: (loading) => set({ isLoading: loading, loading }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilters: (filters) => set({ filters }),
      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),
      fetchLoans: async () => {
        try {
          set({ isLoading: true, loading: true });
          const loans = await loanService.getAllLoans();
          set({ loans, isLoading: false, loading: false });
        } catch (error) {
          console.error('Failed to fetch loans:', error);
          set({ isLoading: false, loading: false });
        }
      },
      fetchLoan: async (id: string) => {
        try {
          const loan = await loanService.getLoan(id);
          if (loan) {
            set({ currentLoan: loan });
          }
          return loan;
        } catch (error) {
          console.error('Failed to fetch loan:', error);
          return null;
        }
      },
      createLoan: async (loanData: any): Promise<Loan> => {
        try {
          const loanId = await loanService.createLoan(loanData);
          const loan = await loanService.getLoan(loanId);
          if (loan) {
            set((state) => ({
              loans: [loan, ...state.loans],
            }));
            return loan;
          }
          throw new Error('Failed to retrieve created loan');
        } catch (error) {
          console.error('Failed to create loan:', error);
          throw error;
        }
      },
      searchLoans: async (query: string) => {
        try {
          set({ isLoading: true, loading: true });
          const loans = await loanService.searchLoans(query);
          set({ loans, isLoading: false, loading: false });
        } catch (error) {
          console.error('Failed to search loans:', error);
          set({ isLoading: false, loading: false });
        }
      },
      approveLoan: async (id: string) => {
        try {
          await loanService.updateLoanStatus(id, 'approved');
          set((state) => ({
            loans: state.loans.map((loan) =>
              loan.id === id ? { ...loan, status: 'approved' } : loan
            ),
            currentLoan:
              state.currentLoan?.id === id
                ? { ...state.currentLoan, status: 'approved' }
                : state.currentLoan,
          }));
        } catch (error) {
          console.error('Failed to approve loan:', error);
          throw error;
        }
      },
      rejectLoan: async (id: string, reason: string) => {
        try {
          await loanService.updateLoanStatus(id, 'rejected');
          set((state) => ({
            loans: state.loans.map((loan) =>
              loan.id === id ? { ...loan, status: 'rejected' } : loan
            ),
            currentLoan:
              state.currentLoan?.id === id
                ? { ...state.currentLoan, status: 'rejected' }
                : state.currentLoan,
          }));
        } catch (error) {
          console.error('Failed to reject loan:', error);
          throw error;
        }
      },
      updateLoanStatus: async (id: string, status: string) => {
        try {
          await loanService.updateLoanStatus(id, status as any);
          set((state) => ({
            loans: state.loans.map((loan) =>
              loan.id === id ? { ...loan, status: status as any } : loan
            ),
            currentLoan:
              state.currentLoan?.id === id
                ? { ...state.currentLoan, status: status as any }
                : state.currentLoan,
          }));
        } catch (error) {
          console.error('Failed to update loan status:', error);
          throw error;
        }
      },
      resetState: () => set(initialState),
    }),
    {
      name: 'loan-store',
    }
  )
);
