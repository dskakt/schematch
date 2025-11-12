import { Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" data-testid="icon-logo" />
          <Link href="/" className="text-2xl font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="text-app-name">
            スケマッチ
          </Link>
        </div>
      </div>
    </header>
  );
}
