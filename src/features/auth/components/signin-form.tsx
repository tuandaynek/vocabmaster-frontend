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
  <Card className="w-full max-w-md rounded-3xl border-2 border-slate-100 bg-white p-4 text-slate-800 shadow-sm sm:p-6">
    <CardHeader className="space-y-2 text-center pb-6">
      <CardTitle className="text-2xl font-extrabold tracking-tight text-slate-800">Đăng nhập</CardTitle>
      <CardDescription className="text-sm text-slate-500">
        Nhập email và mật khẩu của bạn để tiếp tục hành trình học tập
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
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-100"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600">
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
            className="h-12 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-100"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
        </Button>
      </form>
      <div className="mt-6 text-center text-xs font-semibold text-slate-500">
        Chưa có tài khoản?{" "}
        <Link to="/signup" className="font-bold text-emerald-700 hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </CardContent>
  </Card>
);
}