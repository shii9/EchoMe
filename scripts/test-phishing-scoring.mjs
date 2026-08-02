import assert from 'node:assert/strict';
import { scanPhishingInput } from '../src/utils/phishingScoring.js';

const safeUrl = scanPhishingInput('https://www.google.com/', 'url');
assert.equal(safeUrl.score, 0, 'trusted HTTPS URL should not be scored as suspicious');

const userInfoUrl = scanPhishingInput('http://example.com@malicious.com/login', 'url');
assert.ok(userInfoUrl.score >= 70, 'user-info URL trick should be high risk');

const visualImpersonation = scanPhishingInput('https://accounts.google.com.verify-abcdef.online/signin', 'url');
assert.ok(visualImpersonation.score >= 70, 'brand hidden in a subdomain should be high risk');

const safeDocumentation = scanPhishingInput('https://docs.example.com/report.pdf', 'url');
assert.equal(safeDocumentation.score, 0, 'trusted documentation URL should remain safe');

const phishingEmail = scanPhishingInput(
  'URGENT: verify your account now at http://192.168.1.50/login and provide your password and OTP.',
  'email'
);
assert.ok(phishingEmail.score >= 70, 'urgent credential request with an IP link should be high risk');
assert.equal(phishingEmail.brandImpersonation, false, 'no brand should not be invented');

const safeEmail = scanPhishingInput(
  'Hello Sarah, this is a reminder about our team meeting tomorrow. Please reply if you have questions.',
  'email'
);
assert.ok(safeEmail.score < 30, 'ordinary business email should remain low risk');

const suspiciousDomain = scanPhishingInput('secure-bkash.com', 'domain');
assert.equal(suspiciousDomain.brandImpersonation, true, 'lookalike brand domain should be identified');
assert.ok(suspiciousDomain.score >= 28, 'lookalike brand domain should receive a meaningful score');

console.log('phishing scoring regression checks passed');
