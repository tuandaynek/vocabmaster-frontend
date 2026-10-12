import { useState } from 'react';
import '../features/grammar/components/shared/game-animation.css';
import { 
  Flame, 
  Heart, 
  Zap, 
  Sparkles, 
  Lock, 
  BookOpen, 
  Trophy, 
  Play,
  RotateCcw
} from 'lucide-react';
import { useGameSound } from '../features/grammar/components/shared/useGameSound';
import GrammarCampaignSession, { type GameType } from '../features/grammar/GrammarCampaignSession';

interface GrammarTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  level: 'Cơ bản' | 'Trung bình' | 'Nâng cao' | 'Chuyên sâu';
  progress: number;
  isLocked: boolean;
  totalStages: number;
  badgeColor: string;
  iconBg: string;
  stagesMap: GameType[]; // Định nghĩa danh sách các mini-game cho chủ đề này
}

const FAKE_TOPICS: GrammarTopic[] = [
  {
    id: 'topic-1',
    title: 'Thì cơ bản & Dấu hiệu nhận biết',
    category: 'Tenses Foundation',
    description: 'Ôn tập nhanh Hiện tại đơn, Tiếp diễn, Quá khứ và Tương lai với các bẫy hay gặp trong đề thi.',
    level: 'Cơ bản',
    progress: 100,
    isLocked: false,
    totalStages: 3,
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-500',
    stagesMap: ['puzzle', 'error', 'speed']
  },
  {
    id: 'topic-2',
    title: 'Mệnh đề quan hệ & Rút gọn mệnh đề',
    category: 'Clauses & Reduction',
    description: 'Chinh phục Who, Whom, Which, Whose và các dạng rút gọn V-ing, V-ed, To-inf cực hay xuất hiện.',
    level: 'Trung bình',
    progress: 65,
    isLocked: false,
    totalStages: 3,
    badgeColor: 'bg-sky-100 text-sky-700 border-sky-200',
    iconBg: 'bg-sky-500',
    stagesMap: ['error', 'transformer', 'context']
  },
  {
    id: 'topic-3',
    title: 'Đảo ngữ & Thức giả định (Inversion)',
    category: 'Advanced Structures',
    description: 'Vũ khí đạt điểm 9-10 với các cấu trúc Never, Seldom, Hardly... và câu điều kiện giả định.',
    level: 'Nâng cao',
    progress: 20,
    isLocked: false,
    totalStages: 3,
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-500',
    stagesMap: ['transformer', 'speed', 'puzzle']
  },
  {
    id: 'topic-4',
    title: 'Liên từ & Trạng từ chỉ nguyên nhân/nhượng bộ',
    category: 'Connectors',
    description: 'Phân biệt chuẩn xác While, Although, Because of, In spite of trong mọi tình huống viết câu.',
    level: 'Trung bình',
    progress: 0,
    isLocked: false,
    totalStages: 3,
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-500',
    stagesMap: ['context', 'puzzle', 'error']
  },
  {
    id: 'topic-5',
    title: 'Câu bị động đặc biệt & Động từ khuyết thiếu',
    category: 'Passive & Modals',
    description: 'Bị động kép, bị động khách quan và các cấu trúc modal verbs nâng cao (Should have, Might have...).',
    level: 'Chuyên sâu',
    progress: 0,
    isLocked: true,
    totalStages: 3,
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    iconBg: 'bg-rose-400',
    stagesMap: ['puzzle', 'transformer', 'speed']
  }
];

export default function GrammarHubPage() {
  const { playSelect } = useGameSound();

  // Quản lý view hiện tại: 'hub' (bản đồ chủ đề) hoặc 'campaign' (vào chơi game)
  const [currentView, setCurrentView] = useState<'hub' | 'campaign'>('hub');
  const [activeTopic, setActiveTopic] = useState<GrammarTopic | null>(null);

  // Mock User Stats state
  const [userStats] = useState({
    streak: 7,
    lives: 5,
    xp: 1240,
  });

  const handleStartTopic = (topic: GrammarTopic) => {
    if (topic.isLocked) return;
    playSelect();
    setActiveTopic(topic);
    setCurrentView('campaign');
  };

  const handleExitCampaign = () => {
    setCurrentView('hub');
    setActiveTopic(null);
  };

  // Nếu đang trong phiên chơi campaign, hiển thị cụm mini-games tương ứng
  if (currentView === 'campaign' && activeTopic) {
    return (
      <GrammarCampaignSession 
        stages={activeTopic.stagesMap}
        onExitSession={handleExitCampaign}
      />
    );
  }

  // Giao diện chính của Hub (Bản đồ chọn chủ đề)
  return (
    <div className="grammar-hub min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/10 to-teal-50/20 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8 animate-pop-in">

        {/* --- HEADER NAVBAR & USER STATS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/90 backdrop-blur-md p-4 md:p-6 rounded-3xl border-2 border-slate-100 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                Grammar Quest <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold">Arcade & Campaign</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Học ngữ pháp siêu tốc, biến hóa khôn lường cùng AI</p>
            </div>
          </div>

          {/* Stat Badges */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-orange-50 border-2 border-orange-200 text-orange-600 rounded-2xl font-extrabold flex items-center gap-1.5 shadow-sm text-sm">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500 animate-bounce-short" />
              <span>{userStats.streak} Ngày</span>
            </div>
            <div className="px-3.5 py-2 bg-rose-50 border-2 border-rose-200 text-rose-600 rounded-2xl font-extrabold flex items-center gap-1.5 shadow-sm text-sm">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              <span>{userStats.lives} Tim</span>
            </div>
            <div className="px-3.5 py-2 bg-amber-50 border-2 border-amber-200 text-amber-600 rounded-2xl font-extrabold flex items-center gap-1.5 shadow-sm text-sm">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-500" />
              <span>{userStats.xp} XP</span>
            </div>
          </div>
        </div>

        {/* --- HERO BANNER --- */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 p-8 rounded-3xl text-white shadow-xl shadow-emerald-500/10">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              Chiến dịch luyện thi cấp tốc
            </span>
            <h2 className="text-2xl md:text-3xl font-black">Làm chủ hoàn toàn cấu trúc ngữ pháp chỉ với 5 phút mỗi ngày!</h2>
            <p className="text-emerald-50 text-sm md:text-base font-medium opacity-90">
              Chọn ngay một chủ đề bên dưới để bước vào bản đồ 3 chặng thử thách: Ghép khối từ, săn lỗi sai và tăng tốc vượt ải.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute right-32 -top-10 w-32 h-32 bg-amber-300/20 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* --- SECTION TITLE --- */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" /> Bản đồ Chủ đề (Grammar Topics)
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-1.5 rounded-2xl border-2 border-slate-100 shadow-sm">
            Hoàn thành: 1/5 Topics
          </span>
        </div>

        {/* --- TOPICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAKE_TOPICS.map((topic) => (
            <div 
              key={topic.id}
              className={`bg-white/90 backdrop-blur-sm border-2 border-b-4 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all relative flex flex-col justify-between ${
                topic.isLocked ? 'border-slate-100 border-b-slate-200 opacity-60 bg-slate-50/50' : 'border-slate-100 border-b-emerald-100 hover:border-emerald-300 hover:-translate-y-1'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-black border ${topic.badgeColor}`}>
                    {topic.level}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> {topic.totalStages} Chặng ải
                  </span>
                </div>

                <h4 className="text-lg font-black text-slate-800 mb-1">
                  {topic.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2">
                  {topic.description}
                </p>
              </div>

              <div>
                {/* Progress Bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Tiến độ mastery</span>
                    <span className={topic.progress === 100 ? 'text-emerald-600 font-black' : 'text-slate-600'}>
                      {topic.progress}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        topic.progress === 100 ? 'bg-emerald-500' : topic.progress > 0 ? 'bg-amber-400' : 'bg-slate-200'
                      }`}
                      style={{ width: `${topic.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                {topic.isLocked ? (
                  <button 
                    disabled 
                    className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border-2 border-slate-200 text-sm"
                  >
                    <Lock className="w-4 h-4" /> Đã khóa (Hoàn thành bài trước)
                  </button>
                ) : topic.progress === 100 ? (
                  <button 
                    onClick={() => handleStartTopic(topic)}
                    className="w-full py-3.5 bg-white hover:bg-emerald-50 active:translate-y-1 active:border-b-0 border-2 border-b-4 border-emerald-300 text-emerald-700 font-black rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> Ôn tập lại (Mastered)
                  </button>
                ) : (
                  <button 
                    onClick={() => handleStartTopic(topic)}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 border-b-4 border-emerald-700 text-white font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer shadow-emerald-200"
                  >
                    <Play className="w-4 h-4 fill-white" /> Bắt đầu học ngay 🚀
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}