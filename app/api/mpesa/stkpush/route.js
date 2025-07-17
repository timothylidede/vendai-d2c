// app/api/stkpush/route.js
import { NextResponse } from 'next/server'
import axios from 'axios'
import moment from 'moment'

export async function POST(req) {
  try {
    const { phone, amount } = await req.json()

    if (!phone || !amount) {
      return NextResponse.json({ error: 'Missing phone or amount' }, { status: 400 })
    }

    // Step 1: Get Access Token
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64')

    const tokenRes = await axios.get(
      'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    const accessToken = tokenRes.data.access_token

    // Step 2: Generate STK Push Password
    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const timestamp = moment().format('YYYYMMDDHHmmss')
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64')

    // Step 3: Send STK Push
    const stkRes = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: 'VendAI',
        TransactionDesc: 'Payment for goods',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return NextResponse.json({ success: true, data: stkRes.data }, { status: 200 })
  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message)
    return NextResponse.json(
      { error: error.response?.data || 'Something went wrong' },
      { status: 500 }
    )
  }
}
