import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, parse, startOfDay, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeeklyCalendarProps {
  selectedSlots: { date: Date; time: string }[];
  onSlotsChange: (slots: { date: Date; time: string }[]) => void;
  mode?: "create" | "respond";
  availableSlots?: { date: Date; time: string }[];
}

const TIMES = [
  "時間指定なし",
  "8:00-8:30 AM", "8:30-9:00 AM", "9:00-9:30 AM", "9:30-10:00 AM", "10:00-10:30 AM", "10:30-11:00 AM",
  "11:00-11:30 AM", "11:30 AM-12:00 PM", "12:00-12:30 PM", "12:30-1:00 PM", "1:00-1:30 PM", "1:30-2:00 PM",
  "2:00-2:30 PM", "2:30-3:00 PM", "3:00-3:30 PM", "3:30-4:00 PM", "4:00-4:30 PM", "4:30-5:00 PM",
  "5:00-5:30 PM", "5:30-6:00 PM", "6:00-6:30 PM", "6:30-7:00 PM", "7:00-7:30 PM", "7:30-8:00 PM"
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

const getAllDaysToDisplay = (availableSlots: { date: Date; time: string }[]) => {
  if (availableSlots.length === 0) return [];
  
  const uniqueDates = Array.from(
    new Set(availableSlots.map(slot => startOfDay(slot.date).getTime()))
  )
    .map(time => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (uniqueDates.length === 0) return [];
  
  const startDate = startOfWeek(uniqueDates[0], { weekStartsOn: 0 });
  const endDate = addDays(startOfWeek(uniqueDates[uniqueDates.length - 1], { weekStartsOn: 0 }), 6);
  
  return eachDayOfInterval({ start: startDate, end: endDate });
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
    if (mode === "respond" && availableSlots.length > 0) {
      setWeekStart(getInitialWeekStart(mode, availableSlots, selectedSlots));
    }
  }, [mode, availableSlots.length]);

  const weekDays = mode === "respond" 
    ? getAllDaysToDisplay(availableSlots)
    : Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

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
    setWeekStart(addDays(weekStart, -14));
  };

  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 14));
  };

  const goToThisWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const isThisWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 0 }));

  return (
    <div className="space-y-4" data-testid="weekly-calendar">
      {mode === "create" && (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="w-4 h-4" />
            前の2週間
          </Button>
          <div className="text-center">
            <div className="font-medium" data-testid="text-week-range">
              {format(weekDays[0], 'M月d日')} - {format(weekDays[weekDays.length - 1], 'M月d日, yyyy年')}
            </div>
            {isThisWeek && (
              <Button
                type="button"
                variant="ghost"
                onClick={goToThisWeek}
                className="text-base font-medium hidden md:inline-flex"
                data-testid="button-this-week"
              >
                今週と来週
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            data-testid="button-next-week"
          >
            次の2週間
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="border rounded-lg bg-border overflow-hidden">
        <div className="overflow-auto max-h-[600px]">
          <div className="inline-block min-w-full">
            <div className="grid gap-px sm:hidden" style={{ gridTemplateColumns: `95px repeat(${weekDays.length}, minmax(32px, 1fr))` }}>
              <div className="bg-muted p-0 font-medium text-sm sticky left-0 top-0 z-20 relative" data-testid="header-time">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent calc(50% - 0.5px), hsl(var(--border)) calc(50% - 0.5px), hsl(var(--border)) calc(50% + 0.5px), transparent calc(50% + 0.5px))' }}></div>
                {weekDays.length > 0 && <span className="absolute top-1 right-1 text-base">{format(weekDays[0], 'M月')}</span>}
                <span className="absolute bottom-1 left-1 text-base">時間</span>
                <div className="h-[44px]"></div>
              </div>
              {weekDays.map((day, index) => {
                const isSunday = day.getDay() === 0;
                const isSaturday = day.getDay() === 6;
                return (
                  <div
                    key={day.toISOString()}
                    className="bg-muted p-1 text-center sticky top-0 z-10"
                    data-testid={`header-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className={`text-xs ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                      {format(day, 'E', { locale: ja })}
                    </div>
                    <div className={`text-sm font-medium ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {day.getDate() === 1 ? format(day, 'M月d日') : format(day, 'd日')}
                    </div>
                  </div>
                );
              })}

              {TIMES.map((time) => {
                const isHourMark = time.includes(':00-');
                const parts = time.split('-');
                return (
                <div key={time} className="contents">
                  <div
                    className="bg-background p-1 text-xs text-muted-foreground text-center sticky left-0 z-10 flex items-center justify-center whitespace-nowrap"
                    data-testid={`time-label-${time.replace(/[:\s]/g, '-')}`}
                  >
                    {isHourMark && parts.length === 2 ? (
                      <>
                        <span className="font-semibold">{parts[0]}</span>-{parts[1]}
                      </>
                    ) : time === "時間指定なし" ? (
                      <span className="font-semibold">{time}</span>
                    ) : (
                      time
                    )}
                  </div>
                {weekDays.map((day, dayIndex) => {
                  const selected = isSlotSelected(day, time);
                  const available = isSlotAvailable(day, time);
                  const isDisabled = mode === "respond" && !available;
                  const isSunday = day.getDay() === 0;
                  const isSaturday = day.getDay() === 6;

                  return (
                    <button
                      type="button"
                      key={`${day.toISOString()}-${time}`}
                      onClick={() => toggleSlot(day, time)}
                      disabled={isDisabled}
                      className={`
                        p-1 min-h-[28px] transition-colors flex items-center justify-center font-black text-2xl leading-none
                        ${mode === "respond" ? 'border border-white dark:border-white' : ''}
                        ${!isDisabled && 'hover-elevate cursor-pointer'}
                        ${selected && 'bg-primary text-primary-foreground border-primary'}
                        ${isDisabled && 'opacity-30 cursor-not-allowed'}
                        ${!selected && !isDisabled && available && mode === "respond" && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'}
                        ${!selected && !isDisabled && !available && mode === "respond" && 'bg-background'}
                        ${!selected && mode === "create" && (isSunday ? 'bg-red-50 dark:bg-red-950/20' : isSaturday ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-background')}
                      `}
                      data-testid={`slot-${format(day, 'yyyy-MM-dd')}-${time.replace(/[:\s]/g, '-')}`}
                    >
                      {selected && mode === "respond" && '○'}
                    </button>
                  );
                })}
              </div>
              );
            })}
            </div>
            <div className="hidden sm:grid gap-px" style={{ gridTemplateColumns: `115px repeat(${weekDays.length}, minmax(45px, 1fr))` }}>
              <div className="bg-muted p-0 font-medium text-sm sticky left-0 top-0 z-20 relative" data-testid="header-time">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent calc(50% - 0.5px), hsl(var(--border)) calc(50% - 0.5px), hsl(var(--border)) calc(50% + 0.5px), transparent calc(50% + 0.5px))' }}></div>
                {weekDays.length > 0 && <span className="absolute top-1 right-1 text-base">{format(weekDays[0], 'M月')}</span>}
                <span className="absolute bottom-1 left-1 text-base">時間</span>
                <div className="h-[44px]"></div>
              </div>
              {weekDays.map((day, index) => {
                const isSunday = day.getDay() === 0;
                const isSaturday = day.getDay() === 6;
                return (
                  <div
                    key={day.toISOString()}
                    className="bg-muted p-2 text-center sticky top-0 z-10"
                    data-testid={`header-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className={`text-xs ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                      {format(day, 'E', { locale: ja })}
                    </div>
                    <div className={`font-medium ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                      {day.getDate() === 1 ? format(day, 'M月d日') : format(day, 'd日')}
                    </div>
                  </div>
                );
              })}

              {TIMES.map((time) => {
                const isHourMark = time.includes(':00-');
                const parts = time.split('-');
                return (
                <div key={time} className="contents">
                  <div
                    className="bg-background p-1 text-xs text-muted-foreground text-center sticky left-0 z-10 flex items-center justify-center whitespace-nowrap"
                    data-testid={`time-label-${time.replace(/[:\s]/g, '-')}`}
                  >
                    {isHourMark && parts.length === 2 ? (
                      <>
                        <span className="font-semibold">{parts[0]}</span>-{parts[1]}
                      </>
                    ) : time === "時間指定なし" ? (
                      <span className="font-semibold">{time}</span>
                    ) : (
                      time
                    )}
                  </div>
                {weekDays.map((day, dayIndex) => {
                  const selected = isSlotSelected(day, time);
                  const available = isSlotAvailable(day, time);
                  const isDisabled = mode === "respond" && !available;
                  const isSunday = day.getDay() === 0;
                  const isSaturday = day.getDay() === 6;

                  return (
                    <button
                      type="button"
                      key={`${day.toISOString()}-${time}`}
                      onClick={() => toggleSlot(day, time)}
                      disabled={isDisabled}
                      className={`
                        p-1 min-h-[32px] transition-colors flex items-center justify-center font-black text-3xl leading-none
                        ${mode === "respond" ? 'border border-white dark:border-white' : ''}
                        ${!isDisabled && 'hover-elevate cursor-pointer'}
                        ${selected && 'bg-primary text-primary-foreground border-primary'}
                        ${isDisabled && 'opacity-30 cursor-not-allowed'}
                        ${!selected && !isDisabled && available && mode === "respond" && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'}
                        ${!selected && !isDisabled && !available && mode === "respond" && 'bg-background'}
                        ${!selected && mode === "create" && (isSunday ? 'bg-red-50 dark:bg-red-950/20' : isSaturday ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-background')}
                      `}
                      data-testid={`slot-${format(day, 'yyyy-MM-dd')}-${time.replace(/[:\s]/g, '-')}`}
                    >
                      {selected && mode === "respond" && '○'}
                    </button>
                  );
                })}
              </div>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
