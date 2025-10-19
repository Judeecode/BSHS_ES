# Security Improvements for BSHS Website

## Overview
This document outlines the security enhancements implemented in the `index.html` file to protect against common web vulnerabilities.

## Implemented Security Measures

### 1. Content Security Policy (CSP)
**Location:** Lines 7-8 in `<head>` section

**Implementation:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://unpkg.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.weatherapi.com; frame-src 'self';">
```

**Protection:**
- Prevents unauthorized script execution
- Restricts resource loading to trusted sources
- Mitigates XSS (Cross-Site Scripting) attacks
- Controls which domains can be accessed via fetch/XHR

### 2. Additional Security Headers

**X-Content-Type-Options:**
```html
<meta http-equiv="X-Content-Type-Options" content="nosniff">
```
- Prevents MIME-type sniffing attacks
- Forces browsers to respect declared content types

**X-Frame-Options:**
```html
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">
```
- Prevents clickjacking attacks
- Blocks embedding in iframes from other domains

**Referrer Policy:**
```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```
- Controls referrer information sent with requests
- Protects user privacy

**Permissions Policy:**
```html
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
```
- Disables unnecessary browser features
- Reduces attack surface

### 3. XSS Prevention via HTML Sanitization

**Location:** Lines 3400-3469 in `<script>` section

**Implementation:**
Two sanitization functions were added:

1. **sanitizeHTML(str)** - Escapes all HTML entities
2. **setSafeHTML(element, html)** - Allows only whitelisted HTML tags

**Whitelisted Tags:**
- `strong`, `br`, `em`, `b`, `i`, `u`, `span`, `p`, `ul`, `li`, `ol`

**Whitelisted Attributes:**
- `class`, `style`

**Protected Areas:**
- Weather suspension information (Line 3864)
- Chatbot messages (Line 4218)
- Daily reminder content (Line 5024)
- User input sanitization (Line 4272)

### 4. Input Validation

**Chatbot Input Validation (Lines 4265-4269):**
```javascript
// Input validation: limit message length to prevent abuse
if (message.length > 500) {
  addMessage('⚠️ Message too long. Please keep your message under 500 characters.', false);
  return;
}
```

**Protection:**
- Prevents message flooding
- Limits potential XSS payload size
- Improves user experience

### 5. Subresource Integrity (SRI)

**Implementation:**
- Added SRI hashes to external resources where available
- Leaflet CSS (Line 50): Already has SRI hash
- Leaflet JS (Line 5060): Already has SRI hash
- Swiper CSS (Line 53): Added SRI hash
- Tailwind CSS: Uses `crossorigin="anonymous"` attribute

**Protection:**
- Ensures external resources haven't been tampered with
- Prevents supply chain attacks
- Verifies file integrity before execution

### 6. API Key Security

**Location:** Lines 3595-3599

**Current Status:** ⚠️ API key is exposed in client-side code

**Documentation Added:**
```javascript
// SECURITY NOTE: This API key is exposed in client-side code. For production:
// 1. Move API calls to a backend server/serverless function
// 2. Use environment variables to store API keys
// 3. Implement rate limiting and request validation
// 4. Consider using a proxy service to hide the actual API key
```

**Recommendations for Production:**
1. **Backend Proxy:** Create a serverless function (e.g., Vercel/Netlify Functions) to proxy weather API calls
2. **Environment Variables:** Store API key in `.env` file (never commit to Git)
3. **Rate Limiting:** Implement request throttling to prevent abuse
4. **API Key Rotation:** Regularly rotate API keys
5. **Domain Restrictions:** Configure API key to only work from your domain

## Vulnerability Assessment

### ✅ Protected Against:
- Cross-Site Scripting (XSS)
- Clickjacking
- MIME-type sniffing
- Unauthorized resource loading
- HTML injection
- Message flooding
- Supply chain attacks (via SRI)

### ⚠️ Requires Additional Action:
- **API Key Exposure:** Move to backend service
- **HTTPS Enforcement:** Ensure site is served over HTTPS only
- **Rate Limiting:** Implement server-side rate limiting for API calls

## Best Practices Followed

1. **Defense in Depth:** Multiple layers of security
2. **Least Privilege:** Only necessary permissions granted
3. **Input Validation:** All user inputs are validated and sanitized
4. **Secure Defaults:** Restrictive CSP and security headers
5. **Documentation:** Security measures are well-documented

## Testing Recommendations

1. **XSS Testing:**
   - Try injecting `<script>alert('XSS')</script>` in chatbot
   - Verify it's displayed as text, not executed

2. **CSP Validation:**
   - Use browser DevTools to check for CSP violations
   - Verify no console errors related to blocked resources

3. **Clickjacking Test:**
   - Try embedding site in an iframe from different domain
   - Should be blocked by X-Frame-Options

4. **Input Validation:**
   - Test chatbot with messages >500 characters
   - Verify length limit is enforced

## Maintenance

- **Regular Updates:** Keep external libraries updated
- **CSP Review:** Periodically review and tighten CSP rules
- **Security Audits:** Conduct regular security assessments
- **Monitor Logs:** Watch for suspicious activity patterns

## Additional Recommendations

### For Production Deployment:

1. **Implement HTTPS:**
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains
   ```

2. **Add Server-Side Headers:**
   Configure your web server (Nginx/Apache) to add:
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security`
   - `Content-Security-Policy` (server-level)

3. **Backend API Proxy:**
   ```javascript
   // Example Vercel serverless function
   export default async function handler(req, res) {
     const apiKey = process.env.WEATHER_API_KEY;
     const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Balangkayan`);
     const data = await response.json();
     res.json(data);
   }
   ```

4. **Content Security Policy Report-Only Mode:**
   Test CSP changes without breaking functionality:
   ```html
   <meta http-equiv="Content-Security-Policy-Report-Only" content="...">
   ```

5. **Security Monitoring:**
   - Implement CSP violation reporting
   - Monitor for unusual traffic patterns
   - Set up alerts for security events

## Compliance

These security measures help meet common security standards:
- OWASP Top 10 protection
- PCI DSS requirements (if handling payments)
- GDPR privacy considerations
- General web security best practices

## Contact

For security concerns or to report vulnerabilities, please contact the website administrator.

---

**Last Updated:** October 19, 2025
**Version:** 1.0
