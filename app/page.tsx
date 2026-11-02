import { ContactSection } from "@/components/site/ContactSection";
import { Hero } from "@/components/site/Hero";
import { NameIntro } from "@/components/site/NameIntro";
import { JourneySection } from "@/components/site/JourneySection";
import { SelectedWork } from "@/components/site/SelectedWork";
import { SkillsSection } from "@/components/site/SkillsSection";
import { getPortfolio } from "@/lib/content/portfolio";

export const revalidate = 3600;

// Home (spec 002): Name intro → Statement hero → Journey → Selected work → Skills → Let's build.
export default async function HomePage() {
  const { profile, selected, skills, technologies, journey } = await getPortfolio();

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
      <NameIntro profile={profile} />
      <Hero profile={profile} />
      <JourneySection journey={journey} />
      <SelectedWork projects={selected} />
      <SkillsSection skills={skills} />
      <ContactSection profile={profile} />
    </>
  );
}
