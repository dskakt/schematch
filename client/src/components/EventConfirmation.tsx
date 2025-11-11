import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Copy, Mail, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventConfirmationProps {
  eventId: string;
  eventTitle: string;
  participantLink: string;
  organizerLink: string;
}

export default function EventConfirmation({
  eventId,
  eventTitle,
  participantLink,
  organizerLink,
}: EventConfirmationProps) {
  const [copiedParticipant, setCopiedParticipant] = useState(false);
  const [copiedOrganizer, setCopiedOrganizer] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: 'participant' | 'organizer') => {
    navigator.clipboard.writeText(text);
    if (type === 'participant') {
      setCopiedParticipant(true);
      setTimeout(() => setCopiedParticipant(false), 2000);
    } else {
      setCopiedOrganizer(true);
      setTimeout(() => setCopiedOrganizer(false), 2000);
    }
    toast({
      title: "コピーしました",
      description: `${type === 'participant' ? '参加者用' : '主催者用'}リンクをクリップボードにコピーしました`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="confirmation-container">
      <Card className="border-primary/20 bg-primary/5" data-testid="card-success">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" data-testid="icon-success" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2" data-testid="text-success-title">
                イベントを作成しました！
              </h2>
              <p className="text-muted-foreground" data-testid="text-success-message">
                イベント「{eventTitle}」を共有できます
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-participant-link">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-participant-title">
            <LinkIcon className="w-5 h-5" />
            参加者用リンク
          </CardTitle>
          <CardDescription data-testid="text-participant-description">
            このリンクを参加者に送信してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={participantLink}
              readOnly
              data-testid="input-participant-link"
            />
            <Button
              onClick={() => copyToClipboard(participantLink, 'participant')}
              variant="outline"
              data-testid="button-copy-participant"
            >
              {copiedParticipant ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-organizer-link">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-organizer-title">
            <Mail className="w-5 h-5" />
            主催者用集計結果リンク
          </CardTitle>
          <CardDescription data-testid="text-organizer-description">
            回答状況を確認できます（メールで送信されます）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={organizerLink}
              readOnly
              data-testid="input-organizer-link"
            />
            <Button
              onClick={() => copyToClipboard(organizerLink, 'organizer')}
              variant="outline"
              data-testid="button-copy-organizer"
            >
              {copiedOrganizer ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-email-sent">
            このリンクを含む確認メールがメールアドレスに送信されました
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
