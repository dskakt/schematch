import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  options: z.array(z.object({ text: z.string() }))
    .min(2, "選択肢は最低2つ必要です")
    .superRefine((options, ctx) => {
      const validOptions = options.filter(opt => opt.text.trim() !== "");
      if (validOptions.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "選択肢は最低2つ必要です",
          path: [],
        });
      }
    }),
});

type PollFormData = z.infer<typeof pollFormSchema>;

export default function CreatePoll() {
  const [participantLink, setParticipantLink] = useState("");
  const [resultsLink, setResultsLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: "",
      description: "",
      organizerEmail: "",
      allowMultiple: false,
      options: [{ text: "" }, { text: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const createPollMutation = useMutation({
    mutationFn: async (data: PollFormData) => {
      const validOptions = data.options.filter(opt => opt.text.trim() !== "");
      const res = await apiRequest("POST", "/api/polls", { 
        ...data, 
        options: validOptions,
        origin: window.location.origin 
      });
      return await res.json();
    },
    onSuccess: (data: { poll: Poll; pollOptions: PollOption[]; participantLink: string; resultsLink: string }) => {
      setParticipantLink(data.participantLink);
      setResultsLink(data.resultsLink);
      setIsComplete(true);
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

  const onSubmit = (data: PollFormData) => {
    createPollMutation.mutate(data);
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

          {!isComplete && (
            <Card>
              <CardHeader>
                <CardTitle>投票を作成</CardTitle>
                <CardDescription>投票のタイトル、選択肢、メールアドレスを入力してください</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                    <div className="space-y-3 pt-2">
                      <FormLabel>選択肢（最低2つ）</FormLabel>
                      {fields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`options.${index}.text`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    {...inputField}
                                    placeholder={`選択肢 ${index + 1}`}
                                    data-testid={`input-option-${index}`}
                                  />
                                </FormControl>
                                {fields.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    data-testid={`button-remove-option-${index}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                      
                      {form.formState.errors.options && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.options.message}
                        </p>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ text: "" })}
                        className="w-full"
                        data-testid="button-add-option"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        選択肢を追加
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={createPollMutation.isPending}
                      className="w-full"
                      style={{ 
                        backgroundColor: 'hsl(var(--sorematch-primary))',
                        color: 'hsl(var(--sorematch-primary-foreground))',
                        borderColor: 'hsl(var(--sorematch-primary-border))'
                      }}
                      data-testid="button-create-poll"
                    >
                      {createPollMutation.isPending ? "作成中..." : "投票を作成"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {isComplete && (
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
                    setIsComplete(false);
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
