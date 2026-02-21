import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const sendEmail = async (to, subject, text) => {
    // If email credentials are provided, use Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                connectionTimeout: 2000, // Fail fast on Render's blocked ports
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
            };

            // ALWAYS LOG FOR VERIFICATION IN THIS SESSION
            console.log('--- DEBUG EMAIL CONTENT ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Body:', text);
            console.log('---------------------------');

            console.log('Attempting to send email with options:', { ...mailOptions, text: '***' }); // Log options without sensitive text
            const info = await transporter.sendMail(mailOptions);
            console.log(`📧 Email sent to ${to}: ${info.messageId}`);
            return { success: true };
        } catch (error) {
            console.error('Email send failed:', error);
            // Log specific error properties if available
            if (error.response) console.error('Error response:', error.response);
            if (error.command) console.error('Error command:', error.command);
            return { success: false, error };
        }
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('\n=================================');
        console.log('📧 EMAIL SIMULATION');
        console.log('=================================');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Body:', text);
        console.log('=================================\n');
        return { success: true };
    }
    // Placeholder for production email logic
    return { success: true };
};
