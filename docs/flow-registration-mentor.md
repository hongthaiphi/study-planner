# Luồng Đăng ký & Kết nối Mentor-Học sinh

## 1. Tổng quan

```
Học sinh mới ──→ Đăng ký (chọn role) ──→ Duyệt danh sách Mentor ──→ Gửi yêu cầu ──→ Mentor duyệt ──→ Liên kết nhóm
Mentor mới  ──→ Đăng ký (chọn role) ──→ Tạo Profile          ──→ Nhận yêu cầu  ──→ Duyệt        ──→ Liên kết nhóm
```

## 2. Đăng ký tài khoản

### Trang: `/login` (thêm tab Đăng ký)

**Form đăng ký:**
- Tên hiển thị (bắt buộc)
- Email (bắt buộc)
- Mật khẩu (bắt buộc, tối thiểu 6 ký tự)
- Chọn vai trò:
  - 🎓 **Học sinh** — "Tôi muốn quản lý lộ trình học tập"
  - 🧑‍🏫 **Mentor** — "Tôi muốn đồng hành cùng học sinh (phụ huynh, gia sư, thầy cô)"

**Sau khi đăng ký thành công:**
- Tạo row trong bảng `users` (id, name, email, role)
- Tạo row trong `user_game_stats` (level=1, xp=0, streak=0)
- Nếu là Mentor → redirect đến `/profile/edit` (tạo profile)
- Nếu là Học sinh → redirect đến `/dashboard`

**Xác thực email:** Tuỳ chọn — có thể bật Supabase email confirmation sau. MVP bỏ qua.

## 3. Mentor Profile

### 3.1. Bảng DB mới: `mentor_profiles`

| Column | Type | Note |
|--------|------|------|
| id | uuid PK | = user_id |
| bio | text | Giới thiệu ngắn (tối đa 500 ký tự) |
| subjects | text[] | Môn/lĩnh vực: ["Hoá học", "Toán", "IELTS"...] |
| experience | text | Kinh nghiệm (tối đa 200 ký tự) |
| role_type | text | "parent" / "tutor" / "teacher" (phụ huynh / gia sư / thầy cô) |
| is_public | boolean | Hiển thị trong danh sách tìm kiếm (default: true) |
| max_students | int | Số học sinh tối đa (default: 5) |
| avatar_url | text | URL ảnh đại diện (nullable, dùng initial letter nếu null) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 3.2. Trang chỉnh sửa Profile: `/profile/edit`

**Giao diện:**
- Card form với các field từ bảng trên
- Chọn subjects bằng tag input (gợi ý sẵn + tự thêm)
- Chọn role_type bằng radio: Phụ huynh / Gia sư / Thầy cô
- Toggle "Hiển thị profile công khai" (is_public)
- Preview profile trước khi lưu
- Nút "Lưu profile"

### 3.3. Trang xem Profile: `/mentor/[id]`

**Giao diện (public, không cần login):**
```
┌─────────────────────────────────┐
│  [Avatar]                       │
│  Nguyễn Văn A                   │
│  🧑‍🏫 Gia sư                     │
│  ──────────────────             │
│  "Giảng dạy Hoá học 5 năm,     │
│   chuyên luyện thi HSG"        │
│                                 │
│  📚 Môn giảng dạy:              │
│  [Hoá học] [Toán] [Lý]         │
│                                 │
│  💼 Kinh nghiệm:                │
│  5 năm giảng dạy               │
│                                 │
│  👥 Học sinh: 2/5               │
│                                 │
│  [── Gửi yêu cầu kết nối ──]   │
│  (chỉ hiện khi đã login là HS) │
└─────────────────────────────────┘
```

### 3.4. Trang danh sách Mentor: `/mentors`

**Giao diện (public, không cần login):**
```
┌─────────────────────────────────┐
│  🔍 Tìm mentor                  │
│  [Tìm theo tên hoặc môn...]    │
│                                 │
│  Bộ lọc: [Tất cả ▾] [Môn ▾]   │
│                                 │
│  ┌──────────┐ ┌──────────┐     │
│  │ [Avatar] │ │ [Avatar] │     │
│  │ Thầy A   │ │ Cô B     │     │
│  │ Gia sư   │ │ Thầy cô  │     │
│  │ Hoá, Lý  │ │ Toán     │     │
│  │ 2/5 HS   │ │ 1/3 HS   │     │
│  │ [Xem ►]  │ │ [Xem ►]  │     │
│  └──────────┘ └──────────┘     │
└─────────────────────────────────┘
```

**Lọc:**
- Theo role_type (Phụ huynh / Gia sư / Thầy cô / Tất cả)
- Theo môn (subjects)
- Tìm theo tên
- Chỉ hiện mentor có `is_public = true` và còn slot (`current_students < max_students`)

## 4. Luồng Kết nối

### 4.1. Bảng DB mới: `connection_requests`

| Column | Type | Note |
|--------|------|------|
| id | uuid PK | |
| student_id | uuid FK → users | Học sinh gửi yêu cầu |
| mentor_id | uuid FK → users | Mentor nhận yêu cầu |
| message | text | Tin nhắn kèm (tối đa 200 ký tự) |
| status | text | "pending" / "accepted" / "rejected" |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### 4.2. Luồng chi tiết

```
Học sinh                              Mentor
   │                                     │
   ├─ Vào /mentors                       │
   ├─ Tìm & chọn mentor                 │
   ├─ Nhấn "Gửi yêu cầu kết nối"       │
   ├─ (Tuỳ chọn) Gõ tin nhắn:           │
   │  "Em là HS lớp 11, muốn ôn HSG Hoá"│
   ├─ Gửi ──────────────────────────────►│
   │                                     ├─ Thấy badge 🔴 trên Dashboard
   │                                     ├─ Xem yêu cầu: tên, tin nhắn
   │                                     ├─ Nhấn ✅ Chấp nhận
   │                                     │  hoặc ❌ Từ chối
   │  ◄──────────────────────────────────┤
   ├─ Thấy trạng thái: "Đã kết nối"     ├─ Tự động tạo family_members
   │                                     │  (mentor + member)
   └─ Xuất hiện trong Dashboard mentor   └─ Học sinh thấy trong Nhóm
```

### 4.3. Xử lý khi Mentor chấp nhận

1. Cập nhật `connection_requests.status = 'accepted'`
2. Kiểm tra mentor đã có group chưa:
   - Chưa → Tạo row `families` + thêm mentor vào `family_members` (role: mentor)
   - Rồi → Dùng group hiện có
3. Thêm học sinh vào `family_members` (role: member)
4. Học sinh bắt đầu xuất hiện trong Dashboard/Tiến bộ/Mục tiêu tuần của Mentor

### 4.4. Giới hạn

- Mỗi học sinh chỉ kết nối 1 mentor (hoặc mở rộng nhiều mentor sau)
- Mentor tối đa `max_students` học sinh
- Không cho gửi yêu cầu trùng (1 student → 1 mentor chỉ 1 pending request)
- Học sinh có thể huỷ kết nối (rời nhóm)

## 5. Cập nhật Navigation

### Homepage (`/`)
- Thêm card/section: "🧑‍🏫 Tìm Mentor phù hợp" → link `/mentors`

### Sidebar (đã login)
- **Học sinh:** Thêm menu "Tìm Mentor" → `/mentors`
- **Mentor:** Thêm badge yêu cầu mới trên Dashboard

### Trang Login
- Thêm tab "Đăng ký" cạnh "Đăng nhập"

## 6. Tóm tắt trang mới cần tạo

| Route | Loại | Mô tả |
|-------|------|-------|
| `/login` (sửa) | Client | Thêm tab đăng ký với chọn role |
| `/profile/edit` | Auth (Mentor) | Form tạo/sửa mentor profile |
| `/mentor/[id]` | Public | Xem profile mentor |
| `/mentors` | Public | Danh sách mentor + tìm kiếm |

## 7. Migration DB

```sql
-- Bảng mentor_profiles
CREATE TABLE mentor_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  experience TEXT,
  role_type TEXT DEFAULT 'tutor' CHECK (role_type IN ('parent', 'tutor', 'teacher')),
  is_public BOOLEAN DEFAULT TRUE,
  max_students INT DEFAULT 5,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bảng connection_requests
CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

-- RLS policies
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- Mentor profiles: ai cũng đọc được (public), chỉ owner sửa
CREATE POLICY "Public read" ON mentor_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Owner update" ON mentor_profiles FOR ALL USING (id = auth.uid());

-- Connection requests: student tạo, cả 2 bên đọc, mentor update status
CREATE POLICY "Student create" ON connection_requests FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Both read" ON connection_requests FOR SELECT USING (student_id = auth.uid() OR mentor_id = auth.uid());
CREATE POLICY "Mentor update" ON connection_requests FOR UPDATE USING (mentor_id = auth.uid());
```

## 8. Thứ tự triển khai đề xuất

1. **Phase 1:** Đăng ký tài khoản (sửa trang login)
2. **Phase 2:** Mentor profile (DB + trang edit + trang view)
3. **Phase 3:** Danh sách mentor + tìm kiếm
4. **Phase 4:** Luồng kết nối (request + accept/reject)
5. **Phase 5:** Cập nhật navigation + homepage
