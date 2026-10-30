"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { adminFetch, SESSION_EXPIRED } from "@/components/admin/api";
import { SideEditor } from "@/components/admin/SideEditor";
import { prettifyRepoName } from "@/lib/content/merge";
import type { Project } from "@/lib/schemas";

type Column = Project["status"];
type Columns = Record<Column, number[]>;

const COLUMNS: { id: Column; label: string; hint: string }[] = [
  { id: "pending", label: "Pending review", hint: "New from GitHub. Not public." },
  { id: "published", label: "Published", hint: "On the site, in this order. ★ = featured (max 3)." },
  { id: "hidden", label: "Hidden", hint: "Not shown on the site." },
];

function toColumns(projects: Project[]): Columns {
  const cols: Columns = { pending: [], published: [], hidden: [] };
  for (const p of [...projects].sort((a, b) => a.order - b.order)) cols[p.status].push(p.id);
  return cols;
}

export function Board({
  projects,
  onChange,
  assetBase,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  assetBase: string;
}) {
  const [columns, setColumns] = useState(() => toColumns(projects));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const byId = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const featured = projects.filter((p) => p.featured && p.status === "published").map((p) => p.id);

  // Re-derive columns when the server sends a new list (adjusting state during render).
  const [syncedFrom, setSyncedFrom] = useState(projects);
  if (syncedFrom !== projects) {
    setSyncedFrom(projects);
    setColumns(toColumns(projects));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const columnOf = (id: number | string): Column | undefined =>
    (["pending", "published", "hidden"] as const).find((c) => c === id || columns[c].includes(Number(id)));

  const save = async (next: Columns, nextFeatured: number[]) => {
    const previous = columns;
    setColumns(next);
    setSaving(true);
    setError(null);
    const res = await adminFetch<{ projects: Project[] }>("/api/admin/projects", {
      method: "PATCH",
      body: JSON.stringify({ columns: next, featured: nextFeatured.filter((id) => next.published.includes(id)) }),
    });
    setSaving(false);
    if (res.ok) onChange(res.data.projects);
    else {
      setColumns(previous);
      setError(res.status === 401 ? SESSION_EXPIRED : res.message);
    }
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = columnOf(active.id);
    const to = columnOf(over.id);
    if (!from || !to || from === to) return;
    setColumns((cols) => {
      const target = cols[to];
      const overIndex = target.indexOf(Number(over.id));
      const index = overIndex === -1 ? target.length : overIndex;
      return {
        ...cols,
        [from]: cols[from].filter((id) => id !== Number(active.id)),
        [to]: [...target.slice(0, index), Number(active.id), ...target.slice(index)],
      };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const col = columnOf(active.id);
    if (!col) return;
    let next = columns;
    if (over && columnOf(over.id) === col) {
      const from = columns[col].indexOf(Number(active.id));
      const to = columns[col].indexOf(Number(over.id));
      if (to !== -1 && from !== to) next = { ...columns, [col]: arrayMove(columns[col], from, to) };
    }
    const unchanged = JSON.stringify(next) === JSON.stringify(toColumns(projects));
    if (!unchanged) save(next, featured);
  };

  const moveTo = (id: number, to: Column) => {
    const from = columnOf(id)!;
    save({ ...columns, [from]: columns[from].filter((x) => x !== id), [to]: [...columns[to], id] }, featured);
  };

  const toggleFeatured = (id: number) =>
    save(columns, featured.includes(id) ? featured.filter((x) => x !== id) : [...featured, id]);

  const editingProject = editing === null ? null : (byId.get(editing) ?? null);

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm">
          {error}
        </p>
      )}
      <p className="sr-only" role="status">
        {saving ? "Saving…" : ""}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setColumns(toColumns(projects))}>
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((c) => (
            <BoardColumn key={c.id} column={c} ids={columns[c.id]}>
              {columns[c.id].map((id) => {
                const p = byId.get(id);
                if (!p) return null;
                return (
                  <ProjectTile
                    key={id}
                    project={p}
                    column={c.id}
                    featured={featured.includes(id)}
                    canFeature={featured.length < 3 || featured.includes(id)}
                    onEdit={() => setEditing(id)}
                    onMove={(to) => moveTo(id, to)}
                    onToggleFeatured={() => toggleFeatured(id)}
                  />
                );
              })}
            </BoardColumn>
          ))}
        </div>
      </DndContext>

      {editingProject && (
        <SideEditor
          key={editingProject.id}
          project={editingProject}
          assetBase={assetBase}
          onClose={() => setEditing(null)}
          onSaved={(saved) => onChange(projects.map((p) => (p.id === saved.id ? saved : p)))}
        />
      )}
    </>
  );
}

function BoardColumn({
  column,
  ids,
  children,
}: {
  column: (typeof COLUMNS)[number];
  ids: number[];
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <section
      aria-labelledby={`col-${column.id}`}
      className={`glass flex min-h-48 flex-col rounded-2xl p-3 transition-colors ${isOver ? "border-cyan/50" : ""}`}
    >
      <header className="px-2 pb-3 pt-1">
        <h2 id={`col-${column.id}`} className="flex items-center justify-between font-display font-semibold">
          {column.label}
          <span className="rounded-full bg-white/10 px-2 font-mono text-xs text-muted">{ids.length}</span>
        </h2>
        <p className="mt-0.5 text-xs text-muted">{column.hint}</p>
      </header>
      <SortableContext id={column.id} items={ids} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex flex-1 flex-col gap-2">
          {children}
          {ids.length === 0 && (
            <li className="grid flex-1 place-items-center rounded-xl border border-dashed border-line p-6 text-xs text-muted">
              Drop projects here
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

function ProjectTile({
  project: p,
  column,
  featured,
  canFeature,
  onEdit,
  onMove,
  onToggleFeatured,
}: {
  project: Project;
  column: Column;
  featured: boolean;
  canFeature: boolean;
  onEdit: () => void;
  onMove: (to: Column) => void;
  onToggleFeatured: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const title = p.title || prettifyRepoName(p.repoName);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-line bg-space-2/80 p-3 ${isDragging ? "z-10 opacity-80 shadow-2xl" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Move ${title}. Press space to pick up, arrow keys to move, space to drop.`}
          className="mt-0.5 cursor-grab touch-none rounded px-1 text-muted hover:text-ink active:cursor-grabbing"
        >
          ⠿
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          <p className="truncate font-mono text-[0.7rem] text-muted">
            {p.repoName}
            {p.github.isFork && " · fork"}
          </p>
          {p.flags.length > 0 && (
            <p className="mt-1.5 flex flex-wrap gap-1">
              {p.flags.map((f) => (
                <span
                  key={f}
                  className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                    f === "removed-from-github" ? "bg-amber-400/15 text-amber-200" : "bg-white/10 text-muted"
                  }`}
                >
                  {f === "needs-content" ? "needs content" : "removed from GitHub"}
                </span>
              ))}
            </p>
          )}
        </div>
        {column === "published" && (
          <button
            type="button"
            onClick={onToggleFeatured}
            disabled={!canFeature}
            aria-pressed={featured}
            aria-label={featured ? `Unfeature ${title}` : `Feature ${title}`}
            title={canFeature ? undefined : "Up to 3 projects can be featured"}
            className={`text-lg leading-none disabled:opacity-30 ${featured ? "text-cyan" : "text-muted hover:text-ink"}`}
          >
            {featured ? "★" : "☆"}
          </button>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <button type="button" onClick={onEdit} className="rounded-lg border border-line px-2.5 py-1 text-xs hover:border-cyan/50">
          Edit
        </button>
        {column !== "published" && (
          <button type="button" onClick={() => onMove("published")} className="rounded-lg border border-line px-2.5 py-1 text-xs hover:border-cyan/50">
            Publish
          </button>
        )}
        {column !== "hidden" && (
          <button type="button" onClick={() => onMove("hidden")} className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted hover:text-ink">
            Hide
          </button>
        )}
      </div>
    </li>
  );
}
