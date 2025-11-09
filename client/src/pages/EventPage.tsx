import Header from "@/components/Header";
import ParticipantResponse from "@/components/ParticipantResponse";

export default function EventPage() {
  const mockSlots = [
    { date: new Date(2024, 0, 15), time: "10:00 AM" },
    { date: new Date(2024, 0, 15), time: "2:00 PM" },
    { date: new Date(2024, 0, 15), time: "4:00 PM" },
    { date: new Date(2024, 0, 16), time: "10:00 AM" },
    { date: new Date(2024, 0, 16), time: "11:00 AM" },
    { date: new Date(2024, 0, 16), time: "3:00 PM" },
  ];

  const handleSubmit = (data: { name: string; availability: string[] }) => {
    console.log('Response submitted:', data);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-event">
      <Header />
      <main className="py-12 px-6">
        <ParticipantResponse
          eventTitle="Team Planning Meeting"
          timeSlots={mockSlots}
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}
