import { Link } from "wouter";

export default function Header() {
  return (
    <header className="border-b">
      <div className="max-w-4xl mx-auto md:mx-0 md:ml-8 px-4 md:px-6 py-4">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="スケマッチ！" className="w-6 h-6" data-testid="icon-logo" />
          <Link href="/" className="text-2xl font-semibold hover:text-primary transition-colors cursor-pointer" data-testid="text-app-name">
            スケマッチ！
          </Link>
        </div>
      </div>
    </header>
  );
}
