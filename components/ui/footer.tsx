import Link from "next/link";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`py-6 px-4 border-t border-border/40 ${className}`}>
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="text-lg font-semibold text-gradient">
            NEXO
          </div>
          
          {/* Legal Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link 
              href="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
          
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} VENKO AI INNOVATIONS LLC
          </p>
        </div>
      </div>
    </footer>
  );
}

