/**
 * Reusable Luxury HTML Email Base Layout & Templates
 * Enrich Beauty Parlour & Cosmetic Clinic
 * Sikar, Rajasthan
 */

const SALON_CONSTANTS = {
  name: 'Enrich Beauty Parlour & Cosmetic Clinic',
  shortName: 'Enrich Parlour',
  tagline: 'Luxury Hair, Skin & Clinical Aesthetic Studio',
  address: 'First Floor, Sharda Heights, near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001',
  mapsUrl: 'https://www.google.com/maps/place/Enrich+Ladies+Beauty+Parlor/@27.6053398,75.1384512,17z/data=!3m1!4b1!4m6!3m5!1s0x396ca5b1f3574153:0x25aebec5e5e3b1fa!8m2!3d27.6053398!4d75.1384512!16s%2Fg%2F11h4_bw5rk',
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJU0FX87GlbDkR-rHj5cW-riU',
  phone: '96679 00313',
  phoneFormatted: '+91 96679 00313',
  email: 'enrichparlour1212@gmail.com',
  websiteUrl: 'https://enrich-mu.vercel.app',
  currency: '₹'
};

/**
 * Reusable Luxury HTML Email Base Layout
 */
const renderBaseLayout = ({ title, preheader, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8F5F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1C1917;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    td {
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #F8F5F0;
      padding: 36px 12px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #EDE4D8;
      box-shadow: 0 10px 30px rgba(46, 24, 34, 0.06);
    }
    .header {
      background: linear-gradient(135deg, #24111B 0%, #3D1A2A 50%, #1A0B13 100%);
      padding: 40px 32px 34px;
      text-align: center;
      color: #FFFFFF;
      border-bottom: 2px solid #E2A36B;
    }
    .brand-eyebrow {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 3.5px;
      color: #E2A36B;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0;
      color: #FFFFFF;
      font-family: 'Playfair Display', Georgia, serif;
      line-height: 1.25;
    }
    .brand-title span {
      color: #E11D48;
    }
    .brand-subtitle {
      font-size: 11px;
      letter-spacing: 1.5px;
      color: #E7DFD5;
      margin-top: 8px;
      font-weight: 400;
      text-transform: uppercase;
    }
    .body-content {
      padding: 38px 34px 30px;
      line-height: 1.65;
      color: #292524;
    }
    .eyebrow-badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #FFF1F2;
      border: 1px solid #FFE4E6;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #BE123C;
      margin-bottom: 12px;
    }
    .heading {
      font-size: 22px;
      font-weight: 700;
      color: #1C1917;
      margin-top: 0;
      margin-bottom: 14px;
      font-family: 'Playfair Display', Georgia, serif;
      line-height: 1.3;
    }
    .intro-text {
      font-size: 14px;
      color: #44403C;
      margin-bottom: 22px;
      line-height: 1.6;
    }
    .info-card {
      background-color: #FAF7F2;
      border-radius: 14px;
      padding: 22px;
      margin: 24px 0;
      border: 1px solid #EFE8DF;
    }
    .location-card {
      background-color: #FFFBF5;
      border-radius: 14px;
      padding: 20px;
      margin: 24px 0;
      border: 1px solid #F0E3D0;
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
      background-color: #FFE4E6;
      color: #BE123C;
    }
    .badge-green {
      background-color: #DCFCE7;
      color: #15803D;
    }
    .badge-amber {
      background-color: #FEF3C7;
      color: #B45309;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 16px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #BE123C 0%, #9F1239 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 0 4px 14px rgba(190, 18, 60, 0.28);
    }
    .btn-secondary {
      display: inline-block;
      background-color: #FFFFFF;
      color: #1C1917 !important;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid #E7DFD5;
    }
    .footer {
      background-color: #FAF7F2;
      padding: 30px 32px;
      text-align: center;
      font-size: 12px;
      color: #78716C;
      border-top: 1px solid #EDE4D8;
    }
    .footer a {
      color: #BE123C;
      text-decoration: none;
      font-weight: 600;
    }
    @media only screen and (max-width: 480px) {
      .body-content {
        padding: 26px 20px 22px !important;
      }
      .header {
        padding: 32px 20px 26px !important;
      }
      .brand-title {
        font-size: 22px !important;
      }
      .btn {
        display: block !important;
        width: auto !important;
        padding: 14px 20px !important;
      }
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
          <!-- Header -->
          <div class="header">
            <div class="brand-eyebrow">Haute Coiffure & Aesthetics</div>
            <h1 class="brand-title">Enrich <span>Beauty Parlour</span></h1>
            <div class="brand-subtitle">& Cosmetic Clinic • Sikar</div>
          </div>

          <!-- Body Content -->
          <div class="body-content">
            ${content}
          </div>

          <!-- Footer with verified salon address and Google Maps -->
          <div class="footer">
            <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #1C1917;">
              ${SALON_CONSTANTS.name}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 1.5; color: #57534E;">
              ${SALON_CONSTANTS.address}
            </p>
            
            <p style="margin: 0 0 12px 0;">
              <a href="${SALON_CONSTANTS.mapsUrl}" target="_blank" style="display: inline-block; padding: 6px 14px; background-color: #FFFFFF; border: 1px solid #E2D7CA; border-radius: 16px; font-size: 11px; font-weight: 700; color: #BE123C; text-decoration: none;">
                📍 View Location on Google Maps
              </a>
            </p>

            <p style="margin: 0; font-size: 11px; color: #8A847E;">
              Direct Desk: <a href="tel:${SALON_CONSTANTS.phoneFormatted}">${SALON_CONSTANTS.phoneFormatted}</a> &nbsp;|&nbsp;
              Email: <a href="mailto:${SALON_CONSTANTS.email}">${SALON_CONSTANTS.email}</a>
            </p>
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
    <div class="eyebrow-badge">Welcome to Privilege</div>
    <h2 class="heading">Welcome to Enrich Salon Atelier, ${name ? name.split(' ')[0] : 'Valued Client'}</h2>
    <p class="intro-text">
      We are honored to welcome you to <strong>${SALON_CONSTANTS.name}</strong>. Your client account is active, granting you priority access to master stylists, bespoke beauty therapies, and clinical treatments.
    </p>

    <div class="info-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500;">Registered Email:</td>
          <td style="padding: 7px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500;">Membership Tier:</td>
          <td style="padding: 7px 0; text-align: right;"><span class="badge badge-rose">VIP Client</span></td>
        </tr>
      </table>
    </div>

    <div class="location-card">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9F1239; margin-bottom: 6px;">
        Visiting Our Sikar Studio
      </div>
      <p style="margin: 0 0 10px; font-size: 12px; color: #44403C; line-height: 1.5;">
        ${SALON_CONSTANTS.address}
      </p>
      <a href="${SALON_CONSTANTS.mapsUrl}" target="_blank" style="font-size: 12px; font-weight: 700; color: #BE123C; text-decoration: none;">
        Open in Google Maps →
      </a>
    </div>

    <div class="btn-container">
      <a href="${SALON_CONSTANTS.websiteUrl}/book" class="btn">Book Your First Treatment</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Welcome to ${SALON_CONSTANTS.name}`,
    preheader: 'Your VIP access to luxury beauty treatments is ready.',
    content
  });
};

/**
 * 2. Appointment Confirmation Template (Luxury Upgraded)
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
    <div class="eyebrow-badge">Reservation Confirmed</div>
    <h2 class="heading">Your Salon Session is Confirmed!</h2>
    <p class="intro-text">
      Dear ${customerName}, your appointment has been scheduled and assigned to our master styling and beauty team.
    </p>

    <!-- Appointment Key Details Card -->
    <div class="info-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Booking Reference:</td>
          <td style="padding: 8px 0; font-weight: 800; text-align: right; font-family: monospace; color: #BE123C; font-size: 14px; border-bottom: 1px dashed #E7DFD5;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Treatment / Service:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Master Specialist:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Appointment Date:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Time Window:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #BE123C; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">${timeWindow} (${duration} mins)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Total Investment:</td>
          <td style="padding: 8px 0; font-weight: 800; text-align: right; font-size: 15px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${SALON_CONSTANTS.currency}${price}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0 2px; color: #78716C; font-size: 13px; font-weight: 500;">Payment Status:</td>
          <td style="padding: 8px 0 2px; text-align: right;">
            <span class="badge ${paymentStatus === 'paid' ? 'badge-green' : 'badge-amber'}">
              ${paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Salon'}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Exact Location & Navigation Card -->
    <div class="location-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top" style="padding-right: 12px; width: 28px;">
            <span style="font-size: 22px;">📍</span>
          </td>
          <td>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9F1239; margin-bottom: 4px;">
              Studio Location
            </div>
            <p style="margin: 0 0 10px; font-size: 12px; color: #44403C; line-height: 1.5; font-weight: 500;">
              ${SALON_CONSTANTS.address}
            </p>
            <div>
              <a href="${SALON_CONSTANTS.mapsUrl}" target="_blank" style="display: inline-block; padding: 7px 16px; background: linear-gradient(135deg, #BE123C 0%, #9F1239 100%); color: #FFFFFF !important; border-radius: 20px; font-size: 11px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
                Open in Google Maps
              </a>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #78716C; line-height: 1.5;">
      <strong>Client Courtesy:</strong> Please arrive 5–10 minutes prior to your allocated slot to enjoy a complimentary herbal brew and personalized consultation with your specialist.
    </p>

    <div class="btn-container">
      <a href="${SALON_CONSTANTS.websiteUrl}/dashboard?tab=upcoming" class="btn">View Booking in Client Portal</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Confirmed: ${serviceName} on ${date}`,
    preheader: `Booking #${bookingId} confirmed with ${staffName} on ${date}.`,
    content
  });
};

/**
 * 3. Appointment Cancellation Template (Luxury Upgraded)
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
    <div class="eyebrow-badge" style="background-color: #FEF2F2; color: #991B1B; border-color: #FEE2E2;">Reservation Notice</div>
    <h2 class="heading" style="color: #991B1B;">Appointment Cancellation Notice</h2>
    <p class="intro-text">
      Dear ${customerName}, this email confirms that your salon booking <strong>#${bookingId}</strong> has been cancelled.
    </p>

    <div class="info-card" style="border-left: 4px solid #E11D48;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Booking Reference:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-family: monospace; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Cancelled Service:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Scheduled Date:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Specialist:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0 2px; color: #78716C; font-size: 13px; font-weight: 500;">Reason:</td>
          <td style="padding: 8px 0 2px; color: #BE123C; font-weight: 600; text-align: right; font-size: 13px;">${reason || 'Client request'}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 13px; color: #57534E; line-height: 1.6;">
      We look forward to welcoming you back whenever you are ready. Our salon concierge is available at <a href="tel:${SALON_CONSTANTS.phoneFormatted}" style="color: #BE123C; font-weight: 700;">${SALON_CONSTANTS.phoneFormatted}</a> if you require personalized booking assistance.
    </p>

    <div class="btn-container">
      <a href="${SALON_CONSTANTS.websiteUrl}/book" class="btn">Reschedule or Book Alternate Service</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Cancelled: Booking #${bookingId}`,
    preheader: `Your appointment for ${serviceName} has been cancelled.`,
    content
  });
};

/**
 * 4. Appointment Rescheduling Template (Luxury Upgraded)
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
    <div class="eyebrow-badge" style="background-color: #F0FDF4; color: #166534; border-color: #DCFCE7;">Schedule Updated</div>
    <h2 class="heading">Your Appointment Has Been Rescheduled</h2>
    <p class="intro-text">
      Dear ${customerName}, your appointment for <strong>${serviceName}</strong> has been successfully updated with a new session window.
    </p>

    <div class="info-card" style="border-left: 4px solid #10B981;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Booking Reference:</td>
          <td style="padding: 8px 0; font-weight: 800; text-align: right; font-family: monospace; color: #BE123C; font-size: 14px; border-bottom: 1px dashed #E7DFD5;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Treatment:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Specialist:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Previous Date:</td>
          <td style="padding: 8px 0; color: #A8A29E; text-decoration: line-through; text-align: right; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">${oldDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">NEW Date:</td>
          <td style="padding: 8px 0; font-weight: 800; color: #15803D; text-align: right; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">${newDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0 2px; color: #78716C; font-size: 13px; font-weight: 500;">NEW Time Window:</td>
          <td style="padding: 8px 0 2px; font-weight: 800; color: #15803D; text-align: right; font-size: 13px;">${newTime}</td>
        </tr>
      </table>
    </div>

    <!-- Location & Directions -->
    <div class="location-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top" style="padding-right: 12px; width: 28px;">
            <span style="font-size: 22px;">📍</span>
          </td>
          <td>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9F1239; margin-bottom: 4px;">
              Studio Location
            </div>
            <p style="margin: 0 0 10px; font-size: 12px; color: #44403C; line-height: 1.5; font-weight: 500;">
              ${SALON_CONSTANTS.address}
            </p>
            <a href="${SALON_CONSTANTS.mapsUrl}" target="_blank" style="font-size: 12px; font-weight: 700; color: #BE123C; text-decoration: none;">
              Get Directions on Google Maps →
            </a>
          </td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="${SALON_CONSTANTS.websiteUrl}/dashboard?tab=upcoming" class="btn">View Updated Booking</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Rescheduled: ${serviceName} on ${newDate}`,
    preheader: `Your appointment has been updated to ${newDate} at ${newTime}.`,
    content
  });
};

/**
 * 5. Payment Confirmation / Receipt Template (Luxury Upgraded)
 */
export const getPaymentReceiptHtml = ({
  customerName,
  serviceName,
  bookingId,
  paymentId,
  orderId,
  amount,
  paymentMethod,
  date
}) => {
  const content = `
    <div class="eyebrow-badge" style="background-color: #F0FDF4; color: #166534; border-color: #DCFCE7;">Payment Receipt</div>
    <h2 class="heading">Payment Confirmed</h2>
    <p class="intro-text">
      Dear ${customerName}, your payment for <strong>${serviceName}</strong> has been received and verified.
    </p>

    <div class="info-card">
      <div style="text-align: center; padding-bottom: 14px; border-bottom: 1px dashed #E7DFD5; margin-bottom: 14px;">
        <span class="badge badge-green">Verified Transaction</span>
        <div style="font-size: 32px; font-weight: 700; color: #1C1917; margin-top: 10px; font-family: 'Playfair Display', Georgia, serif;">
          ${SALON_CONSTANTS.currency}${amount}
        </div>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Payment ID:</td>
          <td style="padding: 7px 0; font-weight: 700; text-align: right; font-family: monospace; font-size: 12px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${paymentId}</td>
        </tr>
        ${orderId ? `
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Order Ref:</td>
          <td style="padding: 7px 0; font-weight: 600; text-align: right; font-family: monospace; font-size: 12px; color: #78716C; border-bottom: 1px dashed #E7DFD5;">${orderId}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Booking Ref:</td>
          <td style="padding: 7px 0; font-weight: 700; text-align: right; font-family: monospace; color: #BE123C; border-bottom: 1px dashed #E7DFD5;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Service:</td>
          <td style="padding: 7px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Gateway Method:</td>
          <td style="padding: 7px 0; font-weight: 600; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding: 7px 0 2px; color: #78716C; font-size: 13px; font-weight: 500;">Payment Date:</td>
          <td style="padding: 7px 0 2px; text-align: right; color: #57534E; font-size: 13px;">${date}</td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="${SALON_CONSTANTS.websiteUrl}/dashboard" class="btn">View Invoices in Portal</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Payment Receipt: ${SALON_CONSTANTS.currency}${amount} for Booking #${bookingId}`,
    preheader: `Receipt confirmed for your session at ${SALON_CONSTANTS.name}.`,
    content
  });
};

/**
 * 6. Appointment Reminder Template (Luxury Upgraded)
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
    <div class="eyebrow-badge" style="background-color: #FEF3C7; color: #92400E; border-color: #FDE68A;">Visit Reminder</div>
    <h2 class="heading">Reminder: Your Upcoming Appointment</h2>
    <p class="intro-text">
      Dear ${customerName}, your upcoming beauty appointment at <strong>${SALON_CONSTANTS.name}</strong> is scheduled for tomorrow!
    </p>

    <div class="info-card" style="border-left: 4px solid #F59E0B;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Booking Ref:</td>
          <td style="padding: 8px 0; font-weight: 800; text-align: right; font-family: monospace; color: #BE123C; border-bottom: 1px dashed #E7DFD5;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Treatment:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Specialist:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${staffName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Date:</td>
          <td style="padding: 8px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0 2px; color: #78716C; font-size: 13px; font-weight: 500;">Time Window:</td>
          <td style="padding: 8px 0 2px; font-weight: 800; text-align: right; color: #BE123C; font-size: 13px;">${timeWindow}</td>
        </tr>
      </table>
    </div>

    <!-- Location & Directions -->
    <div class="location-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top" style="padding-right: 12px; width: 28px;">
            <span style="font-size: 22px;">📍</span>
          </td>
          <td>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9F1239; margin-bottom: 4px;">
              Studio Location
            </div>
            <p style="margin: 0 0 10px; font-size: 12px; color: #44403C; line-height: 1.5; font-weight: 500;">
              ${SALON_CONSTANTS.address}
            </p>
            <a href="${SALON_CONSTANTS.mapsUrl}" target="_blank" style="display: inline-block; padding: 7px 16px; background: linear-gradient(135deg, #BE123C 0%, #9F1239 100%); color: #FFFFFF !important; border-radius: 20px; font-size: 11px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
              Open in Google Maps
            </a>
          </td>
        </tr>
      </table>
    </div>

    <div class="btn-container">
      <a href="${SALON_CONSTANTS.websiteUrl}/dashboard?tab=upcoming" class="btn">View Appointment Details</a>
    </div>
  `;

  return renderBaseLayout({
    title: `Reminder: Appointment Tomorrow (${date})`,
    preheader: `Reminder: ${serviceName} with ${staffName} scheduled for ${date}.`,
    content
  });
};

/**
 * 7. Account Email Verification OTP Template
 */
export const getVerificationOTPEmailHtml = ({ name, otp, expiryMinutes = 5 }) => {
  const content = `
    <div class="eyebrow-badge">Account Security</div>
    <h2 class="heading">Verify Your Salon Account</h2>
    <p class="intro-text">
      Hello ${name ? name.split(' ')[0] : 'Valued Client'}, welcome to <strong>${SALON_CONSTANTS.name}</strong>. Please enter the 6-digit verification code below to activate your account:
    </p>

    <div style="text-align: center; margin: 32px 0 24px;">
      <div style="display: inline-block; background: #FAF7F2; border: 2px dashed #BE123C; border-radius: 14px; padding: 18px 36px; box-shadow: 0 4px 12px rgba(46,24,34,0.05);">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #1C1917; margin-left: 10px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 12px; color: #78716C; margin-top: 12px; font-weight: 500;">
        ⏱️ This security code will expire in <strong>${expiryMinutes} minutes</strong>.
      </p>
    </div>

    <div class="info-card" style="border-left: 4px solid #3B82F6; background-color: #F8FAFC;">
      <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
        <strong>Security Notice:</strong> Never share this code with anyone. Our concierge will never ask for your verification code.
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
    <div class="eyebrow-badge" style="background-color: #FEF2F2; color: #991B1B; border-color: #FEE2E2;">Security Alert</div>
    <h2 class="heading" style="color: #991B1B;">Reset Your Password</h2>
    <p class="intro-text">
      Hello ${name ? name.split(' ')[0] : 'Valued Client'}, we received a request to reset your password for <strong>${SALON_CONSTANTS.name}</strong>. Use the 6-digit security code below to proceed:
    </p>

    <div style="text-align: center; margin: 32px 0 24px;">
      <div style="display: inline-block; background: #FAF7F2; border: 2px dashed #BE123C; border-radius: 14px; padding: 18px 36px; box-shadow: 0 4px 12px rgba(46,24,34,0.05);">
        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #BE123C; margin-left: 10px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 12px; color: #78716C; margin-top: 12px; font-weight: 500;">
        ⏱️ This security code will expire in <strong>${expiryMinutes} minutes</strong>.
      </p>
    </div>

    <div class="info-card" style="border-left: 4px solid #EF4444; background-color: #FEF2F2;">
      <p style="margin: 0; font-size: 12px; color: #991B1B; line-height: 1.5;">
        <strong>Notice:</strong> If you did not request a password reset, please ignore this email or contact our desk at ${SALON_CONSTANTS.phoneFormatted}.
      </p>
    </div>
  `;

  return renderBaseLayout({
    title: 'Reset Your Parlour Password',
    preheader: `Your password reset code is ${otp}. Valid for ${expiryMinutes} minutes.`,
    content
  });
};

/**
 * 9. New Customer Inquiry Notification (Sent to Admin / Concierge)
 */
export const getInquiryAdminNotificationHtml = ({ name, email, phone, message, date }) => {
  const content = `
    <div class="eyebrow-badge">Concierge Alert</div>
    <h2 class="heading">New Customer Inquiry</h2>
    <p class="intro-text">A new consultation inquiry has been submitted through the salon website.</p>

    <div class="info-card">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Customer Name:</td>
          <td style="padding: 7px 0; font-weight: 700; text-align: right; font-size: 13px; color: #1C1917; border-bottom: 1px dashed #E7DFD5;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Email Address:</td>
          <td style="padding: 7px 0; font-weight: 600; text-align: right; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">
            <a href="mailto:${email}" style="color: #BE123C; text-decoration: none;">${email}</a>
          </td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 7px 0; color: #78716C; font-size: 13px; font-weight: 500; border-bottom: 1px dashed #E7DFD5;">Phone Number:</td>
          <td style="padding: 7px 0; font-weight: 600; text-align: right; font-size: 13px; border-bottom: 1px dashed #E7DFD5;">
            <a href="tel:${phone}" style="color: #BE123C; text-decoration: none;">${phone}</a>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 7px 0 2px; color: #78716C; font-size: 13px; font-weight: 500;">Received At:</td>
          <td style="padding: 7px 0 2px; text-align: right; color: #57534E; font-size: 13px;">${date || new Date().toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: #FAF7F2; border: 1px solid #EFE8DF; border-radius: 12px; padding: 18px; margin: 20px 0;">
      <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #78716C;">Client Message:</h4>
      <p style="margin: 0; font-size: 14px; color: #292524; line-height: 1.6; white-space: pre-wrap;">${message}</p>
    </div>

    <div class="btn-container">
      <a href="mailto:${email}?subject=Re:%20Inquiry%20at%20Enrich%20Beauty%20Parlour" class="btn">
        Reply to ${name.split(' ')[0]}
      </a>
    </div>
  `;

  return renderBaseLayout({
    title: 'New Customer Inquiry',
    preheader: `New inquiry received from ${name}: "${message.substring(0, 50)}..."`,
    content
  });
};

/**
 * 10. Inquiry Acknowledgment (Sent to Customer)
 */
export const getInquiryAcknowledgmentHtml = ({ name, message }) => {
  const content = `
    <div class="eyebrow-badge">Inquiry Received</div>
    <h2 class="heading">We Have Received Your Message</h2>
    <p class="intro-text">
      Dear ${name ? name.split(' ')[0] : 'Valued Client'}, thank you for reaching out to <strong>${SALON_CONSTANTS.name}</strong>. Our salon concierge team is reviewing your request.
    </p>

    <div style="background-color: #FAF7F2; border-left: 3px solid #BE123C; padding: 16px 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 13px; color: #57534E; font-style: italic; line-height: 1.6;">
        "${message.length > 200 ? message.substring(0, 200) + '...' : message}"
      </p>
    </div>

    <p style="font-size: 13px; color: #44403C; line-height: 1.6;">
      A specialist will respond to your email or call you within one business day. If your request is time-sensitive, feel free to call our direct concierge at <strong style="color: #BE123C;">${SALON_CONSTANTS.phoneFormatted}</strong>.
    </p>

    <!-- Studio Address -->
    <div class="location-card">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9F1239; margin-bottom: 4px;">
        Salon Location
      </div>
      <p style="margin: 0 0 8px; font-size: 12px; color: #44403C; line-height: 1.5;">
        ${SALON_CONSTANTS.address}
      </p>
      <a href="${SALON_CONSTANTS.mapsUrl}" target="_blank" style="font-size: 12px; font-weight: 700; color: #BE123C; text-decoration: none;">
        Open in Google Maps →
      </a>
    </div>

    <div class="btn-container">
      <a href="${SALON_CONSTANTS.websiteUrl}/services" class="btn">
        Explore Treatments & Price List
      </a>
    </div>
  `;

  return renderBaseLayout({
    title: `Inquiry Received - ${SALON_CONSTANTS.name}`,
    preheader: `Thank you for contacting ${SALON_CONSTANTS.name}. We will be in touch shortly.`,
    content
  });
};
