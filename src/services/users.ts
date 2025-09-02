import { db } from '@/lib/firebase';
import type { User } from '@/types';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const COLLECTION_NAME = 'users';

// Get all agents (users with role 'agent')
export async function getAgents(): Promise<User[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('role', '==', 'agent'),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const agents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    return agents;
  } catch (error) {
    console.error('Error getting agents:', error);
    throw error;
  }
}

// Get all users with optional role filter
export async function getUsers(role?: 'admin' | 'agent'): Promise<User[]> {
  try {
    let q = query(collection(db, COLLECTION_NAME));

    if (role) {
      q = query(q, where('role', '==', role));
    }

    q = query(q, orderBy('name', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await getUsers();
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}
