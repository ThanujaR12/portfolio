import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { profileSchema, projectsFileSchema, syncLogFileSchema } from "@/lib/schemas";

const read = (name: string) => JSON.parse(readFileSync(`content/${name}`, "utf8"));

describe("content files", () => {
  it("match their schemas", () => {
    expect(() => projectsFileSchema.parse(read("projects.json"))).not.toThrow();
    expect(() => profileSchema.parse(read("profile.json"))).not.toThrow();
    expect(() => syncLogFileSchema.parse(read("sync-log.json"))).not.toThrow();
  });

  it("reject more than 3 featured published projects", () => {
    const file = read("projects.json");
    const base = file.projects[0];
    const projects = [1, 2, 3, 4].map((n) => ({ ...base, id: n, slug: `p-${n}`, featured: true, status: "published" }));
    const result = projectsFileSchema.safeParse({ version: 1, projects });
    expect(result.success).toBe(false);
  });

  it("reject duplicate slugs", () => {
    const file = read("projects.json");
    const dupe = { ...file.projects[1], slug: file.projects[0].slug };
    const result = projectsFileSchema.safeParse({ version: 1, projects: [file.projects[0], dupe] });
    expect(result.success).toBe(false);
  });
});
