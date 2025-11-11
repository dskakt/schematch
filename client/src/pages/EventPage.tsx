import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import ParticipantResponse from "@/components/ParticipantResponse";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
}

interface Event {
  id: string;
  title: string;
}

export default function EventPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const eventId = params.id;

  const { data, isLoading, error } = useQuery<{ event: Event; timeSlots: TimeSlot[] }>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  // Log errors for debugging
  if (error) {
    console.error("Error loading event:", error);
  }

  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: { name: string; availability: string[]; notes?: string }) => {
      const res = await apiRequest("POST", `/api/events/${eventId}/responses`, {
        participantName: responseData.name,
        availableSlotIds: responseData.availability,
        notes: responseData.notes,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate responses cache to ensure fresh data on results page
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "responses"] });
      
      toast({
        title: "Response submitted!",
        description: "Thank you for marking your availability.",
      });
      setTimeout(() => {
        setLocation(`/event/${eventId}/results`);
      }, 1500);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (responseData: { name: string; availability: string[]; notes?: string }) => {
    submitResponseMutation.mutate(responseData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-event">
        <Header />
        <main className="py-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-event">
        <Header />
        <main className="py-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
            <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const formattedSlots = data.timeSlots.map(slot => ({
    id: slot.id,
    date: new Date(slot.date),
    time: slot.time,
  }));

  return (
    <div className="min-h-screen bg-background" data-testid="page-event">
      <Header />
      <main className="py-12 px-6">
        <ParticipantResponse
          eventId={eventId!}
          eventTitle={data.event.title}
          timeSlots={formattedSlots}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
