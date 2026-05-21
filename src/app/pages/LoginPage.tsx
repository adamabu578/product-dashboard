import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useAuthStore } from "../store/auth";
import { Package, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, token } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/products" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const ok = login(form.username, form.password);
    setLoading(false);
    if (ok) {
      navigate("/products");
    } else {
      setError("Invalid credentials. Use demo / password");
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="size-11 rounded-xl bg-[#3b82f6] flex items-center justify-center shadow-lg">
            <Package size={20} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white">ProductOps</h1>
            <p className="text-sm text-white/40 mt-0.5">
              Operations workspace
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-2xl space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="demo"
              required
              className="w-full px-3 h-9 text-sm border border-border rounded-lg bg-input-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/25 focus:border-[#3b82f6] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="password"
                required
                className="w-full px-3 h-9 pr-10 text-sm border border-border rounded-lg bg-input-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/25 focus:border-[#3b82f6] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 text-xs text-destructive bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
            >
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.username || !form.password}
            className="w-full h-9 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>

          <div className="text-xs text-muted-foreground text-center pt-1 space-y-1">
            <p>demo credentials</p>
            <p>
              username: <code className="font-mono text-foreground">demo</code>
            </p>
            <p>
              password: <code className="font-mono text-foreground">password</code>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
