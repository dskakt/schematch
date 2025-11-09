import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

interface TimeSlot {
  date: Date;
  time: string;
}

interface ParticipantResponseProps {
  eventTitle: string;
  timeSlots: TimeSlot[];
  onSubmit: (data: { name: string; availability: string[] }) => void;
}

export default function ParticipantResponse({
  eventTitle,
  timeSlots,
  onSubmit,
}: ParticipantResponseProps) {
  const [name, setName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const handleSlotToggle = (slotId: string) => {
    setSelectedSlots(prev =>
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, availability: selectedSlots });
  };

  const groupedSlots = timeSlots.reduce((acc, slot, index) => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: slot.date,
        slots: []
      };
    }
    acc[dateKey].slots.push({ ...slot, id: `slot-${index}` });
    return acc;
  }, {} as Record<string, { date: Date; slots: Array<TimeSlot & { id: string }> }>);

  return (
    <div className="max-w-3xl mx-auto space-y-6" data-testid="participant-response">
      <Card data-testid="card-event-info">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-event-title">
            <Calendar className="w-5 h-5" />
            {eventTitle}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card data-testid="card-response-form">
        <CardHeader>
          <CardTitle data-testid="text-form-title">Mark Your Availability</CardTitle>
          <CardDescription data-testid="text-form-description">
            Select all times when you're available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" data-testid="label-name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                data-testid="input-name"
              />
            </div>

            <div className="space-y-4">
              <Label data-testid="label-availability">Available Times</Label>
              <div className="space-y-4">
                {Object.values(groupedSlots).map(({ date, slots }) => (
                  <div key={format(date, 'yyyy-MM-dd')} className="space-y-2" data-testid={`date-group-${format(date, 'yyyy-MM-dd')}`}>
                    <h4 className="font-medium text-sm" data-testid={`text-date-${format(date, 'yyyy-MM-dd')}`}>
                      {format(date, 'EEEE, MMMM d, yyyy')}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-4">
                      {slots.map(({ id, time }) => (
                        <div key={id} className="flex items-center space-x-2" data-testid={`slot-${id}`}>
                          <Checkbox
                            id={id}
                            checked={selectedSlots.includes(id)}
                            onCheckedChange={() => handleSlotToggle(id)}
                            data-testid={`checkbox-${id}`}
                          />
                          <label
                            htmlFor={id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                            data-testid={`label-${id}`}
                          >
                            <Clock className="w-3 h-3" />
                            {time}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/results'}
                className="flex-1"
                data-testid="button-view-results"
              >
                View Results
              </Button>
              <Button type="submit" className="flex-1" data-testid="button-submit">
                Submit Response
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
