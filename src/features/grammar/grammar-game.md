# 🎮 VocabAI Grammar Quest - Game Engineering & Architecture Standard

File này định nghĩa kiến trúc kỹ thuật, quy chuẩn đồng bộ UI/UX, âm thanh (SFX), hiệu ứng chuyển động (Animation), và vòng lặp trò chơi (Game Loop) cho toàn bộ 5 mini-games thuộc module **Grammar Quest**.

---

## 🏗️ 1. Kiến trúc dùng chung (Shared Infrastructure)

Topics và sub-topics được cache theo user trong localStorage; cache curriculum không chứa theory hoặc question payload. Theory chỉ được tải khi mở Theory Mode, còn stages/questions chỉ tải khi bắt đầu campaign. Các request được điều phối qua `api/grammarApi.ts`, kiểu dùng chung nằm trong `types/`, và `hooks/useGrammarHubData.ts` quản lý cache cùng tiến độ. Kết quả campaign được gửi về backend để lưu mastery và XP.

Luồng học: Grammar Hub → chọn topic → chọn sub-topic → Theory Mode (mục lục nhảy nhanh, bốn slide, phím tắt, vuốt và phát âm ví dụ) hoặc Game Campaign (chọn mức ôn nhanh, tiêu chuẩn hoặc toàn bộ).

Mỗi campaign ghi nhận kết quả theo chuyên đề và lưu các câu trả lời sai trong phiên. Khi hoàn tất toàn bộ chặng, màn tổng kết hiển thị XP, số tim còn lại, thời lượng, độ chính xác và danh sách câu cần ôn.

Để đảm bảo **sửa 1 game là cả 5 game được thừa hưởng**, tất cả 5 mini-games BẮT BUỘC phải sử dụng các module dùng chung đặt tại `src/features/grammar/`:

src/features/grammar/
├── api/
│   └── grammarApi.ts             # Backend requests and DB-to-game data mapping
├── components/
│   ├── GrammarCampaignSession.tsx # Campaign state and stage orchestration
│   ├── screens/                   # Game, theory, and topic screens
│   └── shared/                    # Reusable game UI and animation styles
├── constants/                     # Game and theory configuration
├── hooks/                         # Game sound and Grammar Hub data hooks
├── types/                         # Curriculum, game, and progress types
├── utils/                         # Cache adapters and pure helpers
└── grammar-game.md                # Source of Truth

## 🔊 2. Âm thanh đồng bộ (`hooks/useGameSound.ts`)

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