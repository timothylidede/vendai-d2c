export class MpesaService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.MPESA_ENVIRONMENT === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
    console.log('MpesaService initialized with baseUrl:', this.baseUrl);
  }

  async getAccessToken(): Promise<string> {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret) {
      console.error('Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET');
      throw new Error('Missing M-Pesa credentials');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      const data = await response.json();
      console.log('Access token response:', { status: response.status, data });

      if (!response.ok || !data.access_token) {
        console.error('Failed to get access token:', { status: response.status, data });
        throw new Error(`Failed to obtain access token: ${data.error || 'Unknown error'}`);
      }

      return data.access_token;
    } catch (error) {
      if (error instanceof Error) {
        console.error('getAccessToken error:', error.message, { stack: error.stack });
      } else {
        console.error('getAccessToken error:', error);
      }
      throw error;
    }
  }

  generateTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  }

  generatePassword(shortcode: string, passkey: string, timestamp: string): string {
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  }

  async initiateStkPush(phoneNumber: string, amount: number, accountReference: string, transactionDesc: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      console.log('Access token obtained:', accessToken);

      const timestamp = this.generateTimestamp();
      const shortcode = process.env.MPESA_SHORTCODE || '174379';
      const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
      const password = this.generatePassword(shortcode, passkey, timestamp);

      if (!phoneNumber.startsWith('254') || phoneNumber.length !== 12) {
        console.error('Invalid phone number format:', phoneNumber);
        throw new Error('Phone number must be in 2547XXXXXXXXX format');
      }

      if (!Number.isInteger(amount) || amount <= 0) {
        console.error('Invalid amount:', amount);
        throw new Error('Amount must be a positive integer');
      }

      const requestBody = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount.toString(),
        PartyA: phoneNumber,
        PartyB: shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://www.vendai.digital/api/mpesa/callback',
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      console.log('STK Push request:', requestBody);

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('STK Push response:', { status: response.status, data });

      if (!response.ok) {
        console.error('STK Push failed:', { status: response.status, data });
        throw new Error(`STK Push failed: ${data.errorMessage || data.error || 'Unknown error'}`);
      }

      if (data.ResponseCode !== '0') {
        console.error('STK Push unsuccessful:', { responseCode: data.ResponseCode, customerMessage: data.CustomerMessage });
        throw new Error(`STK Push unsuccessful: ${data.CustomerMessage || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('initiateStkPush error:', error.message, { stack: error.stack });
      } else {
        console.error('initiateStkPush error:', error);
      }
      throw error;
    }
  }
}

export const mpesaService = new MpesaService();