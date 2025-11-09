import EventConfirmation from '../EventConfirmation';

export default function EventConfirmationExample() {
  return (
    <EventConfirmation
      eventId="abc123"
      eventTitle="Team Planning Meeting"
      participantLink="https://meetsync.app/event/abc123"
      organizerLink="https://meetsync.app/event/abc123/edit?token=xyz789"
    />
  );
}
