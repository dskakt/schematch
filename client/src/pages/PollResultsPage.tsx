import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Poll, PollOption, Vote } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function PollResultsPage() {
  const [, params] = useRoute("/sorematch/poll/:id/results");
  const pollId = params?.id;

  const { data: poll, isLoading: pollLoading } = useQuery<Poll>({
    queryKey: ['/api/polls', pollId],
    enabled: !!pollId,
  });

  const { data: options = [], isLoading: optionsLoading } = useQuery<PollOption[]>({
    queryKey: ['/api/polls', pollId, 'options'],
    enabled: !!pollId,
  });

  const { data: votes = [], isLoading: votesLoading } = useQuery<Vote[]>({
    queryKey: ['/api/polls', pollId, 'votes'],
    enabled: !!pollId,
  });

  if (pollLoading || optionsLoading || votesLoading) {
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

  // Calculate vote counts for each option
  interface VoteCount extends PollOption {
    count: number;
    percentage: number;
  }
  
  const voteCounts: VoteCount[] = options.map((option) => {
    const count = votes.filter((vote) => 
      vote.selectedOptionIds.includes(option.id)
    ).length;
    return {
      ...option,
      count,
      percentage: votes.length > 0 ? (count / votes.length) * 100 : 0,
    };
  });

  // Sort by vote count (descending)
  voteCounts.sort((a, b) => b.count - a.count);

  // Get voter details for each option
  const optionVoters = options.map((option) => {
    const voters = votes
      .filter((vote) => vote.selectedOptionIds.includes(option.id))
      .map((vote) => vote.voterName);
    return {
      optionId: option.id,
      voters,
    };
  });

  return (
    <>
      <Helmet>
        <title>{poll.title} - 結果 | ソレマッチ！</title>
        <meta name="description" content={`${poll.title}の投票結果を確認`} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container max-w-4xl mx-auto px-4 md:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--sorematch-primary))' }}>
              {poll.title}
            </h1>
            {poll.description && (
              <p className="text-muted-foreground">{poll.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              総投票数: {votes.length}名
            </p>
          </div>

          {votes.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>まだ投票がありません</CardTitle>
                <CardDescription>投票が集まり次第、ここに結果が表示されます</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>投票結果</CardTitle>
                  <CardDescription>各選択肢の得票数と割合</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {voteCounts.map((option: any) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.text}</span>
                        <span className="text-sm text-muted-foreground">
                          {option.count}票 ({option.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress 
                        value={option.percentage} 
                        className="h-3"
                        style={{
                          // @ts-ignore - CSS variable
                          '--progress-background': 'hsl(var(--sorematch-primary))',
                        }}
                        data-testid={`progress-option-${option.id}`}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {optionVoters
                          .find((ov: any) => ov.optionId === option.id)
                          ?.voters.map((voter: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: 'hsl(var(--sorematch-accent))',
                                color: 'hsl(var(--foreground))',
                              }}
                              data-testid={`badge-voter-${option.id}-${idx}`}
                            >
                              {voter}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>投票者一覧</CardTitle>
                  <CardDescription>投票してくれた方々</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {votes.map((vote: any, index: number) => (
                      <div
                        key={vote.id}
                        className="p-3 rounded-md border"
                        data-testid={`vote-item-${index}`}
                      >
                        <div className="font-medium mb-1">{vote.voterName}</div>
                        <div className="text-sm text-muted-foreground">
                          選択: {vote.selectedOptionIds.map((id: string) => {
                            const option = options.find((o: any) => o.id === id);
                            return option?.text;
                          }).filter(Boolean).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
