import { Calendar } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  eventTitle?: string;
}

export default function Header({ eventTitle }: HeaderProps = {}) {
  return (
    <header className="border-b">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-start gap-2">
          <Calendar className="w-6 h-6 text-primary flex-shrink-0 mt-1" data-testid="icon-logo" />
          <div className="flex flex-col">
            <Link href="/" className="text-2xl font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="text-app-name">
              スケマッチ
            </Link>
            {eventTitle && (
              <span className="text-2xl font-semibold text-muted-foreground" data-testid="text-event-name">
                / {eventTitle}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
