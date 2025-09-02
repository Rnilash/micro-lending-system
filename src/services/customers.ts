import { db } from '@/lib/firebase';
import type { Customer, CustomerStatus } from '@/types';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

const COLLECTION_NAME = 'customers';

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  nic: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  occupation: string;
  monthlyIncome: number;
  agentId: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  status?: CustomerStatus;
}

export interface CustomerFilters {
  agentId?: string;
  status?: CustomerStatus;
  district?: string;
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  lastDoc?: any;
}

// Create a new customer
export async function createCustomer(data: CreateCustomerData): Promise<string> {
  try {
    // Check if NIC already exists
    const existingCustomer = await getCustomerByNIC(data.nic);
    if (existingCustomer) {
      throw new Error('Customer with this NIC already exists');
    }

    const customerData: Omit<Customer, 'id'> = {
      // Flattened properties for compatibility
      firstName: data.firstName,
      lastName: data.lastName,
      nic: data.nic,
      nationalId: data.nic, // Alias for nic
      phone: data.phone,
      email: data.email,
      address: {
        ...data.address,
        line1: data.address.street,
        street: data.address.street,
        province: 'Western', // Default province
      },
      occupation: data.occupation || '',
      monthlyIncome: data.monthlyIncome || 0,
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      
      // Create nested structure from flat data
      personalInfo: {
        firstName: data.firstName,
        lastName: data.lastName,
        nic: data.nic,
        dateOfBirth: new Date(),
        gender: 'male',
        maritalStatus: 'single',
        occupation: data.occupation || '',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
        },
      },
      contactInfo: {
        phone: data.phone,
        email: data.email,
        address: {
          ...data.address,
          line1: data.address.street,
          street: data.address.street,
          province: 'Western',
        },
      },
      kycInfo: {
        identityVerified: false,
        addressVerified: false,
        incomeVerified: false,
      },
      financialInfo: {
        monthlyIncome: data.monthlyIncome || 0,
        monthlyExpenses: 0,
        existingLoans: [],
      },
      documents: [],
      
      // System fields
      status: 'active' as CustomerStatus,
      kycStatus: 'pending',
      assignedAgent: data.agentId,
      riskRating: 'medium',
      notes: [],
      registrationDate: Timestamp.now() as any,
      totalLoans: 0,
      activeLoans: 0,
      totalPaid: 0,
      outstandingAmount: 0,
      lastPaymentDate: null as any,
      creditScore: 0,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
      createdBy: data.agentId,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), customerData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
}

// Get customer by NIC
export async function getCustomerByNIC(nic: string): Promise<Customer | null> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where('nic', '==', nic));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Customer;
    }
    return null;
  } catch (error) {
    console.error('Error getting customer by NIC:', error);
    throw error;
  }
}

// Get customers with filters and pagination
export async function getCustomers(
  filters: CustomerFilters = {},
  pagination: PaginationOptions = {}
): Promise<{ customers: Customer[]; hasMore: boolean; lastDoc: any }> {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    // Apply filters
    if (filters.agentId) {
      q = query(q, where('agentId', '==', filters.agentId));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.district) {
      q = query(q, where('address.district', '==', filters.district));
    }

    // Order by creation date
    q = query(q, orderBy('createdAt', 'desc'));

    // Apply pagination
    const pageLimit = pagination.limit || 20;
    q = query(q, limit(pageLimit + 1)); // Get one extra to check if there are more

    if (pagination.lastDoc) {
      q = query(q, startAfter(pagination.lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    
    const hasMore = docs.length > pageLimit;
    const customers = docs.slice(0, pageLimit).map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Customer[];

    // Filter by search term on the client side (for name/phone search)
    let filteredCustomers = customers;
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredCustomers = customers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        customer.nic.includes(searchTerm)
      );
    }

    return {
      customers: filteredCustomers,
      hasMore,
      lastDoc: hasMore ? docs[pageLimit - 1] : null
    };
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
}

// Update customer
export async function updateCustomer(
  id: string, 
  data: UpdateCustomerData
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}

// Delete customer (soft delete by setting status to inactive)
export async function deleteCustomer(id: string): Promise<void> {
  try {
    await updateCustomer(id, { status: 'inactive' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}

// Get customers by agent
export async function getCustomersByAgent(agentId: string): Promise<Customer[]> {
  try {
    const { customers } = await getCustomers({ agentId });
    return customers;
  } catch (error) {
    console.error('Error getting customers by agent:', error);
    throw error;
  }
}

// Update customer financial stats (called when loans/payments are updated)
export async function updateCustomerStats(
  customerId: string,
  stats: {
    totalLoans?: number;
    activeLoans?: number;
    totalPaid?: number;
    outstandingAmount?: number;
    lastPaymentDate?: Timestamp | null;
    creditScore?: number;
  }
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, customerId);
    await updateDoc(docRef, {
      ...stats,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating customer stats:', error);
    throw error;
  }
}

// Search customers by query
export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  try {
    const result = await getCustomers();
    const searchLower = searchTerm.toLowerCase();
    
    return result.customers.filter((customer: Customer) => 
      customer.firstName?.toLowerCase().includes(searchLower) ||
      customer.lastName?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchLower) ||
      customer.nic?.includes(searchLower)
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
}
