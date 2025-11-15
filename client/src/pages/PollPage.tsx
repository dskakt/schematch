import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BarChart3 } from "lucide-react";

interface Poll {
  id: string;
  title: string;
  description?: string | null;
  allowMultiple: string;
  shortId: string;
}

interface PollOption {
  id: string;
  pollId: string;
  optionText: string;
}

export default function PollPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const pollId = params.id;
  const [voterName, setVoterName] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  const { data: pollData, isLoading: isPollLoading } = useQuery<Poll>({
    queryKey: ["/api/polls", pollId],
    enabled: !!pollId,
  });

  const { data: optionsData, isLoading: isOptionsLoading } = useQuery<PollOption[]>({
    queryKey: ["/api/polls", pollId, "options"],
    enabled: !!pollId,
  });

  const submitVoteMutation = useMutation({
    mutationFn: async (voteData: { voterName: string; selectedOptionIds: string[] }) => {
      const res = await apiRequest("POST", `/api/polls/${pollId}/votes`, {
        voterName: voteData.voterName,
        selectedOptionIds: voteData.selectedOptionIds,
        origin: window.location.origin,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls", pollId, "votes"] });
      
      setLocation(`/poll/${pollId}/results`);
      
      setTimeout(() => {
        toast({
          title: "投票しました",
          description: "ご投票ありがとうございます。",
          duration: 1500,
        });
      }, 100);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "投票の送信に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptionIds([...selectedOptionIds, optionId]);
    } else {
      setSelectedOptionIds(selectedOptionIds.filter(id => id !== optionId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isMultiple = pollData?.allowMultiple === "true";
    const optionsToSubmit = isMultiple ? selectedOptionIds : [selectedOptionId];
    
    if (!voterName || optionsToSubmit.length === 0) {
      toast({
        title: "入力エラー",
        description: "名前と選択肢を入力してください。",
        variant: "destructive",
      });
      return;
    }

    submitVoteMutation.mutate({ voterName, selectedOptionIds: optionsToSubmit });
  };

  const isLoading = isPollLoading || isOptionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="page-poll">
        <Header />
        <main className="py-12 px-4 md:px-6 flex-1">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pollData || !optionsData) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="page-poll">
        <Header />
        <main className="py-12 px-4 md:px-6 flex-1">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">投票が見つかりません</h2>
            <p className="text-muted-foreground">お探しの投票は存在しません。</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-poll">
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
              <CardTitle className="text-center" data-testid="text-poll-title">
                {pollData.title}
              </CardTitle>
              {pollData.description && (
                <p className="text-muted-foreground text-center mt-2" data-testid="text-poll-description">
                  {pollData.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voter-name">お名前</Label>
                  <Input
                    id="voter-name"
                    placeholder="山田太郎"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    required
                    data-testid="input-voter-name"
                  />
                </div>

                <div className="space-y-3">
                  <Label>
                    選択肢を選んでください
                    {pollData.allowMultiple === "true" && (
                      <span className="text-sm text-muted-foreground ml-2">（複数選択可）</span>
                    )}
                  </Label>
                  
                  {pollData.allowMultiple === "true" ? (
                    <div className="space-y-2">
                      {optionsData.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 border rounded-lg p-4 hover-elevate active-elevate-2"
                          data-testid={`option-${option.id}`}
                        >
                          <Checkbox
                            id={option.id}
                            checked={selectedOptionIds.includes(option.id)}
                            onCheckedChange={(checked) => handleCheckboxChange(option.id, checked === true)}
                          />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer"
                          >
                            {option.optionText}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <RadioGroup
                      value={selectedOptionId}
                      onValueChange={setSelectedOptionId}
                    >
                      {optionsData.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 border rounded-lg p-4 hover-elevate active-elevate-2 cursor-pointer"
                          onClick={() => setSelectedOptionId(option.id)}
                          data-testid={`option-${option.id}`}
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label
                            htmlFor={option.id}
                            className="flex-1 cursor-pointer"
                          >
                            {option.optionText}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={submitVoteMutation.isPending}
                    data-testid="button-submit-vote"
                  >
                    {submitVoteMutation.isPending ? "送信中..." : "投票する"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/poll/${pollId}/results`)}
                    className="border-green-600 text-green-600 hover:bg-green-50"
                    data-testid="button-view-results"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    結果を見る
                  </Button>
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
