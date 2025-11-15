import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface Poll {
  id: string;
  title: string;
  description?: string | null;
  shortId: string;
}

interface PollOption {
  id: string;
  pollId: string;
  optionText: string;
}

interface Vote {
  id: string;
  pollId: string;
  voterName: string;
  selectedOptionId: string;
}

export default function PollResultsPage() {
  const params = useParams();
  const pollId = params.id;

  const { data: pollData, isLoading: isPollLoading } = useQuery<Poll>({
    queryKey: ["/api/polls", pollId],
    enabled: !!pollId,
  });

  const { data: optionsData, isLoading: isOptionsLoading } = useQuery<PollOption[]>({
    queryKey: ["/api/polls", pollId, "options"],
    enabled: !!pollId,
  });

  const { data: votesData, isLoading: isVotesLoading } = useQuery<Vote[]>({
    queryKey: ["/api/polls", pollId, "votes"],
    enabled: !!pollId,
  });

  const isLoading = isPollLoading || isOptionsLoading || isVotesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="page-poll-results">
        <Header />
        <main className="py-12 px-4 md:px-6 flex-1">
          <div className="max-w-4xl mx-auto text-center">
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
      <div className="min-h-screen bg-background flex flex-col" data-testid="page-poll-results">
        <Header />
        <main className="py-12 px-4 md:px-6 flex-1">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">投票が見つかりません</h2>
            <p className="text-muted-foreground">お探しの投票は存在しません。</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const votes = votesData || [];
  const totalVotes = votes.length;

  const votesByOption = optionsData.map(option => {
    const optionVotes = votes.filter(vote => vote.selectedOptionId === option.id);
    const percentage = totalVotes > 0 ? (optionVotes.length / totalVotes) * 100 : 0;
    return {
      option,
      votes: optionVotes,
      count: optionVotes.length,
      percentage,
    };
  });

  votesByOption.sort((a, b) => b.count - a.count);

  const handleShare = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
    const shareUrl = `${baseUrl}/poll/${pollId}`;
    
    if (navigator.share) {
      navigator.share({
        title: pollData.title,
        text: `${pollData.title}に投票してください`,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        alert("リンクをコピーしました！");
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("リンクをコピーしました！");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-poll-results">
      <Header />
      <main className="pt-4 pb-12 px-4 md:px-6 flex-1">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="mb-2" data-testid="text-poll-title">
                    {pollData.title}
                  </CardTitle>
                  {pollData.description && (
                    <p className="text-muted-foreground text-sm" data-testid="text-poll-description">
                      {pollData.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  data-testid="button-share"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  共有
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground" data-testid="text-total-votes">
                総投票数: <span className="font-semibold">{totalVotes}</span>票
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {votesByOption.map((item, index) => (
              <Card key={item.option.id} data-testid={`result-option-${index}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" data-testid={`text-option-${index}`}>
                      {item.option.optionText}
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-2xl font-bold" data-testid={`text-count-${index}`}>
                        {item.count}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-percentage-${index}`}>
                        {item.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-3">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {item.votes.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">投票者:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.votes.map((vote, voteIndex) => (
                          <span
                            key={vote.id}
                            className="text-sm bg-muted px-3 py-1 rounded-full"
                            data-testid={`voter-${index}-${voteIndex}`}
                          >
                            {vote.voterName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {totalVotes === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">まだ投票がありません</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
