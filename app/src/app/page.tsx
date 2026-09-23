import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-600/15 via-transparent to-transparent" />
      <div className="absolute top-20 -left-32 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute bottom-40 -right-32 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-3xl" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold shadow-lg shadow-indigo-500/30">
            S
          </div>
          <span className="text-[15px] font-bold tracking-tight">StudyPlanner</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/help/student"
            className="hidden sm:inline text-[13px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            Hướng dẫn
          </Link>
          <Link
            href="/help/student"
            className="sm:hidden text-[12px] font-medium text-slate-400 hover:text-white transition-colors"
          >
            Help
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-[13px] font-semibold shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 transition-all ring-1 ring-white/10"
            >
              Vào Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-white/10 px-4 py-2 text-[13px] font-semibold backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-400/20 px-4 py-1.5 mb-8">
          <span className="text-sm">🏰</span>
          <span className="text-[12px] font-semibold text-indigo-300">Đế chế Tri thức</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
          Biến việc học thành
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            cuộc chinh phục
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Quản lý lộ trình học tập, theo dõi tiến bộ mỗi ngày, và nhận phần thưởng
          khi hoàn thành mục tiêu — tất cả trong một ứng dụng gamified.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-[15px] font-bold shadow-xl shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all ring-1 ring-white/10"
          >
            {isLoggedIn ? "Vào Dashboard" : "Bắt đầu miễn phí"}
          </Link>
          <a
            href="#why"
            className="rounded-2xl px-8 py-4 text-[15px] font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Tìm hiểu thêm ↓
          </a>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "🎯", value: "Lộ trình", desc: "Tạo mục tiêu rõ ràng" },
            { icon: "📊", value: "Tiến bộ", desc: "Theo dõi mỗi ngày" },
            { icon: "🏆", value: "XP & Gold", desc: "Phần thưởng gamified" },
            { icon: "🤖", value: "AI Coach", desc: "Tư vấn thông minh" },
          ].map((s) => (
            <div key={s.value} className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center backdrop-blur-sm">
              <span className="text-2xl">{s.icon}</span>
              <p className="mt-2 text-[14px] font-bold">{s.value}</p>
              <p className="mt-0.5 text-[12px] text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why section */}
      <section id="why" className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Tại sao <span className="text-indigo-400">StudyPlanner</span> ra đời?
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Từ thực tế của việc ôn thi và quản lý mục tiêu cá nhân
          </p>
        </div>

        <div className="space-y-6">
          <ReasonCard
            emoji="😵"
            title="Học nhiều nhưng không biết mình đang ở đâu"
            description="Hầu hết học sinh ôn thi đều lạc lối giữa hàng tá môn, chuyên đề, deadline. Không có cái nhìn tổng quan, dễ bỏ sót phần quan trọng."
          />
          <ReasonCard
            emoji="📋"
            title="Ghi chú rời rạc, không hệ thống"
            description="Dùng Excel, giấy note, app tách biệt — thông tin phân mảnh. Không biết hôm nay nên ưu tiên gì, tuần này đã học bao nhiêu giờ."
          />
          <ReasonCard
            emoji="😴"
            title="Thiếu động lực kiên trì mỗi ngày"
            description="Ôn thi là marathon, không phải sprint. Nhưng ai cũng dễ bỏ cuộc sau vài tuần vì không thấy tiến bộ rõ ràng."
          />
          <ReasonCard
            emoji="👨‍👩‍👧"
            title="Mentor muốn đồng hành nhưng không biết cách"
            description="Phụ huynh, gia sư, thầy cô — muốn theo dõi nhưng không muốn gây áp lực. Cần một cách nhẹ nhàng để nắm tình hình."
          />
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            StudyPlanner giải quyết <span className="text-purple-400">như thế nào?</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <FeatureCard
            icon="🗺️"
            title="Lộ trình trực quan"
            description="Tạo mục tiêu, chia chuyên đề theo nhóm, đặt mốc quan trọng. Import nhanh từ file Markdown."
          />
          <FeatureCard
            icon="🏰"
            title="Đế chế 3D gamified"
            description="Mỗi chuyên đề là một thành trì. Học giỏi hơn = thành trì mạnh hơn. Bản đồ 3D thay đổi theo tiến bộ thực tế."
          />
          <FeatureCard
            icon="📝"
            title="Log học tập hàng ngày"
            description="Ghi nhận hoạt động, thời gian, điểm số, tâm trạng. Nhận XP, Gold, streak bonus mỗi lần log."
          />
          <FeatureCard
            icon="🤖"
            title="AI Coach cá nhân"
            description="Hỏi AI về chiến lược ôn thi, đánh giá tuần, gợi ý hôm nay nên học gì — dựa trên dữ liệu thật."
          />
          <FeatureCard
            icon="📊"
            title="Tiến bộ rõ ràng"
            description="Biểu đồ streak, lịch sử điểm số, level up system. Nhìn lại là thấy mình đã đi bao xa."
          />
          <FeatureCard
            icon="👨‍👩‍👧‍👦"
            title="Kết nối Mentor"
            description="Phụ huynh, gia sư, thầy cô có dashboard riêng để theo dõi học sinh, ghi nhật ký quan sát, đặt mục tiêu tuần — không gây áp lực."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 p-10 backdrop-blur-sm">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isLoggedIn ? "Quay lại đế chế của bạn" : "Sẵn sàng chinh phục đế chế tri thức?"}
          </h2>
          <p className="mt-3 text-slate-400">
            {isLoggedIn ? "Dashboard đang chờ bạn." : "Miễn phí. Không cần thẻ tín dụng. Bắt đầu trong 30 giây."}
          </p>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="mt-8 inline-block rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-[15px] font-bold shadow-xl shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all ring-1 ring-white/10"
          >
            {isLoggedIn ? "Vào Dashboard" : "Bắt đầu ngay"}
          </Link>
        </div>
      </section>

      {/* About & Footer */}
      <footer className="relative z-10 border-t border-white/5 pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold">
                  S
                </div>
                <span className="text-[14px] font-bold">StudyPlanner</span>
              </div>
              <p className="text-[12px] text-slate-400 leading-relaxed">
                {"Ứng dụng game hoá lộ trình học tập — giúp học sinh tự quản lý mục tiêu và mentor đồng hành hiệu quả."}
              </p>
            </div>

            <div>
              <h3 className="text-[13px] font-bold mb-3">{"Hướng dẫn"}</h3>
              <ul className="space-y-2 text-[12px] text-slate-400">
                <li>
                  <Link href="/help/student" className="hover:text-white transition-colors">
                    {"Hướng dẫn cho Học sinh"}
                  </Link>
                </li>
                <li>
                  <Link href="/help/mentor" className="hover:text-white transition-colors">
                    {"Hướng dẫn cho Mentor"}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    {"Đăng nhập / Đăng ký"}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[13px] font-bold mb-3">{"Liên hệ & Hỗ trợ"}</h3>
              <ul className="space-y-2 text-[12px] text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="text-slate-500">Dev:</span>
                  <span className="text-slate-300 font-medium">Phi Hong Thai</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-500">Email:</span>
                  <a href="mailto:phihongthai.it@gmail.com" className="hover:text-white transition-colors">
                    phihongthai.it@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-500">Facebook:</span>
                  <a href="https://facebook.com/phi.thai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    fb.com/phi.thai
                  </a>
                </li>
              </ul>
              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
                {"Gửi feedback, báo lỗi, hoặc yêu cầu tính năng qua email hoặc Facebook."}
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-5 flex items-center justify-between text-[11px] text-slate-600">
            <p>© 2026 StudyPlanner v1.1.0 · Built with Next.js, Supabase & Three.js</p>
            <p>Made with purpose by Phi Hong Thai</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ReasonCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
      <span className="text-3xl shrink-0 mt-0.5">{emoji}</span>
      <div>
        <h3 className="text-[15px] font-bold">{title}</h3>
        <p className="mt-1.5 text-[13px] text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/15 transition-all">
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-3 text-[15px] font-bold">{title}</h3>
      <p className="mt-1.5 text-[13px] text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
