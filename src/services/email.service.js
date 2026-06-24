import nodemailer from "nodemailer";
import config from "../config/config.js";

function canSendEmail() {
    return Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS && config.SMTP_FROM);
}

function createTransporter() {
    if (!canSendEmail()) return null;
    return nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: Number(config.SMTP_PORT) || 587,
        secure: Number(config.SMTP_PORT) === 465,
        auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS,
        },
    });
}

export async function sendEmail({ to, subject, html, text }) {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn("Email not sent: SMTP env variables are missing.");
        return { skipped: true };
    }

    return transporter.sendMail({
        from: `${config.APP_NAME} <${config.SMTP_FROM}>`,
        to,
        subject,
        text,
        html,
    });
}

export async function sendPasswordResetEmail(user, resetUrl) {
    return sendEmail({
        to: user.email,
        subject: `Reset your ${config.APP_NAME} password`,
        text: `Use this link to reset your password: ${resetUrl}. This link expires in 15 minutes.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
                <h2>Password Reset</h2>
                <p>Hi ${user.name},</p>
                <p>Click the button below to reset your password. This link expires in <b>15 minutes</b>.</p>
                <p><a href="${resetUrl}" style="background:#4f46e5;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a></p>
                <p>If you did not request this, you can ignore this email.</p>
            </div>
        `,
    });
}

export async function sendOrderPlacedEmail(userEmail, order) {
    if (!userEmail) return { skipped: true };
    const rows = order.items.map(item => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${item.productName}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${item.productPrice}</td>
        </tr>
    `).join("");

    return sendEmail({
        to: userEmail,
        subject: `Order placed successfully - #${String(order._id).slice(-8).toUpperCase()}`,
        text: `Your order has been placed successfully. Total amount: ₹${order.totalAmount}`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
                <h2>Order Placed Successfully 🎉</h2>
                <p>Your order <b>#${String(order._id).slice(-8).toUpperCase()}</b> has been placed.</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0">
                    <thead><tr><th align="left">Product</th><th>Qty</th><th align="right">Price</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <h3>Total: ₹${order.totalAmount}</h3>
                <p>Payment: ${order.paymentMethod.toUpperCase()} | Status: ${order.status}</p>
            </div>
        `,
    });
}
