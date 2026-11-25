import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { customToast } from "../../components/GlobalPopup";
import isomaMark from "../../assets/brand/isoma-mark.png";

export default function LoginPage() {
  const [email, setEmail] = useState("isomaug@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      customToast.success("Signed in to Isoma LMS Portal.");
      navigate("/");
    } catch (err) {
      customToast.error(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-2 font-montserrat bg-white">
      {/* Left Brand Panel (Isoma Royal Blue) */}
      <div className="hidden lg:flex flex-col justify-between bg-primary text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/[0.06] pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-white/[0.05] pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">Isoma UG LMS</span>
        </div>

        <div className="relative max-w-md space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            Empowering Learning Across Every Campus
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Access the Public Open Academy on learn.isomaug.com or manage your
            institution&apos;s academics, report cards, attendance, and fees in
            one unified Royal Blue workspace.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="w-6 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go to Home
          </Link>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-gray-50 lg:bg-white">
        <div className="w-full max-w-md bg-white rounded-2xl lg:rounded-none shadow-sm lg:shadow-none border border-gray-100 lg:border-0 p-6 sm:p-8">
          <div className="flex items-center justify-center gap-2.5 h-14 mb-5">
            <img
              src={isomaMark}
              alt="Isoma Logo"
              className="h-11 w-11 object-contain"
            />
            <span className="text-xl font-bold text-primary tracking-tight">
              Isoma
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
            Sign in
          </h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.ac.ug"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => customToast.info("Password reset flow will be connected next.")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Reset password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 pr-10 text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white font-medium py-2.5 px-6 rounded-lg hover:bg-primary-hover transition-all text-sm active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5">
            Local demo admin: <span className="font-medium text-gray-600">isomaug@gmail.com</span> /{" "}
            <span className="font-medium text-gray-600">Isoma2026!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
