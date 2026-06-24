import nodemailer from "nodemailer";
import config from "../config/config.js";

export function canSendEmail() {
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
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;padding:20px">
                <div style="background:#4f46e5;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                    <h2 style="margin:0">Order Placed Successfully 🎉</h2>
                </div>
                <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px">
                    <p>Hi ${order.address?.name || 'Customer'},</p>
                    <p>Thank you for your order! Your order <b>#${String(order._id).slice(-8).toUpperCase()}</b> has been placed and is being processed.</p>
                    
                    <h3 style="margin-top:20px;color:#111827">Order Details:</h3>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0">
                        <thead>
                            <tr style="background:#f3f4f6">
                                <th align="left" style="padding:12px;border:1px solid #e5e7eb">Product</th>
                                <th align="center" style="padding:12px;border:1px solid #e5e7eb">Qty</th>
                                <th align="right" style="padding:12px;border:1px solid #e5e7eb">Price</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    
                    <div style="background:#f9fafb;padding:15px;border-radius:6px;margin:16px 0">
                        <p style="margin:0;display:flex;justify-content:space-between">
                            <span>Subtotal:</span>
                            <strong>₹${order.totalAmount}</strong>
                        </p>
                        <p style="margin:8px 0 0 0;display:flex;justify-content:space-between">
                            <span>Payment Method:</span>
                            <strong>${order.paymentMethod.toUpperCase()}</strong>
                        </p>
                        <p style="margin:8px 0 0 0;display:flex;justify-content:space-between">
                            <span>Status:</span>
                            <strong style="color:#4f46e5">${order.status}</strong>
                        </p>
                    </div>
                    
                    <h3 style="margin-top:20px;color:#111827">Delivery Address:</h3>
                    <div style="background:#f9fafb;padding:15px;border-radius:6px">
                        <p style="margin:0"><strong>${order.address?.name}</strong></p>
                        <p style="margin:5px 0">${order.address?.street}</p>
                        <p style="margin:5px 0">${order.address?.city}, ${order.address?.pincode}</p>
                        <p style="margin:5px 0">Phone: ${order.address?.phone}</p>
                    </div>
                    
                    <p style="margin-top:20px;color:#6b7280;font-size:14px">
                        We'll send you updates as your order progresses. Thank you for shopping with us!
                    </p>
                </div>
            </div>
        `,
    });
}

export async function sendPasswordChangeEmail(user) {
    return sendEmail({
        to: user.email,
        subject: `Your ${config.APP_NAME} password has been changed`,
        text: `Your password has been changed successfully. If this wasn't you, please contact support immediately.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;padding:20px">
                <div style="background:#4f46e5;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center">
                    <h2 style="margin:0">Password Changed ✓</h2>
                </div>
                <div style="border:1px solid #e5e7eb;border-top:none;padding:20px;border-radius:0 0 8px 8px">
                    <p>Hi ${user.name},</p>
                    <p>Your password has been <strong>successfully changed</strong>.</p>
                    
                    <div style="background:#dcfce7;border-left:4px solid #16a34a;padding:15px;margin:20px 0;border-radius:4px">
                        <p style="margin:0;color:#15803d"><strong>ℹ️ Security Notice</strong></p>
                        <p style="margin:8px 0 0 0;color:#15803d">If you did not make this change, please secure your account immediately by resetting your password again.</p>
                    </div>
                    
                    <h3 style="color:#111827">What's Next?</h3>
                    <ul style="color:#6b7280">
                        <li>You can now login with your new password</li>
                        <li>All your existing sessions remain active</li>
                        <li>For security, consider updating your password periodically</li>
                    </ul>
                    
                    <div style="background:#f9fafb;padding:15px;border-radius:6px;margin:20px 0;border-left:4px solid #f97316">
                        <p style="margin:0;color:#ea580c"><strong>Need Help?</strong></p>
                        <p style="margin:8px 0 0 0;color:#6b7280">If you didn't authorize this password change, please <a href="mailto:support@${config.APP_NAME.toLowerCase().replace(/\s/g, '')}.com" style="color:#4f46e5;text-decoration:none">contact support</a> immediately.</p>
                    </div>
                </div>
            </div>
        `,
    });
}
