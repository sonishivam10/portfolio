# EmailJS Setup Guide

This guide will help you set up EmailJS to make the contact form functional and send emails to sonishivama@gmail.com.

## Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Add Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose "Gmail" (or your preferred email provider)
4. Connect your email account (sonishivama@gmail.com)
5. Note down the **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Use this template:

**Template Name:** Portfolio Contact Form

**Subject:** New message from {{from_name}} - {{subject}}

**Content:**
```
Hello Shivam,

You have received a new message from your portfolio website:

Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
This message was sent from your portfolio contact form.
```

4. Save the template and note down the **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to "Account" → "API Keys"
2. Copy your **Public Key** (e.g., `user_public_key_123`)

## Step 5: Update the Code

Replace the placeholder values in `script.js`:

```javascript
// Line 4: Replace with your actual EmailJS public key
emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");

// Line 47: Replace with your actual service ID
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)

// Line 47: Replace with your actual template ID
emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
```

**Example:**
```javascript
emailjs.init("user_abc123def456");
emailjs.send('service_xyz789', 'template_contact123', templateParams)
```

## Step 6: Test the Form

1. Open your portfolio website
2. Fill out the contact form
3. Submit the form
4. Check your email (sonishivama@gmail.com) for the message

## Troubleshooting

### Common Issues:

1. **"EmailJS is not defined"**
   - Make sure the EmailJS CDN is loaded before your script.js
   - Check the network tab for any loading errors

2. **"Service not found"**
   - Verify your Service ID is correct
   - Make sure your email service is properly connected

3. **"Template not found"**
   - Verify your Template ID is correct
   - Check that the template variables match your code

4. **Emails not received**
   - Check your spam folder
   - Verify your email service is active
   - Check EmailJS dashboard for any errors

### Alternative Setup (Using Gmail SMTP):

If you prefer to use Gmail SMTP directly:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use these settings in EmailJS:
   - SMTP Host: smtp.gmail.com
   - Port: 587
   - Username: sonishivama@gmail.com
   - Password: [Your App Password]

## Security Notes

- Never expose your private keys in client-side code
- The public key is safe to use in frontend code
- Consider rate limiting to prevent spam
- Monitor your EmailJS usage (free tier has limits)

## Free Tier Limits

- EmailJS free tier: 200 emails/month
- Consider upgrading for higher limits
- Monitor usage in your dashboard

## Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Community: [https://community.emailjs.com/](https://community.emailjs.com/)

---

**Note:** This setup allows the contact form to send emails directly to sonishivama@gmail.com without requiring a backend server. The emails will appear to come from the visitor's email address, and you can reply directly to them. 