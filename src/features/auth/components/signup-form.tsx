import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { authApi } from "../api/authApi";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try{
      await authApi.register({ email, password, username });
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      toast.success("Đăng ký tài khoản thành công!");
      setLoading(false);
      navigate("/signin");
    }, 800);
  };

  return (
  <Card className="w-full max-w-md rounded-3xl border-2 border-slate-100 bg-white p-4 text-slate-800 shadow-sm sm:p-6">
    <CardHeader className="space-y-2 text-center pb-6">
      <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-800">Tạo tài khoản</CardTitle>
      <CardDescription className="text-sm text-slate-500">
        Tạo tài khoản mới để trải nghiệm VocabAI tối tân
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="name123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-12 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Mật khẩu
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Xác nhận mật khẩu
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-12 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-100"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
        >
          {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
        </Button>
      </form>
      <div className="mt-6 text-center text-xs font-semibold text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/signin" className="font-bold text-emerald-700 hover:underline">
          Đăng nhập
        </Link>
      </div>
    </CardContent>
  </Card>
);
}