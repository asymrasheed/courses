"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/login", { email, password });
      toast.success("Welcome back");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex">
      {/* brand panel */}
      <section className="hidden lg:flex lg:w-[46%] relative items-center justify-center overflow-hidden bg-ink-950 border-r border-white/5">
        <div
          className="absolute -top-32 -left-24 w-[26rem] h-[26rem] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-gold-400), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-8rem] right-[-6rem] w-[24rem] h-[24rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-teal-400), transparent 70%)" }}
        />
        <div className="relative z-10 px-14 max-w-md animate-fade-up">
          <p className="badge mb-8">Course &amp; Question Bank</p>
          <h1 className="font-display italic text-6xl leading-[1.05] text-cream-100">
            Curio
          </h1>
          <p className="mt-6 text-cream-300 text-lg leading-relaxed">
            A quiet place to keep every category, course and question — written
            once, found forever.
          </p>
        </div>
      </section>

      {/* form panel */}
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm animate-fade-up"
          style={{ animationDelay: "0.08s" }}
        >
          <div className="lg:hidden mb-10 text-center">
            <h1 className="font-display italic text-4xl text-cream-100">Curio</h1>
          </div>

          <h2 className="font-display text-2xl text-cream-100 mb-1">Sign in</h2>
          <p className="text-cream-500 text-sm mb-8">
            Use the credentials configured for this workspace.
          </p>

          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                className="field-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="field-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-7 justify-center">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
