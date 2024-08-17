import nodemailer from 'nodemailer';
import UserModel from '../src/models/user.js';

export const otp = async (user) => {
  try {
    const userData = await UserModel.findOne({ email: user.email });
    if (!userData) {
      throw new Error('User not found');
    }

    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE, // Ensure this is a recognized service
      auth: {
        user: process.env.STORFLEET_SMPT_MAIL,
        pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD,
      },
      port: 587, // Try using port 587 instead of 465
    secure: false, // Set to false if using port 587
    });

    const mailOptions = {
      from: process.env.STORFLEET_MAIL,
      to: user.email,
      subject: 'OTP',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    max-width: 400px;
                    width: 100%;
                    text-align: center;
                }
                h1 {
                    color: #333333;
                }
                p {
                    color: #666666;
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    background-color: #f7f7f7;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    display: inline-block;
                }
                .footer {
                    color: #999999;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Your OTP Code</h1>
                <p>Please use the following OTP code to complete your verification:</p>
                <div class="otp">${userData.tampOtp}</div>
                <p>If you didn't request this, please ignore this email.</p>
                <div class="footer">
                    <p>Thank you for using our service.</p>
                </div>
            </div>
        </body>
        </html>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    
    console.error('Error sending email:', error.message);
    // Additional logging to identify specific issues
    console.error(error.stack);
  }
};
