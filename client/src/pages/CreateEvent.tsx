import { useState } from "react";
import Header from "@/components/Header";
import StepIndicator from "@/components/StepIndicator";
import EventDetailsForm from "@/components/EventDetailsForm";
import DateTimeSelector from "@/components/DateTimeSelector";
import EventConfirmation from "@/components/EventConfirmation";

interface DateTimeSlot {
  date: Date;
  times: string[];
}

interface EventDetails {
  title: string;
  email: string;
}

export default function CreateEvent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [timeSlots, setTimeSlots] = useState<DateTimeSlot[]>([]);

  const handleEventDetailsSubmit = (data: EventDetails) => {
    setEventDetails(data);
    setCurrentStep(2);
  };

  const handleTimeSlotsSubmit = (slots: DateTimeSlot[]) => {
    setTimeSlots(slots);
    setCurrentStep(3);
  };

  const handleBackToEventDetails = () => {
    setCurrentStep(1);
  };

  const eventId = "demo-event-123";
  const participantLink = `${window.location.origin}/event/${eventId}`;
  const organizerLink = `${window.location.origin}/event/${eventId}/edit?token=demo-token`;

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
            <DateTimeSelector
              onNext={handleTimeSlotsSubmit}
              onBack={handleBackToEventDetails}
            />
          )}

          {currentStep === 3 && eventDetails && (
            <EventConfirmation
              eventId={eventId}
              eventTitle={eventDetails.title}
              participantLink={participantLink}
              organizerLink={organizerLink}
            />
          )}
        </div>
      </main>
    </div>
  );
}
