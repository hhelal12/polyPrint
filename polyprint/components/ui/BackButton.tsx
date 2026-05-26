// components/ui/BackButton.tsx
import Link from "next/link";

interface BackButtonProps {
  href: string;
  label?: string;
}

export default function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link 
      href={href} 
      className="text-sm text-gray-500 hover:text-[#3CCFD0] flex items-center gap-1 transition-colors font-medium"
    >
      ← {label}
    </Link>
  );
}