import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
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
        origin: window.location.origin,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate responses cache to ensure fresh data on results page
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "responses"] });
      
      toast({
        title: "回答を送信しました",
        description: "ご回答ありがとうございます。",
      });
      setTimeout(() => {
        setLocation(`/event/${eventId}/results`);
      }, 1500);
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "回答の送信に失敗しました。もう一度お試しください。",
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
        <main className="py-12 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background" data-testid="page-event">
        <Header />
        <main className="py-12 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-2">イベントが見つかりません</h2>
            <p className="text-muted-foreground">お探しのイベントは存在しません。</p>
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
    <div className="min-h-screen bg-background flex flex-col" data-testid="page-event">
      <Header />
      <main className="flex-1 pt-4 pb-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-lg text-muted-foreground" data-testid="text-page-tagline">登録不要・簡単スケジュールマッチング！</p>
          </div>
          <ParticipantResponse
            eventId={eventId!}
            eventTitle={data.event.title}
            timeSlots={formattedSlots}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
