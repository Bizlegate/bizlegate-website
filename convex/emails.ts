"use node";

import escapeHtml from "escape-html";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// Sends transactional email via Resend's HTTP API (https://resend.com).
// Replaces the old Hercules-hosted email service so this keeps working
// independently of any Hercules subscription. Set RESEND_API_KEY as a Convex
// environment variable (Resend dashboard -> API Keys).
async function sendEmail(params: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set in Convex environment variables.");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      reply_to: params.replyTo,
      subject: params.subject,
      html: params.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}

// Owner address that receives new inquiry notifications. This is a separate
// setting from SENDER_EMAIL below: SENDER_EMAIL is the "from" address (must
// be on a domain verified in Resend), while OWNER_EMAIL is just where
// notifications land — it can be any inbox you actually check, and does not
// need to be on the bizlegate.com domain at all.
const OWNER_EMAIL = "bizlegate@gmail.com";
// Verified sender domain in Resend. Update this once a different sender is
// verified in the Emails tab.
const SENDER_EMAIL = "concierge@bizlegate.com";

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#64748b;vertical-align:top;white-space:nowrap;">${escapeHtml(
        label,
      )}</td>
      <td style="padding:8px 12px;font-size:14px;color:#0A1B2A;">${value}</td>
    </tr>`;
}

export const sendInquiryNotification = internalAction({
  args: {
    fullName: v.string(),
    organization: v.string(),
    title: v.string(),
    email: v.string(),
    linkedinUrl: v.optional(v.string()),
    arrivalDate: v.optional(v.string()),
    departureDate: v.optional(v.string()),
    dateFlexible: v.optional(v.boolean()),
    partySize: v.optional(v.number()),
    interests: v.array(v.string()),
    objectives: v.string(),
  },
  handler: async (_ctx, args) => {
    const interestsText =
      args.interests.length > 0
        ? args.interests.map((i) => escapeHtml(i)).join(", ")
        : "—";
    const dates =
      args.arrivalDate || args.departureDate
        ? `${escapeHtml(args.arrivalDate ?? "?")} → ${escapeHtml(
            args.departureDate ?? "?",
          )}${args.dateFlexible ? " (flexible)" : ""}`
        : "Not specified";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:#0A1B2A;padding:24px 28px;border-radius:8px 8px 0 0;">
          <h1 style="margin:0;color:#C5A059;font-size:20px;">New Inquiry — Bizlegate</h1>
          <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">A prospective client has submitted the intake form.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
          ${row("Name", escapeHtml(args.fullName))}
          ${row("Organization", escapeHtml(args.organization))}
          ${row("Title", escapeHtml(args.title))}
          ${row("Email", `<a href="mailto:${escapeHtml(args.email)}" style="color:#0A1B2A;">${escapeHtml(args.email)}</a>`)}
          ${
            args.linkedinUrl
              ? row(
                  "LinkedIn",
                  `<a href="${escapeHtml(args.linkedinUrl)}" style="color:#0A1B2A;">${escapeHtml(args.linkedinUrl)}</a>`,
                )
              : ""
          }
          ${row("Travel dates", dates)}
          ${row("Party size", args.partySize ? String(args.partySize) : "Not specified")}
          ${row("Interests", interestsText)}
          ${row("Objectives", escapeHtml(args.objectives).replace(/\n/g, "<br/>"))}
        </table>
      </div>
    `;

    try {
      await sendEmail({
        from: SENDER_EMAIL,
        to: OWNER_EMAIL,
        replyTo: args.email,
        subject: `New inquiry from ${args.fullName} — ${args.organization}`,
        html,
      });
    } catch (error) {
      // Do not fail the submission if email delivery fails; the record is saved.
      console.error("Failed to send inquiry notification email:", error);
    }
  },
});

const QUIZ_RESULT_TITLES: Record<string, string> = {
  A: "The Slow Burn",
  B: "Off the Radar",
  C: "Running on Empty",
  D: "Not Yet Entrenched",
};

export const sendQuizLeadNotification = internalAction({
  args: {
    email: v.string(),
    resultType: v.string(),
    answers: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    const resultLabel = `${args.resultType} — ${
      QUIZ_RESULT_TITLES[args.resultType] ?? "Unknown"
    }`;
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:#0A1B2A;padding:24px 28px;border-radius:8px 8px 0 0;">
          <h1 style="margin:0;color:#C5A059;font-size:20px;">New Quiz Lead — Be the Outsmarter</h1>
          <p style="margin:6px 0 0;color:#cbd5e1;font-size:13px;">Someone completed the Office Politics Self-Diagnostic on /book.</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
          ${row("Email", `<a href="mailto:${escapeHtml(args.email)}" style="color:#0A1B2A;">${escapeHtml(args.email)}</a>`)}
          ${row("Result", escapeHtml(resultLabel))}
          ${row("Answers", escapeHtml(args.answers.join(", ")))}
        </table>
      </div>
    `;

    try {
      await sendEmail({
        from: SENDER_EMAIL,
        to: OWNER_EMAIL,
        replyTo: args.email,
        subject: `New quiz lead (${resultLabel})`,
        html,
      });
    } catch (error) {
      // Do not fail the submission if email delivery fails; the record is saved.
      console.error("Failed to send quiz lead notification email:", error);
    }
  },
});
