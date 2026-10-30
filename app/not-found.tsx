import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center justify-center px-4 pt-24">
      <div className="glass max-w-md rounded-3xl p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">{"// 404"}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Lost in space</h1>
        <p className="mt-3 text-muted">That page doesn&apos;t exist, or the project isn&apos;t public.</p>
        <ButtonLink href="/#projects" className="mt-6">
          Browse all projects
        </ButtonLink>
      </div>
    </section>
  );
}
