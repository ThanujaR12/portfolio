import { Suspense } from "react";
import { AboutSection } from "@/components/site/AboutSection";
import { ContactSection } from "@/components/site/ContactSection";
import { FeaturedCard } from "@/components/site/FeaturedCard";
import { Hero } from "@/components/site/Hero";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ProjectGrid } from "@/components/site/ProjectGrid";
import { SkillsSection } from "@/components/site/SkillsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPortfolio } from "@/lib/content/portfolio";
import { SKILL_CATEGORIES } from "@/lib/content/skills";

export const revalidate = 3600;

export default async function HomePage() {
  const { profile, projects, featured, skills, stats } = await getPortfolio();
  // Filter chips: every skill, most-used first.
  const technologies = SKILL_CATEGORIES.flatMap((c) => skills[c])
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .map((s) => s.name);

  // schema.org Person: helps search engines connect the name to these profiles.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    description: profile.positioning,
    url: siteUrl,
    sameAs: [profile.links.github, profile.links.linkedin].filter(Boolean),
    knowsAbout: technologies.slice(0, 12),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
      />
      <Hero profile={profile} stats={stats} />

      {featured.length > 0 && (
        <section id="featured" aria-labelledby="featured-title" className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              index="01"
              label="Featured work"
              id="featured-title"
              title={
                <>
                  Projects I&apos;m <span className="text-gradient">proudest of</span>
                </>
              }
            />
            <div
              className={`grid gap-5 ${
                featured.length === 1 ? "" : featured.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"
              }`}
            >
              {featured.map((p, i) => (
                <FeaturedCard key={p.id} project={p} large={featured.length === 3 && i === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="projects" aria-labelledby="projects-title" className="px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading index="02" label="All projects" id="projects-title" title="Everything I've shipped" />
          {projects.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center text-muted">Projects coming soon.</div>
          ) : (
            <Suspense
              fallback={
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((p) => (
                    <li key={p.id} className="flex">
                      <ProjectCard project={p} />
                    </li>
                  ))}
                </ul>
              }
            >
              <ProjectGrid projects={projects} technologies={technologies} />
            </Suspense>
          )}
        </div>
      </section>

      <SkillsSection skills={skills} />
      <AboutSection profile={profile} />
      <ContactSection profile={profile} />
    </>
  );
}
