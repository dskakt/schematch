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

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<{ date: Date; time: string }[]>([]);
  const [createdEvent, setCreatedEvent] = useState<{
    eventId: string;
    eventTitle: string;
    participantLink: string;
    organizerLink: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !email || selectedSlots.length === 0) return;
    
    setIsCreating(true);
    
    try {
      const flattenedSlots = selectedSlots.map(slot => ({
        date: format(slot.date, 'yyyy-MM-dd'),
        time: slot.time,
      }));

      const res = await apiRequest("POST", "/api/events", {
        title,
        organizerEmail: email,
        timeSlots: flattenedSlots,
        origin: window.location.origin,
      });
      
      const response = await res.json() as { event: { id: string; title: string }; editToken: string };

      const participantLink = `${window.location.origin}/event/${response.event.id}`;
      const organizerLink = `${window.location.origin}/event/${response.event.id}/results`;

      setCreatedEvent({
        eventId: response.event.id,
        eventTitle: response.event.title,
        participantLink,
        organizerLink,
      });
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (createdEvent) {
    return (
      <div className="min-h-screen bg-background flex flex-col" data-testid="page-create-event">
        <Header />
        <main className="py-12 px-6 flex-1">
          <div className="max-w-5xl mx-auto">
            <EventConfirmation
              eventId={createdEvent.eventId}
              eventTitle={createdEvent.eventTitle}
              participantLink={createdEvent.participantLink}
              organizerLink={createdEvent.organizerLink}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-create-event">
      <Header />
      <main className="py-12 px-6 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-lg text-muted-foreground" data-testid="text-page-tagline">登録不要・秒でスケジュールマッチング！</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg font-semibold" data-testid="label-title">イベント名</Label>
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
                    <Label htmlFor="email" className="text-lg font-semibold" data-testid="label-email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="organizer@example.com"
                      required
                      data-testid="input-email"
                    />
                    <p className="text-sm text-muted-foreground" data-testid="text-email-description">
                      参加者に送るリンクや集計結果を送信します
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold" data-testid="text-time-selection-title">
                      候補日時を選択
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1" data-testid="text-time-selection-description">
                      カレンダーをクリックして、候補となる日時を選択してください。複数選択できます。
                    </p>
                  </div>

                  <WeeklyCalendar
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                    mode="create"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={selectedSlots.length === 0 || isCreating}
                  className="w-full"
                  data-testid="button-create"
                >
                  {isCreating ? "作成中..." : "イベントを作成"}
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
