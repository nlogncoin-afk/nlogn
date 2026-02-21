import { Resend } from 'resend';

export const sendEmail = async (to, subject, text) => {
    // If RESEND_API_KEY is provided, use Resend (for Production/Railway)
    if (process.env.RESEND_API_KEY) {
        try {
            const resend = new Resend(process.env.RESEND_API_KEY);

            console.log('--- DEBUG EMAIL CONTENT ---');
            console.log('To:', to);
            console.log('Subject:', subject);
            console.log('Body:', text);
            console.log('---------------------------');
            console.log('Attempting to send email via Resend API...');

            const { data, error } = await resend.emails.send({
                // Resend requires a verified domain. If you don't have one, 
                // you must use their testing domain 'onboarding@resend.dev'
                // which ONLY allows sending emails TO the email address you signed up with.
                from: 'Anti-Log <onboarding@resend.dev>',
                to,
                subject,
                html: `<p>${text.replace(/\n/g, '<br>')}</p>`,
            });

            if (error) {
                console.error('Resend API Error:', error);
                return { success: false, error };
            }

            console.log(`📧 Email sent to ${to} via Resend. ID: ${data.id}`);
            return { success: true };

        } catch (error) {
            console.error('Email send failed:', error);
            return { success: false, error };
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

    console.warn('⚠️ No RESEND_API_KEY found, and not in development mode. Email not sent.');
    return { success: false, error: 'No email service configured' };
};
