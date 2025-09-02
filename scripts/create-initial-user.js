require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createInitialUsers() {
  try {
    console.log('Creating initial users...');

    // Create Admin User
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';

    const adminCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUser = adminCredential.user;

    await updateProfile(adminUser, {
      displayName: 'System Administrator'
    });

    const adminProfile = {
      uid: adminUser.uid,
      id: adminUser.uid,
      email: adminUser.email,
      name: 'System Administrator',
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+94711234567',
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
            paymentReminders: true,
            systemAlerts: true,
          },
          dateFormat: 'DD/MM/YYYY',
          currency: 'LKR',
        },
        permissions: {
          customers: { create: true, read: true, update: true, delete: true },
          loans: { create: true, read: true, update: true, delete: true, approve: true },
          payments: { create: true, read: true, update: true, delete: true },
          reports: { create: true, read: true, update: true, delete: true },
          users: { create: true, read: true, update: true, delete: true },
          settings: { create: true, read: true, update: true, delete: true },
        },
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', adminUser.uid), {
      ...adminProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');

    // Create Agent User
    const agentEmail = 'agent@example.com';
    const agentPassword = 'agent123';

    const agentCredential = await createUserWithEmailAndPassword(auth, agentEmail, agentPassword);
    const agentUser = agentCredential.user;

    await updateProfile(agentUser, {
      displayName: 'Test Agent'
    });

    const agentProfile = {
      uid: agentUser.uid,
      id: agentUser.uid,
      email: agentUser.email,
      name: 'Test Agent',
      role: 'agent',
      profile: {
        firstName: 'Test',
        lastName: 'Agent',
        phone: '+94711234568',
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false,
            paymentReminders: true,
            systemAlerts: true,
          },
          dateFormat: 'DD/MM/YYYY',
          currency: 'LKR',
        },
        permissions: {
          customers: { create: true, read: true, update: true, delete: false },
          loans: { create: true, read: true, update: true, delete: false, approve: false },
          payments: { create: true, read: true, update: true, delete: false },
          reports: { create: false, read: true, update: false, delete: false },
          users: { create: false, read: false, update: false, delete: false },
          settings: { create: false, read: false, update: false, delete: false },
        },
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', agentUser.uid), {
      ...agentProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Agent user created successfully!');
    console.log('📧 Email: agent@example.com');
    console.log('🔑 Password: agent123');

    console.log('\n🎉 All initial users created successfully!');
    console.log('\nYou can now login with either:');
    console.log('👨‍💼 Admin: admin@example.com / admin123');
    console.log('👤 Agent: agent@example.com / agent123');

  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n💡 Users might already exist. Try logging in with:');
      console.log('👨‍💼 Admin: admin@example.com / admin123');
      console.log('👤 Agent: agent@example.com / agent123');
    }
  }
}

// Run the script
createInitialUsers().then(() => {
  console.log('\n✨ Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
