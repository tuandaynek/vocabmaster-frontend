import { Bot, Lightbulb, Sparkles, Trophy } from "lucide-react";

interface ReviewCollocationSidebarProps {
  currentPhase: number;
  isActiveMode: boolean;
  phrase: string;
}

const phaseGuidance = {
  passive: [
    {
      title: "Luyện phát âm chuẩn nhịp",
      description: "Nhại giọng bản xứ để tăng phản xạ ghi nhớ.",
    },
    {
      title: "Luyện đọc tròn vành rõ chữ",
      description: "Đặt cụm từ vào ngữ cảnh câu hoàn chỉnh.",
    },
    {
      title: "Phản xạ câu biến thể",
      description: "Linh hoạt thay đổi cấu trúc ngữ pháp.",
    },
  ],
  active: [
    {
      title: "Dịch thuật Active Recall",
      description: "Kích hoạt phản xạ xuôi/ngược bằng dịch trực tiếp.",
    },
    {
      title: "Tự đặt câu tự do",
      description: "Sáng tạo câu riêng với AI chấm điểm trực tiếp.",
    },
    {
      title: "Sáng tác mẩu chuyện",
      description: "Kết nối ngữ cảnh đoạn văn ở mức nâng cao.",
    },
  ],
} as const;

export default function ReviewCollocationSidebar({
  currentPhase,
  isActiveMode,
  phrase,
}: ReviewCollocationSidebarProps) {
  const mode = isActiveMode ? "active" : "passive";
  const guide = phaseGuidance[mode][currentPhase - 1];

  return (
    <aside className="w-full space-y-4 lg:sticky lg:top-6 lg:col-span-4">
      <div className="flex items-start gap-3.5 rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600">
          <Bot className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700">
            <Sparkles className="h-3.5 w-3.5" /> Trợ lý AI
          </div>
          <h4 className="text-xs font-bold text-slate-800">{guide?.title}</h4>
          <p className="pt-0.5 text-xs leading-relaxed text-slate-500">
            {guide?.description}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 rounded-3xl border-2 border-amber-200 bg-amber-50 p-4 shadow-sm">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
          <Lightbulb className="h-4 w-4 fill-amber-400 text-amber-600" /> IELTS Tip
        </div>
        <p className="text-xs font-medium leading-relaxed text-slate-600">
          Dùng cụm <strong className="font-bold text-amber-800 underline">{phrase}</strong>{" "}
          sẽ giúp tăng điểm Lexical Resource rõ rệt!
        </p>
      </div>

      <div className="flex items-center justify-between rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 font-bold text-amber-700">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Mục tiêu
            </p>
            <p className="mt-0.5 text-xs font-bold text-slate-800">
              {isActiveMode ? "Active Recall" : "Passive Drill"}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700">
          +15 XP
        </span>
      </div>
    </aside>
  );
}
