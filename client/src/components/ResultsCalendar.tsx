import { useRef, useEffect, useState } from "react";
import { format, addDays, startOfWeek, isSameDay, startOfDay, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  "時間指定なし",
  "8:00-8:30 AM", "8:30-9:00 AM", "9:00-9:30 AM", "9:30-10:00 AM", "10:00-10:30 AM", "10:30-11:00 AM",
  "11:00-11:30 AM", "11:30 AM-12:00 PM", "12:00-12:30 PM", "12:30-1:00 PM", "1:00-1:30 PM", "1:30-2:00 PM",
  "2:00-2:30 PM", "2:30-3:00 PM", "3:00-3:30 PM", "3:30-4:00 PM", "4:00-4:30 PM", "4:30-5:00 PM",
  "5:00-5:30 PM", "5:30-6:00 PM", "6:00-6:30 PM", "6:30-7:00 PM", "7:00-7:30 PM", "7:30-8:00 PM"
];

const getAllDaysToDisplay = (timeSlots: TimeSlot[]) => {
  if (timeSlots.length === 0) return [];
  
  const uniqueDates = Array.from(
    new Set(timeSlots.map(slot => startOfDay(slot.date).getTime()))
  )
    .map(time => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (uniqueDates.length === 0) return [];
  
  const startDate = startOfWeek(uniqueDates[0], { weekStartsOn: 0 });
  const endDate = addDays(startOfWeek(uniqueDates[uniqueDates.length - 1], { weekStartsOn: 0 }), 6);
  
  return eachDayOfInterval({ start: startDate, end: endDate });
};

export default function ResultsCalendar({ timeSlots, responses }: ResultsCalendarProps) {
  const weekDays = getAllDaysToDisplay(timeSlots);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showVerticalScrollIndicator, setShowVerticalScrollIndicator] = useState(false);
  const [showHorizontalScrollIndicator, setShowHorizontalScrollIndicator] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowVerticalScrollIndicator(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 10);
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
  }, [timeSlots, responses]);

  if (weekDays.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" data-testid="results-calendar">
        候補日時が設定されていません
      </div>
    );
  }

  const getSlotAtDateTime = (date: Date, time: string) => {
    return timeSlots.find(
      slot => isSameDay(slot.date, date) && slot.time === time
    );
  };

  const getAvailabilityCount = (slotId: string | undefined) => {
    if (!slotId) return 0;
    return responses.filter(r => r.availability.includes(slotId)).length;
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
      <div className="border rounded-lg bg-border overflow-hidden relative">
        <div ref={scrollContainerRef} className="overflow-auto max-h-[600px]">
          <div className="inline-block min-w-full">
            <div className="grid gap-px" style={{ gridTemplateColumns: `115px repeat(${weekDays.length}, minmax(45px, 1fr))` }}>
              <div className="bg-muted p-0 font-medium text-sm sticky left-0 top-0 z-20 relative" data-testid="header-time">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(45deg, transparent calc(50% - 0.5px), hsl(var(--border)) calc(50% - 0.5px), hsl(var(--border)) calc(50% + 0.5px), transparent calc(50% + 0.5px))' }}></div>
                {weekDays.length > 0 && <span className="absolute top-1 right-1">{format(weekDays[0], 'M月')}</span>}
                <span className="absolute bottom-1 left-1">時間</span>
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
                  const slot = getSlotAtDateTime(day, time);
                  const count = getAvailabilityCount(slot?.id);
                  const isSunday = day.getDay() === 0;
                  const isSaturday = day.getDay() === 6;
                  const hasSlot = !!slot;
                  const isNoTimeSlot = time === "時間指定なし";

                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className={`
                        p-1 min-h-[32px] transition-colors flex items-center justify-center font-medium border border-white dark:border-white
                        ${isNoTimeSlot ? 'border-b-4 border-b-border' : ''}
                        ${hasSlot ? getHeatColor(count) : (isSunday ? 'bg-red-50 dark:bg-red-950/20' : isSaturday ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-background')}
                      `}
                      data-testid={`slot-${format(day, 'yyyy-MM-dd')}-${time.replace(/[:\s]/g, '-')}`}
                    >
                      {hasSlot && (
                        <div className="text-center">
                          <div className="text-sm font-bold">{count}</div>
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
              );
            })}
            </div>
          </div>
        </div>
        {showVerticalScrollIndicator && (
          <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-30 flex items-end justify-center pb-2" style={{ background: 'linear-gradient(to top, hsl(var(--background)), transparent)' }}>
            <div className="flex flex-col items-center gap-1">
              <ChevronDown className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-primary">下にスクロール</span>
            </div>
          </div>
        )}
        {showHorizontalScrollIndicator && (
          <div className="absolute top-1/2 -translate-y-1/2 right-0 h-24 w-20 pointer-events-none z-30 flex items-center justify-end pr-2" style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }}>
            <div className="flex flex-col items-center gap-1 pointer-events-none">
              <ChevronRight className="w-5 h-5 text-primary pointer-events-none" />
              <span className="text-xs font-medium text-primary whitespace-nowrap pointer-events-none" style={{ writingMode: 'vertical-rl' }}>右にスクロール</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-muted-foreground">少ない</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span className="text-muted-foreground">中程度</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-muted-foreground">最適</span>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          数字は参加可能な人数を表示しています
        </div>
      </div>
    </div>
  );
}
