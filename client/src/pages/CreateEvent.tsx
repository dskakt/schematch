import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import EventConfirmation from "@/components/EventConfirmation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<{ date: Date; time: string }[]>([]);
  const [createdEvent, setCreatedEvent] = useState<{
    eventId: string;
    eventTitle: string;
    participantLink: string;
    organizerLink: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !email || selectedSlots.length === 0) return;
    
    setIsCreating(true);
    
    try {
      const flattenedSlots = selectedSlots.map(slot => ({
        date: format(slot.date, 'yyyy-MM-dd'),
        time: slot.time,
      }));

      const res = await apiRequest("POST", "/api/events", {
        title,
        organizerEmail: email,
        timeSlots: flattenedSlots,
      });
      
      const response = await res.json() as { event: { id: string; title: string }; editToken: string };

      const participantLink = `${window.location.origin}/event/${response.event.id}`;
      const organizerLink = `${window.location.origin}/event/${response.event.id}/edit?token=${response.editToken}`;

      setCreatedEvent({
        eventId: response.event.id,
        eventTitle: response.event.title,
        participantLink,
        organizerLink,
      });
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (createdEvent) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-create-event">
        <Header />
        <main className="py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <EventConfirmation
              eventId={createdEvent.eventId}
              eventTitle={createdEvent.eventTitle}
              participantLink={createdEvent.participantLink}
              organizerLink={createdEvent.organizerLink}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-create-event">
      <Header />
      <main className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" data-testid="label-title">Event Name</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Team Meeting"
                      required
                      data-testid="input-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" data-testid="label-email">Your Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="organizer@example.com"
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <WeeklyCalendar
                  selectedSlots={selectedSlots}
                  onSlotsChange={setSelectedSlots}
                  mode="create"
                />

                <Button
                  type="submit"
                  disabled={selectedSlots.length === 0 || isCreating}
                  className="w-full"
                  data-testid="button-create"
                >
                  {isCreating ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
