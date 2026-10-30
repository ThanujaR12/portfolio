export function SectionHeading({
  index,
  label,
  title,
  id,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  id: string;
}) {
  return (
    <header className="mb-10 md:mb-14">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
        <span aria-hidden="true">{`// ${index} · `}</span>
        {label}
      </p>
      <h2 id={id} className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
    </header>
  );
}
