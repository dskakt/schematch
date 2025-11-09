import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import EventDetailsForm from "@/components/EventDetailsForm";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import EventConfirmation from "@/components/EventConfirmation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface EventDetails {
  title: string;
  email: string;
}

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(true);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<{ date: Date; time: string }[]>([]);
  const [createdEvent, setCreatedEvent] = useState<{
    eventId: string;
    eventTitle: string;
    participantLink: string;
    organizerLink: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEventDetailsSubmit = (data: EventDetails) => {
    setEventDetails(data);
    setShowForm(false);
  };

  const handleCreateEvent = async () => {
    if (!eventDetails || selectedSlots.length === 0) return;
    
    setIsCreating(true);
    
    try {
      const flattenedSlots = selectedSlots.map(slot => ({
        date: format(slot.date, 'yyyy-MM-dd'),
        time: slot.time,
      }));

      const res = await apiRequest("POST", "/api/events", {
        title: eventDetails.title,
        organizerEmail: eventDetails.email,
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
        <div className="max-w-6xl mx-auto space-y-6">
          {showForm ? (
            <EventDetailsForm onNext={handleEventDetailsSubmit} />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-event-title">{eventDetails?.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyCalendar
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                    mode="create"
                  />
                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowForm(true)}
                      className="flex-1"
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleCreateEvent}
                      disabled={selectedSlots.length === 0 || isCreating}
                      className="flex-1"
                      data-testid="button-create"
                    >
                      {isCreating ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
