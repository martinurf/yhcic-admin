/* Inline-styled table layout on purpose — this renders in email
   clients, not a browser, so no external stylesheet, no flexbox/grid,
   no custom @font-face. System serif/sans stacks stand in for
   Fraunces/Inter; the brand still reads through color, the wordmark
   block, and the hairline rhythm. */

const INK = "#17131F";
const MUTED = "#6C6480";
const RULE = "#E4DFEC";
const PAPER = "#FBFAFC";
const PURPLE = "#78359F";
const PURPLE_DEEP = "#47217A";

function row(label, value) {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:10px 0;border-top:1px solid ${RULE};font:11px/1.4 -apple-system,Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};width:140px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;border-top:1px solid ${RULE};font:15px/1.5 Georgia,'Times New Roman',serif;color:${INK};vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function buildApplicationEmailHtml(data, applicationUrl) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:${PAPER};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
            <tr>
              <td style="padding-bottom:24px;">
                <span style="display:inline-block;background:${PURPLE_DEEP};color:#fff;font:600 14px/1 -apple-system,Helvetica,Arial,sans-serif;letter-spacing:.05em;padding:8px 12px;">YHCIC</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:4px;font:11px/1 -apple-system,Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:${PURPLE};">New membership application</td>
            </tr>
            <tr>
              <td style="padding-bottom:20px;font:26px/1.2 Georgia,'Times New Roman',serif;color:${INK};">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${row("Email", data.email)}
                  ${row("Graduation year", data.gradYear)}
                  ${row("Major", data.major)}
                  ${row("Heard about us via", data.referral)}
                  ${row("Phone", data.phone)}
                </table>
              </td>
            </tr>
            ${data.experience ? `
            <tr>
              <td style="padding-top:18px;font:11px/1 -apple-system,Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};">Previous experience</td>
            </tr>
            <tr>
              <td style="padding-top:8px;font:15px/1.6 Georgia,'Times New Roman',serif;color:${INK};">${escapeHtml(data.experience)}</td>
            </tr>` : ""}
            <tr>
              <td style="padding-top:32px;">
                <a href="${applicationUrl}" style="display:inline-block;background:${PURPLE};color:#fff;text-decoration:none;font:600 13px/1 -apple-system,Helvetica,Arial,sans-serif;letter-spacing:.03em;padding:13px 22px;">Review in the panel &rarr;</a>
              </td>
            </tr>
            <tr>
              <td style="padding-top:32px;border-top:1px solid ${RULE};margin-top:24px;">
                <p style="margin:24px 0 0;font:11px/1.5 -apple-system,Helvetica,Arial,sans-serif;color:${MUTED};">Young Harris College Investment Club — automated notice, no reply needed.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
