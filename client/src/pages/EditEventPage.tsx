import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { normalizeTimeSlot } from "@shared/timeUtils";
import { format } from "date-fns";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
}

interface Event {
  id: string;
  title: string;
  organizerEmail: string;
}

export default function EditEventPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const eventId = params.id;
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [title, setTitle] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<{ date: Date; time: string }[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, isLoading, error } = useQuery<{ event: Event; timeSlots: TimeSlot[] }>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  useEffect(() => {
    if (data) {
      setTitle(data.event.title);
      const slots = data.timeSlots.map(slot => ({
        date: new Date(slot.date),
        time: slot.time,
      }));
      setSelectedSlots(slots);
    }
  }, [data]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-edit-event">
        <Header />
        <main className="py-12 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">アクセス拒否</h2>
            <p className="text-muted-foreground">
              このページには編集トークンが必要です。確認メールのリンクを使用してください。
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-edit-event">
        <Header />
        <main className="py-12 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-edit-event">
        <Header />
        <main className="py-12 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">イベントが見つかりません</h2>
            <p className="text-muted-foreground">お探しのイベントは存在しません。</p>
          </div>
        </main>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSlots.length === 0) {
      toast({
        title: "エラー",
        description: "少なくとも1つの候補日時を選択してください。",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      const timeSlots = selectedSlots.map(slot => ({
        date: format(slot.date, 'yyyy-MM-dd'),
        time: slot.time,
      }));

      await apiRequest("PUT", `/api/events/${eventId}`, {
        title,
        timeSlots,
        editToken: token,
      });

      toast({
        title: "成功",
        description: "イベントを更新しました。",
      });

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
    } catch (error) {
      console.error("Failed to update event:", error);
      toast({
        title: "エラー",
        description: "イベントの更新に失敗しました。",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-edit-event">
      <Header />
      <main className="py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">イベントを編集</h1>
            <p className="text-muted-foreground">
              イベント詳細と候補日時を更新
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" data-testid="label-title">イベント名</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例：チームミーティング"
                      required
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" data-testid="label-email">主催者メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.event.organizerEmail}
                      disabled
                      data-testid="input-email"
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold" data-testid="text-time-selection-title">
                      候補日時を選択
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1" data-testid="text-time-selection-description">
                      カレンダーをクリックして候補日時を選択してください。時間を指定しない場合は、<strong>「時間指定なし」</strong>の行を選択してください。
                    </p>
                  </div>

                  <WeeklyCalendar
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                    mode="create"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/event/${eventId}/results`)}
                    className="flex-1"
                    data-testid="button-view-results"
                  >
                    集計結果を見る
                  </Button>
                  <Button
                    type="submit"
                    disabled={selectedSlots.length === 0 || isUpdating}
                    className="flex-1"
                    data-testid="button-update"
                  >
                    {isUpdating ? "更新中..." : "イベントを更新"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
