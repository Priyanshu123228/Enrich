/**
 * Reusable Luxury HTML Email Base Layout
 */
const renderBaseLayout = ({ title, preheader, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #262626;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f7f7f7;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #eaeaea;
    }
    .header {
      background: linear-gradient(135deg, #1c1917 0%, #292524 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 0;
      color: #ffffff;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .brand-subtitle {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      color: #e11d48;
      margin-top: 4px;
      font-weight: 600;
    }
    .body-content {
      padding: 36px 32px;
      line-height: 1.6;
    }
    .heading {
      font-size: 20px;
      font-weight: 700;
      color: #1c1917;
      margin-top: 0;
      margin-bottom: 16px;
      font-family: 'Playfair Display', Georgia, serif;
    }
    .info-card {
      background-color: #fafaf9;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      border: 1px solid #f2f2f0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #e7e5e4;
      font-size: 13px;
    }
    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .info-label {
      color: #78716c;
      font-weight: 500;
    }
    .info-value {
      color: #1c1917;
      font-weight: 700;
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-rose {
      background-color: #ffe4e6;
      color: #be123c;
    }
    .badge-green {
      background-color: #dcfce7;
      color: #15803d;
    }
    .badge-amber {
      background-color: #fef3c7;
      color: #b45309;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 16px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.25);
    }
    .footer {
      background-color: #fafaf9;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #a8a29e;
      border-top: 1px solid #f2f2f0;
    }
    .footer a {
      color: #e11d48;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader || title}
  </div>
  <table class="wrapper" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <h1 class="brand-title">Luxe<span style="color: #e11d48;">Parlour</span></h1>
            <div class="brand-subtitle">Haute Coiffure & Luxury Spa</div>
          </div>
          <div class="body-content">
            ${content}
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;"><strong>Enrich Salon</strong></p>
            <p style="margin: 0 0 6px 0;">450 Fashion Avenue, Suite 1800, New York, NY 10018</p>
            <p style="margin: 0;">Need assistance? Contact our concierge at <a href="mailto:concierge@luxeparlour.com">concierge@luxeparlour.com</a></p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * 1. Account Creation / Welcome Email Template
 */
export const getWelcomeEmailHtml = ({ name, email }) => {
  const content = `
    <h2 class="heading">Welcome to the Luxe Sanctuary, ${name.split(' ')[0]}</h2>
    <p>We are delighted to welcome you to <strong>LuxeParlour</strong>. Your account has been registered successfully.</p>
    <p>As a valued client, you now have exclusive access to:</p>
    <ul style="color: #57534e; padding-left: 20px; margin: 16px 0;">
      <li style="margin-bottom: 8px;"><strong>Seamless 24/7 Appointments:</strong> Select master stylists and reserve sessions instantly.</li>
      <li style="margin-bottom: 8px;"><strong>Client Portal:</strong> View upcoming visit details, invoices, and style history.</li>
      <li style="margin-bottom: 8px;"><strong>Exclusive Specials:</strong> Enjoy tailored beauty packages and seasonal promos.</li>
    </ul>

    <div class="info-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Registered Email:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-size: 13px;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Membership Tier:</td>
          <td style="padding: 6px 0; text-align: right;"><span class="badge badge-rose">VIP Client</span></td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="https://enrich-mu.vercel.app/book" class="btn">Book Your First Treatment</a>
    </div>
  `;

  return renderBaseLayout({
    title: 'Welcome to LuxeParlour Salon & Spa',
    preheader: 'Your VIP access to luxury beauty and spa treatments is ready.',
    content
  });
};

/**
 * 2. Appointment Confirmation Template
 */
export const getAppointmentConfirmationHtml = ({
  customerName,
  serviceName,
  staffName,
  date,
  timeWindow,
  duration,
  bookingId,
  price,
  paymentStatus
}) => {
  const content = `
    <h2 class="heading">Your Appointment is Confirmed!</h2>
    <p>Dear ${customerName}, your appointment has been scheduled and assigned to our master styling team.</p>

    <div class="info-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Booking Reference:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace; color: #e11d48; font-size: 14px;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Treatment:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-size: 13px;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Stylist / Beautician:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-size: 13px;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Scheduled Date:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-size: 13px;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Time Window:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #e11d48; font-size: 13px;">${timeWindow} (${duration} mins)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Total Amount:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-size: 15px;">$${price}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Payment Status:</td>
          <td style="padding: 6px 0; text-align: right;">
            <span class="badge ${paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}">
              ${paymentStatus === 'paid' ? 'Paid Online' : 'Payment at Salon'}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #78716c;">
      <strong>Client Note:</strong> Please arrive 5-10 minutes prior to your session to enjoy a complimentary herbal infusion and styling consultation.
    </p>

    <div class="btn-container">
      <a href="https://enrich-mu.vercel.app/dashboard?tab=upcoming" class="btn">View Appointment in Portal</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Confirmed: ${serviceName} on ${date}`,
    preheader: `Booking #${bookingId} confirmed with ${staffName}.`,
    content
  });
};

/**
 * 3. Appointment Cancellation Template
 */
export const getAppointmentCancellationHtml = ({
  customerName,
  serviceName,
  staffName,
  date,
  bookingId,
  reason
}) => {
  const content = `
    <h2 class="heading" style="color: #be123c;">Appointment Cancellation Notice</h2>
    <p>Dear ${customerName}, this email confirms that your salon booking <strong>#${bookingId}</strong> has been cancelled.</p>

    <div class="info-card" style="border-left: 4px solid #e11d48;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Booking ID:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Cancelled Service:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Original Date:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Stylist:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Cancellation Reason:</td>
          <td style="padding: 6px 0; color: #be123c; font-weight: 600; text-align: right;">${reason || 'Client request'}</td>
        </tr>
      </table>
    </div>

    <p>If you would like to reschedule or book an alternate treatment, we would love to welcome you at another time that suits you.</p>

    <div class="btn-container">
      <a href="https://enrich-mu.vercel.app/book" class="btn">Reschedule or Book Again</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Cancelled: Booking #${bookingId}`,
    preheader: `Your appointment for ${serviceName} has been cancelled.`,
    content
  });
};

/**
 * 4. Appointment Rescheduling Template
 */
export const getAppointmentRescheduledHtml = ({
  customerName,
  serviceName,
  staffName,
  oldDate,
  newDate,
  newTime,
  bookingId
}) => {
  const content = `
    <h2 class="heading">Appointment Rescheduled Successfully</h2>
    <p>Dear ${customerName}, your appointment for <strong>${serviceName}</strong> has been updated to a new time window.</p>

    <div class="info-card" style="border-left: 4px solid #10b981;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Booking Reference:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace; color: #e11d48;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Treatment:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Stylist:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Previous Date:</td>
          <td style="padding: 6px 0; color: #a8a29e; text-decoration: line-through; text-align: right;">${oldDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">NEW Date:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #15803d; text-align: right;">${newDate}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">NEW Start Time:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #15803d; text-align: right;">${newTime}</td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="https://enrich-mu.vercel.app/dashboard?tab=upcoming" class="btn">View Updated Booking</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Rescheduled: ${serviceName} on ${newDate}`,
    preheader: `Your appointment has been updated to ${newDate} at ${newTime}.`,
    content
  });
};

/**
 * 5. Payment Confirmation / Receipt Template
 */
export const getPaymentReceiptHtml = ({
  customerName,
  serviceName,
  bookingId,
  paymentId,
  orderId,
  amount,
  paymentMethod = 'Razorpay Online',
  date
}) => {
  const content = `
    <h2 class="heading">Payment Receipt & Invoice</h2>
    <p>Dear ${customerName}, we have received and verified your online payment for appointment <strong>#${bookingId}</strong>.</p>

    <div class="info-card">
      <div style="text-align: center; padding-bottom: 12px; border-bottom: 1px dashed #e7e5e4; margin-bottom: 12px;">
        <span class="badge badge-green">Transaction Verified</span>
        <div style="font-size: 28px; font-weight: 700; color: #1c1917; margin-top: 8px; font-family: 'Playfair Display', Georgia, serif;">
          $${amount}
        </div>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Payment ID:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace; font-size: 12px;">${paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Order ID:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; font-family: monospace; font-size: 12px; color: #78716c;">${orderId || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Booking ID:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace; color: #e11d48;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Service:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Method:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">${paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Date:</td>
          <td style="padding: 6px 0; text-align: right; color: #57534e;">${date}</td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="https://enrich-mu.vercel.app/dashboard" class="btn">View Customer Invoices</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Payment Receipt: $${amount} for Booking #${bookingId}`,
    preheader: `Receipt confirmed for your treatment at LuxeParlour.`,
    content
  });
};

/**
 * 6. Appointment Reminder Template
 */
export const getAppointmentReminderHtml = ({
  customerName,
  serviceName,
  staffName,
  date,
  timeWindow,
  bookingId
}) => {
  const content = `
    <h2 class="heading">Friendly Reminder: Your Upcoming Visit</h2>
    <p>Dear ${customerName}, your upcoming appointment at <strong>LuxeParlour</strong> is coming up tomorrow!</p>

    <div class="info-card" style="border-left: 4px solid #f59e0b;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Booking ID:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace; color: #e11d48;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Treatment:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Stylist:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Appointment Date:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Time Window:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #e11d48;">${timeWindow}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #78716c; font-size: 13px;">Location:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right;">450 Fashion Avenue, Ste 1800, NY</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #57534e;">
      If you need to make any adjustments or have questions for your stylist, please manage your booking via your dashboard or call our concierge.
    </p>

    <div class="btn-container">
      <a href="https://enrich-mu.vercel.app/dashboard?tab=upcoming" class="btn">View Appointment Details</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Reminder: Your Appointment Tomorrow (${date})`,
    preheader: `Reminder: ${serviceName} with ${staffName} scheduled for ${date}.`,
    content
  });
};

/**
 * 7. Account Email Verification OTP Template
 */
export const getVerificationOTPEmailHtml = ({ name, otp, expiryMinutes = 5 }) => {
  const content = `
    <h2 class="heading">Verify Your Parlour Account</h2>
    <p>Hello ${name ? name.split(' ')[0] : 'Valued Client'},</p>
    <p>Welcome to <strong>Enrich Salon & Spa Sanctuary</strong>! To complete your registration and activate your account, please enter the 6-digit verification code below:</p>

    <div style="text-align: center; margin: 32px 0 24px;">
      <div style="display: inline-block; background: #fafaf9; border: 2px dashed #e11d48; border-radius: 12px; padding: 18px 36px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1c1917; margin-left: 10px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 12px; color: #78716c; margin-top: 12px; font-weight: 500;">
        ⏱️ This code will expire in <strong>${expiryMinutes} minutes</strong>.
      </p>
    </div>

    <div class="info-card" style="border-left: 4px solid #3b82f6; background-color: #f8fafc;">
      <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
        <strong>Security Notice:</strong> Never share this code with anyone. Our concierge staff will never ask for your verification code. If you did not create an account with Enrich Salon, you can safely disregard this email.
      </p>
    </div>
  `;

  return renderBaseLayout({
    title: 'Verify Your Parlour Account',
    preheader: `Your verification code is ${otp}. Valid for ${expiryMinutes} minutes.`,
    content
  });
};

/**
 * 8. Password Reset OTP Template
 */
export const getPasswordResetOTPEmailHtml = ({ name, otp, expiryMinutes = 5 }) => {
  const content = `
    <h2 class="heading" style="color: #be123c;">Reset Your Password</h2>
    <p>Hello ${name ? name.split(' ')[0] : 'Valued Client'},</p>
    <p>We received a request to reset the password for your <strong>Enrich Salon</strong> account. Use the 6-digit security code below to proceed with setting a new password:</p>

    <div style="text-align: center; margin: 32px 0 24px;">
      <div style="display: inline-block; background: #fafaf9; border: 2px dashed #be123c; border-radius: 12px; padding: 18px 36px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #be123c; margin-left: 10px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 12px; color: #78716c; margin-top: 12px; font-weight: 500;">
        ⏱️ This password reset code will expire in <strong>${expiryMinutes} minutes</strong>.
      </p>
    </div>

    <div class="info-card" style="border-left: 4px solid #ef4444; background-color: #fef2f2;">
      <p style="margin: 0; font-size: 12px; color: #991b1b; line-height: 1.5;">
        <strong>Security Alert:</strong> If you did not request a password reset, please ignore this email or contact support immediately if you suspect unauthorized activity. Your password will remain unchanged.
      </p>
    </div>
  `;

  return renderBaseLayout({
    title: 'Reset Your Parlour Password',
    preheader: `Your password reset code is ${otp}. Valid for ${expiryMinutes} minutes.`,
    content
  });
};

