import ResultsView from '../ResultsView';

export default function ResultsViewExample() {
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
    <ResultsView
      eventTitle="Team Planning Meeting"
      eventDescription="Let's find the best time for our quarterly planning session"
      timeSlots={mockTimeSlots}
      responses={mockResponses}
      isOrganizer={true}
    />
  );
}
