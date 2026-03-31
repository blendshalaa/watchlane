import { Resend } from "resend";
import { config } from "../utils/config";
import { DiffResult } from "./diff.service";

const resend = new Resend(config.RESEND_API_KEY);

export async function sendChangeAlert(
    recipientEmail: string,
    url: string,
    label: string | null,
    diffResult: DiffResult
): Promise<void> {
    const displayName = label ?? url;

    const subject = `🔔 Watchlane: Change detected on ${displayName}`;

    const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a2e;">🔔 Content Change Detected</h2>
      <p>Watchlane detected changes on a page you're monitoring:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 12px; background: #f0f0f5; font-weight: 600;">URL</td>
          <td style="padding: 8px 12px; background: #f0f0f5;">
            <a href="${url}" style="color: #4361ee;">${url}</a>
          </td>
        </tr>
        ${label ? `<tr><td style="padding: 8px 12px; font-weight: 600;">Label</td><td style="padding: 8px 12px;">${label}</td></tr>` : ""}
        <tr>
          <td style="padding: 8px 12px; background: #f0f0f5; font-weight: 600;">Lines Added</td>
          <td style="padding: 8px 12px; background: #f0f0f5; color: #2d6a4f;">+${diffResult.addedLines}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600;">Lines Removed</td>
          <td style="padding: 8px 12px; color: #e63946;">-${diffResult.removedLines}</td>
        </tr>
      </table>

      <h3 style="color: #1a1a2e;">Diff Preview</h3>
      <pre style="background: #1a1a2e; color: #e0e0e0; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 12px; line-height: 1.5;">${escapeHtml(diffResult.patch.substring(0, 3000))}${diffResult.patch.length > 3000 ? "\n\n... (diff truncated)" : ""}</pre>

      <p style="color: #888; font-size: 12px; margin-top: 24px;">
        — Watchlane Competitor Monitoring
      </p>
    </div>
  `;

    try {
        await resend.emails.send({
            from: config.RESEND_FROM_EMAIL,
            to: recipientEmail,
            subject,
            html: htmlBody,
        });

        console.log(`[Email] Change alert sent to ${recipientEmail} for ${url}`);
    } catch (error) {
        console.error(`[Email] Failed to send alert to ${recipientEmail}:`, error);
    }
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
