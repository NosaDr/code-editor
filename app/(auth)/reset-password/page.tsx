"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      router.push("/login");
    }
  }, [token, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Password reset failed');

      setSuccess(true);
      toast.success("Password reset successful!");
      setTimeout(() => router.push("/login"), 2000);

    } catch (error: any) {
      if (error.message.includes("expired")) {
        toast.error("Reset link has expired. Please request a new one.");
      } else if (error.message.includes("invalid")) {
        toast.error("Invalid reset link. Please request a new one.");
      } else {
        toast.error(error.message || "Failed to reset password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-emerald-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset!</h2>
        <p className="text-slate-500 mb-6">
          Your password has been successfully reset. Redirecting to login...
        </p>
        <Loader2 className="animate-spin mx-auto text-emerald-600" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-emerald-600" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
        <p className="text-slate-500 text-sm mt-2">Enter your new password</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-red-600">Passwords don't match</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" size={32} />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}