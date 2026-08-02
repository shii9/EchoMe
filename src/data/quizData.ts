export interface QuizItem {
    id: string;
    type: 'email' | 'url' | 'ip' | 'domain' | 'file';
    title: string;
    content: string;
    correct: 'safe' | 'suspicious' | 'phishing';
    explanation: string;
}

export const quizData: QuizItem[] = [
    // ═══════════════════════════════════════
    // EMAIL QUESTIONS (5)
    // ═══════════════════════════════════════
    {
        id: 'quiz-email-1',
        type: 'email',
        title: 'Bank Account Verification Email',
        content: `From: security@bkash-urgent.tk
Subject: URGENT — Your Bkash Account Has Been SUSPENDED!

Dear Customer,

Your Bkash account has been SUSPENDED due to suspicious activity detected!

IMMEDIATE ACTION REQUIRED: Click here NOW to restore access:
http://192.168.1.50/bkash-verify

You MUST verify your identity within 6 hours by providing:
- Your password
- NID number
- Mobile PIN
- Bank account details

Failure to act will result in PERMANENT account closure!

Click here immediately: https://bkash-urgent.tk/restore

Bkash Security Team`,
        correct: 'phishing',
        explanation:
            'This email has multiple phishing red flags: an IP-based link (http://192.168.1.50), a suspicious .tk domain, ALL-CAPS urgency language, and requests for highly sensitive data (password, NID, PIN). Legitimate Bkash will never ask for your PIN or password via email.',
    },
    {
        id: 'quiz-email-2',
        type: 'email',
        title: 'Team Meeting Reminder',
        content: `From: michael.chen@company.com
Subject: Reminder — Q1 Review Meeting Tomorrow

Hello Sarah,

This is a reminder about our team meeting scheduled for tomorrow at 2:00 PM.

Meeting Details:
- Date: March 15, 2025
- Time: 2:00 PM – 3:00 PM
- Location: Conference Room B
- Agenda: Q1 Review and Planning

Please bring your quarterly reports. Let me know if you have any questions.

Best regards,
Michael Chen
Project Manager`,
        correct: 'safe',
        explanation:
            'This is a typical internal meeting reminder email: it comes from an internal company domain, uses the recipient\'s name naturally, provides clear meeting details, and makes no requests for personal information or clicks on external links.',
    },
    {
        id: 'quiz-email-3',
        type: 'email',
        title: 'Prize Notification',
        content: `From: winner-notify@claim-prizes.club
Subject: Congratulations — You Won a Special Prize!

Congratulations!

You won a special prize in our promotional draw. Your reference number is #CLB-99281.

Claim your reward here: https://winner-claim.club/prize

This is a limited time offer — you must respond within 48 hours or the prize will be forfeited.

Customer Service
Prize Claims Department`,
        correct: 'suspicious',
        explanation:
            'This email uses a suspicious .club domain, offers an unsolicited prize, and creates urgency with a 48-hour deadline. While it doesn\'t ask for sensitive data outright, the link likely leads to a page that does. The vague "special prize" without specifics is a common social-engineering tactic.',
    },
    {
        id: 'quiz-email-4',
        type: 'email',
        title: 'Order Confirmation from TechStore',
        content: `From: orders@techstore.com.bd
Subject: Your Order #BD-2025-1234 Has Shipped!

Dear John Smith,

Thank you for your order from TechStore Bangladesh.

Order #BD-2025-1234
- Product: Wireless Mouse
- Price: ৳1,200
- Delivery: 3–5 business days

Track your order: https://techstore.com.bd/track/BD-2025-1234

For questions, email support@techstore.com.bd

Best regards,
TechStore Team`,
        correct: 'safe',
        explanation:
            'This is a legitimate order confirmation: it references a specific order number, uses a proper .com.bd domain, includes HTTPS links, and doesn\'t ask for any personal information. The sender and support addresses match the same domain.',
    },
    {
        id: 'quiz-email-5',
        type: 'email',
        title: 'Microsoft Account Security Alert',
        content: `From: security-alert@ms-update.xyz
Subject: CRITICAL SECURITY ALERT — Your Account Has Been Compromised!

CRITICAL SECURITY ALERT!!!

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
        correct: 'phishing',
        explanation:
            'This impersonates Microsoft but uses a suspicious .xyz domain and an internal IP address link. It demands passwords, credit card details, and security answers — Microsoft never requests this via email. The ALL-CAPS threats and 12-hour deletion deadline are classic pressure tactics.',
    },

    // ═══════════════════════════════════════
    // URL QUESTIONS (5)
    // ═══════════════════════════════════════
    {
        id: 'quiz-url-1',
        type: 'url',
        title: 'Banking Login URL',
        content: `You receive an email from your bank asking you to verify your account. The email contains this link:

https://www.chase.com/personal/credit-cards

The email says: "Dear Customer, due to recent security updates, we need you to verify your account information. Click here to login and confirm your details."

You hover over the link and the browser status bar shows the exact same URL: https://www.chase.com/personal/credit-cards`,
        correct: 'safe',
        explanation:
            'This is the official Chase banking website with a proper .com domain and HTTPS encryption. The URL structure is clean and consistent with legitimate banking pages. The hover-over URL matches the displayed text — no redirection tricks.',
    },
    {
        id: 'quiz-url-2',
        type: 'url',
        title: 'Shortened Social Media Link',
        content: `You see this post shared on a Facebook group:

"🚨 AMAZING DEAL! Get your free iPhone 15 Pro! Limited time offer — click the link below to claim yours:

https://bit.ly/3xYzAbC

Don't miss out! Only 100 available. #FreeiPhone #Giveaway"

The post was shared by an account created 2 days ago and has 50 likes. Several comments say "I got mine!" with similar-looking new accounts.`,
        correct: 'suspicious',
        explanation:
            'Shortened URLs (bit.ly) hide the real destination and are commonly used in phishing and scam campaigns. The "free iPhone" bait, brand-new account, fake engagement from new accounts, and artificial urgency are all red flags. Never click shortened links from unknown sources.',
    },
    {
        id: 'quiz-url-3',
        type: 'url',
        title: 'Visual Impersonation URL',
        content: `You receive a notification email that says your Google account has unusual sign-in activity. The email looks professional with Google branding and asks you to "Review Activity" by clicking this link:

https://accounts.google.com.verify-abcdef.online/signin

The email footer includes "© 2025 Google LLC" and a privacy policy link.`,
        correct: 'phishing',
        explanation:
            'Although the URL visually contains "accounts.google.com", the actual domain is verify-abcdef.online — everything before it is just a subdomain. Attackers rely on users reading only the beginning of the URL. The real domain ends with .online, not .com. Always check the root domain.',
    },
    {
        id: 'quiz-url-4',
        type: 'url',
        title: 'IP-Based Link in Email',
        content: `You receive this email from "Microsoft Support" with the subject line "Account Compromised — Immediate Action Required":

"Microsoft Account Alert

Your account has been compromised. Immediate action required.

Login to secure your account:
http://192.168.1.50/bank-login

If you ignore this warning, your account will be permanently locked.

Microsoft Security Team
support@microsoft.com"`,
        correct: 'phishing',
        explanation:
            'Legitimate companies like Microsoft never use raw IP addresses (192.168.x.x) in their links — they use their official domain. The IP 192.168.1.50 is actually a private network address. Additionally, the path says "bank-login" which is inconsistent with a Microsoft account alert.',
    },
    {
        id: 'quiz-url-5',
        type: 'url',
        title: 'GitHub Repository Link',
        content: `A colleague on Slack shares a link to a project repository they've been working on:

"Hey, here's the repo for the new dashboard project we discussed in standup:

https://github.com/sourov/project

I've pushed the latest changes to the develop branch. Can you review the PR when you get a chance?"

You can see the colleague's Slack profile matches their usual avatar and display name.`,
        correct: 'safe',
        explanation:
            'This is a legitimate GitHub URL with a standard repository path structure. The context is appropriate — a known colleague sharing work in a professional setting. GitHub.com is a trusted platform with proper security measures.',
    },

    // ═══════════════════════════════════════
    // IP ADDRESS QUESTIONS (5)
    // ═══════════════════════════════════════
    {
        id: 'quiz-ip-1',
        type: 'ip',
        title: 'Google Public DNS Server',
        content: `Your IT department emails updated network settings:

"Please update your DNS configuration:

Primary DNS: 8.8.8.8
Secondary DNS: 8.8.4.4

These are Google's public DNS servers.

Regards,
IT Infrastructure Team"`,
        correct: 'safe',
        explanation:
            'IP address 8.8.8.8 is Google\'s well-known public DNS server, used by millions worldwide for reliable DNS resolution. This is legitimate infrastructure openly documented by Google. The context — an IT department providing standard network configuration — is appropriate.',
    },
    {
        id: 'quiz-ip-2',
        type: 'ip',
        title: 'Remote Server Connection Request',
        content: `You receive an email from someone claiming to be from your company's IT support:

"Server Maintenance Required — Urgent

Please connect to the remote server to update your system before end of day:

Server IP: 45.77.123.45
Username: admin
Password: temp123

This is urgent — connect immediately using Remote Desktop.

IT Support Team"

You don't recognize the sender's email address, and your company's IT team usually uses a ticketing system for such requests.`,
        correct: 'suspicious',
        explanation:
            'While public IP addresses can be legitimate, this request has several warning signs: credentials shared via email in plain text, urgency without a ticket reference, an unfamiliar sender, and generic "IT Support" branding. Never connect to unknown servers using credentials from unsolicited emails.',
    },
    {
        id: 'quiz-ip-3',
        type: 'ip',
        title: 'Firewall Log Entry',
        content: `While reviewing your company's firewall logs during a routine security audit, you notice repeated connection attempts from this IP address:

Source IP: 203.0.113.45
Destination Port: 4444 (not standard HTTP/HTTPS)
Protocol: TCP
Frequency: 500+ attempts in the last hour
Connection Pattern: Attempting to reach internal servers every 5 seconds

Your security information system flags this IP as associated with known command-and-control (C2) infrastructure.`,
        correct: 'phishing',
        explanation:
            'This IP in the TEST-NET-3 range is flagged as a command-and-control server. Port 4444 is commonly used by remote access trojans (e.g., Metasploit\'s Meterpreter). The high frequency and regular interval of connection attempts indicate automated malware activity, not normal traffic.',
    },
    {
        id: 'quiz-ip-4',
        type: 'ip',
        title: 'Corporate VPN Configuration',
        content: `Your new company's IT team provides VPN setup documentation during onboarding:

"VPN Server: 10.0.0.1
Connection Type: OpenVPN
Authentication: Certificate-based

Install the OpenVPN client from our internal software portal.

— IT Security Team (it-security@techcorp.com)"`,
        correct: 'safe',
        explanation:
            'The IP 10.0.0.1 is a private IP address commonly used in corporate VPN configurations. The context is legitimate: onboarding documentation, certificate-based authentication (more secure than passwords), and instructions to use an internal software portal. Private IPs (10.x.x.x) are standard for internal networks.',
    },
    {
        id: 'quiz-ip-5',
        type: 'ip',
        title: 'Fake Bkash Verification Page',
        content: `You receive a text message on your phone:

"Bkash Alert: Your account has been temporarily locked due to a failed verification attempt. To unlock your account and prevent permanent suspension, visit:

http://203.0.113.10/bkash-verify

Enter your Bkash PIN and NID number to confirm your identity. You have 2 hours before your account is permanently closed.

— Bkash Security"

The link uses an IP address instead of the official bkash.com domain.`,
        correct: 'phishing',
        explanation:
            'Bkash would never use a raw IP address for their verification page — they use bkash.com. Requesting a PIN and NID via a web link is a clear credential-theft attempt. The 2-hour deadline creates panic to bypass critical thinking. Always access Bkash through their official app or website.',
    },

    // ═══════════════════════════════════════
    // DOMAIN QUESTIONS (5)
    // ═══════════════════════════════════════
    {
        id: 'quiz-domain-1',
        type: 'domain',
        title: 'Official Tech Company Website',
        content: `You search Google to download Visual Studio Code. The top result links to:

https://code.visualstudio.com/download

The browser shows a padlock icon with a verified "Microsoft Corporation" certificate.`,
        correct: 'safe',
        explanation:
            'microsoft.com is one of the most trusted domains in the world. The HTTPS connection with a verified Microsoft Corporation certificate, plus SHA-256 checksums for download integrity, indicate a legitimate and secure source. Always download software from official vendor websites.',
    },
    {
        id: 'quiz-domain-2',
        type: 'domain',
        title: 'Free Domain Account Verification',
        content: `You receive an email with the subject "Action Required — Verify Your Account":

"Your account requires immediate verification to prevent suspension. We've detected unusual login patterns from an unrecognized device.

Click here to verify your identity:
https://account-verify.club/secure/login

Complete the verification process within 24 hours to maintain access to your account.

Account Services Team"

The email doesn't mention which specific service or company it's from. The .club domain was registered only 3 days ago according to a WHOIS lookup.`,
        correct: 'suspicious',
        explanation:
            'The .club TLD is a free/cheap domain often used for temporary phishing campaigns. Combined with a recently registered domain, generic "Account Services Team" without naming a specific company, and the urgency tactic, this is highly suspicious. Legitimate companies always clearly identify themselves.',
    },
    {
        id: 'quiz-domain-3',
        type: 'domain',
        title: 'Fake Banking Login Page',
        content: `You receive an SMS that reads:

"Security Alert: Unusual activity detected on your bank account. Someone attempted to transfer $2,500 from your savings. If this wasn't you, secure your account immediately at:

https://secure-bank-login.ml/verify-account

Enter your account credentials to confirm your identity and block the unauthorized transfer.

— Bank Security Department"

You check the domain and find that .ml is a free country-code TLD for Mali, and the domain was registered anonymously yesterday.`,
        correct: 'phishing',
        explanation:
            'Free TLDs like .ml are commonly abused for phishing because they can be registered anonymously at no cost. No legitimate bank uses free domains for security-critical pages. The domain was registered just yesterday — real banking domains are years old. The SMS creates urgency with a fake unauthorized transfer to pressure immediate action.',
    },
    {
        id: 'quiz-domain-4',
        type: 'domain',
        title: 'University Admissions Portal',
        content: `You applied to Harvard University and receive an email from admissions@harvard.edu:

"Harvard University Admission Decision

Dear Applicant,

We are pleased to inform you that you have been accepted to Harvard University for Fall 2025.

Please visit our admissions portal to complete your enrollment:
https://admissions.harvard.edu/enroll

Next steps:
1. Pay enrollment deposit via our secure payment portal
2. Submit required health forms
3. Apply for on-campus housing

Harvard Admissions Office
admissions@harvard.edu"

The .edu domain is reserved exclusively for accredited U.S. educational institutions.`,
        correct: 'safe',
        explanation:
            'The .edu TLD is exclusively reserved for accredited U.S. educational institutions and cannot be freely registered. harvard.edu is the verified, official domain for Harvard University. The sender address matches the official domain, and the email follows a logical context (response to an application you submitted).',
    },
    {
        id: 'quiz-domain-5',
        type: 'domain',
        title: 'Brand Impersonation Domain',
        content: `You receive an email claiming to be from Apple Support:

"Your Apple ID has been locked for security reasons. We detected someone attempting to use your Apple ID from a new location: Lagos, Nigeria.

To regain access, verify your identity at:
https://support-apple-help.com/verify

You'll need to confirm:
- Apple ID and password
- Credit card on file
- Security questions

If you don't verify within 6 hours, your Apple ID will be permanently disabled.

Apple Support Team"

The domain support-apple-help.com is registered through an anonymizing proxy service and is only 5 days old.`,
        correct: 'phishing',
        explanation:
            'This domain impersonates Apple by including "apple" in a hyphenated domain, but Apple\'s official domain is apple.com. A 5-day-old domain registered anonymously is a major red flag. Apple would never ask for your password and credit card details via email, and the 6-hour deletion threat is a classic pressure tactic.',
    },

    // ═══════════════════════════════════════
    // FILE QUESTIONS (5)
    // ═══════════════════════════════════════
    {
        id: 'quiz-file-1',
        type: 'file',
        title: 'Company Annual Report',
        content: `Email from finance@company.com:

"Hi Team,

Please find attached the annual financial report for 2024.

Attachment: annual_report_2024.pdf (2.3 MB)

Please review before Friday's all-hands meeting.

Best regards,
Jennifer Walsh — CFO"`,
        correct: 'safe',
        explanation:
            'This is a standard PDF document from a known internal sender (CFO) with a clear business purpose. PDF is a common and generally safe format for business documents. The sender is identifiable, the file size is reasonable, and the context (upcoming meeting) makes sense.',
    },
    {
        id: 'quiz-file-2',
        type: 'file',
        title: 'System Update Executable',
        content: `You receive an email from it-support@helpdesk-services.com:

"Critical System Update Required — Action Needed Immediately

Your computer is missing important security patches that leave it vulnerable to the latest ransomware threats. Our monitoring system detected that your machine has not been updated in 90 days.

Download and run the attached file to install the update:

Attachment: system_update.exe (1.8 MB)

⚠️ WARNING: This update must be installed within the next hour to prevent your system from being quarantined from the company network.

IT Support Team"

You notice the email came from an external domain (helpdesk-services.com), not your company's IT department.`,
        correct: 'suspicious',
        explanation:
            'Executable (.exe) files from unknown or external sources are inherently risky. The email comes from an external domain, not your company\'s IT. Generic filenames like "system_update" are commonly used to disguise malware. Legitimate IT departments use managed deployment tools, not email attachments, for updates.',
    },
    {
        id: 'quiz-file-3',
        type: 'file',
        title: 'Invoice with Screensaver Extension',
        content: `You receive an email from billing@services-invoicing.com:

"Overdue Invoice — Immediate Payment Required

Dear Customer,

Your account shows an outstanding balance of $1,250 for services rendered. Attached is the detailed invoice for your review. Payment is required within 24 hours to avoid service interruption and additional late fees.

Attachment: invoice_payment_details.scr (856 KB)

Please open the attached file to view the full invoice breakdown and payment instructions.

Accounts Receivable Department"

Note: The file extension is .scr, which is a Windows screensaver file format that can execute code like an .exe file.`,
        correct: 'phishing',
        explanation:
            'The .scr (screensaver) extension is actually an executable format in Windows and can run arbitrary code — it\'s a common malware disguise. Legitimate invoices are sent as PDF or image files, never as .scr. The vague sender domain, generic greeting, and 24-hour payment pressure are additional red flags.',
    },
    {
        id: 'quiz-file-4',
        type: 'file',
        title: 'Team Logo Image from Colleague',
        content: `Slack message from your colleague Sarah (verified profile):

"Hey! 👋 Here's the updated company logo from the design team. Can you use it in the presentation?

📎 company_logo_final.png (245 KB)

I also have SVG if you need vector. Let me know!

— Sarah, Marketing Team"`,
        correct: 'safe',
        explanation:
            'PNG is a standard image format that cannot execute code. The file comes from a verified colleague through an official company communication channel (Slack workspace). The context is logical — marketing sharing a logo for a presentation — and you can physically verify with Sarah.',
    },
    {
        id: 'quiz-file-5',
        type: 'file',
        title: 'Macro-Enabled Document Invoice',
        content: `You receive an email from invoices@supplier-billing.net:

"Updated Invoice — Macros Required

Dear Valued Client,

Please find attached the updated invoice for your recent order. 

IMPORTANT: This document uses advanced formatting. When prompted, please click "Enable Content" or "Enable Macros" to view the full invoice with interactive features.

Attachment: invoice_details.docm (200 KB)

If you have trouble viewing the document, please disable your antivirus temporarily and try again.

Supplier Billing Team"

Note: The .docm extension indicates a Microsoft Word document with embedded macros (executable code).`,
        correct: 'phishing',
        explanation:
            'Macro-enabled documents (.docm) can contain malicious VBA code that executes when macros are enabled. The email explicitly asks you to enable macros AND disable antivirus — these are massive red flags. Legitimate invoices never require macros or antivirus disabling. The external sender domain and generic greeting add to the danger.',
    },
];
