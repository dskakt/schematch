import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import EventConfirmation from "@/components/EventConfirmation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { CalendarDays, Mail, CalendarCheck } from "lucide-react";

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<
    { date: Date; time: string }[]
  >([]);
  const [createdEvent, setCreatedEvent] = useState<{
    eventId: string;
    eventTitle: string;
    participantLink: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !email || selectedSlots.length === 0) return;

    setIsCreating(true);

    try {
      const flattenedSlots = selectedSlots.map((slot) => ({
        date: format(slot.date, "yyyy-MM-dd"),
        time: slot.time,
      }));

      const res = await apiRequest("POST", "/api/events", {
        title,
        organizerEmail: email,
        timeSlots: flattenedSlots,
        origin: window.location.origin,
      });

      const response = (await res.json()) as {
        event: { id: string; title: string; shortId: string };
        editToken: string;
      };

      const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin;
      const participantLink = `${baseUrl}/e/${response.event.shortId}`;

      setCreatedEvent({
        eventId: response.event.id,
        eventTitle: response.event.title,
        participantLink,
      });

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (createdEvent) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col"
        data-testid="page-create-event"
      >
        <Header />
        <main className="py-12 px-6 flex-1">
          <div className="max-w-5xl mx-auto">
            <EventConfirmation
              eventId={createdEvent.eventId}
              eventTitle={createdEvent.eventTitle}
              participantLink={createdEvent.participantLink}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-testid="page-create-event"
    >
      <Header />
      <main className="pt-4 pb-12 px-4 md:px-6 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <div className="flex justify-center mb-2">
              <img 
                src="/favicon.svg" 
                alt="スケマッチ！" 
                width="64"
                height="64"
                className="w-16 h-16" 
                data-testid="logo-schematch" 
              />
            </div>
            <p
              className="text-lg text-[#171717] font-semibold"
              data-testid="text-page-tagline"
            >
              登録不要・仕事も飲み会もカンタン日程調整
            </p>
            <p
              className="text-muted-foreground text-[18px]"
              data-testid="text-feature-no-input"
            >面倒な時間帯の手入力は不要！</p>
            <p
              className="text-muted-foreground text-[18px]"
              data-testid="text-email-notice"
            >回答があるたびにメールでお知らせ！</p>
            <p
              className="text-muted-foreground text-[18px]"
              data-testid="text-feature-results"
            >スマホでも使いやすい！</p>
          </div>
          <Card>
            <CardContent className="pt-6 bg-blue-50 dark:bg-blue-950/30">
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div className="space-y-1 mb-6">
                  <h2
                    className="text-xl font-semibold"
                    data-testid="text-form-heading"
                  >
                    日程調整を始めよう！
                  </h2>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="text-form-description"
                  >
                    以下の順番で入力してください
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-lg font-semibold flex items-center gap-2"
                      data-testid="label-title"
                    >
                      Step 1
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                      イベント名
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例: チームミーティング"
                      required
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-lg font-semibold flex items-center gap-2"
                      data-testid="label-email"
                    >
                      Step 2
                      <Mail className="h-5 w-5 text-blue-600" />
                      メールアドレス（主催者）
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="organizer@example.com"
                      required
                      data-testid="input-email"
                    />
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid="text-email-description"
                    >
                      参加者に送るリンクや集計結果を送信します
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3
                      className="text-lg font-semibold flex items-center gap-2"
                      data-testid="text-time-selection-title"
                    >
                      Step 3
                      <CalendarCheck className="h-5 w-5 text-blue-600" />
                      候補日時を選択
                    </h3>
                    <p
                      className="text-sm text-muted-foreground mt-1"
                      data-testid="text-time-selection-description"
                    >
                      カレンダーをクリックして、候補となる日時を選択してください。　時間を指定しない場合は、
                      <strong>「時間指定なし」</strong>の行を選択してください。
                    </p>
                  </div>

                  <WeeklyCalendar
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                    mode="create"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    type="submit"
                    disabled={selectedSlots.length === 0 || isCreating}
                    className="w-full"
                    data-testid="button-create"
                  >
                    {isCreating ? "作成中..." : "イベントを作成"}
                  </Button>
                  <p
                    className="text-xs text-center text-muted-foreground"
                    data-testid="text-data-retention"
                  >
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
