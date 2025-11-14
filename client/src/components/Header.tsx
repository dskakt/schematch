import { Link } from "wouter";

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-start gap-2">
          <img 
            src="/favicon.svg" 
            alt="スケマッチ！" 
            className="w-6 h-6" 
            data-testid="icon-logo" 
          />
          <Link 
            href="/" 
            className="hover:opacity-80 transition-opacity cursor-pointer" 
            data-testid="text-app-name"
          >
            <div className="text-2xl font-semibold text-foreground leading-none">
              スケマッチ！
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              簡単日程調整
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
