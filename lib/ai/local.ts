import type { ChatContext } from "@/lib/ai/providers";
import { CITATIONS_MARKER } from "@/lib/ai/prompt";
import type { PortfolioProject } from "@/lib/content/merge";
import { categoryOf } from "@/lib/content/skills";

// Rule-based fallback assistant. It only ever restates portfolio content, so it is honest by
// construction; anything it cannot match gets the standard "don't know, use Contact" reply.

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

const has = (q: string, ...words: string[]) => words.some((w) => new RegExp(`\\b${w}`, "i").test(q));

function reply(text: string, cited: PortfolioProject[]) {
  const slugs = cited.map((p) => p.slug);
  return `${text}\n${CITATIONS_MARKER} ${slugs.length ? slugs.join(", ") : "none"}`;
}

export function localAnswer(question: string, { profile, projects }: Pick<ChatContext, "profile" | "projects">): string {
  const first = profile.name.split(" ")[0];
  const q = question.toLowerCase();

  // A specific project by name.
  const named = projects.find(
    (p) => q.includes(p.title.toLowerCase()) || q.includes(p.slug.replace(/-/g, " ")),
  );
  if (named) {
    const highlights = named.highlights.slice(0, 3).map((h) => `- ${h}`).join("\n");
    return reply(
      `**${named.title}** (${named.year}): ${named.summary}${named.role ? ` ${first}'s role: ${named.role}.` : ""} It uses ${list(named.technologies.slice(0, 5))}.${highlights ? `\n\n${highlights}` : ""}`,
      [named],
    );
  }

  // Technologies mentioned by name (longest names first so "React Native" beats "React").
  const techs = [...new Set(projects.flatMap((p) => p.technologies))].sort((a, b) => b.length - a.length);
  const mentioned: string[] = [];
  let rest = q;
  for (const t of techs) {
    const pattern = new RegExp(`(^|[^a-z])${t.toLowerCase().replace(/[.+]/g, "\\$&")}($|[^a-z])`);
    if (pattern.test(rest)) {
      mentioned.push(t);
      rest = rest.replace(pattern, " ");
    }
  }
  if (mentioned.length) {
    const lines = mentioned.map((t) => {
      const using = projects.filter((p) => p.technologies.includes(t));
      return `**${t}**: used in ${list(using.map((p) => p.title))}.`;
    });
    const cited = projects.filter((p) => mentioned.some((t) => p.technologies.includes(t)));
    return reply(`Yes. ${first} has worked with ${list(mentioned)}.\n\n${lines.join("\n")}`, cited);
  }

  if (has(q, "ai", "llm", "machine learning", "ml", "gpt", "openai", "artificial")) {
    const ai = projects.filter((p) => p.technologies.some((t) => categoryOf(t) === "AI/Data"));
    if (ai.length) {
      return reply(
        `Yes. ${list(ai.map((p) => `**${p.title}**`))} ${ai.length > 1 ? "use" : "uses"} AI: ${ai.map((p) => p.summary).join(" ")} Tools involved include ${list([...new Set(ai.flatMap((p) => p.technologies.filter((t) => categoryOf(t) === "AI/Data")))])}.`,
        ai,
      );
    }
  }

  const area = has(q, "front-?end", "ui", "interface")
    ? "Frontend"
    : has(q, "back-?end", "server", "api", "database")
      ? "Backend"
      : has(q, "language")
        ? "Languages"
        : null;
  if (area) {
    const skills = [...new Set(projects.flatMap((p) => p.technologies.filter((t) => categoryOf(t) === area)))];
    const cited = projects.filter((p) => p.technologies.some((t) => skills.includes(t)));
    if (skills.length) {
      return reply(`For ${area.toLowerCase() === "languages" ? "languages" : area.toLowerCase()} work, ${first} has used ${list(skills)}, across ${list(cited.map((p) => p.title))}.`, cited);
    }
  }

  if (has(q, "strong", "best", "proud", "favou?rite", "impressive", "top", "featured", "main project")) {
    const top = projects.filter((p) => p.featured);
    const picks = top.length ? top : projects.slice(0, 2);
    return reply(
      `${first}'s featured work:\n\n${picks.map((p) => `- **${p.title}**: ${p.summary}`).join("\n")}`,
      picks,
    );
  }

  if (has(q, "project", "built", "build", "work on", "portfolio", "made")) {
    return reply(
      `${first} has ${projects.length} public projects here:\n\n${projects.map((p) => `- **${p.title}** (${p.year}): ${p.summary}`).join("\n")}`,
      projects,
    );
  }

  if (has(q, "looking", "next", "goal", "available", "hire", "hiring", "intern", "job", "role", "open to", "focus")) {
    return reply(`${profile.currentFocus} The Contact section is the best way to reach ${first} about opportunities.`, []);
  }

  if (has(q, "school", "university", "college", "study", "studies", "education", "degree", "background", "who is", "about")) {
    const background = profile.highlights.map((h) => `- ${h.label}: ${h.detail}`).join("\n");
    return reply(`${profile.positioning}.${background ? `\n\n${background}` : ""}`, []);
  }

  if (has(q, "contact", "email", "reach", "linkedin", "github")) {
    return reply(`You can email ${first} at ${profile.links.email} or find the code on ${profile.links.github.replace("https://", "")}.`, []);
  }

  if (has(q, "skill", "stack", "tech", "tools", "know")) {
    const top = [...new Set(projects.flatMap((p) => p.technologies))].slice(0, 10);
    return reply(`${first}'s projects use ${list(top)}.`, projects);
  }

  return reply(
    `I don't have information about that in ${first}'s portfolio. I can only answer questions about ${first}'s projects, skills and experience. For anything else, the Contact section reaches ${first} directly.`,
    [],
  );
}
