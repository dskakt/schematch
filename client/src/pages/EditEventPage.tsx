import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { normalizeTimeSlot } from "@shared/timeUtils";
import { format } from "date-fns";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
}

interface Event {
  id: string;
  title: string;
  organizerEmail: string;
}

export default function EditEventPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const eventId = params.id;
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [title, setTitle] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<{ date: Date; time: string }[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data, isLoading, error } = useQuery<{ event: Event; timeSlots: TimeSlot[] }>({
    queryKey: ["/api/events", eventId],
    enabled: !!eventId,
  });

  useEffect(() => {
    if (data) {
      setTitle(data.event.title);
      const slots = data.timeSlots.map(slot => ({
        date: new Date(slot.date),
        time: slot.time,
      }));
      setSelectedSlots(slots);
    }
  }, [data]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-edit-event">
        <Header />
        <main className="py-12 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              This page requires an edit token. Please use the link from your confirmation email.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-edit-event">
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
      <div className="min-h-screen bg-background" data-testid="page-edit-event">
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSlots.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one time slot.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    toast({
      title: "Note",
      description: "Event editing is currently view-only. Update functionality coming soon.",
    });
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-edit-event">
      <Header />
      <main className="py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
            <p className="text-muted-foreground">
              Update your event details and available time slots
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdate} className="space-y-6">
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
                    <Label htmlFor="email" data-testid="label-email">Organizer Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.event.organizerEmail}
                      disabled
                      data-testid="input-email"
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold" data-testid="text-time-selection-title">
                      Select Time Slots
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1" data-testid="text-time-selection-description">
                      Click on the calendar to select possible meeting times. You can select multiple time slots.
                    </p>
                  </div>

                  <WeeklyCalendar
                    selectedSlots={selectedSlots}
                    onSlotsChange={setSelectedSlots}
                    mode="create"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/event/${eventId}/results`)}
                    className="flex-1"
                    data-testid="button-view-results"
                  >
                    View Results
                  </Button>
                  <Button
                    type="submit"
                    disabled={selectedSlots.length === 0 || isUpdating}
                    className="flex-1"
                    data-testid="button-update"
                  >
                    {isUpdating ? "Updating..." : "Update Event"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Note:</strong> Event editing functionality is currently in development. 
              You can view your event settings here, but updates are not yet saved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
