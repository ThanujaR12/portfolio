import "server-only";

// Contact delivery via Resend's free tier (research.md R8), using its REST API directly.
// Without a key, development logs the message; production reports that email isn't set up
// so a visitor's message is never silently dropped.

export type ContactEmail = { name: string; email: string; message: string };

export class EmailNotConfigured extends Error {}

export async function sendContactEmail({ name, email, message }: ContactEmail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`contact (not sent, no RESEND_API_KEY): ${name} <${email}>: ${message}`);
      return;
    }
    throw new EmailNotConfigured("RESEND_API_KEY / CONTACT_TO_EMAIL missing");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>\nSent from your portfolio contact form.`,
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}
