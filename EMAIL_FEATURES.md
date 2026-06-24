# 📧 Email Features Documentation

## Overview
This e-commerce platform includes automated email notifications for critical user actions:
- Order Confirmation
- Password Reset
- Password Change Confirmation

All emails are sent using a free SMTP service (Brevo by default, but configurable).

---

## 🚀 Email Features

### 1. **Order Placed Confirmation Email**
**When:** Triggered automatically when an order is successfully placed
**Recipient:** Customer's registered email address
**Contains:**
- Order ID and confirmation
- Itemized product list with quantities and prices
- Total amount
- Payment method and status
- Delivery address confirmation

**Template Preview:**
```
Order Placed Successfully 🎉
Hi [Customer Name],

Your order #XXXXXXXX has been placed.

Order Details:
┌─────────────────────────────────────┐
│ Product        │ Qty │ Price       │
├─────────────────────────────────────┤
│ Product Name   │  2  │ ₹999.00    │
├─────────────────────────────────────┤
│ TOTAL          │     │ ₹1,998.00  │
└─────────────────────────────────────┘

Payment: COD | Status: PENDING
Delivery Address:
John Doe
123 Main Street
Mumbai, 400001
Phone: +91 98765 43210
```

---

### 2. **Forgot Password - Reset Link Email**
**When:** User clicks "Forgot Password" and submits their email
**Recipient:** User's registered email address
**Contains:**
- Password reset link (valid for 15 minutes)
- Security warning about unauthorized changes
- Instructions to ignore if they didn't request this

**Template Preview:**
```
Password Reset
Hi [User Name],

Click the button below to reset your password. 
This link expires in 15 minutes.

┌────────────────────┐
│   Reset Password   │
└────────────────────┘

If you did not request this, you can ignore this email.
```

---

### 3. **Password Changed Confirmation Email**
**When:** 
- User successfully resets password via reset link
- User changes password from account settings

**Recipient:** User's registered email address
**Contains:**
- Confirmation of password change
- Security notice if unauthorized
- Help/support contact information
- Next steps

**Template Preview:**
```
Password Changed ✓
Hi [User Name],

Your password has been successfully changed.

⚠️ Security Notice
If you did not make this change, please secure your 
account immediately by resetting your password again.

What's Next?
• You can now login with your new password
• All your existing sessions remain active
• For security, update your password periodically

Need Help?
If you didn't authorize this password change, 
contact support immediately.
```

---

## ⚙️ Technical Implementation

### Email Service Architecture

```
User Action
    ↓
Controller
    ↓
Email Service (nodemailer)
    ↓
SMTP Server (Brevo/Gmail/etc)
    ↓
Email Delivered
```

### Email Service Functions

#### 1. `sendEmail(options)`
**Purpose:** Core email sending function
**Parameters:**
```javascript
{
  to: "user@example.com",           // Recipient email
  subject: "Email Subject",         // Email subject
  html: "<html>...</html>",         // HTML template
  text: "Plain text version"        // Fallback plain text
}
```

#### 2. `sendPasswordResetEmail(user, resetUrl)`
**Purpose:** Send password reset link
**Parameters:**
```javascript
{
  user: userObject,                 // User document with email, name
  resetUrl: "https://..."          // Full reset link URL
}
```

#### 3. `sendOrderPlacedEmail(userEmail, order)`
**Purpose:** Send order confirmation
**Parameters:**
```javascript
{
  userEmail: "user@example.com",    // Customer email
  order: orderObject                // Order document with items, address, etc
}
```

#### 4. `sendPasswordChangeEmail(user)`
**Purpose:** Send password change confirmation
**Parameters:**
```javascript
{
  user: userObject                  // User document with email, name
}
```

---

## 🔧 API Endpoints

### Forgot Password
**Endpoint:** `POST /forgot-password`
**Body:**
```json
{
  "email": "user@example.com"
}
```
**Response (Dev Mode):**
```json
{
  "success": true,
  "message": "If this email exists, a reset link has been sent",
  "resetLink": "http://localhost:5173/reset-password/abc123..."
}
```
**Response (Production):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### Reset Password
**Endpoint:** `POST /reset-password/:token`
**Body:**
```json
{
  "password": "newPassword123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Change Password
**Endpoint:** `PUT /change-password`
**Headers:** `Authorization: Bearer [token]`
**Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🔐 Security Features

### Password Reset Security
- **Token Hashing:** Reset tokens are hashed using SHA-256
- **Expiration:** Reset links expire in 15 minutes
- **One-Time Use:** Token is invalidated after successful reset
- **Random Generation:** Tokens are generated using crypto.randomBytes()

### Email Verification
- **No Email Leak:** Forgot password API doesn't reveal if email exists
- **Plain Text Fallback:** All emails have plain text alternatives
- **HTML Sanitization:** User inputs are escaped in email templates

---

## 📱 Frontend Integration

### Forgot Password Flow
```
User clicks "Forgot Password"
    ↓
Enter email address
    ↓
Call API: POST /forgot-password
    ↓
Success message: "Check your email"
    ↓
User clicks link in email
    ↓
Reset password page opens with token
    ↓
User enters new password
    ↓
Call API: POST /reset-password/:token
    ↓
Redirect to login with success message
```

### Change Password Flow
```
User goes to Account Settings
    ↓
Enters current password + new password
    ↓
Call API: PUT /change-password
    ↓
Success message + confirmation email
    ↓
Redirect to profile
```

---

## 🐛 Troubleshooting

### Emails Not Sending?

**1. Check SMTP Configuration**
```javascript
// In console
import { canSendEmail } from './services/email.service.js'
console.log(canSendEmail()) // Should return true if configured
```

**2. Verify .env Variables**
```bash
# Make sure these are set in .env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM=your_email@example.com
```

**3. Check Email Service Limits**
- **Brevo:** 300 emails/day (free)
- **Gmail:** Unlimited (with app password)
- **Mailtrap:** 500 emails/month (free)
- **Elastic Email:** 100 emails/day (free)

### Development Testing

**Test Without SMTP (Development Only)**
```javascript
// Remove SMTP credentials from .env
// Reset links will be returned in API response

// Example response:
{
  "success": true,
  "resetLink": "http://localhost:5173/reset-password/raw_token_here"
}

// Use this link for testing
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "SMTP is not configured" | Missing SMTP env vars | Add valid SMTP credentials to .env |
| "Invalid credentials" | Wrong SMTP password | Verify password in email service |
| "ECONNREFUSED" | SMTP host unreachable | Check SMTP_HOST and SMTP_PORT |
| "Error: connect ETIMEDOUT" | Network/firewall issue | Check internet connection |

---

## 📊 Email Templates

All email templates use:
- **Font:** Arial, sans-serif
- **Primary Color:** #4f46e5 (Indigo)
- **Success Color:** #16a34a (Green)
- **Warning Color:** #ea580c (Orange)
- **Max Width:** 600px (mobile responsive)

### Customization

To customize email templates, edit the HTML in:
- `src/services/email.service.js`

Example customization:
```javascript
export async function sendOrderPlacedEmail(userEmail, order) {
    // Modify the html template here
    return sendEmail({
        to: userEmail,
        subject: `Order placed successfully - #${String(order._id).slice(-8).toUpperCase()}`,
        text: `Your order has been placed successfully.`,
        html: `
            <!-- Your custom HTML here -->
        `,
    });
}
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] SMTP credentials configured in production .env
- [ ] `NODE_ENV=production` in .env
- [ ] `CLIENT_URL` points to production domain
- [ ] Email sender domain is verified in SMTP service
- [ ] Test order placement to verify emails send
- [ ] Test password reset flow end-to-end
- [ ] Monitor email delivery logs
- [ ] Set up email bounce handling (optional)

---

## 📚 Free SMTP Provider Recommendations

### For Beginners
**Brevo (formerly Sendinblue)**
- 300 free emails/day
- User-friendly dashboard
- Good documentation
- No credit card required initially

### For Gmail Users
**Gmail App Password**
- Unlimited emails
- Easy setup with 2FA
- No additional signup needed
- Best for personal projects

### For Testing
**Mailtrap**
- Catches all emails in development
- 500 free emails/month
- Perfect for testing
- Email preview in dashboard

---

## 📞 Support & Resources

- **Nodemailer Docs:** https://nodemailer.com/
- **Brevo Docs:** https://www.brevo.com/developers/
- **Gmail SMTP Guide:** https://support.google.com/accounts/answer/185833
- **Mailtrap Docs:** https://mailtrap.io/integrations/

---

**Last Updated:** June 2024
**Version:** 1.0.0
