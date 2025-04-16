
//Email Automation Debugger

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function sendTestEmail() {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL,
            subject: "Test Email",
            text: "This is a test email from Nodemailer."
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", result.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

sendTestEmail();