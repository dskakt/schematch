import { Resend } from 'resend';

interface SendOrganizerEmailParams {
  organizerEmail: string;
  eventTitle: string;
  eventId: string;
  participantLink: string;
  resultsLink: string;
}

interface SendResponseNotificationParams {
  organizerEmail: string;
  eventTitle: string;
  participantNames: string[];
  resultsLink: string;
}

interface SendPollOrganizerEmailParams {
  organizerEmail: string;
  pollTitle: string;
  pollId: string;
  participantLink: string;
  resultsLink: string;
}

interface SendVoteNotificationParams {
  organizerEmail: string;
  pollTitle: string;
  voterNames: string[];
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
      <p>スケマッチ！をご利用いただきありがとうございます！</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">参加者用リンク</h3>
        <p style="margin: 10px 0;">このリンクを参加者に送信してください：</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${participantLink}" style="color: #2563eb;">${participantLink}</a>
        </p>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
        入力したデータはすべて１年後に自動的に削除されます。
      </p>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log("\n=== 主催者へのメール (開発モード) ===");
    console.log(`宛先: ${organizerEmail}`);
    console.log(`件名: イベント「${eventTitle}」を作成しました`);
    console.log("\n--- メール内容 ---");
    console.log(`
イベント: ${eventTitle}

参加者用リンク:
${participantLink}
    `);
    console.log("=========================\n");
    console.log("ℹ️  実際のメール送信を有効にするには、RESEND_API_KEY環境変数を設定してください。");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'スケマッチ！ <onboarding@resend.dev>',
      to: organizerEmail,
      subject: `イベント「${eventTitle}」を作成しました`,
      html: emailContent,
    });
    
    console.log(`✅ Email sent successfully to ${organizerEmail}`);
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    throw error;
  }
}

export async function sendResponseNotification({
  organizerEmail,
  eventTitle,
  participantNames,
  resultsLink,
}: SendResponseNotificationParams): Promise<void> {
  const participantList = participantNames.map(name => `<li style="margin: 5px 0;">${name}</li>`).join('');
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>イベント「<strong>${eventTitle}</strong>」に新しい回答がありました。</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">回答済み参加者（${participantNames.length}名）</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${participantList}
        </ul>
      </div>
      
      <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">集計結果リンク</h3>
        <p style="margin: 10px 0;">回答状況を確認できます：</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${resultsLink}" style="color: #2563eb;">${resultsLink}</a>
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px;">このメールはスケマッチ！から自動送信されています。</p>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
        入力したデータはすべて１年後に自動的に削除されます。
      </p>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log("\n=== 参加者回答通知メール (開発モード) ===");
    console.log(`宛先: ${organizerEmail}`);
    console.log(`件名: ${eventTitle} - 新しい回答が届きました`);
    console.log("\n--- メール内容 ---");
    console.log(`
イベント: ${eventTitle}
回答済み参加者 (${participantNames.length}名):
${participantNames.map((name, i) => `  ${i + 1}. ${name}`).join('\n')}

集計結果リンク:
${resultsLink}
    `);
    console.log("=========================\n");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'スケマッチ！ <onboarding@resend.dev>',
      to: organizerEmail,
      subject: `${eventTitle} - 新しい回答が届きました`,
      html: emailContent,
    });
    
    console.log(`✅ Response notification email sent to ${organizerEmail}`);
  } catch (error) {
    console.error("Failed to send response notification email:", error);
    throw error;
  }
}

// ソレマッチ用のメール通知関数

export async function sendPollOrganizerEmail({
  organizerEmail,
  pollTitle,
  pollId,
  participantLink,
  resultsLink,
}: SendPollOrganizerEmailParams): Promise<void> {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>ソレマッチをご利用いただきありがとうございます！</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">投票タイトル</h3>
        <p style="margin: 10px 0; font-size: 18px; font-weight: bold; color: #16a34a;">${pollTitle}</p>
      </div>
      
      <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">投票用リンク</h3>
        <p style="margin: 10px 0;">このリンクを参加者に送信してください：</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${participantLink}" style="color: #16a34a;">${participantLink}</a>
        </p>
      </div>
      
      <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">集計結果リンク</h3>
        <p style="margin: 10px 0;">投票状況を確認できます：</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${resultsLink}" style="color: #16a34a;">${resultsLink}</a>
        </p>
      </div>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
        入力したデータはすべて１年後に自動的に削除されます。
      </p>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log("\n=== 投票主催者へのメール (開発モード) ===");
    console.log(`宛先: ${organizerEmail}`);
    console.log(`件名: 投票「${pollTitle}」を作成しました`);
    console.log("\n--- メール内容 ---");
    console.log(`
投票: ${pollTitle}

投票用リンク:
${participantLink}

集計結果リンク:
${resultsLink}
    `);
    console.log("=========================\n");
    console.log("ℹ️  実際のメール送信を有効にするには、RESEND_API_KEY環境変数を設定してください。");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'ソレマッチ <onboarding@resend.dev>',
      to: organizerEmail,
      subject: `投票「${pollTitle}」を作成しました`,
      html: emailContent,
    });
    
    console.log(`✅ Poll organizer email sent successfully to ${organizerEmail}`);
  } catch (error) {
    console.error("Failed to send poll organizer email via Resend:", error);
    throw error;
  }
}

export async function sendVoteNotification({
  organizerEmail,
  pollTitle,
  voterNames,
  resultsLink,
}: SendVoteNotificationParams): Promise<void> {
  const voterList = voterNames.map(name => `<li style="margin: 5px 0;">${name}</li>`).join('');
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>投票「<strong>${pollTitle}</strong>」に新しい投票がありました。</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">投票済み参加者（${voterNames.length}名）</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${voterList}
        </ul>
      </div>
      
      <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #555;">集計結果リンク</h3>
        <p style="margin: 10px 0;">投票状況を確認できます：</p>
        <p style="word-break: break-all; background-color: white; padding: 10px; border-radius: 4px;">
          <a href="${resultsLink}" style="color: #16a34a;">${resultsLink}</a>
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px;">このメールはソレマッチから自動送信されています。</p>
      
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #e5e5e5; padding-top: 20px;">
        入力したデータはすべて１年後に自動的に削除されます。
      </p>
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.log("\n=== 投票通知メール (開発モード) ===");
    console.log(`宛先: ${organizerEmail}`);
    console.log(`件名: ${pollTitle} - 新しい投票が届きました`);
    console.log("\n--- メール内容 ---");
    console.log(`
投票: ${pollTitle}
投票済み参加者 (${voterNames.length}名):
${voterNames.map((name, i) => `  ${i + 1}. ${name}`).join('\n')}

集計結果リンク:
${resultsLink}
    `);
    console.log("=========================\n");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    
    await resend.emails.send({
      from: 'ソレマッチ <onboarding@resend.dev>',
      to: organizerEmail,
      subject: `${pollTitle} - 新しい投票が届きました`,
      html: emailContent,
    });
    
    console.log(`✅ Vote notification email sent to ${organizerEmail}`);
  } catch (error) {
    console.error("Failed to send vote notification email:", error);
    throw error;
  }
}
