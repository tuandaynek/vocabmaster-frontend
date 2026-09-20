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
    <Card className="w-full max-w-md shadow-lg border-slate-800 bg-slate-900 text-slate-100">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
        <CardDescription className="text-center text-slate-400">
          Nhập email và mật khẩu của bạn để truy cập ứng dụng
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-400">
          Chưa có tài khoản?{" "}
          <Link to="/signup" className="text-indigo-400 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}