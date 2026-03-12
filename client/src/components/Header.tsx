import { Link } from "wouter";

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="hover-elevate active-elevate-2 cursor-pointer group"
            data-testid="link-schematch"
          >
            <div className="flex items-center gap-2">
              <img 
                src="/favicon.svg" 
                alt="スケマッチ！" 
                className="w-6 h-6" 
                data-testid="icon-schematch-logo" 
              />
              <div className="text-2xl font-semibold leading-none group-hover:text-primary transition-colors">
                スケマッチ！
              </div>
            </div>
            <div className="text-muted-foreground ml-8 text-[13px]">
              カンタン日程調整
            </div>
          </Link>
          
          <a 
            href="/poll/create" 
            className="hover-elevate active-elevate-2 cursor-pointer group"
            data-testid="link-sorematch"
          >
            <div className="flex items-center gap-2">
              <img 
                src="/sorematch-favicon.svg" 
                alt="ソレマッチ！" 
                className="w-6 h-6" 
                data-testid="icon-sorematch-logo" 
              />
              <div className="text-2xl font-semibold leading-none group-hover:text-green-600 transition-colors">
                ソレマッチ！
              </div>
            </div>
            <div className="text-muted-foreground ml-8 text-[13px]">
              シンプル投票
            </div>
          </a>
        </div>
      </div>
    </header>
  );
}
