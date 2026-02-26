import SibApiV3Sdk from 'sib-api-v3-sdk';

export const sendEmail = async (to, subject, text) => {
    // If BREVO_API_KEY is provided, use Brevo (for Production/Railway)
    if (process.env.BREVO_API_KEY) {
        try {
            const defaultClient = SibApiV3Sdk.ApiClient.instance;
            const apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.BREVO_API_KEY;

            const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            // Set the sender, usually from env or a fallback
            const senderEmail = process.env.BREVO_SENDER_EMAIL || 'nlogn.co.in@gmail.com';
            const senderName = process.env.BREVO_SENDER_NAME || 'NlogN';

            const htmlTemplate = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <div style="background-color: #000000; color: #ffffff; padding: 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">NlogN</h1>
                </div>
                <div style="padding: 32px 24px;">
                    <p style="font-size: 16px; color: #18181b; margin-top: 0;">Hello,</p>
                    <p style="font-size: 16px; color: #3f3f46; line-height: 1.6;">We received a request related to your NlogN account. Please find the information below:</p>
                    
                    <div style="background-color: #f4f4f5; border-radius: 6px; padding: 20px; margin: 24px 0; text-align: center; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #000000;">
                        ${text.replace(/\n/g, '<br>')}
                    </div>
                    
                    <p style="font-size: 14px; color: #71717a; margin-top: 32px;">If you didn't request this email, you can safely ignore it.</p>
                    <p style="font-size: 16px; color: #18181b; margin-top: 24px; margin-bottom: 0;">Best regards,<br>The NlogN Team</p>
                </div>
                <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #e4e4e7;">
                    &copy; ${new Date().getFullYear()} NlogN Platform. All rights reserved.
                </div>
            </div>`;

            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = htmlTemplate;
            sendSmtpEmail.sender = { name: senderName, email: senderEmail };
            sendSmtpEmail.to = [{ email: to }];

            console.log('--- DEBUG EMAIL CONTENT ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Body:', text);
            console.log('---------------------------');
            console.log('Attempting to send email via Brevo API...');

            const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

            console.log(`📧 Email sent to ${to} via Brevo. MessageId: ${data.messageId}`);
            return { success: true };

        } catch (error) {
            console.error('Brevo API Error:', error.response?.text || error.message || error);
            return { success: false, error: error.response?.text || error.message || error };
        }
    }

    // Fallback for local development if no API key is present
    if (process.env.NODE_ENV === 'development') {
        console.log('\n=================================');
        console.log('📧 EMAIL SIMULATION (Local)');
        console.log('=================================');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Body:', text);
        console.log('=================================\n');
        return { success: true };
    }

    console.warn('⚠️ No BREVO_API_KEY found, and not in development mode. Email not sent.');
    return { success: false, error: 'No email service configured' };
};
