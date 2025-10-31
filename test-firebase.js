import { db } from './config/firebaseConfig.ts';
import { collection, addDoc, getDocs } from 'firebase/firestore';

async function testFirestore() {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to read users collection
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log('✅ Connected to Firestore!');
    console.log(`📊 Found ${snapshot.size} users in database`);
    
    snapshot.forEach(doc => {
      console.log(`User: ${doc.id}`, doc.data());
    });
    
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
  }
}

testFirestore();