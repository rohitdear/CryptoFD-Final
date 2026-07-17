// Email service using Resend API
// Set RESEND_API_KEY and EMAIL_FROM in environment variables

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = process.env.EMAIL_FROM || "CryptoFD <noreply@cryptofd.com>"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured")
    // In development, just log the email
    if (process.env.NODE_ENV !== "production") {
      console.log("[Email] Would send email to:", to)
      console.log("[Email] Subject:", subject)
      return true
    }
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    })

    if (error) {
      console.error("[Email] Failed to send:", error)
      return false
    }

    console.log("[Email] Sent successfully to:", to)
    return true
  } catch (error) {
    console.error("[Email] Error sending email:", error)
    return false
  }
}

// Send OTP verification email
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">CryptoFD</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Secure Investment Platform</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Use the following verification code to complete your authentication. This code will expire in 10 minutes.
          </p>
          
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981;">${otp}</span>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
            If you didn't request this code, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} CryptoFD. All rights reserved.<br>
            London, United Kingdom
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `${otp} - Your CryptoFD Verification Code`,
    html,
  })
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">CryptoFD</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Secure Investment Platform</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            We received a request to reset your password. Use the code below to proceed. This code will expire in 10 minutes.
          </p>
          
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #10b981;">${otp}</span>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} CryptoFD. All rights reserved.<br>
            London, United Kingdom
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `${otp} - Reset Your CryptoFD Password`,
    html,
  })
}

// Send welcome email
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to CryptoFD!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Your Secure Investment Journey Begins</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello${name ? ` ${name}` : ""}!</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining CryptoFD. You're now part of a community earning daily returns on their crypto investments.
          </p>
          
          <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin: 0 0 20px 0;">
            <h3 style="color: #166534; margin: 0 0 10px 0; font-size: 16px;">Get Started:</h3>
            <ul style="color: #15803d; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Deposit USDT to your wallet</li>
              <li>Choose an investment plan (2-3.3% daily ROI)</li>
              <li>Watch your earnings grow daily</li>
              <li>Invite friends and earn 10% commission</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
            Need help? Our support team is available 24/7 at support@cryptofdforever.com
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} CryptoFD. All rights reserved.<br>
            London, United Kingdom
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Welcome to CryptoFD - Start Earning Today!",
    html,
  })
}

// Send sign-up bonus confirmation email
export async function sendSignupBonusEmail(email: string, name?: string): Promise<boolean> {
  const SIGNUP_BONUS = 5
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">CryptoFD</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Welcome Bonus Confirmed</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Congratulations${name ? ` ${name}` : ""}!</h2>
          
          <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 30px; margin: 0 0 30px 0; text-align: center; border: 2px solid #10b981;">
            <p style="color: #15803d; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">SIGN-UP BONUS CREDITED</p>
            <p style="color: #059669; margin: 0; font-size: 42px; font-weight: bold;">${SIGNUP_BONUS} USDT</p>
          </div>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Your welcome bonus has been successfully added to your wallet. You're now ready to start your crypto investment journey and grow your wealth with our proven investment plans.
          </p>
          
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
          
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 0 0 25px 0;">
            <div style="margin: 0 0 20px 0;">
              <h4 style="color: #1f2937; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">1. Make Your First Deposit</h4>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Deposit additional USDT to combine with your bonus and maximize your investment potential.
              </p>
            </div>
            
            <div style="margin: 0 0 20px 0;">
              <h4 style="color: #1f2937; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">2. Choose an Investment Plan</h4>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Select from our profitable plans offering 2-3.3% daily returns. Your ${SIGNUP_BONUS} USDT bonus can be invested immediately.
              </p>
            </div>
            
            <div>
              <h4 style="color: #1f2937; margin: 0 0 8px 0; font-size: 15px; font-weight: 600;">3. Refer & Earn</h4>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Invite friends and earn up to 10% commission on their investments. Build your passive income stream today.
              </p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 0 0 25px 0;">
            <p style="color: #78350f; font-size: 13px; margin: 0; font-weight: 600;">📈 Investment Plans Overview:</p>
            <p style="color: #92400e; font-size: 13px; margin: 8px 0 0 0; line-height: 1.6;">
              • Silver: 2% Daily ROI (30-day lock)<br>
              • Gold: 2.5% Daily ROI (30-day lock)<br>
              • Premium: 3.3% Daily ROI (30-day lock)<br>
              Daily earnings available for withdrawal anytime with just 3% platform fee.
            </p>
          </div>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 15px; margin: 0 0 25px 0;">
            <p style="color: #1e40af; font-size: 13px; margin: 0; font-weight: 600;">💰 Referral Program:</p>
            <p style="color: #1e3a8a; font-size: 13px; margin: 8px 0 0 0; line-height: 1.6;">
              Earn passive income by referring others. Get 10% of every referral's first investment and continue earning from their daily returns.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            <strong>Start Growing Your Wealth Today!</strong> Log in to your account to begin making deposits and investments.
          </p>
          
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
            Questions or need assistance? Our dedicated support team is available 24/7 at support@cryptofdforever.com
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            &copy; ${new Date().getFullYear()} CryptoFD. All rights reserved.<br>
            London, United Kingdom
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Congratulations! 5 USDT Sign-Up Bonus Credited to Your Account",
    html,
  })
}

// Send withdrawal confirmation email
export async function sendWithdrawalEmail(email: string, amount: number, address: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">CryptoFD</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Withdrawal Request</p>
        </div>
        
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Withdrawal Initiated</h2>
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
            Your withdrawal request has been submitted and is being processed.
          </p>
          
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 0 0 30px 0;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Amount</p>
            <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: bold;">${amount.toFixed(2)} USDT</p>
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Destination Address</p>
            <p style="margin: 0; color: #1f2937; font-size: 12px; word-break: break-all;">${address}</p>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
            Withdrawals are typically processed within 24 hours. You'll receive another email when the transaction is complete.
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} CryptoFD. All rights reserved.<br>
            London, United Kingdom
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `Withdrawal Request: ${amount.toFixed(2)} USDT`,
    html,
  })
}
