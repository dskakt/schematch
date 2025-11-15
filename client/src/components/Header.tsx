import { Link } from "wouter";

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 hover-elevate active-elevate-2 transition-colors cursor-pointer group"
            data-testid="link-schematch"
          >
            <img 
              src="/favicon.svg" 
              alt="スケマッチ！" 
              className="w-6 h-6" 
              data-testid="icon-schematch-logo" 
            />
            <div>
              <div className="text-2xl font-semibold group-hover:text-primary transition-colors">
                スケマッチ！
              </div>
              <div className="text-xs text-muted-foreground">
                カンタン日程調整
              </div>
            </div>
          </Link>
          
          <Link 
            href="/poll/create" 
            className="flex items-center gap-2 hover-elevate active-elevate-2 transition-colors cursor-pointer group"
            data-testid="link-sorematch"
          >
            <div className="text-right">
              <div className="text-2xl font-semibold group-hover:text-green-600 transition-colors">
                ソレマッチ！
              </div>
              <div className="text-xs text-muted-foreground">
                シンプル投票
              </div>
            </div>
            <img 
              src="/sorematch-favicon.svg" 
              alt="ソレマッチ！" 
              className="w-6 h-6" 
              data-testid="icon-sorematch-logo" 
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
