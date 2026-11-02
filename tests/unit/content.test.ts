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

describe("profile updates", () => {
  it("contain only the fields sent, so an edit never resets other hero fields to defaults", async () => {
    const { profilePatchSchema } = await import("@/lib/schemas");
    expect(profilePatchSchema.parse({ name: "X" })).toEqual({ name: "X" });
  });

  it("older profile files without hero fields still load with defaults", async () => {
    const { profileSchema } = await import("@/lib/schemas");
    const { statement: _s, openTo: _o, location: _l, ...old } = read("profile.json");
    const p = profileSchema.parse(old);
    expect(p.location.timeZone).toBe("America/Chicago");
    expect(p.statement.length).toBeGreaterThan(0);
  });

  it("rejects an unknown time zone", async () => {
    const { profileSchema } = await import("@/lib/schemas");
    const p = read("profile.json");
    expect(profileSchema.safeParse({ ...p, location: { city: "X", timeZone: "Mars/Olympus" } }).success).toBe(false);
  });
});
