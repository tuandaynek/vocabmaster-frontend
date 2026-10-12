# 🎮 VocabAI Grammar Quest - Game Engineering & Architecture Standard

File này định nghĩa kiến trúc kỹ thuật, quy chuẩn đồng bộ UI/UX, âm thanh (SFX), hiệu ứng chuyển động (Animation), và vòng lặp trò chơi (Game Loop) cho toàn bộ 5 mini-games thuộc module **Grammar Quest**.

---

## 🏗️ 1. Kiến trúc dùng chung (Shared Infrastructure)

Để đảm bảo **sửa 1 game là cả 5 game được thừa hưởng**, tất cả 5 mini-games BẮT BUỘC phải sử dụng các module dùng chung đặt tại `src/features/grammar/`:

src/features/grammar/
├── grammar-game.md               # Source of Truth
└── GrammarCampaignSession.tsx    # Màn campaign 3 chặng
└──components/                   # THƯ MỤC COMPONENTS CHÍNH
    ├── shared/                   # Subfolder 1: Đồ dùng chung
    │   ├── useGameSound.ts       # Hook phát SFX
    │   ├── GameHeader.tsx        # Header đồng bộ
    │   ├── GameOverModal.tsx     # Modal thua cuộc (Game Over)
    │   ├── VictoryModal.tsx      # Modal chiến thắng
    │   ├── WordBlock.tsx         # Khối từ nảy 3D
    │   ├── game-animation.css    # Keyframe animations (shake, pop-in, reward)
    │   └── GameReward.tsx        # Floating XP and combo feedback
    │
    └── screens/                  # Subfolder 2: Các màn chơi / games / pages UI
        ├── SentencePuzzleGame.tsx
        ├── ErrorSpotterGame.tsx
        ├── SpeedGrammarQuiz.tsx
        ├── SentenceTransformerGame.tsx
        └── ContextMatchGame.tsx

## 🔊 2. Âm thanh đồng bộ (`useGameSound.ts`)

Mọi game đều gọi chung một hook âm thanh duy nhất để tạo trải nghiệm thính giác đồng nhất:

- `playSelect()`: Tiếng click tệp ngắn khi chọn khối từ / chọn đáp án.
- `playTick()`: Nhịp đếm ngược, tăng cao độ khi sắp hết giờ.
- `playCorrect()`: Tiếng "ting ting" âm vang tươi vui khi trả lời đúng.
- `playIncorrect()`: Tiếng "bõm / tạch" trầm nhẹ khi chọn sai.
- `playGameOver()`: Âm thanh thua cuộc khi mạng sống (`lives`) về 0.
- `playVictory()`: Tiếng nhạc ăn mừng hoàn thành màn chơi.

---

## 🔄 3. Quy chuẩn Vòng lặp Game (Game Loop Standard)

### Logic Mạng sống (Lives Management):
1. Mỗi màn chơi khởi tạo với `lives = 5`.
2. Khi chọn sai hoặc hết giờ, `lives` giảm đi 1.
3. **ĐIỀU KIỆN BẮT BUỘC**: Nếu `lives - 1 <= 0`, trạng thái game lập tức chuyển sang game over và hiển thị `GameOverModal`. Tuyệt đối không cho phép người dùng tiếp tục thao tác khi hết tim.

### Logic Combo & Streak:
- Mỗi câu đúng liên tiếp tăng `streak + 1`.
- Thưởng thêm XP dựa trên combo: `XP_earned = Base_XP + (Streak * 5)` ở cả năm mini-game.
- Trả lời sai reset `streak = 0`.

---

## 🎨 4. Quy chuẩn Animation & Cảm giác vật lý (Physics Feel)

- **Hiệu ứng Khối từ (`WordBlock`):**
  - Viền nổi 3D: `border-b-4 border-slate-200 active:border-b-0 active:translate-y-1`.
  - Khi xuất hiện: `animate-pop-in` (scale từ 0.8 lên 1.0 mượt mà).
  - Khi trả lời sai: `animate-shake` (rung lắc nhẹ màu đỏ).
- **Phản hồi nút bấm (Tactile Feedback):**
  - Mọi nút bấm tương tác đều có `transition-all duration-150 transform active:scale-95`.

---

## 🤖 5. Prompt mẫu chuẩn hóa để gửi cho GitHub Copilot Refactor

Khi nhờ Copilot sửa bất kỳ game nào (hoặc toàn bộ 5 game), hãy dùng đoạn prompt đồng bộ này:

> *"Hãy refactor component `[TênGame].tsx` tuân thủ tuyệt đối quy chuẩn trong `grammar-game.md`:
> 1. Tích hợp hook `useGameSound` để phát âm thanh cho các sự kiện: chọn từ, kiểm tra đúng, chọn sai, và game over.
> 2. Sử dụng component dùng chung `GameHeader`, `WordBlock`, và `GameOverModal`.
> 3. Kiểm tra nghiêm ngặt logic `lives`: khi `lives === 0` phải dừng game ngay lập tức và bật `GameOverModal`.
> 4. Áp dụng các hiệu ứng chuyển động nảy 3D và animation `animate-pop-in`, `animate-shake` từ `game-animation.css`."*