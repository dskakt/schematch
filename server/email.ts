import { Resend } from 'resend';

interface SendOrganizerEmailParams {
  organizerEmail: string;
  eventTitle: string;
  eventId: string;
  participantLink: string;
  resultsLink: string;
}

export async function sendOrganizerEmail({
  organizerEmail,
  eventTitle,
  eventId,
  participantLink,
  resultsLink,
}: SendOrganizerEmailParams): Promise<void> {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">スケマッチ イベント「${eventTitle}」を作成しました</h2>
      
      <p>スケマッチをご利用いただきありがとうございます！</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">参加者用リンク</h3>
        <p style="margin: 10px 0;">このリンクを参加者に送信してください：</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${participantLink}" style="color: #2563eb;">${participantLink}</a>
        </p>
      </div>
      
      <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">結果ページ</h3>
        <p style="margin: 10px 0;">回答状況を確認できます：</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${resultsLink}" style="color: #2563eb;">${resultsLink}</a>
        </p>
      </div>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log("\n=== 主催者へのメール (開発モード) ===");
    console.log(`宛先: ${organizerEmail}`);
    console.log(`件名: スケマッチ イベント「${eventTitle}」を作成しました`);
    console.log("\n--- メール内容 ---");
    console.log(`
イベント: ${eventTitle}

参加者用リンク:
${participantLink}

結果ページ:
${resultsLink}
    `);
    console.log("=========================\n");
    console.log("ℹ️  実際のメール送信を有効にするには、RESEND_API_KEY環境変数を設定してください。");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'スケマッチ <onboarding@resend.dev>',
      to: organizerEmail,
      subject: `スケマッチ イベント「${eventTitle}」を作成しました`,
      html: emailContent,
    });
    
    console.log(`✅ Email sent successfully to ${organizerEmail}`);
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
}
