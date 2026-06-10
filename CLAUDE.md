# Lumi Live Client Next.js

## Vai trò repo

Repo này là frontend Next.js của Lumi Live.

Client chỉ có nhiệm vụ:

- Đăng ký / đăng nhập bằng Clerk.
- Dùng Clerk session/cookie để xác thực với Backend Node.js.
- Gọi API sang Backend Node.js qua request wrapper nội bộ.
- Mở SSE để nhận comment realtime.
- Hiển thị comment live.
- Tạo đơn từ comment.
- Hiển thị danh sách đơn hàng.
- Hiển thị lịch sử phiên live.
- Hiển thị license / trial.
- Quản lý kênh TikTok của shop qua API backend.

Client không chứa business logic backend, không gọi database trực tiếp, không gọi collector trực tiếp.

## Kiến trúc hệ thống

```txt
Client Next.js
        ↓ Clerk cookie/session + Backend API
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
Supabase + Redis + SSE
        ↓
Client Next.js
```

## Quy tắc bắt buộc

- Client không được gọi Supabase trực tiếp.
- Client không được gọi Python Collector trực tiếp.
- Client không được gọi `http://localhost:8765`.
- Client chỉ gọi Backend Node.js qua `src/lib/request.ts` hoặc service wrapper dùng `src/lib/request.ts`.
- Không dùng `fetch` rải rác trong component/page để gọi backend.
- Realtime comment phải nhận qua SSE từ `/api/live-stream/events`.
- Không tự tạo API path mới nếu backend chưa có.
- Không đưa secrets hoặc internal keys vào client.
- Không lưu hoặc expose các biến sau trong client:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NODE_INTERNAL_API_KEY`
  - `COLLECTOR_CONTROL_API_KEY`
- Không gửi lại `Authorization: Bearer <accessToken>` theo auth flow cũ nếu backend đang dùng Clerk session/cookie.
- Backend request từ client phải dùng `credentials: "include"` để gửi Clerk/session cookie.

## Auth contract hiện tại

Client dùng Clerk làm auth provider.

Quy tắc:

- Login/register dùng Clerk client SDK.
- Sau khi Clerk login/register `complete`, gọi `setActive(...)` để active session.
- API backend dựa trên Clerk session/cookie, không dựa trên Bearer token cũ.
- `src/lib/request.ts` phải mặc định gửi `credentials: "include"`.
- Không tự đọc/gửi access token trong component.
- Không tự gọi `/api/me/bootstrap` nhiều lần trong cùng một flow.

Sau login/register thành công:

```txt
1. Clerk signIn/signUp complete.
2. setActive(session).
3. Nếu register có TikTok ID thì tạo default TikTok channel qua backend.
4. Redirect trực tiếp vào dashboard.
5. DashboardProvider/useAuth bootstrap một lần để lấy app profile/shop/license/channels.
```

## API client được phép gọi

Tất cả path bên dưới là path tương đối so với `NEXT_PUBLIC_API_URL`.
Ví dụ `NEXT_PUBLIC_API_URL=http://localhost:3001/api` thì gọi `/me/bootstrap` sẽ thành `http://localhost:3001/api/me/bootstrap`.

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

> Nếu auth đã chuyển hoàn toàn sang Clerk SDK, chỉ giữ các API auth backend nếu backend còn dùng cho cleanup/logout/app session. Không khôi phục Bearer auth cũ.

### Me / Bootstrap

```txt
GET  /api/me/bootstrap
GET  /api/me/tiktok-channels
POST /api/me/tiktok-channels
PATCH /api/me/tiktok-channels/:channelId
DELETE /api/me/tiktok-channels/:channelId
```

`/api/me/bootstrap` chỉ dùng để khởi tạo app/session context, gồm các thông tin như:

- backend user/profile
- shop
- shop member/role
- license/canUseApp
- default TikTok username
- TikTok channels cần cho app shell

Không dùng bootstrap thay cho mọi API màn hình. Dữ liệu riêng từng màn nên có API riêng nếu backend đã hỗ trợ.

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

## Flow bootstrap/app state

```txt
1. App/dashboard mở.
2. Clerk session đã active hoặc đang loading.
3. Khi Clerk loaded và signed-in, gọi GET /api/me/bootstrap một lần trong useAuth/DashboardProvider.
4. Map response backend thành AuthUser trong client.
5. Dashboard dùng AuthUser để biết shop, role, canUseApp, default TikTok channel.
6. Chỉ refresh bootstrap khi login/register hoàn tất, logout, user bấm refresh thủ công, hoặc sau mutation cần sync app identity như đổi default TikTok channel.
```

Quy tắc tránh gọi bootstrap dư:

- Không gọi bootstrap ở từng tab dashboard.
- Không gọi bootstrap trong mỗi component con nếu DashboardProvider đã có state.
- Không gọi bootstrap sau mỗi route transition nội bộ.
- Login/register nên redirect thẳng vào dashboard thay vì đi qua page trung gian gây bootstrap thêm lần nữa.
- Sau khi đổi default TikTok channel, có thể gọi `refreshAuth()` một lần để sync lại app state.

## Flow màn Live

```txt
1. Dashboard đã bootstrap user/shop/license/channel.
2. Mở SSE /api/live-stream/events khi vào màn live và user đủ quyền dùng app.
3. User chọn hoặc nhập TikTok username.
4. Gọi POST /api/live-stream/start.
5. Nhận event PING/LIVE_CONNECTED/COMMENT/LIVE_ERROR/LIVE_DISCONNECTED/COLLECTOR_STOPPED.
6. Render comment realtime.
7. Nếu comment trùng id thì update comment cũ, không thêm duplicate.
8. User bấm tạo đơn.
9. Gọi POST /api/orders/from-comment.
10. User bấm dừng live.
11. Gọi POST /api/live-stream/stop.
12. Khi rời màn live phải close EventSource.
13. Gọi lại history/orders nếu màn hiện tại cần dữ liệu mới.
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

Quy tắc SSE/comment:

- Khi rời màn live phải close `EventSource`.
- Không mở nhiều EventSource song song cho cùng một session nếu không cần.
- Comment trùng id thì update comment cũ, không append duplicate.
- Comment có `priority_level = high` thì đưa vào tab ưu tiên.
- Comment có `can_create_order = true` thì hiển thị nút tạo đơn rõ hơn.
- SSE phải đi qua backend `/api/live-stream/events`, không gọi collector.

## Quy tắc state/dashboard

- `DashboardProvider` là nơi điều phối auth state, live socket state và order manager state cho dashboard.
- Page trong `app/dashboard/*` nên mỏng, chủ yếu lấy context và render component màn hình.
- Không duplicate state lớn ở nhiều page nếu đã có trong DashboardProvider/hook chung.
- Bottom navigation không prefetch toàn bộ route khi mount nếu gây nhiều request `_rsc`; chỉ prefetch khi user tương tác và cache route đã prefetch.
- UI mobile phải tôn trọng `h-dvh`, safe-area, fixed footer/bottom nav và scroll container riêng.
- Nếu có footer/bottom nav fixed, nội dung scroll phải có padding-bottom đủ để không bị che.

## Env

### Local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Production

```env
NEXT_PUBLIC_API_URL=https://tiktok-live-be.onrender.com/api
```

Quy tắc env:

- Chỉ biến bắt đầu bằng `NEXT_PUBLIC_` mới được expose ra browser.
- Không đưa service role/internal API key vào `.env.local.example` của client.
- Không hardcode URL backend trong component; dùng `NEXT_PUBLIC_API_URL` qua request wrapper.

## Commands

```bash
npm run dev
npm run build
npm run typecheck
```

Nếu project không có script `typecheck`, dùng `npm run build` để kiểm tra TypeScript/Next.js build.

## Khi sửa code

Trước khi sửa:

1. Đọc file liên quan.
2. Xác định flow hiện tại và API nào được gọi.
3. Kiểm tra API đó có trong danh sách backend đã hỗ trợ không.
4. Không tự tạo API path mới nếu backend chưa có.
5. Với task hiểu flow lớn, dùng GitNexus trước khi đọc nhiều file.

Sau khi sửa:

1. Chạy `npm run build` hoặc typecheck nếu có.
2. Với UI/frontend change, chạy app và kiểm tra màn hình nếu có thể.
3. Kiểm tra Network không còn call Supabase/Python/collector trực tiếp.
4. Kiểm tra request backend đi qua `src/lib/request.ts` hoặc service wrapper.
5. Kiểm tra SSE vẫn nhận `PING`/`COMMENT` nếu đụng live flow.
6. Không commit trừ khi user yêu cầu.

## Figma Design Workflow

Repo client có thể dùng Figma MCP trong Claude Code để code UI sát design.

Quy tắc:

- Chỉ dùng Figma MCP trong repo client.
- Không dùng Figma MCP trong backend hoặc Python collector.
- Khi user đưa Figma link, phải đọc design context trước khi code.
- Không đoán layout nếu Figma MCP có thể đọc được design.
- Ưu tiên map design sang React + Tailwind CSS.
- Giữ đúng spacing, font size, border radius, color, shadow theo Figma.
- Nếu design có component lặp lại, tạo component React riêng khi thật sự giúp code dễ đọc.
- Không hardcode quá nhiều nếu có thể tách constants/components, nhưng không over-abstract.
- Không phụ thuộc vào Figma asset URL tạm thời trong production code nếu chưa download/commit asset.
- Nếu thiếu asset/icon/image, báo rõ asset nào thiếu và dùng placeholder hợp lý nếu user đồng ý.
- Nếu Figma không đọc được, yêu cầu user check quyền share hoặc export screenshot.

Flow code UI từ Figma:

1. Nhận Figma link hoặc node/frame.
2. Dùng Figma MCP đọc design context.
3. Xác định page/component cần sửa trong Next.js.
4. Đọc file UI tương ứng.
5. Code bằng React + Tailwind CSS.
6. So sánh lại spacing/layout chính với Figma.
7. Chạy `npm run build` nếu có.
8. Nếu có thể, mở dev server và kiểm tra UI ở mobile width.

Prompt mẫu:

```txt
Use Figma MCP to inspect this Figma frame: <link>. Then update the corresponding Next.js page/component to match the design using Tailwind CSS. Do not change backend API logic.
```

---

# Frontend Code Rules

## Tech stack chính

Repo client dùng:

- Next.js App Router
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
- Clerk

## Next.js rules

- Ưu tiên App Router trong `src/app`.
- Chỉ thêm `"use client"` khi component thật sự cần:
  - `useState`
  - `useEffect`
  - event handler
  - `localStorage`
  - `EventSource`
  - Clerk client hooks
  - React Hook Form
- Không đặt `"use client"` ở page/layout nếu có thể giữ server component.
- Với dashboard hiện tại, nếu layout/page cần context client thì được dùng client component nhưng không lan rộng không cần thiết.
- Không viết logic API trực tiếp trong component lớn.
- Tách logic thành:
  - `src/api/`
  - `src/features/`
  - `src/hooks/`
  - `src/lib/`
  - `src/types/`
- Page chỉ nên điều phối layout/context và gọi component.
- Component UI nên nhỏ, dễ đọc, dễ reuse.
- Không gọi API trực tiếp bằng `fetch` rải rác trong component.
- Mọi API phải đi qua `src/lib/request.ts` hoặc service wrapper.

Ví dụ cấu trúc đúng:

```txt
src/app/dashboard/live/page.tsx
src/features/tiktok-live/sseApi.ts
src/features/tiktok-live/useTikTokLiveSession.ts
src/screens/dashboard/components/HomeView.tsx
src/screens/dashboard/hooks/useOrderManager.ts
src/api/ordersApi.ts
src/lib/request.ts
src/types/database.ts
```

## TypeScript/code style

- Ưu tiên type rõ ở API response và props public của component.
- Không dùng `any` nếu có thể định nghĩa type đơn giản.
- Không thêm abstraction khi chưa cần.
- Không thêm fallback/validation cho case không thể xảy ra trong internal code.
- Chỉ validate ở boundary: form input, API response, external service/SSE.
- Không thêm comment giải thích code đang làm gì; chỉ comment khi có constraint/why không hiển nhiên.
- Không để dead code, import không dùng hoặc compatibility shim không cần thiết.

## UI/Tailwind rules

- Ưu tiên Tailwind class trực tiếp cho component nhỏ/vừa.
- Giữ mobile-first vì app chính đang tối ưu mobile width.
- Với màn có bottom nav/fixed footer, scroll container phải dùng `min-h-0`, `overflow-y-auto`, `pb-*` phù hợp.
- Dùng `h-dvh` thay vì `h-screen` cho màn full height trên mobile nếu liên quan viewport.
- Dùng safe-area khi có top/bottom fixed area:
  - `env(safe-area-inset-top)`
  - `env(safe-area-inset-bottom)`
- Không dùng remote image URL tạm từ Figma trong code lâu dài.

---

# GitNexus Rules

Repo này dùng GitNexus để giảm context/token khi làm việc với Claude Code.

## Mục tiêu

- Giúp Claude Code hiểu cấu trúc repo trước khi đọc nhiều file.
- Giảm việc grep/read toàn bộ codebase.
- Ưu tiên tìm đúng file, đúng flow, đúng dependency trước khi sửa code.
- Tránh sửa nhầm file vì thiếu context.
- Tránh nạp quá nhiều file vào context.

## Quy tắc bắt buộc

- Khi task yêu cầu hiểu flow lớn, phải dùng GitNexus trước khi đọc nhiều file.
- Không đọc toàn bộ repo nếu GitNexus đã có index.
- Không grep lan man qua nhiều thư mục nếu có thể hỏi GitNexus trước.
- Không mở quá nhiều file cùng lúc.
- Chỉ đọc những file GitNexus hoặc architect-agent xác định là liên quan.
- Trước khi sửa API route handler, dùng GitNexus `api_impact` nếu route đã được index.
- Trước refactor/rename symbol dùng nhiều nơi, dùng GitNexus `impact` hoặc `rename` dry-run.
- Sau refactor lớn, đổi nhiều function, đổi route, đổi service, phải re-index GitNexus.
- Sau khi git pull hoặc merge branch lớn, phải re-index GitNexus.
- Không để GitNexus tự ghi đè `CLAUDE.md`.
- Luôn chạy GitNexus với `--skip-agents-md` hoặc dùng `.gitnexusrc` có `skipContextFiles: true`.

## Commands

Index repo:

```bash
gitnexus analyze --skip-agents-md
```

Nếu repo dùng wrapper riêng:

```bash
node .gitnexus/run.cjs analyze --skip-agents-md
```
