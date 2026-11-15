import nodemailer from 'nodemailer';

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(payload: ContactEmailPayload): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const to = process.env.CONTACT_NOTIFY_EMAIL?.trim();

  if (!host || !user || !pass || !to) {
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM?.trim() || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.email,
    subject: `[Portfolio Inquiry] ${payload.subject}`,
    text: [
      `New contact message received on your portfolio:`,
      ``,
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      `Subject: ${payload.subject}`,
      ``,
      `Message:`,
      payload.message,
    ].join('\n'),
  });
}
