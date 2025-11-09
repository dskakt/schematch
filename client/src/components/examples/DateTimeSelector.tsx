import DateTimeSelector from '../DateTimeSelector';

export default function DateTimeSelectorExample() {
  return (
    <DateTimeSelector
      onNext={(slots) => console.log('Next clicked with slots:', slots)}
      onBack={() => console.log('Back clicked')}
    />
  );
}
