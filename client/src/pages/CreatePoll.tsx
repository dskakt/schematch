import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import type { Poll, PollOption } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Plus, X, Copy, Check } from "lucide-react";
import { Helmet } from "react-helmet-async";

const pollFormSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional(),
  organizerEmail: z.string().email("有効なメールアドレスを入力してください"),
  allowMultiple: z.boolean(),
});

type PollFormData = z.infer<typeof pollFormSchema>;

export default function CreatePoll() {
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [participantLink, setParticipantLink] = useState("");
  const [resultsLink, setResultsLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: "",
      description: "",
      organizerEmail: "",
      allowMultiple: false,
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; organizerEmail: string; allowMultiple: boolean; options: { text: string }[] }) => {
      const res = await apiRequest("POST", "/api/polls", { ...data, origin: window.location.origin });
      return await res.json();
    },
    onSuccess: (data: { poll: Poll; pollOptions: PollOption[]; participantLink: string; resultsLink: string }) => {
      setParticipantLink(data.participantLink);
      setResultsLink(data.resultsLink);
      setStep(3);
      toast({
        title: "投票を作成しました",
        description: "参加者に投票リンクを共有してください",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "投票の作成に失敗しました",
      });
    },
  });

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleNext = () => {
    if (step === 1) {
      form.trigger().then((isValid) => {
        if (isValid) {
          setStep(2);
        }
      });
    } else if (step === 2) {
      const validOptions = options.filter(opt => opt.trim() !== "");
      if (validOptions.length < 2) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: "選択肢は最低2つ必要です",
        });
        return;
      }
      
      const formData = form.getValues();
      createPollMutation.mutate({
        ...formData,
        options: validOptions.map(text => ({ text })),
      });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(participantLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "コピーしました",
      description: "リンクをクリップボードにコピーしました",
    });
  };

  return (
    <>
      <Helmet>
        <title>ソレマッチ！ - 簡単投票ツール | 無料オンライン投票</title>
        <meta name="description" content="登録不要で簡単に投票を作成・共有できます。イベント、会議、グループの意思決定に最適な無料投票ツール" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container max-w-3xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--sorematch-primary))' }}>
              ソレマッチ！
            </h1>
            <p className="text-muted-foreground">登録不要・簡単投票マッチング！</p>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>① 投票情報を入力</CardTitle>
                <CardDescription>投票のタイトルとあなたのメールアドレスを入力してください</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(() => handleNext())} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>投票タイトル</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="例: 忘年会の日程" 
                              {...field}
                              data-testid="input-poll-title"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>説明（任意）</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="投票の説明を入力してください" 
                              {...field}
                              data-testid="input-poll-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>メールアドレス</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="your@email.com" 
                              {...field}
                              data-testid="input-organizer-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allowMultiple"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-allow-multiple"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>複数選択を許可する</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      style={{ 
                        backgroundColor: 'hsl(var(--sorematch-primary))',
                        color: 'hsl(var(--sorematch-primary-foreground))',
                        borderColor: 'hsl(var(--sorematch-primary-border))'
                      }}
                      data-testid="button-next-step"
                    >
                      次へ
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>② 選択肢を入力</CardTitle>
                <CardDescription>投票の選択肢を追加してください（最低2つ）</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`選択肢 ${index + 1}`}
                      data-testid={`input-option-${index}`}
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        data-testid={`button-remove-option-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                  data-testid="button-add-option"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  選択肢を追加
                </Button>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    data-testid="button-back"
                  >
                    戻る
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={createPollMutation.isPending}
                    className="flex-1"
                    style={{ 
                      backgroundColor: 'hsl(var(--sorematch-primary))',
                      color: 'hsl(var(--sorematch-primary-foreground))',
                      borderColor: 'hsl(var(--sorematch-primary-border))'
                    }}
                    data-testid="button-create-poll"
                  >
                    {createPollMutation.isPending ? "作成中..." : "投票を作成"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle style={{ color: 'hsl(var(--sorematch-primary))' }}>
                  投票を作成しました！
                </CardTitle>
                <CardDescription>参加者に以下のリンクを共有してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">参加用リンク</label>
                  <div className="flex gap-2">
                    <Input
                      value={participantLink}
                      readOnly
                      data-testid="text-participant-link"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyLink}
                      data-testid="button-copy-link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">結果確認用リンク</label>
                  <Input
                    value={resultsLink}
                    readOnly
                    data-testid="text-results-link"
                  />
                </div>

                <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                  <p>✉️ 入力したメールアドレスにもリンクを送信しました</p>
                </div>

                <Button
                  onClick={() => {
                    form.reset();
                    setOptions(["", ""]);
                    setStep(1);
                  }}
                  variant="outline"
                  className="w-full"
                  data-testid="button-create-another"
                >
                  新しい投票を作成
                </Button>
              </CardContent>
            </Card>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
