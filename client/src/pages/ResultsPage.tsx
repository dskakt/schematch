import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ResultsView from "@/components/ResultsView";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
}

interface Event {
  id: string;
  title: string;
}

interface Response {
  participantName: string;
  availableSlotIds: string[];
}

export default function ResultsPage() {
  const params = useParams();
  const eventId = params.id;

  const { data: eventData, isLoading: isLoadingEvent } = useQuery<{ event: Event; timeSlots: TimeSlot[] }>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  const { data: responsesData, isLoading: isLoadingResponses } = useQuery<Response[]>({
    queryKey: ["/api/events", eventId, "responses"],
    enabled: !!eventId,
  });

  const isLoading = isLoadingEvent || isLoadingResponses;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-results">
        <Header />
        <main className="py-12 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading results...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-results">
        <Header />
        <main className="py-12 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const formattedTimeSlots = eventData.timeSlots.map(slot => ({
    id: slot.id,
    date: new Date(slot.date),
    time: slot.time,
  }));

  const formattedResponses = (responsesData || []).map(response => ({
    name: response.participantName,
    availability: response.availableSlotIds,
  }));

  return (
    <div className="min-h-screen bg-background" data-testid="page-results">
      <Header />
      <main className="py-12 px-6">
        <ResultsView
          eventTitle={eventData.event.title}
          timeSlots={formattedTimeSlots}
          responses={formattedResponses}
          isOrganizer={false}
        />
      </main>
    </div>
  );
}
