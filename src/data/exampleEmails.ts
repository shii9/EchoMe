export interface ExampleEmail {
  id: string;
  title: string;
  category: 'safe' | 'suspicious' | 'phishing';
  technique?: string;
  content: string;
  description: string;
}

export const exampleEmails: ExampleEmail[] = [
  // ============================================
  // SAFE EMAILS (Score < 30)
  // ============================================
  {
    id: 'safe-1',
    title: 'Safe - Meeting Reminder',
    category: 'safe',
    content: `Hello Sarah,

This is a reminder about our team meeting scheduled for tomorrow at 2:00 PM.

Meeting Details:
- Date: March 15, 2025
- Time: 2:00 PM - 3:00 PM
- Location: Conference Room B
- Agenda: Q1 Review and Planning

Please let me know if you have any questions.

Best regards,
Michael Chen
Project Manager`,
    description: 'Professional meeting reminder with clear details and no suspicious elements.'
  },
  {
    id: 'safe-2',
    title: 'Safe - Order Confirmation',
    category: 'safe',
    content: `Dear John Smith,

Thank you for your order from TechStore Bangladesh.

Order #BD-2025-1234
- Product: Wireless Mouse
- Price: ৳1,200
- Delivery: 3-5 business days

Track your order: https://techstore.com.bd/track/BD-2025-1234

For questions, email support@techstore.com.bd

Best regards,
TechStore Team`,
    description: 'Legitimate e-commerce order confirmation with proper HTTPS link and business details.'
  },
  {
    id: 'safe-3',
    title: 'Safe - Newsletter',
    category: 'safe',
    content: `Hello Subscriber,

Welcome to our weekly tech newsletter!

This week's highlights:
- New smartphone launches
- Software updates guide
- Tech industry news

Read full newsletter: https://newsletter.example.com

To stop receiving these emails, visit https://example.com/preferences

Regards,
Tech News Team`,
    description: 'Standard newsletter with proper unsubscribe link and HTTPS URLs only.'
  },

  // ============================================
  // SUSPICIOUS EMAILS (Score 30-69)
  // ============================================
  {
    id: 'suspicious-1',
    title: 'Suspicious - Account Update',
    category: 'suspicious',
    content: `Dear Customer,

Please update your account information.

Click to verify: https://update-account.tk

Thank you.

Support Team`,
    description: 'Generic greeting with suspicious .tk domain, lacks details but not overtly threatening.'
  },
  {
    id: 'suspicious-2',
    title: 'Suspicious - Prize Notification',
    category: 'suspicious',
    content: `Congratulations!

You won a special prize in our draw.

Claim here: https://winner-claim.club

Limited time offer!

Customer Service`,
    description: 'Prize claim with suspicious .club domain and urgency, but minimal personal data requests.'
  },
  {
    id: 'suspicious-3',
    title: 'Suspicious - Service Alert',
    category: 'suspicious',
    content: `Dear User,

Your service requires verification.

Please visit: https://service-verify.xyz

Complete within 48 hours.

Service Team`,
    description: 'Vague service alert with .xyz domain and mild urgency.'
  },
  {
    id: 'suspicious-4',
    title: 'Suspicious - Delivery Notice',
    category: 'suspicious',
    content: `Package Notification

Your delivery is pending.

Update address: https://delivery-update.online

Click here to proceed.

Shipping Department`,
    description: 'Generic delivery notice with suspicious .online domain and call-to-action.'
  },

  // ============================================
  // PHISHING EMAILS (Score >= 70)
  // ============================================
  {
    id: 'phishing-1',
    title: 'Phishing - Bkash Account Suspended',
    category: 'phishing',
    content: `URGENT SECURITY ALERT

Dear Customer,

Your Bkash account has been SUSPENDED due to suspicious activity detected!

IMMEDIATE ACTION REQUIRED: Click here NOW: http://192.168.1.50/bkash-verify

You MUST verify your identity within 6 hours by providing:
- Your password
- NID number  
- Mobile PIN
- Bank account details

Failure to act will result in PERMANENT account closure!

Click here immediately: https://bkash-urgent.tk/restore

Bkash Security Team`,
    description: 'Multi-layered phishing with IP URL, urgent threats, sensitive data requests, and suspicious .tk domain.'
  },
  {
    id: 'phishing-2',
    title: 'Phishing - Lottery Scam',
    category: 'phishing',
    content: `CONGRATULATIONS! YOU WON $5,000,000!!!

Dear Winner,

You have been selected to receive FIVE MILLION DOLLARS in our international lottery!

URGENT: Claim your prize NOW: http://192.168.0.100/claim-prize

To process payment, provide immediately:
- Full name and address
- Bank account number
- Social security number
- Credit card details for verification

This offer expires in 12 hours! ACT NOW!

Click here: https://lottery-winner.ml/urgent

International Lottery Commission`,
    description: 'Classic lottery scam with IP URL, ALL CAPS urgency, massive prize claim, and sensitive data theft.'
  },
  {
    id: 'phishing-3',
    title: 'Phishing - PayPal Security',
    category: 'phishing',
    content: `SECURITY ALERT - URGENT ACTION REQUIRED

Dear PayPal User,

Your account will be SUSPENDED in 24 hours unless you verify immediately!

CLICK HERE NOW: http://192.168.2.75/paypal-security

We detected unauthorized access. You must confirm:
- Password
- Credit card number
- CVV and expiration date
- Social security number

WARNING: Failure to verify will result in permanent account closure!

Verify now: https://paypal-verify.ga/urgent

PayPal Security Team`,
    description: 'PayPal phishing with IP URL, threatening language, multiple sensitive requests, and .ga domain.'
  },
  {
    id: 'phishing-4',
    title: 'Phishing - Sonali Bank KYC',
    category: 'phishing',
    content: `URGENT: Account Blocked - Immediate Action Required!

Dear Sonali Bank Customer,

Your account has been LOCKED due to incomplete KYC verification!

CRITICAL: Update NOW: http://192.168.5.88/sonali-verify

Required immediately:
- NID card number
- TIN certificate  
- ATM PIN
- Credit card CVV
- Bank account password

You have only 6 hours! Account will be permanently closed!

Click immediately: https://sonali-kyc.tk/urgent

Sonali Bank Security Division`,
    description: 'Banking phishing targeting Bangladesh with IP URL, government ID theft, and urgent threats.'
  },
  {
    id: 'phishing-5',
    title: 'Phishing - Microsoft Account Alert',
    category: 'phishing',
    content: `CRITICAL SECURITY ALERT!!!

Your Microsoft account has been compromised!

URGENT: Verify immediately: http://192.168.3.99/microsoft-secure

We detected suspicious login attempts. Confirm NOW:
- Account password
- Payment information  
- Security questions
- Credit card details

Your account will be DELETED in 12 hours if you don't act!

Download security update: https://ms-update.xyz/critical

Microsoft Security Team`,
    description: 'Microsoft impersonation with IP URL, deletion threat, credential theft, and suspicious .xyz domain.'
  },
  {
    id: 'phishing-6',
    title: 'Phishing - Grameenphone KYC',
    category: 'phishing',
    content: `URGENT NOTICE - SIM Will Be Blocked!

Dear Grameenphone User,

Your mobile number will be BLOCKED within 24 hours due to incomplete KYC!

IMMEDIATE ACTION: http://192.168.7.44/gp-kyc-update

Submit now:
- NID number
- TIN details
- Bkash PIN  
- Bank account information

Failure to comply will result in permanent disconnection!

Update urgently: https://grameenphone-verify.ml/kyc

Grameenphone Customer Care`,
    description: 'Telecom phishing targeting Bangladesh with SIM blocking threat, IP URL, and government ID requests.'
  },
  {
    id: 'phishing-7',
    title: 'Phishing - Amazon Account Locked',
    category: 'phishing',
    content: `URGENT: Your Amazon Account Has Been Locked!

Dear Customer,

We detected UNUSUAL ACTIVITY and suspended your account immediately!

VERIFY NOW: http://192.168.9.123/amazon-verify

To unlock, confirm:
- Account password
- Social security number
- Credit card number and CVV  
- Billing address

You have 6 hours or lose your account permanently!

Click here urgently: https://amazon-secure.ga/restore

Amazon Security Team`,
    description: 'Amazon phishing with IP URL, account suspension threat, and comprehensive credential theft.'
  },
  {
    id: 'phishing-8',
    title: 'Phishing - Investment Fraud',
    category: 'phishing',
    content: `URGENT: You Won $250,000 in Bitcoin Investment!

Dear Investor,

CONGRATULATIONS! Your crypto investment generated MASSIVE returns!

CLAIM NOW: http://192.168.4.200/bitcoin-claim

To receive funds immediately, provide:
- Bank account number
- Routing number
- Social security number  
- Password for verification

This offer expires in 24 hours! Wire transfer pending!

Download form: https://crypto-invest.tk/urgent

Global Investment Partners`,
    description: 'Investment scam with Bitcoin lure, IP URL, unrealistic returns, and banking credential theft.'
  }
];
