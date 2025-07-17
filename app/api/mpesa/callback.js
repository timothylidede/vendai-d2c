// pages/api/mpesa/callback.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const callbackData = req.body.Body?.stkCallback;

  try {
    await addDoc(collection(db, 'transactions'), {
      checkoutRequestID: callbackData.CheckoutRequestID,
      resultCode: callbackData.ResultCode,
      resultDesc: callbackData.ResultDesc,
      amount: callbackData.CallbackMetadata?.Item.find(item => item.Name === 'Amount')?.Value,
      mpesaReceiptNumber: callbackData.CallbackMetadata?.Item.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
      phoneNumber: callbackData.CallbackMetadata?.Item.find(item => item.Name === 'PhoneNumber')?.Value,
      transactionDate: callbackData.CallbackMetadata?.Item.find(item => item.Name === 'TransactionDate')?.Value,
      createdAt: new Date(),
    });

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
}