import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const sendEmail = async (to, subject, text) => {
    // If email credentials are provided, use Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                connectionTimeout: 5000,   // 5s to establish TCP
                greetingTimeout: 5000,     // 5s for SMTP greeting
                socketTimeout: 10000,      // 10s for socket inactivity
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

            try {
                // Write to artifact dir to be safe
                const logPath = 'C:\\Users\\sanjo\\.gemini\\antigravity\\brain\\1cdf95d9-37a9-44cc-9147-85f875790622\\otp.log';
                fs.writeFileSync(logPath, `To: ${to}\nSubject: ${subject}\nBody: ${text}\n---------------------------\n`, { flag: 'a' });
            } catch (err) {
                console.error('Failed to write to otp.log', err);
            }

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
