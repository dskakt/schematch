import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfWeek, isSameDay, parse, startOfDay, eachDayOfInterval, isAfter, isBefore } from "date-fns";
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
  "8:00-8:30", "8:30-9:00", "9:00-9:30", "9:30-10:00", "10:00-10:30", "10:30-11:00",
  "11:00-11:30", "11:30-12:00", "12:00-12:30", "12:30-13:00", "13:00-13:30", "13:30-14:00",
  "14:00-14:30", "14:30-15:00", "15:00-15:30", "15:30-16:00", "16:00-16:30", "16:30-17:00",
  "17:00-17:30", "17:30-18:00", "18:00-18:30", "18:30-19:00", "19:00-19:30", "19:30-20:00"
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showHorizontalScrollIndicator, setShowHorizontalScrollIndicator] = useState(false);

  useEffect(() => {
    if (mode === "respond" && availableSlots.length > 0) {
      setWeekStart(getInitialWeekStart(mode, availableSlots, selectedSlots));
    }
  }, [mode, availableSlots.length]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowHorizontalScrollIndicator(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [selectedSlots]);

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
    const today = startOfDay(new Date());
    const slotDate = startOfDay(date);
    
    if (isBefore(slotDate, today)) return;
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

      <div className="border rounded-lg bg-border relative">
        <div ref={scrollContainerRef} className="overflow-x-auto">
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
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-1 text-center sticky top-0 z-10 ${isToday ? 'bg-primary/10' : 'bg-muted'}`}
                    data-testid={`header-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className={`text-xs ${
                      isToday ? 'text-primary font-semibold' :
                      isSunday ? 'text-red-600 dark:text-red-400' :
                      isSaturday ? 'text-blue-600 dark:text-blue-400' :
                      'text-muted-foreground'
                    }`}>
                      {format(day, 'E', { locale: ja })}
                    </div>
                    <div className="flex items-center justify-center">
                      {isToday ? (
                        <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {day.getDate()}
                        </span>
                      ) : (
                        <span className={`text-sm font-medium ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                          {day.getDate() === 1 ? format(day, 'M月d日') : format(day, 'd日')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {TIMES.map((time, timeIndex) => {
                const isHourMark = time.includes(':00-');
                const parts = time.split('-');
                const isNoTimeSlot = time === "時間指定なし";
                return (
                <div key={time} className="contents">
                  <div
                    className={`bg-background p-1 text-xs text-muted-foreground text-center sticky left-0 z-10 flex items-center justify-center whitespace-nowrap ${isNoTimeSlot ? 'border-b-4 border-b-border' : ''}`}
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
                  const today = startOfDay(new Date());
                  const slotDate = startOfDay(day);
                  const isPast = isBefore(slotDate, today);
                  const isUnavailable = mode === "respond" && !available;
                  const isClickDisabled = isUnavailable || isPast;
                  const isSunday = day.getDay() === 0;
                  const isSaturday = day.getDay() === 6;
                  const isNoTimeSlot = time === "時間指定なし";
                  const isTodayCol = isSameDay(day, today);

                  return (
                    <button
                      type="button"
                      key={`${day.toISOString()}-${time}`}
                      onClick={() => toggleSlot(day, time)}
                      disabled={isClickDisabled}
                      className={`
                        p-1 transition-colors flex items-center justify-center font-black text-xl leading-none
                        ${isNoTimeSlot ? 'min-h-[40px]' : 'min-h-[28px]'}
                        ${mode === "respond" ? 'border border-white dark:border-white' : ''}
                        ${isNoTimeSlot ? 'border-b-4 border-b-border' : ''}
                        ${!isClickDisabled && 'hover-elevate cursor-pointer'}
                        ${selected && 'bg-primary text-primary-foreground border-primary'}
                        ${isUnavailable && 'opacity-30 cursor-not-allowed'}
                        ${isPast && !isUnavailable && 'cursor-not-allowed'}
                        ${!selected && !isUnavailable && available && mode === "respond" && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'}
                        ${!selected && !isUnavailable && !available && mode === "respond" && 'bg-background'}
                        ${!selected && mode === "create" && (isTodayCol ? 'bg-primary/10' : isSunday ? 'bg-red-50 dark:bg-red-950/20' : isSaturday ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-background')}
                      `}
                      data-testid={`slot-${format(day, 'yyyy-MM-dd')}-${time.replace(/[:\s]/g, '-')}`}
                    >
                      {selected && mode === "respond" && (
                        <div className="rounded-full border-[3px] border-current w-5 h-5 flex-shrink-0" />
                      )}
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
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 text-center sticky top-0 z-10 ${isToday ? 'bg-primary/10' : 'bg-muted'}`}
                    data-testid={`header-day-${format(day, 'yyyy-MM-dd')}`}
                  >
                    <div className={`text-xs ${
                      isToday ? 'text-primary font-semibold' :
                      isSunday ? 'text-red-600 dark:text-red-400' :
                      isSaturday ? 'text-blue-600 dark:text-blue-400' :
                      'text-muted-foreground'
                    }`}>
                      {format(day, 'E', { locale: ja })}
                    </div>
                    <div className="flex items-center justify-center">
                      {isToday ? (
                        <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                          {day.getDate()}
                        </span>
                      ) : (
                        <span className={`font-medium ${isSunday ? 'text-red-600 dark:text-red-400' : isSaturday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                          {day.getDate() === 1 ? format(day, 'M月d日') : format(day, 'd日')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {TIMES.map((time) => {
                const isHourMark = time.includes(':00-');
                const parts = time.split('-');
                const isNoTimeSlot = time === "時間指定なし";
                return (
                <div key={time} className="contents">
                  <div
                    className={`bg-background p-1 text-xs text-muted-foreground text-center sticky left-0 z-10 flex items-center justify-center whitespace-nowrap ${isNoTimeSlot ? 'border-b-4 border-b-border' : ''}`}
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
                  const today = startOfDay(new Date());
                  const slotDate = startOfDay(day);
                  const isPast = isBefore(slotDate, today);
                  const isUnavailable = mode === "respond" && !available;
                  const isClickDisabled = isUnavailable || isPast;
                  const isSunday = day.getDay() === 0;
                  const isSaturday = day.getDay() === 6;
                  const isNoTimeSlot = time === "時間指定なし";
                  const isTodayCol = isSameDay(day, today);

                  return (
                    <button
                      type="button"
                      key={`${day.toISOString()}-${time}`}
                      onClick={() => toggleSlot(day, time)}
                      disabled={isClickDisabled}
                      className={`
                        p-1 transition-colors flex items-center justify-center font-black text-2xl leading-none
                        ${isNoTimeSlot ? 'min-h-[48px]' : 'min-h-[32px]'}
                        ${mode === "respond" ? 'border border-white dark:border-white' : ''}
                        ${isNoTimeSlot ? 'border-b-4 border-b-border' : ''}
                        ${!isClickDisabled && 'hover-elevate cursor-pointer'}
                        ${selected && 'bg-primary text-primary-foreground border-primary'}
                        ${isUnavailable && 'opacity-30 cursor-not-allowed'}
                        ${isPast && !isUnavailable && 'cursor-not-allowed'}
                        ${!selected && !isUnavailable && available && mode === "respond" && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'}
                        ${!selected && !isUnavailable && !available && mode === "respond" && 'bg-background'}
                        ${!selected && mode === "create" && (isTodayCol ? 'bg-primary/10' : isSunday ? 'bg-red-50 dark:bg-red-950/20' : isSaturday ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-background')}
                      `}
                      data-testid={`slot-${format(day, 'yyyy-MM-dd')}-${time.replace(/[:\s]/g, '-')}`}
                    >
                      {selected && mode === "respond" && (
                        <div className="rounded-full border-[3px] border-current w-6 h-6 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              );
            })}
            </div>
          </div>
        </div>
        {showHorizontalScrollIndicator && (
          <div className="absolute top-0 right-0 h-full w-20 pointer-events-none z-30 flex items-center justify-end pr-2" style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }}>
            <div className="flex flex-col items-center gap-1 pointer-events-none">
              <ChevronRight className="w-5 h-5 text-primary pointer-events-none" />
              <span className="text-xs font-medium text-primary whitespace-nowrap pointer-events-none" style={{ writingMode: 'vertical-rl' }}>右にスクロール</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
