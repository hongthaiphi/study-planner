import Link from "next/link";

function ScreenGuide({
  icon,
  title,
  path,
  mockup,
  steps,
}: {
  icon: string;
  title: string;
  path: string;
  mockup: React.ReactNode;
  steps: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-[15px] font-bold text-white">{title}</h3>
        </div>
        <code className="text-[11px] text-indigo-200 bg-white/10 rounded px-2 py-0.5">{path}</code>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 overflow-hidden">
          {mockup}
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[12px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-[13px] text-slate-700 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockupBar({ items }: { items: { label: string; value: string; color: string }[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item.label} className={`rounded-lg ${item.color} p-2.5 text-white text-center`}>
          <p className="text-[10px] font-semibold uppercase opacity-80">{item.label}</p>
          <p className="text-lg font-black">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function StudentHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-3">
          <Link href="/dashboard" className="text-[13px] text-indigo-600 hover:underline">
            ← Quay về Dashboard
          </Link>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent">
            Hướng dẫn sử dụng — Học sinh
          </h1>
          <p className="text-[14px] text-slate-500 max-w-lg mx-auto">
            Chinh phục đế chế tri thức của bạn qua 5 màn hình chính
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-200/50 p-5">
          <h2 className="text-[14px] font-bold text-indigo-900 mb-3">🗺️ Tổng quan luồng sử dụng</h2>
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium">
            <span className="bg-indigo-100 text-indigo-700 rounded-full px-3 py-1">1. Tạo mục tiêu</span>
            <span className="text-slate-400">→</span>
            <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1">2. Chia chuyên đề</span>
            <span className="text-slate-400">→</span>
            <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1">3. Log hoạt động</span>
            <span className="text-slate-400">→</span>
            <span className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1">4. Xem tiến bộ</span>
            <span className="text-slate-400">→</span>
            <span className="bg-amber-100 text-amber-700 rounded-full px-3 py-1">5. Hỏi AI Coach</span>
          </div>
        </div>

        <div className="space-y-6">
          <ScreenGuide
            icon="🏰"
            title="Đế chế (Dashboard)"
            path="/dashboard"
            mockup={
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-slate-800">Đế chế của bạn</p>
                    <p className="text-[11px] text-slate-400">☀️ Nắng đẹp · Lãnh chúa trẻ · Level 7</p>
                  </div>
                  <div className="rounded-xl bg-indigo-600 text-white px-3 py-1.5 text-center">
                    <p className="text-[9px] font-semibold text-indigo-200">COUNTDOWN</p>
                    <p className="text-lg font-black">45 <span className="text-[10px]">ngày</span></p>
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 h-32 flex items-center justify-center text-slate-400 text-[12px]">
                  🏰 Bản đồ 3D — thành trì thay đổi theo điểm số
                </div>
                <MockupBar items={[
                  { label: "Level", value: "7", color: "bg-indigo-600" },
                  { label: "XP", value: "1250", color: "bg-teal-600" },
                  { label: "Vàng", value: "340", color: "bg-amber-500" },
                  { label: "Streak", value: "5", color: "bg-orange-500" },
                ]} />
              </div>
            }
            steps={[
              "Bản đồ 3D hiển thị đế chế của bạn — mỗi chuyên đề là một thành trì. Điểm trung bình càng cao, thành trì càng hùng vĩ (Đất hoang → Huyền thoại).",
              "Thời tiết đế chế phản ánh streak: mưa bão (0 ngày) → nắng đẹp (3–6 ngày) → cầu vồng → thời đại hoàng kim (14+ ngày).",
              "Countdown hiện số ngày còn lại đến deadline mục tiêu chính.",
              "4 ô stats: Level (cấp độ tổng), XP (kinh nghiệm), Vàng (thưởng), Streak (số ngày liên tục học).",
              "Phía dưới là Nhiệm vụ tuần — hoàn thành để nhận thưởng XP và Gold.",
            ]}
          />

          <ScreenGuide
            icon="🗺️"
            title="Lộ trình"
            path="/roadmap"
            mockup={
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-slate-800">Lộ trình</p>
                  <div className="flex gap-2">
                    <span className="text-[11px] bg-slate-100 border rounded-lg px-2 py-1">📥 Import MD</span>
                    <span className="text-[11px] bg-indigo-600 text-white rounded-lg px-2 py-1">+ Tạo mục tiêu</span>
                  </div>
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-[12px] font-semibold">🏁 Mốc quan trọng</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span>Thi giữa kỳ — 2026-10-15</span>
                  </div>
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-[12px] font-semibold">🏰 Chuyên đề</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Nhóm Đồng học", "Đồng học", "Cân bằng hóa học"].map((t) => (
                      <div key={t} className="border rounded-lg p-2 text-center">
                        <p className="text-[10px] font-medium text-slate-700 truncate">{t}</p>
                        <div className="mt-1 h-1 bg-slate-200 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{ width: "35%" }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
            steps={[
              "Nhấn \"Tạo mục tiêu\" để tạo project mới (ví dụ: HSG Hóa Quốc tế). Chọn loại (thi, học, kỹ năng...) và deadline.",
              "\"Import MD\" — dán nội dung Markdown để tự động tạo chuyên đề và mốc quan trọng.",
              "Mốc quan trọng: các cột mốc thời gian (thi giữa kỳ, nộp bài...). Nhấn ✏️ để sửa, ✅ để đánh dấu hoàn thành.",
              "Chuyên đề: mỗi ô là một mảng kiến thức. Thanh tiến bộ hiện % điểm trung bình. Nhấn vào để sửa tên, nhóm, trọng số.",
              "Nếu có nhiều mục tiêu, chuyển tab ở phía trên để xem từng project.",
            ]}
          />

          <ScreenGuide
            icon="📝"
            title="Log hoạt động"
            path="/log"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">Log hoạt động</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Project</p>
                    <p className="text-[11px] font-medium">HSG Hóa Quốc tế ⭐</p>
                  </div>
                  <div className="border rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Chuyên đề</p>
                    <p className="text-[11px] font-medium">[Hóa lý] Nhiệt động học</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="border rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Loại</p>
                    <p className="text-[11px] font-medium">Bài tập</p>
                  </div>
                  <div className="border rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Thời gian</p>
                    <p className="text-[11px] font-medium">45 phút</p>
                  </div>
                  <div className="border rounded-lg p-2">
                    <p className="text-[10px] text-slate-500">Kết quả</p>
                    <p className="text-[11px] font-medium">8 / 10</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {["😄 Tuyệt vời", "🙂 Tốt", "😐 Bình thường", "😴 Mệt", "😫 Chán nản"].map((m) => (
                    <span key={m} className="text-[9px] border rounded-lg px-1.5 py-1">{m}</span>
                  ))}
                </div>
                <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 p-3">
                  <p className="text-[11px] font-bold text-amber-800">🎉 Phần thưởng! ✨ +25 XP · 🪙 +10 Gold · 🔥 Streak: 5 ngày</p>
                </div>
              </div>
            }
            steps={[
              "Chọn Project và Chuyên đề bạn vừa học.",
              "Chọn Loại hoạt động: Lý thuyết, Bài tập, Đề thi thử, Thực hành, hoặc Buổi học.",
              "Nhập Thời gian (phút) và Kết quả (điểm / tổng điểm) — không bắt buộc.",
              "Chọn Tâm trạng hôm nay — giúp AI Coach hiểu trạng thái của bạn.",
              "Nhấn \"Lưu hoạt động\" → nhận XP, Gold, và streak bonus ngay lập tức! Level up khi đủ XP.",
              "Lịch sử gần đây hiện 20 hoạt động mới nhất bên dưới.",
            ]}
          />

          <ScreenGuide
            icon="📊"
            title="Tiến bộ"
            path="/progress"
            mockup={
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-slate-800">Tiến bộ</p>
                  <div className="flex gap-1 text-[10px]">
                    {["7 ngày", "30 ngày", "90 ngày"].map((t) => (
                      <span key={t} className="border rounded-lg px-2 py-1">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Tổng buổi", value: "23" },
                    { label: "Tổng thời gian", value: "18h 30m" },
                    { label: "TB/ngày", value: "37m" },
                    { label: "Điểm TB", value: "7.5" },
                  ].map((s) => (
                    <div key={s.label} className="border rounded-lg p-2 text-center">
                      <p className="text-[9px] text-slate-500">{s.label}</p>
                      <p className="text-[13px] font-bold text-slate-800">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-2.5">
                  <p className="text-[11px] font-semibold mb-1">📅 Hoạt động theo ngày</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 14 }, (_, i) => (
                      <div key={i} className={`w-full h-8 rounded-sm ${i % 3 === 0 ? "bg-slate-200" : i % 2 === 0 ? "bg-indigo-300" : "bg-indigo-500"}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            }
            steps={[
              "Chọn khoảng thời gian: 7 ngày, 30 ngày, hoặc 90 ngày.",
              "4 số liệu tổng: số buổi học, tổng thời gian, trung bình/ngày, điểm trung bình.",
              "Biểu đồ hoạt động theo ngày — cột cao = học nhiều, cột thấp/trống = nghỉ.",
              "Phân tích theo loại: xem tỷ lệ Lý thuyết vs Bài tập vs Đề thi thử.",
              "Tâm trạng: phân bố cảm xúc qua các buổi học (😄😐😴...).",
              "Theo chuyên đề: xem chuyên đề nào đang yếu, cần tập trung hơn.",
            ]}
          />

          <ScreenGuide
            icon="🤖"
            title="AI Coach"
            path="/coach"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">AI Coach</p>
                <div className="flex flex-col items-center py-4 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg">🤖</div>
                  <p className="text-[13px] font-bold text-slate-800">Chào! Hôm nay cần gì?</p>
                  <p className="text-[11px] text-slate-400">Hỏi về lộ trình, gợi ý học tập, hoặc đánh giá tiến bộ</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {["Hôm nay nên học gì?", "Đánh giá tuần của tôi", "Gợi ý chiến lược ôn thi"].map((q) => (
                    <span key={q} className="text-[10px] border rounded-full px-2.5 py-1 text-indigo-600">{q}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded-lg px-3 py-2 text-[11px] text-slate-400" placeholder="Hỏi AI Coach..." readOnly />
                  <span className="bg-indigo-600 text-white rounded-lg px-3 py-2 text-[11px]">Gửi</span>
                </div>
              </div>
            }
            steps={[
              "Nhấn vào các gợi ý có sẵn hoặc tự gõ câu hỏi.",
              "AI Coach biết dữ liệu thật của bạn: điểm số, streak, chuyên đề yếu/mạnh, lịch sử log.",
              "Hỏi \"Hôm nay nên học gì?\" — AI phân tích chuyên đề yếu nhất và gợi ý ưu tiên.",
              "Hỏi \"Đánh giá tuần\" — AI tổng kết: bao nhiêu buổi, thời gian, điểm, tâm trạng.",
              "AI ưu tiên gợi ý \"làm đề\" hơn \"đọc lý thuyết\" — hiệu quả hơn cho ôn thi.",
              "Giọng thân thiện, dùng ngôn ngữ game (thành trì, nhiệm vụ, lãnh thổ).",
            ]}
          />
        </div>

        <div className="text-center pt-4 pb-8">
          <Link href="/help/mentor" className="text-[13px] text-indigo-600 hover:underline font-medium">
            Xem hướng dẫn cho Mentor →
          </Link>
        </div>
      </div>
    </div>
  );
}
