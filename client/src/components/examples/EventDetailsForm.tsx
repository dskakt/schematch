import EventDetailsForm from '../EventDetailsForm';

export default function EventDetailsFormExample() {
  return (
    <EventDetailsForm
      onNext={(data) => console.log('Next clicked with data:', data)}
    />
  );
}
