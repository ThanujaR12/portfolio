import type { Profile } from "@/lib/schemas";

export function Footer({ profile }: { profile: Profile }) {
  return (
    <footer className="border-t border-line px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="font-mono text-xs">Built with Next.js · spec-driven with Spec Kit</p>
      </div>
    </footer>
  );
}
