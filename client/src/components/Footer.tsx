import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-sm text-muted-foreground">
          <Link href="/terms">
            <a className="hover:text-foreground transition-colors" data-testid="link-terms">
              利用規約
            </a>
          </Link>
          <Link href="/privacy">
            <a className="hover:text-foreground transition-colors" data-testid="link-privacy">
              プライバシーポリシー
            </a>
          </Link>
          <Link href="/contact">
            <a className="hover:text-foreground transition-colors" data-testid="link-contact">
              お問い合わせ・ご要望
            </a>
          </Link>
        </div>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          © 2025 スケマッチ
        </div>
      </div>
    </footer>
  );
}
