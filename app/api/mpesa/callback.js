// app/api/mpesa/callback/route.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

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

export async function POST(req) {
  try {
    const body = await req.json();
    const callbackData = body.Body?.stkCallback;

    if (!callbackData) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    await addDoc(collection(db, 'transactions'), {
      checkoutRequestID: callbackData.CheckoutRequestID,
      resultCode: callbackData.ResultCode,
      resultDesc: callbackData.ResultDesc,
      amount: callbackData.CallbackMetadata?.Item.find(item => item.Name === 'Amount')?.Value,
      mpesaReceiptNumber: callbackData.CallbackMetadata?.Item.find(item => item.Name === 'MpesaReceiptNumber')?.Value,
      phoneNumber: callbackData.CallbackMetadata?.Item.find(item => item.Name === 'PhoneNumber')?.Value,
      transactionDate: new Date(),
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error processing callback:', error);
    return NextResponse.json({ error: 'Failed to process callback' }, { status: 500 });
  }
}