import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Services & Stores
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/stores/authStore";

// Pages
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";
import VocabExtractorPage from "./pages/VocabExtractorPage";
import DictionaryPage from "./pages/DictionaryPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import MyVocabPage from "./pages/MyVocabPage";
import IeltsSpeakingPage from "./pages/IeltsSpeakingPage";
import IeltsWritingPage from "./pages/IeltsWritingPage";
import AdminCollocationImport from "./pages/AdminCollocationImport";
import ReviewCollocation from "./pages/ReviewCollocation";
import ReviewCollocationRedirect from "./pages/ReviewCollocationRedirect";
import ProfilePage from "./pages/Profile";
import WallOfLovePage from './pages/WallOfLovePage'
import IeltsHubPage from "./features/website/components/IeltsHubPage";
import VocabHubPage from "./features/website/components/VocabHubPage";

// Protected Route Component
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import { RefreshCw } from "lucide-react";
import { RatingProvider } from "./contexts/RatingContext";

export default function App() {
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const cachedUser = useAuthStore.getState().user;

      // 1. Nếu không có token -> Logout sạch và tắt loading ngay
      if (!token) {
        logout();
        setLoading(false);
        return;
      }

      // 2. Nếu ĐÃ CÓ token + cachedUser trong storage -> Tắt loading NGAY TẬP TRUNG
      // Cho user vào App luôn, không bị đứng ở màn hình quay quay
      if (cachedUser) {
        setLoading(false);
      }

      // 3. Gọi getMe() ngầm ở Background để kiểm tra Token thực tế
      try {
        const freshUser = await authApi.getMe();
        updateUser(freshUser); // Cập nhật data mới nhất từ server
      } catch (error) {
        // Chỉ khi Refresh Token thực sự chết thì mới kick ra ngoài
        console.error("Phiên đăng nhập đã hết hạn.", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [logout, updateUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />

      <RatingProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. PUBLIC ROUTES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/about" element={<WallOfLovePage/>} />

            {/* 2. PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/ielts" element={<IeltsHubPage/>}/>
              <Route path="/vocab" element={<VocabHubPage/>}/>

              {/* Vocabulary module */}
              <Route path="/vocab-extractor" element={<VocabExtractorPage />} />
              <Route path="/dictionary" element={<DictionaryPage />} />
              <Route path="/my-vocab" element={<MyVocabPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />

              {/* Collocation module */}
              <Route
                path="/collocation/review"
                element={<ReviewCollocationRedirect />}
              />
              <Route
                path="/collocation/review/:collocationId"
                element={<ReviewCollocation />}
              />
              <Route
                path="/secret/collocation/admin"
                element={<AdminCollocationImport />}
              />

              <Route path="/ielts/speaking" element={<IeltsSpeakingPage />} />
              <Route path="/ielts/writing" element={<IeltsWritingPage />} />

              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 3. DEFAULT REDIRECT: Mọi đường dẫn không tồn tại đều chuyển về HomePage (ProtectedRoute sẽ kiểm tra tiếp) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RatingProvider>
    </>
  );
}
