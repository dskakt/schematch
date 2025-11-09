import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import StepIndicator from "@/components/StepIndicator";
import EventDetailsForm from "@/components/EventDetailsForm";
import DateTimeSelector from "@/components/DateTimeSelector";
import EventConfirmation from "@/components/EventConfirmation";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface DateTimeSlot {
  date: Date;
  times: string[];
}

interface EventDetails {
  title: string;
  email: string;
}

export default function CreateEvent() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [timeSlots, setTimeSlots] = useState<DateTimeSlot[]>([]);
  const [createdEvent, setCreatedEvent] = useState<{
    eventId: string;
    eventTitle: string;
    participantLink: string;
    organizerLink: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEventDetailsSubmit = (data: EventDetails) => {
    setEventDetails(data);
    setCurrentStep(2);
  };

  const handleTimeSlotsSubmit = async (slots: DateTimeSlot[]) => {
    if (!eventDetails) return;
    
    setIsCreating(true);
    setTimeSlots(slots);
    
    try {
      // Flatten time slots for API
      const flattenedSlots = slots.flatMap(slot =>
        slot.times.map(time => ({
          date: format(slot.date, 'yyyy-MM-dd'),
          time: time,
        }))
      );

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
      
      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackToEventDetails = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-create-event">
      <Header />
      <main className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold mb-2" data-testid="text-page-title">
              Create New Event
            </h2>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Follow the steps to set up your scheduling poll
            </p>
          </div>

          <StepIndicator currentStep={currentStep} totalSteps={3} />

          {currentStep === 1 && (
            <EventDetailsForm onNext={handleEventDetailsSubmit} />
          )}

          {currentStep === 2 && (
            <div className="relative">
              {isCreating && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Creating event...</p>
                  </div>
                </div>
              )}
              <DateTimeSelector
                onNext={handleTimeSlotsSubmit}
                onBack={handleBackToEventDetails}
              />
            </div>
          )}

          {currentStep === 3 && createdEvent && (
            <EventConfirmation
              eventId={createdEvent.eventId}
              eventTitle={createdEvent.eventTitle}
              participantLink={createdEvent.participantLink}
              organizerLink={createdEvent.organizerLink}
            />
          )}
        </div>
      </main>
    </div>
  );
}
