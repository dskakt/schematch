import { Resend } from 'resend';

interface SendOrganizerEmailParams {
  organizerEmail: string;
  eventTitle: string;
  eventId: string;
  participantLink: string;
  editLink: string;
}

export async function sendOrganizerEmail({
  organizerEmail,
  eventTitle,
  eventId,
  participantLink,
  editLink,
}: SendOrganizerEmailParams): Promise<void> {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Your MeetSync Event "${eventTitle}" has been created</h2>
      
      <p>Hi there,</p>
      
      <p>Your scheduling event has been successfully created. Here are your event links:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Participant Link</h3>
        <p style="margin: 10px 0;">Share this link with people you want to invite:</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${participantLink}" style="color: #2563eb;">${participantLink}</a>
        </p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">Edit Link (Organizer Only)</h3>
        <p style="margin: 10px 0;">Use this link to edit your event or view results:</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${editLink}" style="color: #2563eb;">${editLink}</a>
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 10px;">
          ⚠️ Keep this link private. Anyone with this link can edit your event.
        </p>
      </div>
      
      <p>Thank you for using MeetSync!</p>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log("\n=== Email to Organizer (Development Mode) ===");
    console.log(`To: ${organizerEmail}`);
    console.log(`Subject: Your MeetSync Event "${eventTitle}" has been created`);
    console.log("\n--- Email Content ---");
    console.log(`
Event: ${eventTitle}

Participant Link:
${participantLink}

Edit Link (Organizer Only):
${editLink}

⚠️ Keep the edit link private. Anyone with this link can edit your event.
    `);
    console.log("=========================\n");
    console.log("ℹ️  To enable actual email sending, set the RESEND_API_KEY environment variable.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'MeetSync <onboarding@resend.dev>',
      to: organizerEmail,
      subject: `Your MeetSync Event "${eventTitle}" has been created`,
      html: emailContent,
    });
    
    console.log(`✅ Email sent successfully to ${organizerEmail}`);
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
}
