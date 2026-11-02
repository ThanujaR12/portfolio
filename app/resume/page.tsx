import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { getPortfolio } from "@/lib/content/portfolio";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return { title: "Resume", description: `Resume of ${profile.name}: ${profile.positioning}` };
}

const longDate = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

export default async function ResumePage() {
  const { profile } = await getPortfolio();
  const { resume } = profile;
  const fileName = `${profile.name.replace(/\s+/g, "-")}-Resume.pdf`;

  return (
    <section aria-labelledby="resume-title" className="px-4 pb-24 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">{"// Resume"}</p>
            <h1 id="resume-title" className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-2 text-muted">
              {profile.positioning}
              {resume.updatedAt && <> · updated {longDate.format(new Date(resume.updatedAt))}</>}
            </p>
          </div>
          {resume.updatedAt && (
            <div className="flex flex-wrap gap-3">
              <a
                href={resume.path}
                download={fileName}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-ai px-5 py-2.5 text-sm font-medium text-canvas"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
                </svg>
                Download PDF
              </a>
              <a
                href={resume.path}
                target="_blank"
                rel="noopener noreferrer"
                className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-ink hover:border-accent/50"
              >
                Open in new tab <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </header>

        {resume.updatedAt ? (
          <>
            {/* Phones rarely render inline PDFs; the fallback offers the same file as a link. */}
            <object
              data={`${resume.path}#view=FitH`}
              type="application/pdf"
              aria-label={`${profile.name}'s resume`}
              className="glass hidden h-[80vh] w-full rounded-2xl md:block"
            >
              <ResumeFallback path={resume.path} />
            </object>
            <div className="md:hidden">
              <ResumeFallback path={resume.path} />
            </div>
            {resume.text && (
              <details className="glass mt-5 rounded-2xl p-5">
                <summary className="cursor-pointer font-medium">Text version</summary>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/90">{resume.text}</div>
              </details>
            )}
          </>
        ) : (
          <div className="glass rounded-3xl p-8 text-center sm:p-12">
            <p className="font-display text-2xl font-semibold">The resume is on its way</p>
            <p className="mx-auto mt-3 max-w-md text-muted">
              Meanwhile, the projects show what {profile.name.split(" ")[0]} builds, and the contact
              section is the fastest way to ask for a copy.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/#work">See projects</ButtonLink>
              <ButtonLink href="/#contact" variant="ghost">
                Get in touch
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ResumeFallback({ path }: { path: string }) {
  return (
    <div className="glass rounded-2xl p-6 text-center">
      <p className="text-muted">Your browser can&apos;t show the PDF here.</p>
      <a href={path} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-accent underline">
        Open the resume PDF
      </a>
    </div>
  );
}
