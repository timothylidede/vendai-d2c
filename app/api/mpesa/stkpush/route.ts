import { type NextRequest, NextResponse } from 'next/server';
import { mpesaService } from '@/lib/mpesa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('STK Push endpoint received:', body);

    const { phoneNumber, amount, accountReference, transactionDesc } = body;

    if (!phoneNumber || !amount || !accountReference || !transactionDesc) {
      console.error('Missing required fields:', { phoneNumber, amount, accountReference, transactionDesc });
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (!phoneNumber.startsWith('254') || phoneNumber.length !== 12) {
      console.error('Invalid phone number:', phoneNumber);
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    const response = await mpesaService.initiateStkPush(phoneNumber, amount, accountReference, transactionDesc);
    console.log('STK Push service response:', response);

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('STK Push endpoint error:', error.message, { stack: error.stack });
      return NextResponse.json({ success: false, error: error.message || 'Failed to initiate STK push' }, { status: 500 });
    } else {
      console.error('STK Push endpoint error:', error);
      return NextResponse.json({ success: false, error: 'Failed to initiate STK push' }, { status: 500 });
    }
  }
}