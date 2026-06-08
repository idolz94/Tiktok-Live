# Lumi Live Client Next.js

## Vai trò repo

Repo này là frontend Next.js của Lumi Live.

Client chỉ có nhiệm vụ:
- Đăng ký / đăng nhập.
- Gọi API sang Backend Node.js.
- Mở SSE để nhận comment realtime.
- Hiển thị comment live.
- Tạo đơn từ comment.
- Hiển thị danh sách đơn hàng.
- Hiển thị lịch sử phiên live.
- Hiển thị license / trial.

## Kiến trúc

```txt
Client Next.js
        ↓
Backend Node.js Express
        ↓
Supabase / Redis
        ↓
SSE realtime
        ↓
Client Next.js
```

Python Collector không được gọi trực tiếp từ client.

```txt
Python TikTok Collector
        ↓
Backend Node.js
        ↓
Supabase + SSE
        ↓
Client Next.js
```

## Quy tắc bắt buộc

- Client không được gọi Supabase trực tiếp.
- Client không được gọi Python trực tiếp.
- Client không được gọi `http://localhost:8765`.
- Client chỉ gọi Backend Node.js qua `lib/request.ts`.
- Realtime comment phải nhận qua SSE từ `/api/live-stream/events`.
- Không được để `SUPABASE_SERVICE_ROLE_KEY` trong client.
- Không được để `NODE_INTERNAL_API_KEY` trong client.
- Không được để `COLLECTOR_CONTROL_API_KEY` trong client.

## API client được phép gọi

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Me

```txt
GET /api/me/bootstrap
```

### Live stream

```txt
GET  /api/live-stream/events
POST /api/live-stream/start
POST /api/live-stream/stop
```

### Orders

```txt
GET    /api/orders
POST   /api/orders/from-comment
PATCH  /api/orders/:orderId/deposit-status
PATCH  /api/orders/:orderId/status
DELETE /api/orders/:orderId
```

### Live sessions

```txt
GET /api/live-sessions/history
```

### License

```txt
GET  /api/licenses/current
POST /api/licenses/refresh
```

## Flow màn Live

```txt
1. App mở.
2. Đọc accessToken.
3. Gọi GET /api/me/bootstrap.
4. Mở SSE /api/live-stream/events.
5. User nhập TikTok username.
6. Gọi POST /api/live-stream/start.
7. Nhận event COMMENT.
8. Render comment realtime.
9. User bấm tạo đơn.
10. Gọi POST /api/orders/from-comment.
11. User bấm dừng live.
12. Gọi POST /api/live-stream/stop.
13. Gọi lại history nếu cần.
```

## SSE events cần xử lý

```txt
PING
LIVE_CONNECTED
COMMENT
LIVE_ERROR
LIVE_DISCONNECTED
COLLECTOR_STOPPED
```

## Quy tắc state

- Không gọi `/api/me/bootstrap` liên tục.
- Bootstrap chỉ gọi khi app mở, login/register thành công, logout hoặc refresh thủ công.
- Khi rời màn live phải close EventSource.
- Khi nhận comment trùng id thì update comment cũ, không thêm duplicate.
- Comment có `priority_level = high` thì đưa vào tab ưu tiên.
- Comment có `can_create_order = true` thì hiển thị nút tạo đơn rõ hơn.

## Env

### Local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production

```env
NEXT_PUBLIC_API_URL=https://tiktok-live-be.onrender.com/api
```

## Commands

```bash
npm run dev
npm run build
npm run typecheck
```

## Khi sửa code

Trước khi sửa:
1. Đọc file liên quan.
2. Xác định API nào được gọi.
3. Không tự tạo API path mới nếu backend chưa có.

Sau khi sửa:
1. Chạy build/typecheck nếu có.
2. Kiểm tra Network không còn call Supabase/Python.
3. Kiểm tra SSE vẫn nhận PING/COMMENT.


## Figma Design Workflow

Repo client có thể dùng Figma MCP trong Claude Code để code UI sát design.

Quy tắc:
- Chỉ dùng Figma MCP trong repo client.
- Không dùng Figma MCP trong backend hoặc python collector.
- Khi user đưa Figma link, phải đọc design context trước khi code.
- Không đoán layout nếu Figma MCP có thể đọc được design.
- Ưu tiên map design sang Tailwind CSS.
- Giữ đúng spacing, font size, border radius, color, shadow theo Figma.
- Nếu design có component lặp lại, tạo component React riêng.
- Không hardcode quá nhiều nếu có thể tách constants/components.
- Nếu thiếu asset/icon/image, báo rõ asset nào thiếu.
- Nếu Figma không đọc được, yêu cầu user check quyền share hoặc export screenshot.

Flow code UI từ Figma:
1. Nhận Figma link hoặc node/frame.
2. Dùng Figma MCP đọc design context.
3. Xác định page/component cần sửa.
4. Tìm file UI tương ứng trong Next.js.
5. Code bằng React + Tailwind CSS.
6. So sánh lại với Figma.
7. Chạy npm run build nếu có.

Prompt mẫu:
"Use Figma MCP to inspect this Figma frame: <link>. Then update the corresponding Next.js page/component to match the design using Tailwind CSS. Do not change backend API logic."

---

# Frontend Code Rules

## Tech stack chính

Repo client dùng:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prettier
- prettier-plugin-tailwindcss
- eslint-config-prettier
- SWR
- React Hook Form
- Zod
- Sonner
- Vaul

---

## Next.js Rules

- Ưu tiên dùng App Router nếu project đang dùng `app/`.
- Chỉ thêm `"use client"` khi component thật sự cần:
  - useState
  - useEffect
  - event handler
  - localStorage
  - EventSource
  - React Hook Form
- Không đặt `"use client"` ở page/layout nếu không cần.
- Không viết logic API trực tiếp trong component lớn.
- Tách logic thành:
  - `services/`
  - `hooks/`
  - `lib/`
  - `types/`
- Page chỉ nên điều phối layout và gọi component.
- Component UI nên nhỏ, dễ đọc, dễ reuse.
- Không gọi API trực tiếp bằng `fetch` rải rác trong component.
- Mọi API phải đi qua `lib/request.ts` hoặc service wrapper.

Ví dụ đúng:

```txt
app/live/page.tsx
features/live/components/LiveCommentList.tsx
features/live/hooks/useLiveStreamSse.ts
features/live/services/live-stream.api.ts
features/live/types/live-comment.ts


---

# GitNexus Rules

Repo này dùng GitNexus để giảm context/token khi làm việc với Claude Code.

## Mục tiêu

- Giúp Claude Code hiểu cấu trúc repo trước khi đọc nhiều file.
- Giảm việc grep/read toàn bộ codebase.
- Ưu tiên tìm đúng file, đúng flow, đúng dependency trước khi sửa code.
- Tránh việc Claude sửa nhầm file vì thiếu context.
- Tránh nạp quá nhiều file vào context.

## Quy tắc bắt buộc

- Khi task yêu cầu hiểu flow lớn, phải dùng GitNexus trước khi đọc nhiều file.
- Không đọc toàn bộ repo nếu GitNexus đã có index.
- Không grep lan man qua nhiều thư mục nếu có thể hỏi GitNexus trước.
- Không mở quá nhiều file cùng lúc.
- Chỉ đọc những file GitNexus hoặc architect-agent xác định là liên quan.
- Sau khi refactor lớn, đổi nhiều function, đổi route, đổi service, phải re-index GitNexus.
- Sau khi git pull hoặc merge branch lớn, phải re-index GitNexus.
- Không để GitNexus tự ghi đè `CLAUDE.md`.
- Luôn chạy GitNexus với `--skip-agents-md` hoặc dùng `.gitnexusrc` có `skipContextFiles: true`.

## Commands

Index repo:

```bash
gitnexus analyze --skip-agents-md