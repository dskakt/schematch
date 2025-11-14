import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  const isSorematch = location.startsWith('/sorematch') || location.startsWith('/p/') || location.startsWith('/pr/');
  
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img 
              src="/favicon.svg" 
              alt="スケマッチ！" 
              className="w-6 h-6" 
              data-testid="icon-logo" 
            />
            <Link 
              href="/" 
              className="text-2xl font-semibold text-foreground hover:opacity-80 transition-opacity cursor-pointer" 
              data-testid="text-app-name"
            >
              スケマッチ！
            </Link>
          </div>
          {isSorematch && (
            <div className="flex items-center gap-2">
              <img 
                src="/favicon-sorematch.svg" 
                alt="ソレマッチ！" 
                className="w-6 h-6" 
                data-testid="icon-sorematch-logo" 
              />
              <Link 
                href="/sorematch" 
                className="text-2xl font-semibold text-foreground hover:opacity-80 transition-opacity cursor-pointer" 
                data-testid="text-sorematch-link"
              >
                ソレマッチ！
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
