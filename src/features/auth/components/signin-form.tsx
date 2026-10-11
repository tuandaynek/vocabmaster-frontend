import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { authApi } from "../api/authApi";
import { useAuthStore } from "../stores/authStore";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try{
      const response = await authApi.login({ email, password });
      const { accessToken, user } = response;
      setAuth(user, accessToken);
    } catch(error){
      const err = error as { message?: string };
      toast.error(err?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally{
      setLoading(false);
    }

    // Mô phỏng gọi API
    setTimeout(() => {
      toast.success("Đăng nhập thành công!");
      setLoading(false);
      navigate("/");
    }, 800);
  };

  return (
  <Card className="w-full max-w-md rounded-[32px] border border-slate-800 bg-slate-900 shadow-2xl p-4 sm:p-6 text-slate-100">
    <CardHeader className="space-y-2 text-center pb-6">
      <CardTitle className="text-2xl font-black tracking-tight text-white">Đăng nhập</CardTitle>
      <CardDescription className="text-sm text-slate-400">
        Nhập email và mật khẩu của bạn để tiếp tục hành trình học tập
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 bg-slate-950 border-slate-800 rounded-2xl text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mật khẩu
            </Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-slate-950 border-slate-800 rounded-2xl text-white placeholder:text-slate-500 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-all duration-200 mt-2"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
        </Button>
      </form>
      <div className="mt-6 text-center text-xs font-semibold text-slate-400">
        Chưa có tài khoản?{" "}
        <Link to="/signup" className="text-indigo-400 hover:underline font-bold">
          Đăng ký ngay
        </Link>
      </div>
    </CardContent>
  </Card>
);
}