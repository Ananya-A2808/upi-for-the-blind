const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Verify required environment variables
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// Create transporter with more detailed configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP connection error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        console.log('Attempting to send email to:', to);
        
        const mailOptions = {
            from: `"UPI App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">UPI App Authentication</h2>
                    <p style="font-size: 16px; line-height: 1.5;">${text}</p>
                    <p style="color: #666; font-size: 14px; margin-top: 20px;">
                        If you didn't request this email, please ignore it.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Detailed email error:', {
            error: error.message,
            code: error.code,
            command: error.command
        });
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

module.exports = { sendEmail }; 