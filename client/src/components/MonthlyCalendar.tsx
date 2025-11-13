import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
          const isDisabled = mode === "respond" && !available;
          const isSunday = date.getDay() === 0;
          const isSaturday = date.getDay() === 6;
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

          return (
            <button
              key={format(date, 'yyyy-MM-dd')}
              type="button"
              onClick={() => !isDisabled && toggleDate(date)}
              disabled={isDisabled}
              className={`
                p-2 min-h-[48px] rounded-md border transition-colors font-semibold relative
                ${!isDisabled && 'hover-elevate cursor-pointer'}
                ${selected && 'bg-primary text-primary-foreground border-primary'}
                ${isDisabled && 'opacity-30 cursor-not-allowed'}
                ${!selected && !isDisabled && available && mode === "respond" && 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'}
                ${!selected && !isDisabled && !available && mode === "respond" && 'bg-background border-border'}
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
              {selected && mode === "respond" && (
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">
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
  const [currentMonth, setCurrentMonth] = useState(today);

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

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 2));
  };

  const goToThisMonth = () => {
    setCurrentMonth(today);
  };

  const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(today, 'yyyy-MM');
  const nextMonth = addMonths(currentMonth, 1);

  return (
    <div className="space-y-4" data-testid="monthly-calendar">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          data-testid="button-prev-month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <Button
              type="button"
              variant="ghost"
              onClick={goToThisMonth}
              className="text-base font-medium"
              data-testid="button-this-month"
            >
              今月
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          data-testid="button-next-month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthGrid
          month={currentMonth}
          selectedSlots={selectedSlots}
          availableSlots={availableSlots}
          mode={mode}
          toggleDate={toggleDate}
          today={today}
        />
        <MonthGrid
          month={nextMonth}
          selectedSlots={selectedSlots}
          availableSlots={availableSlots}
          mode={mode}
          toggleDate={toggleDate}
          today={today}
        />
      </div>
    </div>
  );
}
