import ParticipantResponse from '../ParticipantResponse';

export default function ParticipantResponseExample() {
  const mockSlots = [
    { date: new Date(2024, 0, 15), time: "10:00 AM" },
    { date: new Date(2024, 0, 15), time: "2:00 PM" },
    { date: new Date(2024, 0, 15), time: "4:00 PM" },
    { date: new Date(2024, 0, 16), time: "10:00 AM" },
    { date: new Date(2024, 0, 16), time: "11:00 AM" },
    { date: new Date(2024, 0, 16), time: "3:00 PM" },
  ];

  return (
    <ParticipantResponse
      eventTitle="Team Planning Meeting"
      timeSlots={mockSlots}
      onSubmit={(data) => console.log('Submitted:', data)}
    />
  );
}
