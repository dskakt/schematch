import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyCalendarProps {
  selectedSlots: { date: Date; time: string }[];
  onSlotsChange: (slots: { date: Date; time: string }[]) => void;
  mode?: "create" | "respond";
  availableSlots?: { date: Date; time: string }[];
}

const TIMES = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"
];

const getInitialWeekStart = (
  mode: "create" | "respond",
  availableSlots: { date: Date; time: string }[],
  selectedSlots: { date: Date; time: string }[]
) => {
  const slotsToCheck = mode === "respond" ? availableSlots : selectedSlots;
  
  if (slotsToCheck.length > 0) {
    const earliestSlot = slotsToCheck.reduce((earliest, slot) =>
      slot.date < earliest.date ? slot : earliest
    );
    return startOfWeek(earliestSlot.date, { weekStartsOn: 0 });
  }
  
  return startOfWeek(new Date(), { weekStartsOn: 0 });
};

export default function WeeklyCalendar({
  selectedSlots,
  onSlotsChange,
  mode = "create",
  availableSlots = []
}: WeeklyCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => 
    getInitialWeekStart(mode, availableSlots, selectedSlots)
  );

  useEffect(() => {
    setWeekStart(getInitialWeekStart(mode, availableSlots, selectedSlots));
  }, [mode, availableSlots.length, selectedSlots.length]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const isSlotSelected = (date: Date, time: string) => {
    return selectedSlots.some(
      slot => isSameDay(slot.date, date) && slot.time === time
    );
  };

  const isSlotAvailable = (date: Date, time: string) => {
    if (mode === "create") return true;
    return availableSlots.some(
      slot => isSameDay(slot.date, date) && slot.time === time
    );
  };

  const toggleSlot = (date: Date, time: string) => {
    if (mode === "respond" && !isSlotAvailable(date, time)) return;

    const isSelected = isSlotSelected(date, time);
    if (isSelected) {
      onSlotsChange(
        selectedSlots.filter(
          slot => !(isSameDay(slot.date, date) && slot.time === time)
        )
      );
    } else {
      onSlotsChange([...selectedSlots, { date, time }]);
    }
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

  return (
    <div className="space-y-4" data-testid="weekly-calendar">
      <div className="flex items-center justify-between gap-3">
        <Button
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
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="bg-muted p-2 text-center"
                data-testid={`header-day-${format(day, 'yyyy-MM-dd')}`}
              >
                <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                <div className="font-medium">{format(day, 'd')}</div>
              </div>
            ))}

            {TIMES.map((time) => (
              <div key={time} className="contents">
                <div
                  className="bg-background p-2 text-sm text-muted-foreground text-center sticky left-0 z-10 flex items-center justify-center"
                  data-testid={`time-label-${time.replace(/[:\s]/g, '-')}`}
                >
                  {time}
                </div>
                {weekDays.map((day) => {
                  const selected = isSlotSelected(day, time);
                  const available = isSlotAvailable(day, time);
                  const isDisabled = mode === "respond" && !available;

                  return (
                    <button
                      key={`${day.toISOString()}-${time}`}
                      onClick={() => toggleSlot(day, time)}
                      disabled={isDisabled}
                      className={`
                        bg-background p-2 min-h-[40px] transition-colors
                        ${!isDisabled && 'hover-elevate cursor-pointer'}
                        ${selected && 'bg-primary text-primary-foreground'}
                        ${isDisabled && 'opacity-30 cursor-not-allowed'}
                        ${!selected && !isDisabled && available && mode === "respond" && 'bg-primary/10'}
                      `}
                      data-testid={`slot-${format(day, 'yyyy-MM-dd')}-${time.replace(/[:\s]/g, '-')}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {mode === "respond" && (
        <div className="text-sm text-muted-foreground text-center">
          Click on the available time slots to mark your availability
        </div>
      )}
    </div>
  );
}
