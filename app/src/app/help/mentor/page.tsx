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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-[15px] font-bold text-white">{title}</h3>
        </div>
        <code className="text-[11px] text-emerald-200 bg-white/10 rounded px-2 py-0.5">{path}</code>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 overflow-hidden">
          {mockup}
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-[12px] font-bold flex items-center justify-center mt-0.5">
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

export default function MentorHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-[13px]">
            <Link href="/" className="text-slate-500 hover:underline">
              Trang chủ
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/dashboard" className="text-emerald-600 hover:underline">
              Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-emerald-700 bg-clip-text text-transparent">
            Hướng dẫn sử dụng — Mentor
          </h1>
          <p className="text-[14px] text-slate-500 max-w-lg mx-auto">
            Dành cho phụ huynh, gia sư, thầy cô — đồng hành cùng học sinh qua 9 màn hình
          </p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-200/50 p-5">
          <h2 className="text-[14px] font-bold text-emerald-900 mb-3">🎯 Vai trò Mentor</h2>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Mentor là người đồng hành — không phải người quản lý. Bạn đặt mục tiêu <strong>cùng</strong> học sinh,
            theo dõi tiến bộ, ghi nhận quan sát, và dùng AI Coach để nhận tư vấn.
            Hệ thống thiết kế để bạn làm <em>cố vấn</em> (consultant) chứ không phải <em>giám sát</em> (manager).
          </p>
        </div>

        <div className="space-y-6">
          <ScreenGuide
            icon="📋"
            title="Dashboard Mentor"
            path="/dashboard"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">Dashboard Mentor</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Minh Khôi", streak: 5, level: 7 },
                    { name: "Bảo Ngọc", streak: 3, level: 4 },
                  ].map((s) => (
                    <div key={s.name} className="border rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {s.name[0]}
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-slate-800">{s.name}</p>
                          <p className="text-[10px] text-slate-400">Học sinh</p>
                        </div>
                      </div>
                      <div className="flex gap-2 text-[10px]">
                        <span className="bg-indigo-100 text-indigo-600 rounded px-1.5 py-0.5">Lv.{s.level}</span>
                        <span className="bg-orange-100 text-orange-600 rounded px-1.5 py-0.5">Streak {s.streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Tổng buổi (7 ngày)", value: "12" },
                    { label: "TB thời gian/ngày", value: "42m" },
                    { label: "Điểm TB", value: "7.8" },
                  ].map((s) => (
                    <div key={s.label} className="border rounded-lg p-2 text-center">
                      <p className="text-[9px] text-slate-500">{s.label}</p>
                      <p className="text-[13px] font-bold text-slate-800">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            }
            steps={[
              "Dashboard hiển thị danh sách học sinh đã liên kết với bạn.",
              "Mỗi thẻ học sinh hiện: tên, Level, Streak (số ngày liên tục học).",
              "Phía dưới là stats tổng hợp 7 ngày gần nhất: tổng buổi học, thời gian trung bình, điểm trung bình.",
              "Nhấn vào thẻ học sinh để xem chi tiết tiến bộ.",
              "Nếu chưa có học sinh nào, nhờ học sinh liên kết với bạn qua trang Nhóm.",
            ]}
          />

          <ScreenGuide
            icon="🎯"
            title="Mục tiêu tuần"
            path="/weekly-goals"
            mockup={
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-slate-800">Mục tiêu tuần</p>
                  <span className="text-[11px] text-slate-400">Tuần 16/09 - 22/09</span>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="bg-indigo-100 text-indigo-700 rounded-lg px-3 py-1.5 font-medium">Minh Khôi</span>
                  <span className="border rounded-lg px-3 py-1.5 text-slate-500">Bảo Ngọc</span>
                </div>
                <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center text-white text-[8px]">✓</span>
                    <span className="text-[12px] text-slate-600 line-through">Ôn lại chương Nhiệt động học</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border-2 border-slate-300"></span>
                    <span className="text-[12px] text-slate-800">Làm 3 đề thi thử Hóa lý</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded border-2 border-slate-300"></span>
                    <span className="text-[12px] text-slate-800">Đọc tài liệu Cân bằng hóa học</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded-lg px-3 py-2 text-[11px] text-slate-400" placeholder="Thêm mục tiêu mới..." readOnly />
                  <span className="bg-emerald-600 text-white rounded-lg px-3 py-2 text-[11px]">+ Thêm</span>
                </div>
              </div>
            }
            steps={[
              "Chọn tab tên học sinh ở trên để xem/đặt mục tiêu riêng cho từng em.",
              "Tuần hiện tại hiện ở góc phải. Mục tiêu tuần trước sẽ lưu lịch sử.",
              "Nhấn checkbox để đánh dấu hoàn thành (học sinh cũng thấy mục tiêu này).",
              "Gõ mục tiêu mới vào ô và nhấn \"Thêm\" — nên bàn với học sinh trước khi đặt.",
              "Mục tiêu nên cụ thể, đo được: \"Làm 3 đề\" tốt hơn \"Ôn thi thật chăm\".",
            ]}
          />

          <ScreenGuide
            icon="📓"
            title="Nhật ký quan sát"
            path="/notes"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">Nhật ký quan sát</p>
                <div className="flex gap-2 text-[11px]">
                  <span className="bg-indigo-100 text-indigo-700 rounded-lg px-3 py-1.5 font-medium">Minh Khôi</span>
                  <span className="border rounded-lg px-3 py-1.5 text-slate-500">Bảo Ngọc</span>
                </div>
                <div className="border rounded-lg p-3">
                  <textarea className="w-full text-[12px] text-slate-600 resize-none" rows={2} readOnly value="Hôm nay Khôi có vẻ tập trung hơn, hoàn thành 2 đề thi thử..." />
                  <div className="flex justify-end mt-2">
                    <span className="bg-emerald-600 text-white rounded-lg px-3 py-1.5 text-[11px]">Lưu ghi chú</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="border-l-2 border-emerald-400 pl-3 py-1">
                    <p className="text-[10px] text-slate-400">12/09/2026</p>
                    <p className="text-[12px] text-slate-600">Khôi than mệt, chỉ học 20 phút. Nên hỏi tình trạng sức khỏe.</p>
                  </div>
                  <div className="border-l-2 border-emerald-400 pl-3 py-1">
                    <p className="text-[10px] text-slate-400">10/09/2026</p>
                    <p className="text-[12px] text-slate-600">Rất hứng thú với bài Nhiệt động, hỏi nhiều câu nâng cao.</p>
                  </div>
                </div>
              </div>
            }
            steps={[
              "Chọn học sinh bằng tab phía trên.",
              "Gõ quan sát của bạn vào ô text và nhấn \"Lưu ghi chú\".",
              "Ghi cả tính cách, thái độ, tâm trạng — không chỉ điểm số.",
              "Lịch sử ghi chú hiện bên dưới, sắp xếp theo ngày mới nhất.",
              "AI Coach sẽ đọc nhật ký này để đưa tư vấn chính xác hơn.",
            ]}
          />

          <ScreenGuide
            icon="📊"
            title="Tiến bộ học sinh"
            path="/child-progress"
            mockup={
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-slate-800">Tiến bộ học sinh</p>
                  <div className="flex gap-1 text-[10px]">
                    <span className="border rounded-lg px-2 py-1">7 ngày</span>
                    <span className="bg-slate-800 text-white rounded-lg px-2 py-1">30 ngày</span>
                  </div>
                </div>
                <div className="flex gap-2 text-[11px]">
                  <span className="bg-indigo-100 text-indigo-700 rounded-lg px-3 py-1.5 font-medium">Minh Khôi</span>
                  <span className="border rounded-lg px-3 py-1.5 text-slate-500">Bảo Ngọc</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Buổi học", value: "18" },
                    { label: "Tổng giờ", value: "12h" },
                    { label: "TB/ngày", value: "45m" },
                    { label: "Điểm TB", value: "7.5" },
                  ].map((s) => (
                    <div key={s.label} className="border rounded-lg p-2 text-center">
                      <p className="text-[9px] text-slate-500">{s.label}</p>
                      <p className="text-[13px] font-bold text-slate-800">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-2.5">
                  <p className="text-[11px] font-semibold mb-1">Hoạt động gần đây</p>
                  <div className="space-y-1">
                    {["Bài tập · Nhiệt động · 45m · 8/10", "Đề thi thử · Hữu cơ · 90m · 7/10", "Lý thuyết · Vô cơ · 30m"].map((a) => (
                      <p key={a} className="text-[10px] text-slate-500 border-b border-dashed pb-1">{a}</p>
                    ))}
                  </div>
                </div>
              </div>
            }
            steps={[
              "Chọn học sinh và khoảng thời gian (7, 30, 90 ngày).",
              "4 số liệu tổng hợp: số buổi, tổng giờ, trung bình/ngày, điểm trung bình.",
              "Biểu đồ hoạt động theo ngày — nhận biết ngày nào học sinh nghỉ, ngày nào học nhiều.",
              "Danh sách hoạt động gần đây: loại, chuyên đề, thời gian, điểm — xem nhanh em đang làm gì.",
              "Nếu thấy streak bị đứt hoặc điểm giảm, không hoảng — hỏi học sinh trước khi kết luận.",
            ]}
          />

          <ScreenGuide
            icon="🤖"
            title="AI Coach (cho Mentor)"
            path="/coach"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">AI Coach</p>
                <div className="flex flex-col items-center py-3 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg">🤖</div>
                  <p className="text-[13px] font-bold text-slate-800">Xin chào Mentor!</p>
                  <p className="text-[11px] text-slate-400">Hỏi về tiến bộ học sinh, cách đồng hành, hoặc nhận báo cáo</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {["Đánh giá tuần của các em", "Em A đang yếu mảng nào?", "Cách khen hiệu quả"].map((q) => (
                    <span key={q} className="text-[10px] border rounded-full px-2.5 py-1 text-emerald-600">{q}</span>
                  ))}
                </div>
              </div>
            }
            steps={[
              "AI Coach cho Mentor có giọng điệu khác: bình tĩnh, chuyên nghiệp, tư vấn kiểu cố vấn.",
              "Hỏi \"Đánh giá tuần\" → AI tổng kết tiến bộ từng học sinh dựa trên dữ liệu thực.",
              "Hỏi \"Em A đang yếu mảng nào?\" → AI phân tích chuyên đề điểm thấp nhất.",
              "AI khuyên bạn khen nỗ lực (\"Con đã cố gắng làm 5 bài\") chứ không khen tài năng.",
              "Khi không đủ dữ liệu, AI nói thẳng \"Chưa đủ data\" thay vì đoán.",
              "AI không dùng thuật ngữ chuyên môn — phù hợp cho phụ huynh không chuyên.",
            ]}
          />

          <ScreenGuide
            icon="📂"
            title="Project cá nhân"
            path="/my-projects"
            mockup={
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] font-bold text-slate-800">Project cá nhân</p>
                  <span className="text-[11px] bg-emerald-600 text-white rounded-lg px-3 py-1.5">+ Tạo project</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Ôn thi IELTS", type: "Thi", deadline: "2026-12-01" },
                    { name: "Đọc sách Giáo dục tích cực", type: "Kỹ năng", deadline: "—" },
                  ].map((p) => (
                    <div key={p.name} className="border rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.type} · Deadline: {p.deadline}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">→</span>
                    </div>
                  ))}
                </div>
              </div>
            }
            steps={[
              "Mentor cũng có thể tạo project riêng cho bản thân (ôn thi, đọc sách, kỹ năng mềm...).",
              "Nhấn \"Tạo project\" và điền tên, loại, deadline.",
              "Project cá nhân hoàn toàn tách biệt — học sinh không nhìn thấy.",
              "Bạn có thể log hoạt động và theo dõi tiến bộ giống hệt học sinh.",
            ]}
          />

          <ScreenGuide
            icon="👥"
            title="Nhóm"
            path="/family"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">👥 Nhóm</p>
                <div className="border rounded-xl p-3 text-center">
                  <p className="text-[11px] text-slate-500">Streak nhóm</p>
                  <p className="text-2xl font-black text-orange-500">🔥 4 ngày</p>
                  <p className="text-[10px] text-emerald-600">Cả nhóm đều đang nỗ lực!</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Bạn (Mentor)", level: 3, streak: 4 },
                    { name: "Minh Khôi", level: 7, streak: 5 },
                    { name: "Bảo Ngọc", level: 4, streak: 3 },
                  ].map((m) => (
                    <div key={m.name} className="border rounded-xl p-2.5 text-center">
                      <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold mb-1">
                        {m.name[0]}
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 truncate">{m.name}</p>
                      <div className="flex justify-center gap-1 mt-1 text-[8px]">
                        <span className="bg-indigo-100 text-indigo-600 rounded px-1">Lv.{m.level}</span>
                        <span className="bg-orange-100 text-orange-600 rounded px-1">🔥{m.streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
            steps={[
              "Nhóm hiển thị tất cả thành viên: Mentor + học sinh đã liên kết.",
              "Streak nhóm = streak thấp nhất trong nhóm — khuyến khích cả nhóm cùng duy trì.",
              "Mỗi thẻ thành viên hiện Level, Streak, XP — so sánh tích cực, không xếp hạng.",
              "Để thêm học sinh: học sinh đăng ký tài khoản → bạn mời vào nhóm bằng email.",
              "Khi cả nhóm đều có streak ≥ 3 ngày, hiện thông báo chúc mừng.",
            ]}
          />
        </div>

          <ScreenGuide
            icon="👤"
            title="Mentor Profile"
            path="/profile"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">Mentor Profile</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Vai trò</p>
                    <div className="flex gap-1.5 text-[10px]">
                      {["Phụ huynh", "Gia sư", "Thầy/Cô"].map((r, i) => (
                        <span key={r} className={`rounded-lg px-2.5 py-1 ${i === 1 ? "bg-indigo-600 text-white" : "border text-slate-500"}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Giới thiệu</p>
                    <div className="border rounded-lg p-2 text-[11px] text-slate-600">Gia sư Toán-Lý-Hoá 5 năm kinh nghiệm...</div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 mb-1">Môn giảng dạy</p>
                    <div className="flex gap-1 flex-wrap">
                      {["Toán", "Lý", "Hoá"].map((s) => (
                        <span key={s} className="text-[10px] bg-emerald-100 text-emerald-700 rounded px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500">Công khai profile</p>
                    </div>
                    <div className="w-8 h-4 rounded-full bg-emerald-500 relative"><div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div></div>
                  </div>
                </div>
                <span className="block text-center bg-emerald-600 text-white rounded-lg px-3 py-2 text-[11px] font-semibold">Lưu Profile</span>
              </div>
            }
            steps={[
              "Vào \"Profile\" trên sidebar để tạo/chỉnh sửa hồ sơ mentor.",
              "Chọn vai trò: Phụ huynh, Gia sư, hoặc Thầy/Cô giáo.",
              "Viết giới thiệu ngắn (tối đa 500 ký tự) và kinh nghiệm (tối đa 200 ký tự).",
              "Thêm môn giảng dạy — nhấn Enter hoặc chọn từ gợi ý (Toán, Lý, Hoá, Anh, Văn...).",
              "Bật \"Công khai\" để profile hiển thị trên trang Tìm Mentor — học sinh mới có thể tìm thấy bạn.",
              "Đặt số học sinh tối đa bạn muốn nhận (1-20).",
            ]}
          />

          <ScreenGuide
            icon="📬"
            title="Yêu cầu kết nối"
            path="/requests"
            mockup={
              <div className="space-y-3">
                <p className="text-[14px] font-bold text-slate-800">Yêu cầu kết nối</p>
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">M</div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800">Minh Khôi</p>
                      <p className="text-[9px] text-slate-500">hs1@studyplanner.dev</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 bg-white rounded-lg p-2 mb-2 border">&ldquo;Em muốn được anh hướng dẫn ôn thi...&rdquo;</p>
                  <div className="flex gap-2">
                    <span className="flex-1 text-center bg-emerald-600 text-white rounded-lg py-1.5 text-[11px] font-semibold">Chấp nhận</span>
                    <span className="flex-1 text-center border rounded-lg py-1.5 text-[11px] text-slate-600">Từ chối</span>
                  </div>
                </div>
                <div className="border rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">B</div>
                    <p className="text-[11px] text-slate-700">Bảo Ngọc</p>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">Đã chấp nhận</span>
                </div>
              </div>
            }
            steps={[
              "Khi học sinh gửi yêu cầu kết nối, bạn sẽ thấy trong trang \"Yêu cầu\".",
              "Mỗi yêu cầu hiện tên, email, và tin nhắn giới thiệu của học sinh.",
              "Nhấn \"Chấp nhận\" → học sinh tự động được thêm vào nhóm của bạn.",
              "Nhấn \"Từ chối\" → học sinh nhận thông báo — họ có thể gửi lại sau.",
              "Phía dưới là danh sách yêu cầu đã xử lý (đã chấp nhận / đã từ chối).",
            ]}
          />
        </div>

        <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
          <h2 className="text-[14px] font-bold text-emerald-900 mb-3">💡 Mẹo sử dụng hiệu quả</h2>
          <ul className="space-y-2 text-[13px] text-slate-600">
            <li className="flex gap-2"><span>1.</span> <span>Đặt mục tiêu tuần <strong>cùng</strong> học sinh, không áp đặt từ trên xuống.</span></li>
            <li className="flex gap-2"><span>2.</span> <span>Ghi nhật ký quan sát thường xuyên — 1-2 câu mỗi ngày là đủ.</span></li>
            <li className="flex gap-2"><span>3.</span> <span>Khi streak bị đứt, hỏi <em>&quot;có chuyện gì không&quot;</em> thay vì trách.</span></li>
            <li className="flex gap-2"><span>4.</span> <span>Dùng AI Coach để nhận báo cáo tuần thay vì tự theo dõi thủ công.</span></li>
            <li className="flex gap-2"><span>5.</span> <span>Khen nỗ lực cụ thể: <em>&quot;Con đã làm 3 đề liên tiếp, tuyệt lắm!&quot;</em></span></li>
          </ul>
        </div>

        <div className="text-center pt-4 pb-8">
          <Link href="/help/student" className="text-[13px] text-emerald-600 hover:underline font-medium">
            ← Xem hướng dẫn cho Học sinh
          </Link>
        </div>
      </div>
    </div>
  );
}
