import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Users, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Response {
  name: string;
  availability: string[];
}

interface TimeSlot {
  id: string;
  date: Date;
  time: string;
}

interface ResultsViewProps {
  eventTitle: string;
  eventDescription: string;
  timeSlots: TimeSlot[];
  responses: Response[];
  isOrganizer?: boolean;
}

export default function ResultsView({
  eventTitle,
  eventDescription,
  timeSlots,
  responses,
  isOrganizer = false,
}: ResultsViewProps) {
  const getAvailabilityCount = (slotId: string) => {
    return responses.filter(r => r.availability.includes(slotId)).length;
  };

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: slot.date,
        slots: []
      };
    }
    acc[dateKey].slots.push(slot);
    return acc;
  }, {} as Record<string, { date: Date; slots: TimeSlot[] }>);

  const maxAvailable = Math.max(...timeSlots.map(slot => getAvailabilityCount(slot.id)), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="results-view">
      <Card data-testid="card-event-header">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2" data-testid="text-event-title">
                <Calendar className="w-5 h-5" />
                {eventTitle}
              </CardTitle>
              {eventDescription && (
                <CardDescription data-testid="text-event-description">
                  {eventDescription}
                </CardDescription>
              )}
            </div>
            {isOrganizer && (
              <Button variant="outline" data-testid="button-edit">
                Edit Event
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span data-testid="text-response-count">{responses.length} responses</span>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-availability-grid">
        <CardHeader>
          <CardTitle data-testid="text-grid-title">Availability Overview</CardTitle>
          <CardDescription data-testid="text-grid-description">
            Green indicates more people are available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.values(groupedSlots).map(({ date, slots }) => (
              <div key={format(date, 'yyyy-MM-dd')} className="space-y-3" data-testid={`date-section-${format(date, 'yyyy-MM-dd')}`}>
                <h4 className="font-medium" data-testid={`text-date-${format(date, 'yyyy-MM-dd')}`}>
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot) => {
                    const count = getAvailabilityCount(slot.id);
                    const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0;
                    const isTopChoice = count === maxAvailable && count > 0;

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-lg border ${
                          isTopChoice
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        data-testid={`slot-${slot.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium" data-testid={`text-time-${slot.id}`}>
                            {slot.time}
                          </span>
                          {isTopChoice && (
                            <Badge variant="default" data-testid={`badge-top-${slot.id}`}>
                              Best
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span data-testid={`text-count-${slot.id}`}>
                            {count} / {responses.length}
                          </span>
                          <span data-testid={`text-percentage-${slot.id}`}>
                            ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                            data-testid={`progress-${slot.id}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-responses">
        <CardHeader>
          <CardTitle data-testid="text-responses-title">Individual Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-responses">
                No responses yet. Share the event link to get started!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-responses">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium" data-testid="header-name">
                        Name
                      </th>
                      {timeSlots.map((slot) => (
                        <th
                          key={slot.id}
                          className="text-center py-3 px-2 font-medium text-sm"
                          data-testid={`header-slot-${slot.id}`}
                        >
                          <div>{format(slot.date, 'MMM d')}</div>
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
                              <Check className="w-5 h-5 text-primary mx-auto" data-testid={`check-${index}-${slot.id}`} />
                            ) : (
                              <X className="w-5 h-5 text-muted-foreground/30 mx-auto" data-testid={`x-${index}-${slot.id}`} />
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

      <div className="flex justify-center">
        <Button data-testid="button-add-response">
          Add Your Availability
        </Button>
      </div>
    </div>
  );
}
