import { CheckCircle2, PartyPopper } from "lucide-react";

interface ReviewCompletionOverlayProps {
  phrase: string;
}

export default function ReviewCompletionOverlay({
  phrase,
}: ReviewCompletionOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm fade-in duration-300">
      <div className="w-full max-w-sm space-y-4 rounded-3xl border-2 border-emerald-100 bg-white p-8 text-center shadow-xl animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h3 className="flex items-center justify-center gap-2 text-2xl font-extrabold tracking-tight text-slate-800">
          Xuất sắc! <PartyPopper className="h-6 w-6 text-amber-500" />
        </h3>
        <p className="text-sm font-medium leading-relaxed text-slate-600">
          Bạn đã hoàn thành trọn vẹn cả 3 Phase cho cụm từ{" "}
          <span className="font-bold text-emerald-700 underline">
            &ldquo;{phrase}&rdquo;
          </span>
        </p>
        <div className="border-t-2 border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-500">
            🚀 Đang chuyển hướng về trang danh sách...
          </p>
        </div>
      </div>
    </div>
  );
}
