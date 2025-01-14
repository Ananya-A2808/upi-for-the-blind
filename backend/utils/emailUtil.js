const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shreelakshmisomshekar@gmail.com',  // Your Gmail
        pass: 'hgxi wkbt hfvz vbro'    // Your App Password
    }
});

// Email templates
const EMAIL_TEMPLATES = {
    ACCOUNT_CREATED: (name) => ({
        subject: 'Welcome to Blind UPI - Account Created',
        html: `
            <h2>Welcome to Blind UPI, ${name}!</h2>
            <p>Your account has been successfully created. Please verify your account to start using our services.</p>
            <p>If you didn't create this account, please contact our support immediately.</p>
        `
    }),
    
    ACCOUNT_VERIFIED: (name) => ({
        subject: 'Blind UPI - Account Verified Successfully',
        html: `
            <h2>Account Verified</h2>
            <p>Hello ${name},</p>
            <p>Your Blind UPI account has been successfully verified. You can now start using all our services.</p>
            <p>For your security, please note:</p>
            <ul>
                <li>Never share your OTP with anyone</li>
                <li>Enable two-factor authentication</li>
                <li>Keep your password secure</li>
            </ul>
        `
    }),

    LOGIN_ALERT: (name, time, location) => ({
        subject: 'Blind UPI - New Login Detected',
        html: `
            <h2>New Login Alert</h2>
            <p>Hello ${name},</p>
            <p>A new login was detected on your account:</p>
            <p>Time: ${time}</p>
            <p>Location: ${location}</p>
            <p>If this wasn't you, please secure your account immediately.</p>
        `
    }),

    TRANSACTION_ALERT: (name, type, amount, balance) => ({
        subject: 'Blind UPI - Transaction Alert',
        html: `
            <h2>Transaction Alert</h2>
            <p>Hello ${name},</p>
            <p>A ${type} transaction has been processed on your account:</p>
            <p>Amount: ₹${amount}</p>
            <p>Current Balance: ₹${balance}</p>
            <p>If you didn't authorize this transaction, please contact us immediately.</p>
        `
    }),

    SECURITY_ALERT: (name, activity) => ({
        subject: 'Blind UPI - Security Alert',
        html: `
            <h2>Security Alert</h2>
            <p>Hello ${name},</p>
            <p>We detected the following security activity on your account:</p>
            <p>${activity}</p>
            <p>If this wasn't you, please secure your account immediately.</p>
        `
    })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
    try {
        const { subject, html } = template(data.name, ...Object.values(data).slice(1));
        
        const mailOptions = {
            from: '"Blind UPI Security" <shreelakshmisomshekar@gmail.com>',
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = {
    sendEmail,
    EMAIL_TEMPLATES
}; 