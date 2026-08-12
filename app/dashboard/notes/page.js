"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import PageHeader from "@/components/PageHeader";
import QuestionCard from "@/components/QuestionCard";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/time";
import { IconSearch, IconHelp, IconArrowRight } from "@/components/icons";

const fetcher = (url) => api.get(url);

function plainText(html) {
  return (html || "").replace(/<[^>]+>/g, " ").toLowerCase();
}

function videoLabel(path) {
  if (!path) return "General notes";
  return path.replace(/\.[^./]+$/, "").split("/").join(" › ");
}

export default function NotesExplorerPage() {
  const { data: categories } = useSWR("/api/categories", fetcher);
  const { data: questions, isLoading } = useSWR("/api/questions", fetcher);

  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  const grouped = useMemo(() => {
    if (!questions) return [];
    const term = search.trim().toLowerCase();

    const filtered = questions.filter((q) => {
      if (!q.course?.category) return false;
      if (categorySlug && q.course.category.slug !== categorySlug) return false;
      if (term && !q.title.toLowerCase().includes(term) && !plainText(q.notes).includes(term)) {
        return false;
      }
      return true;
    });

    const byCategory = new Map();
    for (const q of filtered) {
      const cat = q.course.category;
      if (!byCategory.has(cat._id)) byCategory.set(cat._id, { category: cat, courses: new Map() });
      const catEntry = byCategory.get(cat._id);
      const course = q.course;
      if (!catEntry.courses.has(course._id)) {
        catEntry.courses.set(course._id, { course, videos: new Map() });
      }
      const courseEntry = catEntry.courses.get(course._id);
      if (!courseEntry.videos.has(q.video)) courseEntry.videos.set(q.video, []);
      courseEntry.videos.get(q.video).push(q);
    }

    return Array.from(byCategory.values()).map((c) => ({
      ...c,
      courses: Array.from(c.courses.values()).map((co) => ({
        ...co,
        videos: Array.from(co.videos.entries()).map(([video, notes]) => ({
          video,
          notes: notes.slice().sort((a, b) => a.timestamp - b.timestamp),
        })),
      })),
    }));
  }, [questions, search, categorySlug]);

  const total = grouped.reduce(
    (sum, c) =>
      sum + c.courses.reduce((s, co) => s + co.videos.reduce((n, v) => n + v.notes.length, 0), 0),
    0
  );

  return (
    <div>
      <PageHeader
        eyebrow="Explore"
        title="All notes"
        description="Every timestamped note in the bank, grouped by category, course and video."
      />

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative w-full sm:w-72">
          <IconSearch
            width={15}
            height={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-500"
          />
          <input
            className="field-input pl-9"
            placeholder="Search titles & notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field-select w-full sm:w-56"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-cream-500 text-sm">Loading…</p>
      ) : total === 0 ? (
        <div className="card p-12 text-center">
          <IconHelp width={28} height={28} className="text-cream-500 mx-auto mb-3" />
          <p className="text-cream-300">No notes match your filters yet.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map((catEntry) => (
            <section key={catEntry.category._id}>
              <div className="flex items-center gap-2.5 mb-4">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: catEntry.category.color }}
                />
                <h2 className="font-display text-xl text-cream-100">{catEntry.category.name}</h2>
              </div>

              <div className="space-y-7">
                {catEntry.courses.map((courseEntry) => (
                  <div key={courseEntry.course._id}>
                    <Link
                      href={`/dashboard/courses/${courseEntry.course._id}`}
                      className="text-sm text-cream-300 hover:text-gold-300 mb-3 inline-block"
                    >
                      {courseEntry.course.title}
                    </Link>
                    <div className="space-y-5 mt-2">
                      {courseEntry.videos.map((v) => (
                        <div key={v.video || "__general"}>
                          <Link
                            href={
                              v.video
                                ? `/dashboard/courses/${courseEntry.course._id}/watch?v=${encodeURIComponent(
                                    v.video
                                  )}`
                                : `/dashboard/courses/${courseEntry.course._id}`
                            }
                            className="flex items-center gap-1.5 text-sm text-cream-500 hover:text-gold-300 mb-2 group"
                          >
                            {videoLabel(v.video)}
                            <IconArrowRight
                              width={11}
                              height={11}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            <span className="badge ml-1">{v.notes.length}</span>
                          </Link>
                          <div className="space-y-3">
                            {v.notes.map((q, i) => (
                              <QuestionCard
                                key={q._id}
                                question={q}
                                index={i}
                                meta={
                                  <span className="badge mb-1.5 inline-flex">
                                    {formatTime(q.timestamp)}
                                  </span>
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
