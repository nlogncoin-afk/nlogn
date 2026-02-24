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
            const senderName = process.env.BREVO_SENDER_NAME || 'Anti-Log';

            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = `<p>${text.replace(/\n/g, '<br>')}</p>`;
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
