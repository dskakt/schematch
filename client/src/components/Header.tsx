import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  const isPollPage = location.startsWith("/poll");

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={isPollPage ? "/sorematch-favicon.svg" : "/favicon.svg"} 
              alt={isPollPage ? "ソレマッチ！" : "スケマッチ！"} 
              className="w-6 h-6" 
              data-testid="icon-logo" 
            />
            <Link 
              href={isPollPage ? "/poll/create" : "/"} 
              className={`text-2xl font-semibold transition-colors cursor-pointer ${
                isPollPage ? "hover:text-green-600" : "hover:text-primary"
              }`}
              data-testid="text-app-name"
            >
              {isPollPage ? "ソレマッチ！" : "スケマッチ！"}
            </Link>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                !isPollPage 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-schedule"
            >
              日程調整
            </Link>
            <Link 
              href="/poll/create" 
              className={`text-sm font-medium transition-colors ${
                isPollPage 
                  ? "text-green-600" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="link-poll"
            >
              投票
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
