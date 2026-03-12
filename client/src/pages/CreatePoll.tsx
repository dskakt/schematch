import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus, Check, Copy, Link as LinkIcon, Vote, Mail, ListChecks } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

export default function CreatePoll() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [createdPoll, setCreatedPoll] = useState<{
    pollId: string;
    pollTitle: string;
    participantLink: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedParticipant, setCopiedParticipant] = useState(false);
  const { toast } = useToast();

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedParticipant(true);
    setTimeout(() => setCopiedParticipant(false), 2000);
    toast({
      title: "コピーしました",
      description: "参加者用リンクをクリップボードにコピーしました",
    });
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (!title || !email || validOptions.length < 2) {
      alert("投票のタイトル、メールアドレス、最低2つの選択肢を入力してください。");
      return;
    }

    setIsCreating(true);

    try {
      const res = await apiRequest("POST", "/api/polls", {
        title,
        description: description || undefined,
        organizerEmail: email,
        allowMultiple: allowMultiple ? "true" : "false",
        options: validOptions,
        origin: window.location.origin,
      });

      const response = (await res.json()) as {
        pollId: string;
        pollTitle: string;
        participantLink: string;
      };

      setCreatedPoll(response);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to create poll:", error);
      alert("投票の作成に失敗しました。もう一度お試しください。");
    } finally {
      setIsCreating(false);
    }
  };

  if (createdPoll) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col"
        data-testid="page-create-poll"
      >
        <Header />
        <main className="py-12 px-6 flex-1">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-green-600/20 bg-green-600/5" data-testid="card-success">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-600/10 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" data-testid="icon-success" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-2" data-testid="text-success-title">
                      投票を作成しました！
                    </h2>
                    <p className="text-muted-foreground" data-testid="text-success-message">
                      参加者にリンクを送って投票を開始しましょう！
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
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={createdPoll.participantLink}
                    readOnly
                    data-testid="input-participant-link"
                  />
                  <Button
                    onClick={() => copyToClipboard(createdPoll.participantLink)}
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
                
                <div className="flex justify-center pt-2">
                  <div className="p-4 bg-white rounded-lg border" data-testid="qrcode-container">
                    <QRCodeSVG 
                      value={createdPoll.participantLink}
                      size={200}
                      level="M"
                      data-testid="qrcode-participant"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  QRコードをスキャンしても参加できます
                </p>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center" data-testid="text-email-sent">
              参加者用リンクを含む確認メールがメールアドレスに送信されました
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-testid="page-create-poll"
    >
      <Header />
      <main className="pt-4 pb-12 px-4 md:px-6 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-2">
              <img 
                src="/sorematch-favicon.svg" 
                alt="ソレマッチ！" 
                width="64"
                height="64"
                className="w-16 h-16" 
                data-testid="logo-sorematch" 
              />
            </div>
            <p
              className="text-lg text-[#171717] font-semibold"
              data-testid="text-page-tagline"
            >登録不要・秒でシンプル投票</p>
          </div>

          <Card>
            <CardHeader className="bg-green-50 dark:bg-green-950/30">
              <CardTitle className="font-semibold tracking-tight text-left text-[20px]">投票を準備しよう！</CardTitle>
              <p className="text-sm text-muted-foreground mt-2 text-left">
                以下の順番で入力してください
              </p>
            </CardHeader>
            <CardContent className="bg-green-50 dark:bg-green-950/30">
              <form onSubmit={handleCreatePoll} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[18px] font-semibold flex items-center gap-2">
                    Step 1
                    <Vote className="h-5 w-5 text-green-600" />
                    投票タイトル
                  </Label>
                  <Input
                    id="title"
                    placeholder="例：次回の飲み会のお店を決めよう"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    data-testid="input-poll-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[14px] font-normal">説明（任意）</Label>
                  <Textarea
                    id="description"
                    placeholder="投票の詳細や補足情報があれば入力してください"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    data-testid="input-poll-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[18px] font-semibold flex items-center gap-2">
                    Step 2
                    <Mail className="h-5 w-5 text-green-600" />
                    メールアドレス（主催者）
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                  <p className="text-sm text-muted-foreground">参加者に送るリンクや投票結果を送信します</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[18px] font-semibold flex items-center gap-2">
                    Step 3
                    <ListChecks className="h-5 w-5 text-green-600" />
                    選択肢を入力
                  </Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`選択肢 ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        data-testid={`input-option-${index}`}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          data-testid={`button-remove-option-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOption}
                    className="w-full"
                    data-testid="button-add-option"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    選択肢を追加
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowMultiple"
                    checked={allowMultiple}
                    onCheckedChange={(checked) => setAllowMultiple(checked === true)}
                    data-testid="checkbox-allow-multiple"
                  />
                  <Label
                    htmlFor="allowMultiple"
                    className="text-sm font-normal cursor-pointer"
                  >
                    複数選択を許可する
                  </Label>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isCreating}
                    data-testid="button-submit"
                  >
                    {isCreating ? "作成中..." : "投票を作成"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center" data-testid="text-auto-delete-notice">
                    入力したデータはすべて１年後に自動的に削除されます。
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
