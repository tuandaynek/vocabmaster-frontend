import { useMemo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import type { ActivityItem } from "../types";

interface ActivityCalendarProps {
  activityHistory?: ActivityItem[];
}

export default function ActivityCalendar({
  activityHistory = [],
}: ActivityCalendarProps) {
  // 1. Tự động lấy tháng & năm hiện tại từ JS Date
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed (tháng 9 = index 8)
  const todayDateNumber = today.getDate();

  // Tiêu đề Tháng/Năm động
  const currentMonthName = `Tháng ${currentMonth + 1}, ${currentYear}`;

  // Ngày đầu tiên của tháng rơi vào thứ mấy (0 = CN, 1 = T2, ...)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Số ngày trong tháng hiện tại
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // 2. Chuyển mảng activityHistory thành Map để tìm kiếm O(1)
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    activityHistory.forEach((item) => {
      map.set(item.date, item.xpGained);
    });
    return map;
  }, [activityHistory]);

  return (
  <div className="space-y-6">
    {/* Header Lịch */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Hành trình học tập</h2>
          <p className="text-xs text-slate-500">{currentMonthName}</p>
        </div>
      </div>

      {/* Legend chú thích màu sắc */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>Ít</span>
        <div className="flex gap-1">
          <div
            className="h-3.5 w-3.5 rounded-md border border-slate-200 bg-slate-100"
            title="Chưa học"
          />
          <div
            className="h-3.5 w-3.5 rounded-md border border-emerald-200 bg-emerald-100"
            title="1-15 XP"
          />
          <div
            className="h-3.5 w-3.5 rounded-md border border-emerald-400 bg-emerald-300"
            title="16-35 XP"
          />
          <div
            className="h-3.5 w-3.5 rounded-md border border-emerald-600 bg-emerald-500 shadow-sm"
            title=">35 XP"
          />
        </div>
        <span>Chăm</span>
      </div>
    </div>

    {/* Grid Lịch */}
    <div className="space-y-3">
      {/* Header các Thứ */}
      <div className="grid grid-cols-7 gap-2.5 text-center">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={`text-xs font-bold py-1 ${
              idx === 0 || idx === 6 ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Các ô Ngày */}
      <div className="grid grid-cols-7 gap-2.5">
        {/* Ô đệm cho ngày đầu tháng */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-10 rounded-2xl border-2 border-slate-100 bg-slate-50 md:h-12"
          />
        ))}

        {/* Render các ngày trong tháng */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          
          const monthStr = String(currentMonth + 1).padStart(2, "0");
          const dayStr = String(dayNum).padStart(2, "0");
          const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

          const xp = activityMap.get(dateKey) || 0;
          const isToday = dayNum === todayDateNumber;

          let bgStyle = "bg-slate-50 border-slate-200 text-slate-500";
          if (xp > 0 && xp <= 15) {
            bgStyle =
              "bg-emerald-50 border-emerald-200 text-emerald-800";
          } else if (xp > 15 && xp <= 35) {
            bgStyle =
              "bg-emerald-200 border-emerald-300 text-emerald-900 font-bold";
          } else if (xp > 35) {
            bgStyle =
              "bg-emerald-500 border-emerald-600 text-white font-black shadow-sm";
          }

          return (
            <div
              key={dayNum}
              title={`Ngày ${dayStr}/${monthStr}/${currentYear}: +${xp} XP`}
              className={`h-10 md:h-12 rounded-2xl border p-1.5 flex flex-col justify-between transition-all hover:scale-105 cursor-pointer relative ${bgStyle} ${
                isToday
                  ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white"
                  : ""
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className="text-[11px] font-mono font-bold leading-none">
                  {dayNum}
                </span>
                {isToday && (
                  <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 font-sans text-[8px] font-bold leading-none text-white shadow-sm">
                    Hôm nay
                  </span>
                )}
              </div>

              <div className="text-right text-[10px] font-mono leading-none font-bold">
                {xp > 0 ? `+${xp}` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
}