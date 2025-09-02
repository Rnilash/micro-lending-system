const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-firebase-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-firebase-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateLoansWithCustomerNames() {
  try {
    console.log('🔄 Starting to update loans with customer names...');
    
    const loansSnapshot = await getDocs(collection(db, 'loans'));
    console.log(`📋 Found ${loansSnapshot.docs.length} loans to check`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const loanDoc of loansSnapshot.docs) {
      try {
        const loan = loanDoc.data();
        
        // Skip if customer name is already populated
        if (loan.customerName && loan.customerName !== '') {
          skippedCount++;
          continue;
        }

        console.log(`📝 Updating loan ${loan.loanNumber} for customer ${loan.customerId}`);

        // Get customer data
        const customerDoc = await getDoc(doc(db, 'customers', loan.customerId));
        
        if (customerDoc.exists()) {
          const customer = customerDoc.data();
          const customerName = `${customer.firstName} ${customer.lastName}`;
          
          // Update loan with customer name
          await updateDoc(doc(db, 'loans', loanDoc.id), {
            customerName: customerName,
            updatedAt: Timestamp.now(),
          });
          
          console.log(`✅ Updated loan ${loan.loanNumber} with customer name: ${customerName}`);
          updatedCount++;
        } else {
          console.log(`❌ Customer ${loan.customerId} not found for loan ${loan.loanNumber}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating loan ${loanDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Updated: ${updatedCount} loans`);
    console.log(`⏭️ Skipped: ${skippedCount} loans (already had customer names)`);
    console.log(`❌ Errors: ${errorCount} loans`);
    console.log('🎉 Update process completed!');
    
  } catch (error) {
    console.error('❌ Error updating loans with customer names:', error);
  }
}

// Run the update
updateLoansWithCustomerNames().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
