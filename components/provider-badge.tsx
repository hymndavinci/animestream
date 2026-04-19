import { Badge } from "./ui/badge";

export function ProviderBadge({ label }: { label: string }) {
  return (
    <Badge
      variant="secondary"
      className="fixed right-4 top-4 z-50 border-sky-400/30 bg-zinc-950/80 shadow-glow"
    >
      Source: {label}
    </Badge>
  );
}
