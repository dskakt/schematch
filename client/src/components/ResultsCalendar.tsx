import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface TimeSlot {
  id: string;
  date: Date;
  time: string;
}

interface Response {
  name: string;
  availability: string[];
}

interface ResultsCalendarProps {
  timeSlots: TimeSlot[];
  responses: Response[];
}

const TIMES = [
  "8:00-8:30 AM", "8:30-9:00 AM", "9:00-9:30 AM", "9:30-10:00 AM", "10:00-10:30 AM", "10:30-11:00 AM",
  "11:00-11:30 AM", "11:30 AM-12:00 PM", "12:00-12:30 PM", "12:30-1:00 PM", "1:00-1:30 PM", "1:30-2:00 PM",
  "2:00-2:30 PM", "2:30-3:00 PM", "3:00-3:30 PM", "3:30-4:00 PM", "4:00-4:30 PM", "4:30-5:00 PM",
  "5:00-5:30 PM", "5:30-6:00 PM", "6:00-6:30 PM", "6:30-7:00 PM", "7:00-7:30 PM", "7:30-8:00 PM"
];

const getInitialWeekStart = (timeSlots: TimeSlot[]) => {
  if (timeSlots.length > 0) {
    const earliestSlot = timeSlots.reduce((earliest, slot) =>
      slot.date < earliest.date ? slot : earliest
    );
    return startOfWeek(earliestSlot.date, { weekStartsOn: 0 });
  }
  return startOfWeek(new Date(), { weekStartsOn: 0 });
};

export default function ResultsCalendar({ timeSlots, responses }: ResultsCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => getInitialWeekStart(timeSlots));

  useEffect(() => {
    setWeekStart(getInitialWeekStart(timeSlots));
  }, [timeSlots.length]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getSlotAtDateTime = (date: Date, time: string) => {
    return timeSlots.find(
      slot => isSameDay(slot.date, date) && slot.time === time
    );
  };

  const getAvailabilityCount = (slotId: string | undefined) => {
    if (!slotId) return 0;
    return responses.filter(r => r.availability.includes(slotId)).length;
  };

  const goToPreviousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  const goToThisWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const totalResponses = responses.length;
  const maxCount = Math.max(...timeSlots.map(s => getAvailabilityCount(s.id)), 0);

  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-background";
    if (totalResponses === 0) return "bg-background";
    
    const percentage = count / totalResponses;
    if (count === maxCount && maxCount > 0) {
      return "bg-green-500 text-white";
    } else if (percentage >= 0.75) {
      return "bg-green-400 text-white";
    } else if (percentage >= 0.5) {
      return "bg-green-300 text-gray-900";
    } else if (percentage >= 0.25) {
      return "bg-green-200 text-gray-900";
    } else {
      return "bg-green-100 text-gray-900";
    }
  };

  return (
    <div className="space-y-4" data-testid="results-calendar">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          data-testid="button-prev-week"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <div className="text-center">
          <div className="font-medium" data-testid="text-week-range">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goToThisWeek}
            className="text-xs"
            data-testid="button-this-week"
          >
            This Week
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          data-testid="button-next-week"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-px bg-border rounded-lg overflow-hidden" style={{ gridTemplateColumns: "80px repeat(7, minmax(80px, 1fr))" }}>
            <div className="bg-muted p-2 font-medium text-sm text-center sticky left-0 z-10" data-testid="header-time">
              Time
            </div>
            {weekDays.map((day, index) => {
              const isSunday = index === 0;
              const isSaturday = index === 6;
              return (
                <div
                  key={day.toISOString()}
                  className="bg-muted p-2 text-center"
                  data-testid={`header-day-${format(day, 'yyyy-MM-dd')}`}
                >
                  <div className={`text-xs ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={`font-medium ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}

            {TIMES.map((time) => (
              <div key={time} className="contents">
                <div
                  className="bg-background p-2 text-sm text-muted-foreground text-center sticky left-0 z-10 flex items-center justify-center"
                  data-testid={`time-label-${time.replace(/[:\s]/g, '-')}`}
                >
                  {time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const slot = getSlotAtDateTime(day, time);
                  const count = getAvailabilityCount(slot?.id);
                  const isSunday = dayIndex === 0;
                  const isSaturday = dayIndex === 6;
                  const hasSlot = !!slot;

                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className={`
                        p-2 min-h-[50px] transition-colors flex items-center justify-center font-medium
                        ${hasSlot ? getHeatColor(count) : (isSunday ? 'bg-red-50 dark:bg-red-950/20' : isSaturday ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-background')}
                      `}
                      data-testid={`slot-${format(day, 'yyyy-MM-dd')}-${time.replace(/[:\s]/g, '-')}`}
                    >
                      {hasSlot && (
                        <div className="text-center">
                          <div className="text-lg font-bold">{count}</div>
                          {totalResponses > 0 && (
                            <div className="text-xs opacity-90">
                              {Math.round((count / totalResponses) * 100)}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-muted-foreground">Best time</span>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Numbers show how many participants are available
        </div>
      </div>
    </div>
  );
}
