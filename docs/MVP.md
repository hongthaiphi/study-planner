# StudyPlanner MVP — Tài liệu mô tả sản phẩm

## 1. Tổng quan

**StudyPlanner** là web app hỗ trợ theo dõi lộ trình mục tiêu cá nhân, tích hợp AI để gợi ý, đánh giá tiến bộ và cổ vũ tinh thần. Dùng cho cả học sinh (ôn thi) lẫn người lớn (mục tiêu cá nhân).

### Phiên bản MVP phục vụ 4 người dùng:

| Người dùng | Vai trò | Mục tiêu |
|---|---|---|
| HS1 | Học sinh | Thi HSG Hoá quốc tế (IChO) — lớp 10 chuyên Hoá ĐHSP |
| HS2 | Học sinh | Thi đỗ chuyên Tin HSGS — lớp 8 |
| PH1 | Phụ huynh HS1 + bản thân | Đồng hành HS1 + Hoàn thành khoá học riêng |
| PH2 | Phụ huynh HS2 + bản thân | Đồng hành HS2 + Học tiếng Anh + Chạy bộ 100km |

### Tech stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + Auth)
- **AI**: Claude API (Sonnet cho phân tích, Haiku cho task nhẹ)
- **Deploy**: Vercel

---

## 2. Người dùng MVP

2 role:

### Học sinh
Đăng nhập bằng tài khoản được tạo sẵn. Là người trực tiếp học và log dữ liệu hàng ngày.

### Phụ huynh
Đăng nhập bằng tài khoản riêng, liên kết với 1 hoặc nhiều học sinh (con). Phụ huynh có **2 không gian**:

1. **Không gian đồng hành** — theo dõi & hỗ trợ lộ trình con (xem mục 3.6)
2. **Không gian cá nhân** — theo dõi & thực hiện project của riêng mình, với đầy đủ tính năng game hoá như học sinh

Phụ huynh dùng cùng hệ thống → hiểu con hơn, làm gương "cùng chiến đấu", và tự phát triển bản thân.

---

## 3. Tính năng

### 3.1 Dashboard tổng quan

Màn hình chính sau khi đăng nhập, hiển thị:

- **Countdown** đến mốc thi gần nhất (VD: "Còn 45 ngày → Vòng tỉnh HSG Hoá")
- **Tiến độ tổng** — thanh progress tổng hợp các chuyên đề (%)
- **Chuyên đề yếu nhất** — top 3 chuyên đề cần cải thiện
- **AI gợi ý hôm nay** — 1 dòng ngắn gọn: "Hôm nay nên ôn Động học Hoá học, lần cuối em làm cách đây 12 ngày"
- **Streak** — số ngày liên tục có log học tập

### 3.2 Quản lý mục tiêu & lộ trình

#### Mốc thi (Milestones)

Danh sách các mốc thi theo thời gian, mỗi mốc gồm:

```
- Tên: "Vòng tỉnh HSG Hoá" 
- Ngày thi: 2027-01-15
- Trạng thái: upcoming / passed
- Ghi chú: "Cần đạt top 5 để vào vòng quốc gia"
```

Ví dụ lộ trình HSG Hoá:
1. Vòng trường → 2. Vòng tỉnh → 3. Vòng quốc gia (VMO/VChO) → 4. Tập huấn đội tuyển → 5. IChO

Ví dụ lộ trình chuyên Tin HSGS:
1. Ôn luyện → 2. Thi vòng 1 (trắc nghiệm) → 3. Thi vòng 2 (tự luận + thực hành)

#### Chuyên đề (Topics)

Database các chuyên đề, mỗi chuyên đề gồm:

```
- Tên: "Nhiệt động học"
- Nhóm: "Hoá lý"
- Mức độ: cơ bản / nâng cao / olympiad
- Trọng số trong đề thi: 15%
- Trạng thái: chưa học / đang học / đã ôn / cần ôn lại
- Điểm trung bình: 72%
- Lần ôn gần nhất: 2026-09-01
```

Chuyên đề được tạo sẵn theo template mục tiêu (xem mục 6).

### 3.3 Log học tập (Study Log)

Học sinh ghi nhận mỗi buổi học:

```
- Ngày: 2026-09-08
- Chuyên đề: Động học Hoá học
- Loại: lý thuyết / bài tập / đề thi thử
- Thời gian học: 90 phút
- Điểm (nếu làm bài): 7.5/10
- Ghi chú: "Khó phần bậc phản ứng phức tạp"
- Tâm trạng: 😊 / 😐 / 😫 (optional)
```

### 3.4 AI Coach

#### a) Gợi ý hôm nay học gì

Dựa trên:
- Chuyên đề nào lâu chưa ôn (spaced repetition đơn giản)
- Chuyên đề nào điểm thấp
- Deadline vòng thi sắp tới
- Trọng số chuyên đề trong đề thi

Output: 1-3 gợi ý ưu tiên kèm lý do ngắn.

#### b) Đánh giá tiến bộ tuần

Mỗi tuần AI tổng hợp:
- Số giờ học, so với tuần trước
- Chuyên đề nào cải thiện, chuyên đề nào stagnate
- Nhận xét xu hướng: "Em đang tập trung nhiều vào Hữu cơ (60% thời gian) nhưng Vô cơ chỉ chiếm 10% dù trọng số đề thi là 20%"

#### c) Cổ vũ & động viên

- Khi streak dài: "7 ngày liên tục — em đang rất ổn định!"
- Khi điểm tăng: "Nhiệt động từ 55% lên 72% trong 2 tuần — tiến bộ rõ rệt"
- Khi có dấu hiệu giảm: nhẹ nhàng nhắc, không tạo áp lực — "Tuần này chưa log buổi nào, mọi thứ ổn chứ? Chỉ cần 30 phút ôn lại là đủ duy trì"

#### d) Cảnh báo sớm

- "Còn 30 ngày thi mà chuyên đề X chưa bắt đầu"
- "Điểm chuyên đề Y giảm 3 lần liên tiếp — cần xem lại phương pháp"

### 3.5 Biểu đồ tiến bộ

- **Line chart**: điểm theo thời gian, filter theo chuyên đề
- **Radar chart**: tổng quan năng lực các chuyên đề (so với mức yêu cầu)
- **Heatmap**: ngày nào có học, ngày nào nghỉ (kiểu GitHub contribution)
- **Bar chart**: phân bổ thời gian theo chuyên đề vs trọng số đề thi

### 3.6 Phụ huynh — Dashboard & công cụ đồng hành

Phụ huynh đăng nhập vào hệ thống riêng, thấy giao diện khác học sinh, tập trung vào vai trò đồng hành.

#### a) Dashboard phụ huynh

- **Tổng quan con**: tiến độ tổng, streak, countdown mốc thi
- **Báo cáo tuần AI** — viết bằng ngôn ngữ đơn giản, không thuật ngữ chuyên môn
- **Cảnh báo cần lưu ý** — AI flag những điều phụ huynh nên biết:
  - "Con chưa log buổi học nào 5 ngày qua"
  - "Tâm trạng con 3 buổi gần nhất đều là 😫"
  - "Chuyên đề Điện hoá còn 0% mà còn 30 ngày thi"

#### b) Giao nhiệm vụ & mục tiêu tuần

Phụ huynh có thể đặt **mục tiêu tuần** cho con (cùng hoặc thay con):
```
- "Tuần này hoàn thành 5 bài tập Quy hoạch động"
- "Học ít nhất 10 tiếng"
- "Ôn lại 2 chuyên đề yếu nhất"
```
Học sinh thấy mục tiêu này trên dashboard → tick hoàn thành → phụ huynh thấy kết quả.

#### c) Nhật ký quan sát (Parent Notes)

Phụ huynh ghi chú quan sát về con — những thứ data không bắt được:
```
- "Hôm nay con có vẻ mệt, ngủ muộn đêm qua"
- "Con nói muốn tập trung Hữu cơ hơn"
- "Thầy dạy thêm nhận xét con yếu phần phổ"
- "Con đang mất động lực, cần động viên"
```
AI Coach sẽ đọc những ghi chú này để điều chỉnh giọng điệu và gợi ý phù hợp hơn (VD: ngày con mệt → không push nặng, chỉ gợi ý ôn nhẹ).

#### d) Hỏi AI về lộ trình

Phụ huynh có thể chat với AI Coach với góc nhìn phụ huynh:
- "Con tôi cần bao nhiêu giờ nữa để đủ sẵn sàng cho vòng tỉnh?"
- "Con đang học đúng hướng không?"
- "Nên thuê gia sư thêm chuyên đề nào?"
- "So với lộ trình chuẩn thì con đang nhanh hay chậm?"

AI trả lời dựa trên data thực tế, ngôn ngữ dành cho phụ huynh.

#### e) Lịch sử & timeline

- Xem toàn bộ study log của con (read-only)
- Timeline lộ trình: mốc nào đã qua, mốc nào sắp tới
- So sánh kế hoạch vs thực tế: "Kế hoạch tuần 8 tiếng, thực tế 5.5 tiếng"

### 3.7 Project cá nhân (cho phụ huynh & mọi người dùng)

Hệ thống project tổng quát — không giới hạn "ôn thi", mà bất kỳ mục tiêu dài hạn nào.

#### a) Tạo project

Mỗi người dùng có thể tạo nhiều project song song:

```
- Tên: "Học IELTS 7.0"
- Loại: learning / fitness / skill / habit / custom
- Deadline: 2027-06-01 (optional)
- Mô tả: "Đạt IELTS 7.0 để apply học bổng"
```

Ví dụ project phụ huynh:
- Hoàn thành khoá AWS Certified
- Học tiếng Anh IELTS 7.0
- Chạy bộ tích luỹ 100km
- Đọc 20 cuốn sách trong năm
- Giảm 5kg trong 3 tháng

#### b) Chuyên đề / Mảng trong project

Mỗi project chia thành các mảng, tự tạo hoặc từ template:

```
Project "IELTS 7.0":
├── Listening (trọng số 25%)
├── Reading (25%)
├── Writing (25%)  
└── Speaking (25%)

Project "Chạy bộ 100km":
├── Kỹ thuật chạy
├── Tích luỹ km
├── Sức bền (tempo run)
└── Phục hồi & dinh dưỡng

Project "Khoá AWS Certified":
├── Cloud Concepts
├── Security
├── Technology  
├── Billing & Pricing
└── Mock Exam
```

#### c) Log hoạt động — cùng cấu trúc với study log

```
- Ngày: 2026-09-09
- Project: Chạy bộ 100km
- Mảng: Tích luỹ km
- Loại: practice
- Giá trị: 5.2 km (hoặc 45 phút, hoặc 8/10 điểm — tuỳ project)
- Ghi chú: "Chạy buổi sáng, pace 6:30"
- Tâm trạng: 😊
```

**Đơn vị đo linh hoạt** — mỗi project tự chọn:
- Học tập: điểm (x/10), giờ học
- Fitness: km, phút, rep
- Đọc sách: số trang, số cuốn
- Habit: done/not done (binary)

#### d) Game hoá — cùng hệ thống Đế chế

Project cá nhân cũng có đế chế riêng:
- Mỗi project = 1 **vương quốc** trên bản đồ
- Mỗi mảng = 1 thành trì
- Cùng hệ thống XP, level, streak, thời tiết
- Nhiệm vụ tuần sinh từ project cá nhân

**Lãnh chúa có nhiều vương quốc** — phụ huynh quản lý đế chế của riêng mình (IELTS, chạy bộ) song song với việc xem đế chế con.

#### e) AI Coach cho project cá nhân

AI Coach hoạt động giống hệt cho mọi loại project:
- Gợi ý hôm nay nên làm gì (dựa trên progress, deadline, spaced repetition)
- Đánh giá tiến bộ tuần
- Cảnh báo khi trễ deadline
- Cổ vũ khi streak dài

Giọng điệu tự động điều chỉnh theo đối tượng:
- Với học sinh: thân thiện, như anh/chị
- Với phụ huynh: ngang hàng, như đồng nghiệp

#### f) Gia đình cùng chiến đấu (Family view)

Dashboard tổng quan gia đình — tất cả thành viên trên 1 màn hình:
```
🏰 Gia đình Nguyễn
├── Con: Đế chế HSG Hoá — Level 12, streak 8 ngày, thời tiết ☀️
├── Bố: Vương quốc IELTS — Level 5, streak 3 ngày, thời tiết 🌤️  
├── Bố: Vương quốc Chạy bộ — 47/100 km, streak 2 ngày
└── Tổng streak gia đình: 13 ngày 🔥
```

**Streak gia đình** = tổng streak tất cả thành viên → động lực tập thể:
- "Cả nhà đã cùng nỗ lực 13 ngày liên tục!"
- Khi 1 người nghỉ → ảnh hưởng streak gia đình → nhẹ nhàng kéo lại
- **Không guilt-trip** — AI nói "Bố hôm nay nghỉ chạy — cũng cần phục hồi" chứ không "Bố làm streak gia đình bị giảm"

---

## 4. Data Model

### users
```
id, name, email, avatar, role (student/parent), created_at
```

### families (nhóm gia đình)
```
id, name, created_at
```

### family_members
```
id, family_id, user_id, role_in_family (parent/child), created_at
```

### projects (thay thế goal_template_id trên user)
```
id, user_id, name, type (exam/learning/fitness/skill/habit/custom),
description, deadline, unit (score/hours/km/pages/boolean),
template_id (optional), is_primary, created_at
```

### goal_templates
```
id, name, description, category (hoa/tin/toan/ly/ielts/running/reading...)
```

### milestones
```
id, project_id, name, date, status, notes, order
```

### topics (mảng/chuyên đề trong project)
```
id, template_id, project_id, name, group, level, weight, order
```

### user_topics (tiến bộ trên từng mảng)
```
id, user_id, topic_id, status, avg_score, last_studied_at
```

### activity_logs (thay thế study_logs — tổng quát hơn)
```
id, user_id, project_id, topic_id, date, 
type (theory/exercise/mock_exam/practice/session),
duration_minutes, value (số liệu: điểm, km, trang...), max_value,
notes, mood, created_at
```

### weekly_goals (mục tiêu tuần do phụ huynh hoặc học sinh đặt)
```
id, student_id, set_by_user_id, week_start, description, 
is_completed, completed_at, created_at
```

### parent_notes (nhật ký quan sát của phụ huynh)
```
id, parent_id, student_id, date, content, created_at
```

### user_game_stats (dữ liệu game của học sinh)
```
id, user_id, level, xp, gold, rare_materials, 
current_streak, best_streak, perfect_weeks, updated_at
```

### quests (nhiệm vụ tuần)
```
id, user_id, week_start, title, description, 
tier (normal/challenge/epic/royal), 
reward_gold, reward_xp, reward_materials,
is_completed, completed_at, source (ai/parent/system), created_at
```

### buildings (công trình trong thành trì)
```
id, user_id, topic_id, type (library/training/tower/forge), 
unlocked_at
```

### achievements (thành tựu đặc biệt)
```
id, user_id, type (territory_conquest/boss_battle/revival/perfect_week),
title, description, earned_at
```

### ai_reports
```
id, user_id, type (daily_suggestion/weekly_review/alert/parent_weekly), 
content, created_at
```

---

## 5. Screens (MVP)

### Học sinh

| # | Màn hình | Mô tả |
|---|---|---|
| S1 | Login | Đăng nhập (email/password hoặc magic link) |
| S2 | Đế chế (Dashboard) | Bản đồ đế chế, thời tiết, level, nhiệm vụ tuần, AI gợi ý |
| S3 | Lộ trình | Timeline mốc thi + danh sách chuyên đề (thành trì) |
| S4 | Log học tập | Form nhập buổi học + lịch sử |
| S5 | Tiến bộ | Biểu đồ: line, radar, heatmap, bar |
| S6 | AI Coach | Chat với AI về lộ trình, hỏi gợi ý |

### Phụ huynh — Không gian đồng hành (con)

| # | Màn hình | Mô tả |
|---|---|---|
| P1 | Login | Đăng nhập phụ huynh |
| P2 | Dashboard PH | Bản đồ đế chế con (visual), cảnh báo AI, báo cáo tuần |
| P3 | Mục tiêu tuần | Đặt mục tiêu cho con, xem tiến độ hoàn thành |
| P4 | Nhật ký quan sát | Ghi chú về tình trạng con (mệt, động lực, feedback thầy cô) |
| P5 | Tiến bộ con | Biểu đồ tiến bộ của con (cùng data như S5) |
| P6 | AI Coach (PH) | Chat với AI từ góc nhìn phụ huynh |
| P7 | Lịch sử học | Xem study log của con (read-only) |

### Phụ huynh — Không gian cá nhân

| # | Màn hình | Mô tả |
|---|---|---|
| PP1 | Danh sách Project | Tất cả project cá nhân, nút tạo mới, filter theo type |
| PP2 | Project Dashboard | Đế chế/vương quốc riêng, tiến độ milestone, thời tiết, level |
| PP3 | Log hoạt động | Form nhập activity (km, giờ, bài, điểm...) + lịch sử |
| PP4 | Tiến bộ cá nhân | Biểu đồ line/heatmap/bar cho project đang chọn |
| PP5 | AI Coach cá nhân | Chat AI về lộ trình project cá nhân |

### Gia đình

| # | Màn hình | Mô tả |
|---|---|---|
| F1 | Family Dashboard | Bản đồ tất cả vương quốc trong gia đình, streak gia đình |

---

## 6. Template chuyên đề có sẵn

### Template: HSG Hoá (IChO pathway)

| Nhóm | Chuyên đề | Trọng số |
|---|---|---|
| Hoá lý | Nhiệt động học | 12% |
| Hoá lý | Động học | 10% |
| Hoá lý | Cân bằng hoá học | 8% |
| Hoá lý | Điện hoá | 10% |
| Vô cơ | Hoá học nguyên tố | 12% |
| Vô cơ | Phức chất | 8% |
| Hữu cơ | Cơ chế phản ứng | 12% |
| Hữu cơ | Tổng hợp hữu cơ | 10% |
| Hữu cơ | Hoá sinh cơ bản | 5% |
| Phân tích | Phân tích định lượng | 8% |
| Phân tích | Quang phổ & Phổ | 5% |

### Template: Chuyên Tin HSGS

| Nhóm | Chuyên đề | Trọng số |
|---|---|---|
| Nền tảng | Toán rời rạc & Tổ hợp | 10% |
| Nền tảng | Số học (ước, bội, modular) | 8% |
| Lập trình | C++ cơ bản & STL | 10% |
| Thuật toán | Sắp xếp & Tìm kiếm | 8% |
| Thuật toán | Quy hoạch động (DP) | 15% |
| Thuật toán | Đồ thị (BFS, DFS, Dijkstra) | 15% |
| Thuật toán | Chia để trị | 8% |
| Thuật toán | Tham lam (Greedy) | 8% |
| Cấu trúc DL | Stack, Queue, Deque | 5% |
| Cấu trúc DL | Cây (Segment tree, BIT) | 8% |
| Kỹ năng | Đọc hiểu đề & phân tích | 5% |

### Template: IELTS (type: learning)

| Nhóm | Mảng | Đơn vị |
|---|---|---|
| Kỹ năng | Listening | band |
| Kỹ năng | Reading | band |
| Kỹ năng | Writing | band |
| Kỹ năng | Speaking | band |
| Từ vựng | Academic Word List | từ |
| Ngữ pháp | Grammar nâng cao | bài |

### Template: Chạy bộ 100km (type: fitness)

| Nhóm | Mảng | Đơn vị |
|---|---|---|
| Cardio | Chạy dài (Long run) | km |
| Cardio | Chạy tempo | km |
| Cardio | Interval/Fartlek | buổi |
| Sức mạnh | Core & leg | buổi |
| Phục hồi | Nghỉ ngơi & giãn cơ | buổi |

### Template: Đọc sách (type: habit)

| Nhóm | Mảng | Đơn vị |
|---|---|---|
| Thể loại | Non-fiction | cuốn |
| Thể loại | Fiction | cuốn |
| Thể loại | Chuyên ngành | cuốn |
| Kỹ năng | Ghi chú & tóm tắt | bài |

### Template: Khoá học online (type: learning)

| Nhóm | Mảng | Đơn vị |
|---|---|---|
| Lý thuyết | Video bài giảng | bài |
| Thực hành | Bài tập / Lab | bài |
| Đánh giá | Quiz / Assignment | điểm |
| Project | Capstone / Final project | % |

---

## 7. Game hoá — Hệ thống Đế chế Tri thức

Mỗi user đóng vai **Lãnh chúa tri thức**, xây dựng đế chế bằng cách chinh phục mục tiêu. Mỗi hành động (học tập, luyện tập, đọc sách, chạy bộ...) = hành động xây dựng đế chế.

Mỗi **project** = một **vương quốc** riêng trên bản đồ đế chế. Một user có thể có nhiều vương quốc — ví dụ phụ huynh có "Vương quốc IELTS" và "Vương quốc 100km". Family Dashboard hiển thị bản đồ tất cả vương quốc của mọi thành viên.

### 7.1 Bản đồ đế chế (Empire Map)

Mỗi **nhóm chuyên đề** = một **vùng lãnh thổ** trên bản đồ:

| Nhóm chuyên đề | Lãnh thổ (Hoá) | Lãnh thổ (Tin) |
|---|---|---|
| Nhóm 1 | Vương quốc Hoá Lý | Thung lũng Nền Tảng |
| Nhóm 2 | Miền đất Vô Cơ | Cao nguyên Thuật Toán |
| Nhóm 3 | Rừng Hữu Cơ | Pháo đài Cấu Trúc Dữ Liệu |
| Nhóm 4 | Đỉnh Phân Tích | Tháp Lập Trình |

Mỗi **chuyên đề** = một **thành trì** trong vùng lãnh thổ đó.

Trạng thái thành trì theo điểm trung bình:
- **0%** — Đất hoang (màu xám, sương mù)
- **1-30%** — Đang khai phá (nền móng, công trình dang dở)
- **31-60%** — Thành trì cơ bản (tường thấp, cờ nhỏ)
- **61-80%** — Thành trì vững chắc (tường cao, tháp canh)
- **81-100%** — Pháo đài huyền thoại (thành trì lộng lẫy, cờ bay phấp phới)

Khi lâu không ôn lại → thành trì **xuống cấp** (rạn nứt, cỏ mọc) — tạo urgency ôn bài mà không cần la mắng.

### 7.2 Nhiệm vụ tuần (Weekly Quests)

Mỗi tuần hệ thống + AI sinh ra **3-5 nhiệm vụ**, chia 3 hạng:

| Hạng | Ví dụ | Thưởng |
|---|---|---|
| **Nhiệm vụ thường** | "Hoàn thành 3 bài tập Động học" | +10 vàng, +5 XP |
| **Nhiệm vụ thử thách** | "Đạt >= 8/10 bài test Điện hoá" | +30 vàng, +15 XP, +1 nguyên liệu hiếm |
| **Nhiệm vụ sử thi** | "Hoàn thành đề thi thử trọn vẹn" | +100 vàng, +50 XP, mở khoá công trình đặc biệt |

Phụ huynh đặt mục tiêu tuần → tự động trở thành **nhiệm vụ hoàng gia** (khung vàng, thưởng cao hơn).

Hoàn thành tất cả nhiệm vụ tuần → **Perfect Week** → bonus lớn + hiệu ứng pháo hoa trên bản đồ.

### 7.3 Tài nguyên & Xây dựng

#### Tài nguyên

| Tài nguyên | Cách kiếm | Dùng để |
|---|---|---|
| **Vàng** | Hoàn thành nhiệm vụ, log học tập | Xây & nâng cấp công trình |
| **XP (kinh nghiệm)** | Mọi hoạt động học | Lên level Lãnh chúa |
| **Nguyên liệu hiếm** | Nhiệm vụ thử thách, streak dài | Công trình đặc biệt |

#### Công trình nâng cấp

Dùng vàng + nguyên liệu để xây trong thành trì:

| Công trình | Điều kiện | Ý nghĩa |
|---|---|---|
| Thư viện | 5 buổi lý thuyết | Đã nắm nền tảng |
| Trường huấn luyện | 10 bài tập | Đã luyện đủ |
| Tháp quan sát | Điểm TB >= 70% | Nhìn xa (nắm vững) |
| Lò rèn huyền thoại | Điểm TB >= 90% | Master chuyên đề |

### 7.4 Level Lãnh chúa

XP tích luỹ → lên level → mở khoá danh hiệu:

| Level | XP | Danh hiệu |
|---|---|---|
| 1-5 | 0-500 | Người khai hoang |
| 6-10 | 500-1500 | Lãnh chúa trẻ |
| 11-15 | 1500-3500 | Tướng quân tri thức |
| 16-20 | 3500-7000 | Hiền giả |
| 21-25 | 7000-12000 | Hoàng đế học thuật |
| 26-30 | 12000+ | Huyền thoại Olympiad |

### 7.5 Streak & Thời tiết đế chế

Streak liên tục → thời tiết đế chế thay đổi:

- **0 ngày**: Bão tố, mây đen — đế chế u ám
- **1-2 ngày**: Nhiều mây — đang hồi phục
- **3-6 ngày**: Nắng đẹp — đế chế thịnh vượng
- **7-13 ngày**: Cầu vồng — dân cư vui mừng
- **14+ ngày**: Thời đại hoàng kim — hiệu ứng vàng lấp lánh

Nghỉ 1 ngày → thời tiết xấu đi (nhưng không mất hết, tránh gây nản).

### 7.6 Sự kiện đặc biệt

| Sự kiện | Trigger | Phần thưởng |
|---|---|---|
| **Chinh phục lãnh thổ** | Tất cả thành trì 1 vùng >= 60% | Mở khoá biểu tượng vùng, hiệu ứng đặc biệt |
| **Đại chiến Boss** | Mốc thi sắp đến (7 ngày) | Chuỗi nhiệm vụ đặc biệt, đếm ngược epic |
| **Hồi sinh thành trì** | Ôn lại chuyên đề đang xuống cấp | Bonus XP gấp đôi |
| **Kỳ tích tuần** | Perfect Week | Pháo hoa + badge tuần |

### 7.7 Phụ huynh trong hệ thống game

Phụ huynh thấy đế chế con dưới dạng **bản đồ visual** — hiểu ngay tiến độ mà không cần đọc số liệu:
- Vùng nào sáng = con học tốt, vùng nào tối = cần cải thiện
- Thành trì nứt vỡ = lâu không ôn
- Thời tiết đẹp = con học đều

Phụ huynh đặt mục tiêu tuần → hiển thị như **nhiệm vụ hoàng gia** với khung vàng → con có thêm động lực vì thưởng cao.

### 7.8 Nguyên tắc thiết kế game

1. **Không phạt, chỉ giảm thưởng** — nghỉ học không mất vàng, chỉ thời tiết xấu đi & thành trì xuống cấp dần
2. **Luôn có đường quay lại** — thành trì xuống cấp thì ôn lại = hồi phục + bonus
3. **Phần thưởng gắn với hành động thực** — không thưởng hành vi vô nghĩa, mỗi phần thưởng phản ánh tiến bộ thật
4. **Không so sánh giữa 2 học sinh** — mỗi người có đế chế riêng, không bảng xếp hạng (MVP)
5. **Visual > số liệu** — bản đồ, thời tiết, công trình kể câu chuyện tiến bộ tốt hơn bảng điểm

---

## 8. AI Prompt Strategy

### Daily suggestion
```
Context cho AI:
- Danh sách chuyên đề + trạng thái + điểm TB + lần ôn cuối
- Mốc thi sắp tới + số ngày còn lại  
- Trọng số đề thi
- Study log 7 ngày gần nhất

Yêu cầu: Gợi ý 1-3 chuyên đề nên ôn hôm nay, kèm lý do ngắn 1 dòng.
Giọng: thân thiện, xen lẫn ngôn ngữ game.
Ví dụ: "Thành trì Điện hoá đang rạn nứt (14 ngày chưa ôn) — 
hôm nay dành 45 phút hồi sinh nó thì được bonus XP gấp đôi đấy!"
```

### Weekly review
```
Context cho AI:
- Study log cả tuần
- Điểm các bài test trong tuần
- So sánh với tuần trước
- Tiến độ tổng vs deadline

Yêu cầu: Đánh giá tuần trong 5-7 dòng, xen ngôn ngữ game.
Khen điểm tốt trước, góp ý điểm cần cải thiện sau. 
Kết thúc bằng 1 câu động viên.
Ví dụ: "Tuần này Lãnh chúa chinh phục 2 nhiệm vụ thử thách 
và lên được level 8! Vương quốc Hoá Lý đang rực rỡ. 
Nhưng Rừng Hữu Cơ vẫn còn sương mù — tuần tới ta tiến vào đó nhé."
```

### Parent weekly report
```
Context:
- Study log cả tuần của con
- Điểm các bài test
- Mục tiêu tuần (đặt bởi phụ huynh) → đạt hay chưa
- Parent notes trong tuần (tâm trạng, nhận xét thầy cô)
- So sánh kế hoạch vs thực tế

Yêu cầu: Viết cho phụ huynh, ngôn ngữ đơn giản, 
không dùng thuật ngữ chuyên môn. 5-8 dòng.
Bao gồm: tóm tắt tuần → điểm tốt → điểm cần lưu ý → 
gợi ý phụ huynh nên làm gì (động viên? cho nghỉ? tìm gia sư?).
```

### Parent alert (cảnh báo cho phụ huynh)
```
Context:
- Study log + mood gần nhất
- Parent notes gần nhất
- Tiến độ vs deadline

Trigger khi:
- Không log học >= 3 ngày liên tục
- Mood 😫 >= 3 lần liên tiếp
- Điểm sụt >= 2 lần liên tiếp trong 1 chuyên đề
- Chuyên đề quan trọng chưa bắt đầu mà deadline gần

Yêu cầu: 1-2 dòng cảnh báo + 1 dòng gợi ý hành động.
Giọng: bình tĩnh, không gây hoảng. Đề xuất cụ thể.
Ví dụ: "Con chưa học 4 ngày và tâm trạng gần đây không tốt. 
Có thể hỏi thăm con nhẹ nhàng, tránh tạo thêm áp lực."
```

### Parent chat (AI Coach cho phụ huynh — về con)
```
Context:
- Toàn bộ data của con (study log, điểm, chuyên đề, milestone)
- Parent notes
- Lịch sử chat trước đó

Yêu cầu: Trả lời câu hỏi phụ huynh về lộ trình con.
Dựa trên data thực tế, không đoán mò.
Giọng: như một cố vấn giáo dục đáng tin cậy.
Khi không đủ data → nói thẳng "chưa đủ dữ liệu để đánh giá, 
cần con log thêm X buổi nữa".
```

### Personal project — Daily suggestion
```
Context cho AI:
- Project type + mảng/chuyên đề + tiến độ + lần hoạt động cuối
- Milestone sắp tới + số ngày còn lại
- Activity log 7 ngày gần nhất
- Streak hiện tại

Yêu cầu: Gợi ý 1-2 hoạt động nên làm hôm nay, kèm lý do.
Giọng: tuỳ project type:
  - fitness → huấn luyện viên năng động ("Hôm nay chạy nhẹ 5km recovery nhé!")
  - learning → mentor đáng tin ("Mảng Writing lâu chưa luyện — viết 1 essay Task 2?")
  - habit → bạn đồng hành ("Đọc 20 trang trước khi ngủ — thành trì Đọc sách sắp lên cấp!")
```

### Personal project — Weekly review
```
Context cho AI:
- Activity log cả tuần
- So sánh với tuần trước
- Tiến độ tổng vs milestone/deadline
- Streak

Yêu cầu: Đánh giá tuần 4-6 dòng, xen ngôn ngữ game.
Khen thành quả trước, gợi ý cải thiện sau.
Kết thúc bằng 1 câu khích lệ.
```

---

## 8. MVP Scope — Không bao gồm

Những thứ **chưa làm** trong MVP, để lại cho version sau:

- [ ] Đăng ký tài khoản tự do (MVP tạo sẵn 2 HS + 2 PH)
- [ ] Role mentor / gia sư riêng
- [ ] Notification push / Zalo / email tự động
- [ ] Ngân hàng đề thi (upload & quản lý đề)
- [ ] Bảng xếp hạng giữa các học sinh
- [ ] Shop mua skin/trang trí cho đế chế
- [ ] Template do cộng đồng đóng góp
- [ ] Mobile app (responsive web là đủ cho MVP)
- [ ] Offline mode
- [ ] Tích hợp Garmin/Strava cho project fitness
- [ ] Chia sẻ project giữa người dùng ngoài gia đình
- [ ] Template marketplace (mua/bán template chuyên đề)

---

## 9. Tiêu chí hoàn thành MVP

### Học sinh
- [ ] 2 học sinh đăng nhập và dùng được
- [ ] Log buổi học mượt, dưới 30 giây
- [ ] Bản đồ đế chế hiển thị đúng tiến độ, trạng thái thành trì cập nhật theo điểm
- [ ] Nhiệm vụ tuần sinh tự động, hoàn thành → nhận thưởng đúng
- [ ] Streak → thời tiết thay đổi, level lên đúng XP
- [ ] AI gợi ý hàng ngày chính xác và hữu ích
- [ ] Biểu đồ tiến bộ dễ đọc

### Phụ huynh — Đồng hành
- [ ] 2 phụ huynh đăng nhập, mỗi người thấy dashboard con mình
- [ ] Đặt mục tiêu tuần cho con, con thấy được trên dashboard
- [ ] Ghi chú quan sát, AI đọc được và điều chỉnh gợi ý
- [ ] Nhận báo cáo tuần AI dễ hiểu
- [ ] Chat với AI Coach hỏi về lộ trình con
- [ ] Nhận cảnh báo khi con nghỉ học lâu / tâm trạng kém

### Phụ huynh — Project cá nhân
- [ ] Tạo project cá nhân từ template hoặc custom
- [ ] Log hoạt động với đơn vị linh hoạt (km, giờ, trang, điểm...)
- [ ] Bản đồ vương quốc riêng, thành trì cập nhật theo tiến độ
- [ ] Nhiệm vụ tuần + streak + level hoạt động đúng
- [ ] AI Coach gợi ý phù hợp loại project (fitness ≠ learning ≠ habit)
- [ ] Family Dashboard hiển thị vương quốc của tất cả thành viên

### Chung
- [ ] Responsive trên điện thoại
- [ ] AI giọng điệu phù hợp: thân thiện với HS, đáng tin cậy với PH, cá nhân hoá theo project type
