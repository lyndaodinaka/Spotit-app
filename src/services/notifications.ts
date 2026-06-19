export async function notifyAccessRequest(input: {
  fullName: string;
  email: string;
  roleRequested?: string;
  organisation?: string;
  message?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.ACCESS_REQUEST_OWNER_EMAIL || process.env.ADMIN_EMAIL || "lynda.chidi@medholic.net";
  const fromEmail = process.env.ACCESS_REQUEST_FROM_EMAIL || "Spotit Access <onboarding@resend.dev>";

  if (!apiKey || !ownerEmail) {
    return { sent: false, reason: "email notification not configured" };
  }

  const lines = [
    `Name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Role: ${input.roleRequested || "Not provided"}`,
    `Organisation: ${input.organisation || "Not provided"}`,
    "",
    input.message || "No message provided."
  ];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: ownerEmail,
      subject: "New Spotit access request",
      text: lines.join("\n")
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Email provider rejected the request");
    throw new Error(errorText);
  }

  return { sent: true };
}
