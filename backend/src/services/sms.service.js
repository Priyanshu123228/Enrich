import { ApiError } from '../utils/apiError.js';

/**
 * Format phone number to standard E.164
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
};

export const smsService = {
  /**
   * 1. Send 6-Digit Phone Verification OTP via SMS
   */
  sendPhoneOTP: async ({ phone, otp, userName = 'Valued Client' }) => {
    if (!phone) {
      throw new ApiError(400, 'Recipient phone number is required');
    }

    const provider = (process.env.SMS_PROVIDER || 'simulated').toLowerCase();
    const formattedPhone = formatPhoneNumber(phone);
    const message = `Your Enrich Salon verification code is ${otp}. Valid for 5 minutes. Please do not share this code.`;

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `\n======================================================\n` +
        `📱 [PHONE OTP DISPATCH]\n` +
        `Recipient: ${formattedPhone}\n` +
        `6-Digit OTP: ${otp}\n` +
        `Provider: ${provider.toUpperCase()}\n` +
        `======================================================\n`
      );
    }

    try {
      // 1. Twilio Provider
      if (provider === 'twilio') {
        const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
        const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
        const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim() || 'VA48f24db85208c56403c9700aa47190f8';
        const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();

        if (!accountSid || !authToken || accountSid === 'your_twilio_account_sid') {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`ℹ️ [SMSService] Twilio placeholder credentials detected. Using simulated mode.`);
            return { success: true, simulated: true };
          }
          throw new Error('Twilio credentials not configured');
        }

        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        // Preferred Carrier-Compliant Channel: Twilio Verify Service
        if (verifySid) {
          try {
            const verifyParams = new URLSearchParams();
            verifyParams.append('To', formattedPhone);
            verifyParams.append('Channel', 'sms');

            const verifyUrl = `https://verify.twilio.com/v2/Services/${verifySid}/Verifications`;
            const verifyRes = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: verifyParams.toString()
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.sid) {
              console.log(`✅ [SMSService] Twilio Verify SMS dispatched to ${formattedPhone} (Status: ${verifyData.status})`);
              return { success: true, sid: verifyData.sid, provider: 'twilio-verify' };
            }

            if (verifyData.message?.includes('Max send attempts')) {
              console.warn(`⚠️ [SMSService] Twilio trial max attempts reached for ${formattedPhone}. Falling back to local verification.`);
              return { success: true, simulated: true, note: 'Twilio trial limit reached; local OTP active' };
            }

            console.warn(`⚠️ Twilio Verify notice (${verifyData.message || verifyRes.status}), trying standard messaging...`);
          } catch (vErr) {
            console.warn('⚠️ Twilio Verify dispatch notice:', vErr.message);
          }
        }

        // Standard Programmable Messaging Fallback
        const formattedFrom = formatPhoneNumber(fromNumber);
        const params = new URLSearchParams();
        params.append('To', formattedPhone);
        params.append('From', formattedFrom);
        params.append('Body', message);

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Twilio API error: ${response.status}`);
        }

        console.log(`✅ [SMSService] Twilio SMS dispatched to ${formattedPhone} (SID: ${data.sid})`);
        return { success: true, sid: data.sid, provider: 'twilio' };
      }

      // 2. MSG91 Provider
      if (provider === 'msg91') {
        const authKey = process.env.MSG91_AUTH_KEY?.trim();
        const templateId = process.env.MSG91_TEMPLATE_ID?.trim();

        if (!authKey || authKey === 'your_msg91_auth_key') {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`ℹ️ [SMSService] MSG91 credentials not configured. Using simulated mode.`);
            return { success: true, simulated: true };
          }
          throw new Error('MSG91 credentials not configured');
        }

        const msg91Url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${formattedPhone.replace('+', '')}&authkey=${authKey}&otp=${otp}`;
        const response = await fetch(msg91Url, { method: 'POST' });
        const data = await response.json();

        if (data.type === 'error') {
          throw new Error(data.message || 'MSG91 OTP dispatch failed');
        }

        console.log(`✅ [SMSService] MSG91 SMS dispatched to ${formattedPhone}`);
        return { success: true, data, provider: 'msg91' };
      }

      // 3. Simulated Dev Mode
      return { success: true, simulated: true, provider: 'simulated' };
    } catch (error) {
      console.error(`❌ [SMSService Error] ${error.message}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`ℹ️ [SMSService Fallback] Proceeding with development mode (OTP logged above).`);
        return { success: true, simulated: true, fallback: true };
      }
      throw new ApiError(500, 'Failed to send SMS verification code. Please check the phone number or try again later.');
    }
  },

  /**
   * 2. Verify Phone OTP (Twilio Verify or Local DB)
   */
  verifyPhoneOTP: async ({ phone, otp }) => {
    const provider = (process.env.SMS_PROVIDER || 'simulated').toLowerCase();
    const formattedPhone = formatPhoneNumber(phone);

    if (provider === 'twilio') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
      const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
      const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim() || 'VA48f24db85208c56403c9700aa47190f8';

      if (verifySid && accountSid && authToken) {
        try {
          const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
          const checkParams = new URLSearchParams();
          checkParams.append('To', formattedPhone);
          checkParams.append('Code', otp.toString().trim());

          const checkUrl = `https://verify.twilio.com/v2/Services/${verifySid}/VerificationCheck`;
          const checkRes = await fetch(checkUrl, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: checkParams.toString()
          });

          const checkData = await checkRes.json();
          if (checkRes.ok && checkData.status === 'approved') {
            console.log(`✅ [SMSService] Twilio Verify Check approved for ${formattedPhone}`);
            return { success: true, verified: true };
          }
          console.warn(`⚠️ Twilio Verify Check status: ${checkData.status}, checking local DB fallback...`);
        } catch (vErr) {
          console.warn('⚠️ Twilio Verify check network issue, checking local DB fallback:', vErr.message);
        }
      }
    }

    // Use local MongoDB VerificationOTP check
    return { success: true, useLocalCheck: true };
  }
};
