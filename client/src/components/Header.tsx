import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  const isSorematch = location.startsWith('/sorematch') || location.startsWith('/p/') || location.startsWith('/pr/');
  
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center gap-2">
          <img 
            src={isSorematch ? "/favicon-sorematch.svg" : "/favicon.svg"} 
            alt={isSorematch ? "ソレマッチ！" : "スケマッチ！"} 
            className="w-6 h-6" 
            data-testid="icon-logo" 
          />
          <Link 
            href={isSorematch ? "/sorematch" : "/"} 
            className="text-2xl font-semibold hover:opacity-80 transition-opacity cursor-pointer" 
            style={isSorematch ? { color: 'hsl(var(--sorematch-primary))' } : { color: 'hsl(var(--primary))' }}
            data-testid="text-app-name"
          >
            {isSorematch ? 'ソレマッチ！' : 'スケマッチ！'}
          </Link>
        </div>
      </div>
    </header>
  );
}
