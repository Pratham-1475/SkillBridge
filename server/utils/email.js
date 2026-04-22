import nodemailer from 'nodemailer';

function getSmtpPort() {
  const parsedPort = Number(process.env.SMTP_PORT || 587);
  return Number.isFinite(parsedPort) ? parsedPort : 587;
}

function getSmtpSecure(port) {
  if (process.env.SMTP_SECURE) {
    return process.env.SMTP_SECURE === 'true';
  }

  return port === 465;
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createMailError(message) {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
}

function createTransporter() {
  if (!isEmailConfigured()) {
    throw createMailError(
      'Email verification is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM to server/.env.',
    );
  }

  const port = getSmtpPort();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: getSmtpSecure(port),
    logger: process.env.SMTP_DEBUG === 'true',
    debug: process.env.SMTP_DEBUG === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatExpiry(expiresAt) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(expiresAt);
}

export async function sendVerificationEmail({ to, name, verificationUrl, otp, expiresAt }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appName = 'SkillBridge';
  const expiryText = formatExpiry(expiresAt);

  const info = await transporter.sendMail({
    from,
    to,
    subject: 'Verify your SkillBridge account',
    text: [
      `Hi ${name || 'there'},`,
      '',
      `Use this one-time code to verify your SkillBridge account: ${otp}`,
      `This code and verification link expire at ${expiryText}.`,
      '',
      `Or open this verification link: ${verificationUrl}`,
      '',
      'If you did not create this account, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;background:#060b19;color:#e5e7eb;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#0f172a;border:1px solid #273449;border-radius:24px;padding:28px;">
          <p style="margin:0 0 12px;color:#a5b4fc;text-transform:uppercase;letter-spacing:3px;font-size:12px;">${appName}</p>
          <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;">Verify your email</h1>
          <p style="line-height:1.6;color:#cbd5e1;">Hi ${name || 'there'}, use the one-time code below or click the button to verify your SkillBridge account.</p>
          <div style="margin:24px 0;padding:18px 20px;border-radius:18px;background:#111827;border:1px solid #374151;text-align:center;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Verification code</p>
            <p style="margin:0;color:#ffffff;font-size:34px;letter-spacing:8px;font-weight:700;">${otp}</p>
          </div>
          <a href="${verificationUrl}" style="display:inline-block;background:#4F46E5;color:#ffffff;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:700;">Verify email</a>
          <p style="line-height:1.6;color:#94a3b8;font-size:14px;margin-top:22px;">This code and link expire at ${expiryText}.</p>
          <p style="line-height:1.6;color:#64748b;font-size:13px;">If the button does not work, paste this link into your browser:<br>${verificationUrl}</p>
        </div>
      </div>
    `,
  });

  console.log('SkillBridge verification email accepted by SMTP:', {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  return info;
}

function getBaseMailHtml({ title, eyebrow = 'SkillBridge', children }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#060b19;color:#e5e7eb;padding:32px;">
      <div style="max-width:620px;margin:0 auto;background:#0f172a;border:1px solid #273449;border-radius:24px;padding:28px;">
        <p style="margin:0 0 12px;color:#a5b4fc;text-transform:uppercase;letter-spacing:3px;font-size:12px;">${eyebrow}</p>
        <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;">${title}</h1>
        ${children}
      </div>
    </div>
  `;
}

function getSafeText(value = '') {
  return String(value).replace(/[<>&"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
  }[character]));
}

export async function sendFreelancerInquiryEmail({ to, freelancerName, inquiry }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from,
    to,
    replyTo: inquiry.email,
    subject: `New SkillBridge inquiry: ${inquiry.subject}`,
    text: [
      `Hi ${freelancerName || 'there'},`,
      '',
      `You received a new inquiry from ${inquiry.name} (${inquiry.email}).`,
      '',
      `Subject: ${inquiry.subject}`,
      '',
      inquiry.message,
      '',
      'Reply directly to this email to contact the client.',
    ].join('\n'),
    html: getBaseMailHtml({
      title: 'New freelancer inquiry',
      children: `
        <p style="line-height:1.6;color:#cbd5e1;">Hi ${getSafeText(freelancerName || 'there')}, ${getSafeText(inquiry.name)} sent you a new SkillBridge inquiry.</p>
        <div style="margin:20px 0;padding:18px;border-radius:18px;background:#111827;border:1px solid #374151;">
          <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">From</p>
          <p style="margin:0;color:#ffffff;font-weight:700;">${getSafeText(inquiry.name)} &lt;${getSafeText(inquiry.email)}&gt;</p>
          <p style="margin:18px 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Subject</p>
          <p style="margin:0;color:#ffffff;">${getSafeText(inquiry.subject)}</p>
          <p style="margin:18px 0 8px;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Message</p>
          <p style="margin:0;white-space:pre-line;line-height:1.7;color:#dbeafe;">${getSafeText(inquiry.message)}</p>
        </div>
        <p style="line-height:1.6;color:#94a3b8;font-size:14px;">Reply to this email to contact the client.</p>
      `,
    }),
  });

  console.log('SkillBridge inquiry email accepted by SMTP:', {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  return info;
}

export async function sendChatNotificationEmail({ to, recipientName, senderName, freelancerName, message }) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject: `New SkillBridge chat message from ${senderName}`,
    text: [
      `Hi ${recipientName || 'there'},`,
      '',
      `${senderName} sent you a new chat message about ${freelancerName}.`,
      '',
      message,
      '',
      'Log in to SkillBridge to reply.',
    ].join('\n'),
    html: getBaseMailHtml({
      title: 'New chat message',
      children: `
        <p style="line-height:1.6;color:#cbd5e1;">Hi ${getSafeText(recipientName || 'there')}, ${getSafeText(senderName)} sent you a new message about ${getSafeText(freelancerName)}.</p>
        <div style="margin:20px 0;padding:18px;border-radius:18px;background:#111827;border:1px solid #374151;">
          <p style="margin:0;white-space:pre-line;line-height:1.7;color:#dbeafe;">${getSafeText(message)}</p>
        </div>
        <p style="line-height:1.6;color:#94a3b8;font-size:14px;">Log in to SkillBridge to reply from your chat inbox.</p>
      `,
    }),
  });

  console.log('SkillBridge chat email accepted by SMTP:', {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });

  return info;
}
