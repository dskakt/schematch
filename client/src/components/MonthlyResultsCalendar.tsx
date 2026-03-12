import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { useMemo } from "react";

interface TimeSlot {
  id: string;
  date: Date;
  time: string;
}

interface Response {
  name: string;
  availability: string[];
}

interface MonthlyResultsCalendarProps {
  timeSlots: TimeSlot[];
  responses: Response[];
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function MonthGrid({
  month,
  timeSlots,
  responses,
  getSlotForDate,
  getAvailabilityCount,
  getHeatColor,
  totalResponses,
  today,
}: {
  month: Date;
  timeSlots: TimeSlot[];
  responses: Response[];
  getSlotForDate: (date: Date) => TimeSlot | undefined;
  getAvailabilityCount: (slotId: string | undefined) => number;
  getHeatColor: (count: number) => string;
  totalResponses: number;
  today: Date;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="space-y-2">
      <div className="text-center font-semibold text-base">
        {format(month, 'yyyy年M月', { locale: ja })}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day, index) => {
          const isSunday = index === 0;
          const isSaturday = index === 6;
          return (
            <div
              key={day}
              className={`text-center font-semibold text-sm p-2 ${
                isSunday
                  ? 'text-red-600 dark:text-red-400'
                  : isSaturday
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-foreground'
              }`}
              data-testid={`header-weekday-${day}`}
            >
              {day}
            </div>
          );
        })}

        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="p-2" />
        ))}

        {daysInMonth.map((date) => {
          const slot = getSlotForDate(date);
          const count = getAvailabilityCount(slot?.id);
          const isSunday = date.getDay() === 0;
          const isSaturday = date.getDay() === 6;
          const hasSlot = !!slot;
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

          return (
            <div
              key={format(date, 'yyyy-MM-dd')}
              className={`
                p-2 min-h-[64px] rounded-md border transition-colors relative flex flex-col items-center justify-center
                ${hasSlot ? getHeatColor(count) : (
                  isSunday
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    : isSaturday
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                    : 'bg-background border-border'
                )}
                ${isToday && 'ring-2 ring-primary'}
              `}
              data-testid={`date-${format(date, 'yyyy-MM-dd')}`}
            >
              <div className={`text-xs font-semibold mb-1 ${
                hasSlot && count / totalResponses >= 0.75
                  ? ''
                  : isSunday
                  ? 'text-red-600 dark:text-red-400'
                  : isSaturday
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-foreground'
              }`}>
                {format(date, 'd')}
              </div>
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
    </div>
  );
}

export default function MonthlyResultsCalendar({
  timeSlots,
  responses,
}: MonthlyResultsCalendarProps) {
  const today = new Date();

  const monthsToDisplay = useMemo(() => {
    if (timeSlots.length > 0) {
      const uniqueMonths = new Set<string>();
      timeSlots.forEach(slot => {
        uniqueMonths.add(format(startOfMonth(slot.date), 'yyyy-MM'));
      });
      
      const sortedMonths = Array.from(uniqueMonths)
        .sort()
        .map(monthStr => {
          const [year, month] = monthStr.split('-');
          return new Date(parseInt(year), parseInt(month) - 1, 1);
        });
      
      return sortedMonths;
    }
    
    return [today];
  }, [timeSlots, today]);

  const totalResponses = responses.length;

  const getSlotForDate = (date: Date) => {
    return timeSlots.find(
      slot => format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getAvailabilityCount = (slotId: string | undefined) => {
    if (!slotId) return 0;
    return responses.filter(r => r.availability.includes(slotId)).length;
  };

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-background';
    const ratio = count / totalResponses;
    if (ratio >= 0.75) return 'bg-green-500 text-white';
    if (ratio >= 0.5) return 'bg-green-300';
    return 'bg-green-100';
  };

  return (
    <div className="space-y-4" data-testid="monthly-results-calendar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {monthsToDisplay.map((month) => (
          <MonthGrid
            key={format(month, 'yyyy-MM')}
            month={month}
            timeSlots={timeSlots}
            responses={responses}
            getSlotForDate={getSlotForDate}
            getAvailabilityCount={getAvailabilityCount}
            getHeatColor={getHeatColor}
            totalResponses={totalResponses}
            today={today}
          />
        ))}
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
