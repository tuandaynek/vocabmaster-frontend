interface EmptyGameStateProps {
  title?: string;
  onBack?: () => void;
}

export default function EmptyGameState({
  title = "Chặng này chưa có câu hỏi",
  onBack,
}: EmptyGameStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 p-6">
      <section className="max-w-md rounded-3xl border-2 border-white bg-white p-8 text-center shadow-xl">
        <h1 className="text-xl font-black text-slate-800">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Hãy quay lại và chọn một chặng có câu hỏi để tiếp tục.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-2xl border-b-4 border-slate-300 bg-slate-100 px-5 py-3 font-black text-slate-700 active:translate-y-1 active:border-b-0"
        >
          Về bản đồ
        </button>
      </section>
    </main>
  );
}
