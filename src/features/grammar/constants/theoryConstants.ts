export type TheorySlideCategory = 'formula' | 'usage' | 'examples' | 'traps';

export const THEORY_SLIDES: {
  category: TheorySlideCategory;
  label: string;
  title: string;
}[] = [
  { category: 'formula', label: '01 · NẮM CÔNG THỨC', title: 'Công thức cốt lõi' },
  { category: 'usage', label: '02 · NHẬN DIỆN NGỮ CẢNH', title: 'Cách dùng & dấu hiệu' },
  { category: 'examples', label: '03 · XEM VÍ DỤ', title: 'Phân tích ví dụ' },
  { category: 'traps', label: '04 · TRÁNH BẪY', title: 'Bẫy thường gặp' },
];
