import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { X, Plus } from "lucide-react";

export default function CreatePoll() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [createdPoll, setCreatedPoll] = useState<{
    pollId: string;
    pollTitle: string;
    participantLink: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  投票を作成しました！
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    投票タイトル
                  </Label>
                  <p className="text-lg font-medium" data-testid="text-poll-title">
                    {createdPoll.pollTitle}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>参加者用リンク</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={createdPoll.participantLink}
                      className="flex-1"
                      data-testid="input-participant-link"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(createdPoll.participantLink);
                        alert("リンクをコピーしました！");
                      }}
                      data-testid="button-copy-link"
                    >
                      コピー
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    このリンクを参加者に共有してください
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setLocation(`/poll/${createdPoll.pollId}/results`)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-view-results"
                  >
                    結果を見る
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                    data-testid="button-create-another"
                  >
                    新しい投票を作成
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <p
              className="text-lg text-muted-foreground"
              data-testid="text-page-tagline"
            >
              登録不要・シンプル投票アプリ
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">投票を作成</CardTitle>
              <p className="text-sm text-muted-foreground text-center mt-2">
                以下の順番で入力してください
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePoll} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[18px] font-semibold">
                    ① 投票タイトル
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
                  <Label htmlFor="description" className="text-[14px] font-medium">説明（任意）</Label>
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
                  <Label htmlFor="email" className="text-[18px] font-semibold">② メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                  <p className="text-sm text-muted-foreground">
                    投票結果の通知を受け取るメールアドレス
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[18px] font-semibold">④ 選択肢を入力</Label>
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

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isCreating}
                  data-testid="button-submit"
                >
                  {isCreating ? "作成中..." : "投票を作成"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
