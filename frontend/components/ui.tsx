import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "./motion";

type BtnProps = {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "outline" | "dark" | "whatsapp";
  className?: string;
  external?: boolean;
};

const styles = {
  gold: "bg-gradient-to-r from-gold-light via-gold to-gold-deep text-ink shadow-[0_10px_40px_-10px_rgba(232,181,58,.7)]",
  outline: "border border-white/25 text-white hover:border-gold hover:text-gold backdrop-blur",
  dark: "bg-ink text-cream",
  whatsapp: "bg-[#25d366] text-[#06260f] shadow-[0_10px_40px_-12px_rgba(37,211,102,.8)]",
};

/** Bouton arrondi avec flèche qui tourne + effet aimanté. */
export function Button({ href, children, variant = "gold", className = "", external }: BtnProps) {
  const cls = `group relative inline-flex items-center gap-3 overflow-hidden rounded-full py-3.5 pl-6 pr-3 text-[15px] font-bold transition-transform duration-300 active:scale-95 ${styles[variant]} ${className}`;
  const inner = (
    <>
      <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-full" />
      <span className="relative">{children}</span>
      <span className="relative grid h-8 w-8 place-items-center rounded-full bg-black/15 transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </>
  );
  return (
    <Magnetic strength={0.25}>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {inner}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {inner}
        </Link>
      )}
    </Magnetic>
  );
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43a9.37 9.37 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.44 9.42m8.03-17.45A11.27 11.27 0 0 0 12.05.75C5.8.75.7 5.84.7 12.1c0 2 .52 3.95 1.52 5.67L.6 23.75l6.1-1.6a11.3 11.3 0 0 0 5.35 1.36h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02" />
    </svg>
  );
}
