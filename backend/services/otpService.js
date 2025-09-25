const nodemailer = require("nodemailer");
const OTPToken = require("../models/OTPToken");

class OTPService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: "smtp.hostinger.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || "hello@auraxai.in",
        pass: process.env.EMAIL_PASS || "Myspace@1423",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Email configuration error:", error);
      } else {
        console.log("✅ Email service ready for OTP delivery");
      }
    });
  }

  // Generate and send registration OTP
  async sendRegistrationOTP(email, firstName) {
    try {
      // Check if user recently requested an OTP (prevent spam)
      const hasRecentOTP = await OTPToken.hasRecentOTP(
        email,
        "registration",
        1
      );
      if (hasRecentOTP) {
        throw new Error("Please wait before requesting another OTP");
      }

      // Generate OTP token
      const { token, plainOTP } = await OTPToken.createOTPToken(
        email,
        "registration",
        {
          expiryMinutes: 10,
        }
      );

      // Create email content
      const emailContent = this.createRegistrationOTPEmail(plainOTP, firstName);

      // Send email
      const mailOptions = {
        from: `"Aurax AI" <${process.env.EMAIL_USER || "hello@auraxai.in"}>`,
        to: email,
        subject: "Complete Your Aurax Registration - Verification Code",
        html: emailContent,
        text: `Your Aurax registration verification code is: ${plainOTP}. This code expires in 10 minutes.`,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Registration OTP sent to ${email}:`, plainOTP);

      return {
        success: true,
        messageId: result.messageId,
        expiresAt: token.expiresAt,
        message: "Verification code sent successfully",
      };
    } catch (error) {
      console.error("Registration OTP send error:", error);
      throw new Error(error.message || "Failed to send verification code");
    }
  }

  // Generate and send login OTP
  async sendLoginOTP(email, firstName) {
    try {
      // Check if user recently requested an OTP
      const hasRecentOTP = await OTPToken.hasRecentOTP(email, "login", 1);
      if (hasRecentOTP) {
        throw new Error("Please wait before requesting another OTP");
      }

      // Generate OTP token
      const { token, plainOTP } = await OTPToken.createOTPToken(
        email,
        "login",
        {
          expiryMinutes: 5, // Shorter expiry for login OTPs
        }
      );

      // Create email content
      const emailContent = this.createLoginOTPEmail(plainOTP, firstName);

      // Send email
      const mailOptions = {
        from: `"Aurax AI" <${process.env.EMAIL_USER || "hello@auraxai.in"}>`,
        to: email,
        subject: "Your Aurax Login Code",
        html: emailContent,
        text: `Your Aurax login code is: ${plainOTP}. This code expires in 5 minutes.`,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Login OTP sent to ${email}:`, plainOTP);

      return {
        success: true,
        messageId: result.messageId,
        expiresAt: token.expiresAt,
        message: "Login code sent successfully",
      };
    } catch (error) {
      console.error("Login OTP send error:", error);
      throw new Error(error.message || "Failed to send login code");
    }
  }

  // Generate and send password reset OTP
  async sendPasswordResetOTP(email, firstName) {
    try {
      // Check if user recently requested an OTP
      const hasRecentOTP = await OTPToken.hasRecentOTP(
        email,
        "password-reset",
        2
      );
      if (hasRecentOTP) {
        throw new Error("Please wait before requesting another reset code");
      }

      // Generate OTP token
      const { token, plainOTP } = await OTPToken.createOTPToken(
        email,
        "password-reset",
        {
          expiryMinutes: 15, // Longer expiry for password reset
        }
      );

      // Create email content
      const emailContent = this.createPasswordResetOTPEmail(
        plainOTP,
        firstName
      );

      // Send email
      const mailOptions = {
        from: `"Aurax AI" <${process.env.EMAIL_USER || "hello@auraxai.in"}>`,
        to: email,
        subject: "Reset Your Aurax Password - Verification Code",
        html: emailContent,
        text: `Your Aurax password reset code is: ${plainOTP}. This code expires in 15 minutes.`,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Password reset OTP sent to ${email}:`, plainOTP);

      return {
        success: true,
        messageId: result.messageId,
        expiresAt: token.expiresAt,
        message: "Password reset code sent successfully",
      };
    } catch (error) {
      console.error("Password reset OTP send error:", error);
      throw new Error(error.message || "Failed to send password reset code");
    }
  }

  // Verify OTP
  async verifyOTP(email, otp, purpose) {
    try {
      const result = await OTPToken.verifyOTP(email, otp, purpose);

      if (!result.success) {
        // Increment attempt count for failed verifications
        await OTPToken.incrementAttempt(email, otp, purpose);
      }

      return result;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw new Error("Failed to verify code");
    }
  }

  // Check if user has active OTP
  async hasActiveOTP(email, purpose) {
    try {
      const activeOTP = await OTPToken.findActiveOTP(email, purpose);
      return !!activeOTP;
    } catch (error) {
      console.error("Check active OTP error:", error);
      return false;
    }
  }

  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOTPs() {
    try {
      const deletedCount = await OTPToken.cleanupExpired();
      console.log(`🗑️ Cleaned up ${deletedCount} expired OTP tokens`);
      return deletedCount;
    } catch (error) {
      console.error("OTP cleanup error:", error);
      throw error;
    }
  }

  // Email Templates
  createRegistrationOTPEmail(otp, firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your Aurax Registration</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-text { font-size: 18px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 20px; color: #1a1a1a; margin-bottom: 20px; }
            .message { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 30px; }
            .otp-container { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-label { color: white; font-size: 14px; margin-bottom: 10px; opacity: 0.9; }
            .otp-code { color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .validity { background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0; }
            .validity-text { color: #2d3748; font-size: 14px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer-text { color: #718096; font-size: 12px; line-height: 1.5; }
            .warning { background-color: #fed7d7; border: 1px solid #feb2b2; color: #c53030; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚀 Aurax AI</div>
                <div class="header-text">Complete Your Registration</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hi ${firstName || "there"}!</div>
                
                <div class="message">
                    Welcome to Aurax AI! You're just one step away from joining our innovative platform. 
                    Please use the verification code below to complete your registration:
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="validity">
                    <div class="validity-text">
                        ⏰ <strong>This code expires in 10 minutes</strong><br>
                        🔒 Keep this code secure and don't share it with anyone
                    </div>
                </div>
                
                <div class="message">
                    If you didn't request this verification code, please ignore this email. 
                    Your account remains secure.
                </div>
                
                <div class="warning">
                    <strong>Security Notice:</strong> Aurax will never ask for your verification code via phone or email. 
                    Only enter this code on the Aurax registration page.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    © 2024 Aurax AI. All rights reserved.<br>
                    This email was sent to confirm your registration. If you have questions, contact our support team.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  createLoginOTPEmail(otp, firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Aurax Login Code</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-text { font-size: 18px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 20px; color: #1a1a1a; margin-bottom: 20px; }
            .message { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 30px; }
            .otp-container { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-label { color: #2d3748; font-size: 14px; margin-bottom: 10px; opacity: 0.8; }
            .otp-code { color: #2d3748; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .validity { background-color: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0; }
            .validity-text { color: #2f855a; font-size: 14px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer-text { color: #718096; font-size: 12px; line-height: 1.5; }
            .security { background-color: #ebf8ff; border: 1px solid #90cdf4; color: #2c5282; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🔐 Aurax AI</div>
                <div class="header-text">Secure Login Verification</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${firstName || "there"}!</div>
                
                <div class="message">
                    You requested to log into your Aurax account. Please use the login code below to access your account:
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your Login Code</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="validity">
                    <div class="validity-text">
                        ⚡ <strong>This code expires in 5 minutes</strong><br>
                        🛡️ Use this code immediately for security
                    </div>
                </div>
                
                <div class="message">
                    If you didn't request this login code, someone may be trying to access your account. 
                    Please secure your account immediately.
                </div>
                
                <div class="security">
                    <strong>Security Tip:</strong> Always verify you're on the official Aurax website before entering your login code.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    © 2024 Aurax AI. All rights reserved.<br>
                    This is an automated security message. Please do not reply to this email.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  createPasswordResetOTPEmail(otp, firstName) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Aurax Password</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 40px 20px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-text { font-size: 18px; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .greeting { font-size: 20px; color: #1a1a1a; margin-bottom: 20px; }
            .message { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 30px; }
            .otp-container { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-label { color: #744210; font-size: 14px; margin-bottom: 10px; opacity: 0.8; }
            .otp-code { color: #744210; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .validity { background-color: #fffaf0; border-left: 4px solid #ed8936; padding: 15px; margin: 20px 0; }
            .validity-text { color: #c05621; font-size: 14px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer-text { color: #718096; font-size: 12px; line-height: 1.5; }
            .warning { background-color: #fed7d7; border: 1px solid #feb2b2; color: #c53030; padding: 15px; border-radius: 6px; margin-top: 20px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🔄 Aurax AI</div>
                <div class="header-text">Password Reset Request</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hi ${firstName || "there"}!</div>
                
                <div class="message">
                    You requested to reset your Aurax account password. Please use the verification code below to proceed with resetting your password:
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Password Reset Code</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="validity">
                    <div class="validity-text">
                        ⏳ <strong>This code expires in 15 minutes</strong><br>
                        🔑 You'll be able to set a new password after verification
                    </div>
                </div>
                
                <div class="message">
                    If you didn't request a password reset, please ignore this email and your password will remain unchanged. 
                    Consider reviewing your account security.
                </div>
                
                <div class="warning">
                    <strong>Important:</strong> If you didn't request this password reset, someone may have access to your email. 
                    Please secure your email account and contact our support team.
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    © 2024 Aurax AI. All rights reserved.<br>
                    This email was sent in response to your password reset request. If you need help, contact support.
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new OTPService();
