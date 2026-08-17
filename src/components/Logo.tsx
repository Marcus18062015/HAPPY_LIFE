import Link from "next/link";
import LogoMark from "./LogoMark";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <LogoMark size={34} radius={10} />
      <span className="text-lg font-bold tracking-tight brand-gradient-text">
        Happy Life
      </span>
    </Link>
  );
}
