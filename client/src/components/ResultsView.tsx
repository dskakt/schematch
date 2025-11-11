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

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="results-view">
      <Card data-testid="card-event-header">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-event-title">
            <Calendar className="w-5 h-5" />
            {eventTitle}
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
                      <th className="text-left py-3 px-4 font-medium" data-testid="header-name">
                        名前
                      </th>
                      {timeSlots.map((slot) => (
                        <th
                          key={slot.id}
                          className="text-center py-3 px-2 font-medium text-sm"
                          data-testid={`header-slot-${slot.id}`}
                        >
                          <div>{format(slot.date, 'M月d日', { locale: ja })}</div>
                          <div className="text-xs text-muted-foreground">{slot.time}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response, index) => (
                      <tr key={index} className="border-b" data-testid={`row-${index}`}>
                        <td className="py-3 px-4 font-medium" data-testid={`name-${index}`}>
                          {response.name}
                        </td>
                        {timeSlots.map((slot) => (
                          <td
                            key={slot.id}
                            className="text-center py-3 px-2"
                            data-testid={`cell-${index}-${slot.id}`}
                          >
                            {response.availability.includes(slot.id) ? (
                              <span className="text-xl text-primary font-bold" data-testid={`available-${index}-${slot.id}`}>
                                ○
                              </span>
                            ) : (
                              <span className="text-xl text-muted-foreground/30 font-bold" data-testid={`unavailable-${index}-${slot.id}`}>
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
