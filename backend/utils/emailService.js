const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Verify email credentials before creating transporter
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Email credentials not found in environment variables');
  throw new Error('Email configuration missing');
}

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER.trim(),
    pass: process.env.EMAIL_PASS.trim()
  }
});

// Test connection immediately
transporter.verify()
  .then(() => {
    console.log('SMTP connection verified with:', {
      user: process.env.EMAIL_USER,
      passLength: process.env.EMAIL_PASS?.length
    });
  })
  .catch((error) => {
    console.error('SMTP verification failed:', error);
  });

/**
 * Sends a verification email to the specified user.
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @param {string} token - The email verification token.
 * @returns {Promise<Object>} - The result of the email sending process.
 */
async function sendVerificationEmail(email, name, token) {
  try {
    // Make sure to use the frontend URL from environment variables
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: `"GDG Blog" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
          <h2 style="text-align: center; color: #2563eb;">Welcome to GDG Blog!</h2>
          <p>Hi ${name},</p>
          <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-wrap: break-word; color: #2563eb;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Thanks,<br>The GDG Blog Team</p>
        </div>
      `
    };

    // Verify the SMTP connection before sending
    await transporter.verify();
    console.log('Mail server connection verified');

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw error;
  }
}

/**
 * Sends a verification OTP to the specified user.
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @param {string} otp - The email verification OTP.
 * @returns {Promise<Object>} - The result of the email sending process.
 */
async function sendVerificationOTP(email, name, otp) {
  try {
    const mailOptions = {
      from: `"GDG Blog" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
          <h2 style="text-align: center; color: #2563eb;">Welcome to GDG Blog!</h2>
          <p>Hi ${name},</p>
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; font-size: 24px; letter-spacing: 4px;">
              ${otp}
            </div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Thanks,<br>The GDG Blog Team</p>
        </div>
      `
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw error;
  }
}

/**
 * Sends a password reset OTP to the specified user.
 * @param {string} email - The recipient's email address.
 * @param {string} name - The recipient's name.
 * @param {string} otp - The password reset OTP.
 * @returns {Promise<Object>} - The result of the email sending process.
 */
async function sendPasswordResetOTP(email, name, otp) {
  try {
    const mailOptions = {
      from: `"GDG Blog" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">
          <h2 style="text-align: center; color: #2563eb;">Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>Your password reset code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; font-size: 24px; letter-spacing: 4px;">
              ${otp}
            </div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Thanks,<br>The GDG Blog Team</p>
        </div>
      `
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset OTP sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Failed to send password reset OTP:', error);
    throw error;
  }
}

module.exports = {
  sendVerificationEmail,
  sendVerificationOTP,
  sendPasswordResetOTP
};
