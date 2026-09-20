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
    <Card className="w-full max-w-md shadow-lg border-slate-800 bg-slate-900 text-slate-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Tạo tài khoản</CardTitle>
        <CardDescription className="text-center text-slate-400">
          Tạo tài khoản mới để trải nghiệm VocabAI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="name123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-400">
          Đã có tài khoản?{" "}
          <Link to="/signin" className="text-indigo-400 hover:underline font-medium">
            Đăng nhập
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}