import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendTestEmail = async () => {
    console.log('Testing email sending...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'Not set');

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: 'Test Email from Anti-Log',
            text: 'This is a test email to verify Nodemailer configuration.',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

sendTestEmail();
