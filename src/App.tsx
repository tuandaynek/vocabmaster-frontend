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

// Protected Route Component
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

export default function App() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        // Tải thông tin user từ Token sẵn có
        const user = await authApi.getMe();
        setAuth(user, token);
      } catch (error) {
        console.error("App: Failed to fetch user info. Logging out.", error);
        logout();
      }
    } else {
      logout();
    }

    setLoading(false);
  };

  initAuth();
}, [setAuth, logout]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />

      <BrowserRouter>
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* 2. PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />

            {/* Vocabulary module */}
            <Route path="/vocab-extractor" element={<VocabExtractorPage />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/my-vocab" element={<MyVocabPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />

            {/* Collocation module */}
            <Route path="/collocation/review" element={<ReviewCollocationRedirect />} />
            <Route path="/collocation/review/:collocationId" element={<ReviewCollocation />} />
            <Route path="/secret/collocation/admin" element={<AdminCollocationImport />} />

            <Route path="/ielts/speaking" element={<IeltsSpeakingPage />} />
            <Route path="/ielts/writing" element={<IeltsWritingPage />} />
          </Route>

          {/* 3. DEFAULT REDIRECT: Mọi đường dẫn không tồn tại đều chuyển về HomePage (ProtectedRoute sẽ kiểm tra tiếp) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}