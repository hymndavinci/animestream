export function SectionHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      {description ? <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">{description}</p> : null}
    </div>
  );
}
