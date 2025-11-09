import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { normalizeTimeSlot } from "@shared/timeUtils";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface TimeSlot {
  id?: string;
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
  const [selectedSlots, setSelectedSlots] = useState<{ date: Date; time: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const slotIds = selectedSlots.map(selected => {
      const normalizedSelectedTime = normalizeTimeSlot(selected.time);
      const matchingSlot = timeSlots.find(
        slot =>
          format(slot.date, 'yyyy-MM-dd') === format(selected.date, 'yyyy-MM-dd') &&
          normalizeTimeSlot(slot.time) === normalizedSelectedTime
      );
      return matchingSlot?.id || '';
    }).filter(Boolean);

    onSubmit({ name, availability: slotIds });
  };

  const availableSlots = timeSlots.map(slot => ({
    date: slot.date,
    time: slot.time,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="participant-response">
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
            Click on times when you can attend
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

            <WeeklyCalendar
              selectedSlots={selectedSlots}
              onSlotsChange={setSelectedSlots}
              mode="respond"
              availableSlots={availableSlots}
            />

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
