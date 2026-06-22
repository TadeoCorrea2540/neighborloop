import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthMobileHeader() {
  return (
    <header className="auth-mobile-header">
      <Link href="/" className="auth-mobile-back" aria-label="Back to home">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <Link href="/" className="auth-mobile-brand">
        <Logo size={26} />
        <span>NeighborLoop</span>
      </Link>
      <span className="auth-mobile-header-spacer" aria-hidden="true" />
    </header>
  );
}
