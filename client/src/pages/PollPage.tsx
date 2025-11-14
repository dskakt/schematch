import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Poll, PollOption, Vote } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

const voteFormSchema = z.object({
  voterName: z.string().min(1, "お名前を入力してください"),
  selectedOptionIds: z.array(z.string()).min(1, "最低1つ選択してください"),
});

type VoteFormData = z.infer<typeof voteFormSchema>;

export default function PollPage() {
  const [, params] = useRoute("/sorematch/poll/:id");
  const pollId = params?.id;
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: poll, isLoading: pollLoading } = useQuery<Poll>({
    queryKey: ['/api/polls', pollId],
    enabled: !!pollId,
  });

  const { data: options = [], isLoading: optionsLoading } = useQuery<PollOption[]>({
    queryKey: ['/api/polls', pollId, 'options'],
    enabled: !!pollId,
  });

  const form = useForm<VoteFormData>({
    resolver: zodResolver(voteFormSchema),
    defaultValues: {
      voterName: "",
      selectedOptionIds: [],
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (data: { voterName: string; selectedOptionIds: string[] }) => {
      const res = await apiRequest("POST", `/api/polls/${pollId}/votes`, { ...data, origin: window.location.origin });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/polls', pollId, 'votes'] });
      setSubmitted(true);
      toast({
        title: "投票しました",
        description: "投票ありがとうございました",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error.message || "投票に失敗しました",
      });
    },
  });

  const onSubmit = (data: VoteFormData) => {
    voteMutation.mutate(data);
  };

  if (pollLoading || optionsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(var(--sorematch-primary))' }} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container max-w-3xl mx-auto px-4 md:px-6 py-8">
          <Card>
            <CardHeader>
              <CardTitle>投票が見つかりません</CardTitle>
              <CardDescription>指定された投票は存在しないか、削除された可能性があります</CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{poll.title} | ソレマッチ！</title>
        <meta name="description" content={poll.description || "投票に参加してください"} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container max-w-3xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--sorematch-primary))' }}>
              ソレマッチ！
            </h1>
            <p className="text-sm text-muted-foreground">登録不要・簡単投票マッチング！</p>
          </div>

          {submitted ? (
            <Card>
              <CardHeader>
                <CardTitle style={{ color: 'hsl(var(--sorematch-primary))' }}>
                  投票を受け付けました！
                </CardTitle>
                <CardDescription>投票ありがとうございました</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    主催者に投票結果が通知されました
                  </p>
                  <Button
                    onClick={() => window.location.href = `/sorematch/poll/${pollId}/results`}
                    style={{ 
                      backgroundColor: 'hsl(var(--sorematch-primary))',
                      color: 'hsl(var(--sorematch-primary-foreground))',
                      borderColor: 'hsl(var(--sorematch-primary-border))'
                    }}
                    data-testid="button-view-results"
                  >
                    結果を見る
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription>{poll.description}</CardDescription>
                )}
                <CardDescription className="mt-2">
                  {poll.allowMultiple ? "複数選択可" : "単一選択"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="voterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>お名前</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="山田太郎" 
                              {...field}
                              data-testid="input-voter-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="selectedOptionIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>選択してください</FormLabel>
                          <FormControl>
                            {poll.allowMultiple ? (
                              <div className="space-y-3">
                                {options.map((option: any) => (
                                  <div key={option.id} className="flex items-center space-x-3">
                                    <Checkbox
                                      checked={field.value.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, option.id]);
                                        } else {
                                          field.onChange(field.value.filter((id) => id !== option.id));
                                        }
                                      }}
                                      data-testid={`checkbox-option-${option.id}`}
                                    />
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      {option.text}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <RadioGroup
                                value={field.value[0] || ""}
                                onValueChange={(value) => field.onChange([value])}
                              >
                                {options.map((option: any) => (
                                  <div key={option.id} className="flex items-center space-x-3">
                                    <RadioGroupItem 
                                      value={option.id}
                                      data-testid={`radio-option-${option.id}`}
                                    />
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      {option.text}
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={voteMutation.isPending}
                      style={{ 
                        backgroundColor: 'hsl(var(--sorematch-primary))',
                        color: 'hsl(var(--sorematch-primary-foreground))',
                        borderColor: 'hsl(var(--sorematch-primary-border))'
                      }}
                      data-testid="button-submit-vote"
                    >
                      {voteMutation.isPending ? "送信中..." : "投票する"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
