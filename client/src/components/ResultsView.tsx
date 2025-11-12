import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, Users } from "lucide-react";
import ResultsCalendar from "./ResultsCalendar";

interface Response {
  name: string;
  availability: string[];
  notes?: string;
}

interface TimeSlot {
  id: string;
  date: Date;
  time: string;
}

interface ResultsViewProps {
  eventTitle: string;
  timeSlots: TimeSlot[];
  responses: Response[];
  isOrganizer?: boolean;
}

export default function ResultsView({
  eventTitle,
  timeSlots,
  responses,
  isOrganizer = false,
}: ResultsViewProps) {
  // Convert time string (e.g., "8:00-8:30 AM" or "11:30 AM-12:00 PM" or "1:00-1:30 PM") to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    // Match the first time
    const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (!match) {
      console.warn('Could not parse time string:', timeStr);
      return Number.POSITIVE_INFINITY; // Push unparseable slots to the end
    }
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    
    // Look for AM/PM marker anywhere in the string after the first time
    // If there's only one AM/PM marker (e.g., "1:00-1:30 PM"), it applies to both times
    // If there are two (e.g., "11:30 AM-12:00 PM"), use the first one
    const afterFirstTime = timeStr.substring(match[0].length);
    const firstPeriodMatch = afterFirstTime.match(/([AP]M)/i);
    const period = firstPeriodMatch ? firstPeriodMatch[1].toUpperCase() : null;
    
    // Handle AM/PM
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  // Sort time slots by date first, then by time
  const sortedTimeSlots = [...timeSlots].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    
    // If dates are the same, sort by time (convert to minutes for proper numeric comparison)
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="results-view">
      <Card data-testid="card-event-header">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-event-title">
            <Calendar className="w-5 h-5" />
            {eventTitle}の集計結果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span data-testid="text-response-count">{responses.length}件の回答</span>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-availability-grid">
        <CardHeader>
          <CardTitle data-testid="text-grid-title">参加可能人数</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsCalendar timeSlots={timeSlots} responses={responses} />
        </CardContent>
      </Card>

      <Card data-testid="card-responses">
        <CardHeader>
          <CardTitle data-testid="text-responses-title">個別の回答</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-responses">
                まだ回答がありません。イベントリンクを共有してください！
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-responses">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium" data-testid="header-time">
                        日時
                      </th>
                      {responses.map((response, index) => (
                        <th
                          key={index}
                          className="text-left py-3 px-4 font-medium text-sm"
                          data-testid={`header-name-${index}`}
                        >
                          {response.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTimeSlots.map((slot) => (
                      <tr key={slot.id} className="border-b" data-testid={`row-slot-${slot.id}`}>
                        <td className="py-3 px-4 font-medium" data-testid={`time-${slot.id}`}>
                          <div>{format(slot.date, 'M月d日（E）', { locale: ja })}</div>
                          <div className="text-xs text-muted-foreground">{slot.time}</div>
                        </td>
                        {responses.map((response, index) => (
                          <td
                            key={index}
                            className="text-left py-3 px-4"
                            data-testid={`cell-${slot.id}-${index}`}
                          >
                            {response.availability.includes(slot.id) ? (
                              <span className="text-xl text-primary font-bold" data-testid={`available-${slot.id}-${index}`}>
                                ○
                              </span>
                            ) : (
                              <span className="text-xl text-muted-foreground/30 font-bold" data-testid={`unavailable-${slot.id}-${index}`}>
                                ×
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {responses.some(r => r.notes) && (
        <Card data-testid="card-notes">
          <CardHeader>
            <CardTitle data-testid="text-notes-title">参加者の備考</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {responses.filter(r => r.notes).map((response, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2" data-testid={`note-${index}`}>
                  <div className="font-medium mb-1" data-testid={`note-name-${index}`}>
                    {response.name}
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid={`note-text-${index}`}>
                    {response.notes}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
