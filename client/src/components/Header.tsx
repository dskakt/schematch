import { Calendar } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" data-testid="icon-logo" />
          <h1 className="text-2xl font-semibold" data-testid="text-app-name">MeetSync</h1>
        </div>
      </div>
    </header>
  );
}
