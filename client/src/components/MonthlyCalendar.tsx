import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { useMemo } from "react";

interface TimeSlot {
  date: Date;
  time: string;
}

interface MonthlyCalendarProps {
  selectedSlots: TimeSlot[];
  onSlotsChange: (slots: TimeSlot[]) => void;
  mode: "create" | "respond";
  availableSlots?: TimeSlot[];
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function MonthGrid({
  month,
  selectedSlots,
  availableSlots,
  mode,
  toggleDate,
  today,
}: {
  month: Date;
  selectedSlots: TimeSlot[];
  availableSlots: TimeSlot[];
  mode: "create" | "respond";
  toggleDate: (date: Date) => void;
  today: Date;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const isDateSelected = (date: Date) => {
    return selectedSlots.some(
      slot => format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isDateAvailable = (date: Date) => {
    return availableSlots.some(
      slot => format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

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
          const selected = isDateSelected(date);
          const available = isDateAvailable(date);
          const isPast = startOfDay(date) < startOfDay(today);
          const isUnavailable = mode === "respond" && !available;
          const isClickDisabled = isUnavailable || isPast;
          const isSunday = date.getDay() === 0;
          const isSaturday = date.getDay() === 6;
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

          return (
            <button
              key={format(date, 'yyyy-MM-dd')}
              type="button"
              onClick={() => !isClickDisabled && toggleDate(date)}
              disabled={isClickDisabled}
              className={`
                p-2 min-h-[48px] rounded-md border transition-colors font-semibold relative
                ${!isClickDisabled && 'hover-elevate cursor-pointer'}
                ${selected && 'bg-primary text-primary-foreground border-primary'}
                ${isUnavailable && 'cursor-not-allowed'}
                ${isPast && !isUnavailable && 'cursor-not-allowed'}
                ${!selected && !isUnavailable && available && mode === "respond" && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'}
                ${!selected && !isUnavailable && !available && mode === "respond" && 'bg-background border-border'}
                ${!selected && mode === "create" && (
                  isSunday
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                    : isSaturday
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                    : 'bg-background border-border'
                )}
                ${isToday && !selected && 'ring-2 ring-primary'}
              `}
              data-testid={`date-${format(date, 'yyyy-MM-dd')}`}
            >
              {isToday && !selected ? (
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mx-auto">
                  {format(date, 'd')}
                </span>
              ) : (
                <div className={`text-sm ${
                  isSunday && !selected
                    ? 'text-red-600 dark:text-red-400'
                    : isSaturday && !selected
                    ? 'text-blue-600 dark:text-blue-400'
                    : !selected
                    ? 'text-foreground'
                    : ''
                }`}>
                  {format(date, 'd')}
                </div>
              )}
              {selected && mode === "respond" && (
                <div className="absolute inset-0 flex items-center justify-center text-xl font-black">
                  ○
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MonthlyCalendar({
  selectedSlots,
  onSlotsChange,
  mode,
  availableSlots = [],
}: MonthlyCalendarProps) {
  const today = new Date();

  const monthsToDisplay = useMemo(() => {
    if (mode === "respond" && availableSlots.length > 0) {
      const uniqueMonths = new Set<string>();
      availableSlots.forEach(slot => {
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
  }, [mode, availableSlots, today]);

  const toggleDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = selectedSlots.some(
      slot => format(slot.date, 'yyyy-MM-dd') === dateStr
    );

    if (isSelected) {
      onSlotsChange(
        selectedSlots.filter(slot => format(slot.date, 'yyyy-MM-dd') !== dateStr)
      );
    } else {
      onSlotsChange([...selectedSlots, { date, time: "時間指定なし" }]);
    }
  };

  return (
    <div className="space-y-4" data-testid="monthly-calendar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {monthsToDisplay.map((month, index) => (
          <MonthGrid
            key={format(month, 'yyyy-MM')}
            month={month}
            selectedSlots={selectedSlots}
            availableSlots={availableSlots}
            mode={mode}
            toggleDate={toggleDate}
            today={today}
          />
        ))}
      </div>
    </div>
  );
}
