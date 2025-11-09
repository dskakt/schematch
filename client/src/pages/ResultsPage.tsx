import Header from "@/components/Header";
import ResultsView from "@/components/ResultsView";

export default function ResultsPage() {
  const mockTimeSlots = [
    { id: "slot-0", date: new Date(2024, 0, 15), time: "10:00 AM" },
    { id: "slot-1", date: new Date(2024, 0, 15), time: "2:00 PM" },
    { id: "slot-2", date: new Date(2024, 0, 15), time: "4:00 PM" },
    { id: "slot-3", date: new Date(2024, 0, 16), time: "10:00 AM" },
    { id: "slot-4", date: new Date(2024, 0, 16), time: "11:00 AM" },
    { id: "slot-5", date: new Date(2024, 0, 16), time: "3:00 PM" },
  ];

  const mockResponses = [
    { name: "Alice Johnson", availability: ["slot-0", "slot-1", "slot-3", "slot-4"] },
    { name: "Bob Smith", availability: ["slot-1", "slot-2", "slot-4", "slot-5"] },
    { name: "Carol Davis", availability: ["slot-0", "slot-1", "slot-4"] },
    { name: "David Wilson", availability: ["slot-1", "slot-3", "slot-4", "slot-5"] },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="page-results">
      <Header />
      <main className="py-12 px-6">
        <ResultsView
          eventTitle="Team Planning Meeting"
          timeSlots={mockTimeSlots}
          responses={mockResponses}
          isOrganizer={true}
        />
      </main>
    </div>
  );
}
