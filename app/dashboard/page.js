import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Course from "@/models/Course";
import Question from "@/models/Question";
import PageHeader from "@/components/PageHeader";
import { IconArrowRight } from "@/components/icons";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();
  const [categoryCount, courseCount, questionCount, recentCourses] = await Promise.all([
    Category.countDocuments(),
    Course.countDocuments(),
    Question.countDocuments(),
    Course.find().sort({ createdAt: -1 }).limit(5).populate("category").lean(),
  ]);
  return { categoryCount, courseCount, questionCount, recentCourses };
}

export default async function DashboardHome() {
  const { categoryCount, courseCount, questionCount, recentCourses } = await getStats();

  const stats = [
    { label: "Categories", value: categoryCount, href: "/dashboard/categories", accent: "gold" },
    { label: "Courses", value: courseCount, href: "/dashboard/courses", accent: "teal" },
    { label: "Questions", value: questionCount, href: "/dashboard/questions", accent: "rose" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Good to see you"
        description="A quick look at what's in the archive right now."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            className="card p-6 group animate-fade-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="flex items-center justify-between">
              <p className="field-label !mb-0">{s.label}</p>
              <IconArrowRight
                width={14}
                height={14}
                className="text-cream-500 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <p className="font-display text-5xl text-cream-100 mt-4">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="card p-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-cream-100">Recently added courses</h2>
          <Link href="/dashboard/courses" className="text-sm text-gold-300 hover:text-gold-200">
            View all
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <p className="text-cream-500 text-sm py-6 text-center">
            No courses yet — create your first category, then a course.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {recentCourses.map((c) => (
              <li key={c._id}>
                <Link
                  href={`/dashboard/courses/${c._id}`}
                  className="flex items-center justify-between py-3.5 group"
                >
                  <div>
                    <p className="text-cream-100 font-medium group-hover:text-gold-300 transition-colors">
                      {c.title}
                    </p>
                    <p className="text-cream-500 text-xs mt-0.5">{c.category?.name}</p>
                  </div>
                  <IconArrowRight
                    width={14}
                    height={14}
                    className="text-cream-500 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
