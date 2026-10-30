export function GlassPanel({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  const id = `panel-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="glass rounded-3xl p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">{"// "}{label}</p>
      <h2 id={id} className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
