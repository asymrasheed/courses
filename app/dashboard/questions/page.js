"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import PageHeader from "@/components/PageHeader";
import QuestionCard from "@/components/QuestionCard";
import { api } from "@/lib/api";
import { IconSearch, IconHelp, IconArrowRight } from "@/components/icons";

const fetcher = (url) => api.get(url);

function plainText(html) {
  return (html || "").replace(/<[^>]+>/g, " ").toLowerCase();
}

export default function QuestionsExplorerPage() {
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
      if (term && !plainText(q.question).includes(term) && !plainText(q.answer).includes(term)) {
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
        catEntry.courses.set(course._id, { course, questions: [] });
      }
      catEntry.courses.get(course._id).questions.push(q);
    }

    return Array.from(byCategory.values()).map((c) => ({
      ...c,
      courses: Array.from(c.courses.values()),
    }));
  }, [questions, search, categorySlug]);

  const total = grouped.reduce(
    (sum, c) => sum + c.courses.reduce((s, co) => s + co.questions.length, 0),
    0
  );

  return (
    <div>
      <PageHeader
        eyebrow="Explore"
        title="All questions"
        description="Every question in the bank, grouped by category and course."
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
            placeholder="Search questions & answers…"
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
          <p className="text-cream-300">No questions match your filters yet.</p>
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
                      className="flex items-center gap-1.5 text-sm text-cream-300 hover:text-gold-300 mb-3 group"
                    >
                      {courseEntry.course.title}
                      <IconArrowRight
                        width={12}
                        height={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                      <span className="badge ml-1">{courseEntry.questions.length}</span>
                    </Link>
                    <div className="space-y-3">
                      {courseEntry.questions.map((q, i) => (
                        <QuestionCard key={q._id} question={q} index={i} />
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
