import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import { normalizeTimeSlot } from "@shared/timeUtils";
import { format } from "date-fns";
import { Calendar, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface TimeSlot {
  id?: string;
  date: Date;
  time: string;
}

interface ParticipantResponseProps {
  eventId: string;
  eventTitle: string;
  timeSlots: TimeSlot[];
  onSubmit: (data: { name: string; availability: string[]; notes?: string }) => void;
  isSubmitting: boolean;
}

export default function ParticipantResponse({
  eventId,
  eventTitle,
  timeSlots,
  onSubmit,
  isSubmitting,
}: ParticipantResponseProps) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<{ date: Date; time: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slotIds = selectedSlots.map(selected => {
      const normalizedSelectedTime = normalizeTimeSlot(selected.time);
      const matchingSlot = timeSlots.find(
        slot =>
          format(slot.date, 'yyyy-MM-dd') === format(selected.date, 'yyyy-MM-dd') &&
          normalizeTimeSlot(slot.time) === normalizedSelectedTime
      );
      return matchingSlot?.id || '';
    }).filter(Boolean);

    onSubmit({ name, availability: slotIds, notes: notes.trim() || undefined });
  };

  const availableSlots = timeSlots.map(slot => ({
    date: slot.date,
    time: slot.time,
  }));

  // すべてのスロットが「時間指定なし」かどうかをチェック
  const allSlotsNoTime = timeSlots.every(slot => slot.time === "時間指定なし");

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="participant-response">
      <Card data-testid="card-event-info">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-event-title">
            <Calendar className="w-5 h-5" />
            {eventTitle}の日程調整
          </CardTitle>
        </CardHeader>
      </Card>

      <Card data-testid="card-response-form">
        <CardHeader>
          <CardTitle data-testid="text-form-title">回答フォーム</CardTitle>
          <CardDescription data-testid="text-form-description">
            以下の順番で入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold" data-testid="label-name">
                ① お名前
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="お名前を入力"
                required
                data-testid="input-name"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                ② 参加可能な日時を選択
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                参加できる日時をクリックしてください
              </p>
              <div className="flex items-center justify-center gap-4 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
                  <span className="text-muted-foreground">候補日時</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded flex items-center justify-center text-xs text-primary-foreground">○</div>
                  <span className="text-muted-foreground">あなたの参加可能な日時</span>
                </div>
              </div>

              {allSlotsNoTime ? (
                <MonthlyCalendar
                  selectedSlots={selectedSlots}
                  onSlotsChange={setSelectedSlots}
                  mode="respond"
                  availableSlots={availableSlots}
                />
              ) : (
                <WeeklyCalendar
                  selectedSlots={selectedSlots}
                  onSlotsChange={setSelectedSlots}
                  mode="respond"
                  availableSlots={availableSlots}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold" data-testid="label-notes">
                備考（任意）
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="コメントや希望などを入力してください..."
                rows={3}
                data-testid="input-notes"
              />
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex gap-3">
                <Link href={`/event/${eventId}/results`}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    data-testid="button-view-results"
                  >
                    回答せず集計結果を見る
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className={`flex-1 gap-2 transition-all ${isSubmitting ? 'opacity-60 scale-95' : ''}`}
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "送信中…" : "回答を送信"}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground" data-testid="text-data-retention">
                入力したデータはすべて１年後に自動的に削除されます。
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
