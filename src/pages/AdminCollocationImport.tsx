import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collocationApi } from '../features/collocations/api/collocationApi';
import type { CollocationImportItem } from '@/features/collocations/types';
import { getErrorMessage } from '@/features/collocations/utils/errorMessage';
import { parseCollocationImport } from '@/features/collocations/utils/parseCollocationImport';

export default function AdminCollocationImport() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [parsedCards, setParsedCards] = useState<CollocationImportItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Parse JSON khi người dùng nhập/paste
  const handleParseJson = () => {
    setError('');
    setSuccessMsg('');
    try {
      if (!jsonInput.trim()) {
        setError('Vui lòng paste đoạn JSON vào ô bên dưới.');
        return;
      }

      // Hỗ trợ xóa bớt markdown ```json nếu lỡ copy dính vào
      const cleanedInput = jsonInput
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = parseCollocationImport(JSON.parse(cleanedInput) as unknown);

      setParsedCards(parsed);
      // Mặc định chọn tất cả các thẻ khi parse thành công
      setSelectedIndices(parsed.map((_, index) => index));
    } catch (err: unknown) {
      setError(`Lỗi định dạng JSON: ${err instanceof Error ? err.message : 'Dữ liệu không hợp lệ'}`);
      setParsedCards([]);
      setSelectedIndices([]);
    }
  };

  // 2. Toggle chọn/bỏ chọn từng Card
  const toggleSelectCard = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  // 3. Select All / Deselect All
  const handleToggleSelectAll = () => {
    if (selectedIndices.length === parsedCards.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(parsedCards.map((_, index) => index));
    }
  };

  // 4. Submit các item đã chọn lên DB
  const handlePublish = async () => {
    if (selectedIndices.length === 0) {
      alert('Vui lòng chọn ít nhất 1 collocation để lưu!');
      return;
    }

    const payload = selectedIndices.map((i) => parsedCards[i]);

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      await collocationApi.adminImport(payload);

      setSuccessMsg(`Đã publish thành công collocations vào DB!`);
      
      // Lọc bỏ những card đã được lưu khỏi danh sách preview
      const remainingCards = parsedCards.filter((_, i) => !selectedIndices.includes(i));
      setParsedCards(remainingCards);
      setSelectedIndices(remainingCards.map((_, i) => i));
      if (remainingCards.length === 0) setJsonInput('');

    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Lỗi khi lưu vào database.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* HEADER GIẤU KÍN CÓ NÚT BACK */}
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            🛠️ Collocation Quick Publish (Admin Portal)
          </h1>
          <p className="text-sm text-gray-500">
            Paste JSON từ AI -&gt; Preview Card chuẩn UI -&gt; Pick &amp; Publish.
          </p>
        </div>

        {/* Nút quay về trang chủ */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
        >
          <span>⬅️</span>
          <span>Back to Home</span>
        </button>
      </div>

      {/* STEP 1: PASTE JSON */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <label className="block text-sm font-semibold text-gray-700">
          1. Paste JSON Collocations từ Gemini / ChatGPT:
        </label>
        <textarea
          rows={6}
          className="w-full p-3 font-mono text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder='[\n  {\n    "phrase": "take immediate action",\n    "type": "lexical",\n    "topic": "Environment",\n    "cefr_level": "B2",\n    "meaning": "Hành động ngay lập tức",\n    "base_sentence": "Governments must take immediate action to fight climate change."\n  }\n]'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <button
            onClick={handleParseJson}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            🔍 Parse &amp; Preview Cards
          </button>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {successMsg && <p className="text-sm text-green-600 font-medium">{successMsg}</p>}
        </div>
      </div>

      {/* STEP 2: PREVIEW CARDS & SELECT */}
      {parsedCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
            <div>
              <span className="font-semibold text-gray-700">
                2. Preview Thẻ ({selectedIndices.length}/{parsedCards.length} được chọn)
              </span>
            </div>
            <div className="space-x-3">
              <button
                onClick={handleToggleSelectAll}
                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300"
              >
                {selectedIndices.length === parsedCards.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Publishing...' : '🚀 Publish Selected to DB'}
              </button>
            </div>
          </div>

          {/* GRID RENDER CARDS (Giống trang /dictionary) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsedCards.map((card, idx) => {
              const isSelected = selectedIndices.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleSelectCard(idx)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white ${
                    isSelected
                      ? 'border-indigo-600 shadow-md ring-2 ring-indigo-100'
                      : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Checkbox badge */}
                  <div className="absolute top-3.5 right-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // Đã handle ở parent div click
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </div>

                  {/* Badges Info */}
                  <div className="flex gap-2 mb-2">
                    {card.cefr_level && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                        {card.cefr_level}
                      </span>
                    )}
                    {card.type && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 rounded capitalize">
                        {card.type}
                      </span>
                    )}
                    {card.topic && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded">
                        {card.topic}
                      </span>
                    )}
                  </div>

                  {/* Main Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{card.phrase}</h3>
                  <p className="text-sm font-medium text-indigo-600 mb-3">{card.meaning}</p>

                  {/* Context Sentence */}
                  {card.base_sentence && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                      "{card.base_sentence}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}