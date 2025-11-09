import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { X, Clock } from "lucide-react";
import { format } from "date-fns";

interface DateTimeSlot {
  date: Date;
  times: string[];
}

interface DateTimeSelectorProps {
  onNext: (slots: DateTimeSlot[]) => void;
  onBack: () => void;
}

const TIME_OPTIONS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
];

export default function DateTimeSelector({ onNext, onBack }: DateTimeSelectorProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dateTimeSlots, setDateTimeSlots] = useState<DateTimeSlot[]>([]);
  const [selectedDateForTime, setSelectedDateForTime] = useState<Date | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
    setSelectedDates(dates);
  };

  const handleAddTimes = () => {
    if (!selectedDateForTime || selectedTimes.length === 0) return;

    const existingSlotIndex = dateTimeSlots.findIndex(
      slot => format(slot.date, 'yyyy-MM-dd') === format(selectedDateForTime, 'yyyy-MM-dd')
    );

    if (existingSlotIndex >= 0) {
      const updated = [...dateTimeSlots];
      updated[existingSlotIndex] = {
        ...updated[existingSlotIndex],
        times: selectedTimes
      };
      setDateTimeSlots(updated);
    } else {
      setDateTimeSlots([...dateTimeSlots, { date: selectedDateForTime, times: selectedTimes }]);
    }

    setSelectedDateForTime(null);
    setSelectedTimes([]);
  };

  const removeSlot = (dateToRemove: Date) => {
    setDateTimeSlots(dateTimeSlots.filter(
      slot => format(slot.date, 'yyyy-MM-dd') !== format(dateToRemove, 'yyyy-MM-dd')
    ));
  };

  const handleSubmit = () => {
    if (dateTimeSlots.length > 0) {
      onNext(dateTimeSlots);
    }
  };

  return (
    <Card className="max-w-5xl mx-auto" data-testid="card-datetime-selector">
      <CardHeader>
        <CardTitle data-testid="text-selector-title">Select Date & Time Options</CardTitle>
        <CardDescription data-testid="text-selector-description">
          Choose dates and times when the event could take place
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-medium" data-testid="text-select-dates">Select Dates</h3>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
              className="rounded-lg border"
              data-testid="calendar-dates"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium" data-testid="text-select-times">Select Times for Date</h3>
            {selectedDates.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-dates">
                Select dates from the calendar first
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Choose a date:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map((date) => (
                      <Button
                        key={format(date, 'yyyy-MM-dd')}
                        variant={selectedDateForTime && format(selectedDateForTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? "default" : "outline"}
                        onClick={() => {
                          setSelectedDateForTime(date);
                          const existing = dateTimeSlots.find(
                            slot => format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                          );
                          setSelectedTimes(existing?.times || []);
                        }}
                        data-testid={`button-date-${format(date, 'yyyy-MM-dd')}`}
                      >
                        {format(date, 'MMM d')}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedDateForTime && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Times for {format(selectedDateForTime, 'MMMM d, yyyy')}:
                    </Label>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                      {TIME_OPTIONS.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTimes.includes(time) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedTimes(prev =>
                              prev.includes(time)
                                ? prev.filter(t => t !== time)
                                : [...prev, time]
                            );
                          }}
                          data-testid={`button-time-${time.replace(/[:\s]/g, '-')}`}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={handleAddTimes}
                      disabled={selectedTimes.length === 0}
                      className="w-full"
                      data-testid="button-add-times"
                    >
                      Add Times
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {dateTimeSlots.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-medium" data-testid="text-selected-slots">Selected Time Slots</h3>
            <div className="space-y-2">
              {dateTimeSlots.map((slot) => (
                <div
                  key={format(slot.date, 'yyyy-MM-dd')}
                  className="flex items-start justify-between p-3 border rounded-lg"
                  data-testid={`slot-${format(slot.date, 'yyyy-MM-dd')}`}
                >
                  <div className="space-y-2">
                    <p className="font-medium" data-testid={`text-slot-date-${format(slot.date, 'yyyy-MM-dd')}`}>
                      {format(slot.date, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {slot.times.map((time) => (
                        <Badge key={time} variant="secondary" data-testid={`badge-time-${time.replace(/[:\s]/g, '-')}`}>
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSlot(slot.date)}
                    data-testid={`button-remove-${format(slot.date, 'yyyy-MM-dd')}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-back">
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={dateTimeSlots.length === 0}
            className="flex-1"
            data-testid="button-next"
          >
            Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
