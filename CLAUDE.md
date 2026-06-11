# CLAUDE.md

# Lumi Client Next.js

## Vai trò repo

Repo này là frontend Next.js của Lumi.

Client chỉ có nhiệm vụ:

* Đăng ký / đăng nhập bằng Clerk.
* Dùng Clerk session/cookie để xác thực với Backend Node.js.
* Gọi API sang Backend Node.js qua request wrapper nội bộ.
* Mở SSE để nhận comment realtime.
* Hiển thị comment live.
* Tạo đơn từ comment.
* Hiển thị danh sách đơn hàng.
* Hiển thị lịch sử phiên live.
* Hiển thị license / trial.
* Quản lý shop.
* Quản lý kênh live của shop: TikTok hiện tại, Facebook sau này.
* Quản lý khách hàng, đơn hàng, sản phẩm, cấu hình shop qua API backend.

Client không chứa business logic backend, không gọi database trực tiếp, không gọi Python collector trực tiếp.

---

## Kiến trúc hệ thống

```txt
Next.js Client
        ↓ Clerk session/cookie + Backend API
Node.js Backend Express
        ↓ Drizzle ORM
Neon Postgres
```

Realtime:

```txt
Python TikTok Collector
        ↓ Internal API
Node.js Backend
        ↓ Save to Neon via Drizzle
        ↓ SSE realtime
Next.js Client
```

Python Collector không được gọi trực tiếp từ client.

---

## Stack hiện tại

Frontend:

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* Clerk
* SWR
* React Hook Form
* Zod
* Sonner
* Vaul
* Prettier
* prettier-plugin-tailwindcss
* eslint-config-prettier

Backend contract:

* Node.js Backend
* Clerk Auth
* Neon Postgres
* Drizzle ORM
* Python Collector thông qua internal API của backend

---

## Quy tắc bắt buộc

* Client không được gọi Neon trực tiếp.
* Client không được gọi Drizzle trực tiếp.
* Client không được gọi Python Collector trực tiếp.
* Client không được gọi `http://localhost:8765`.
* Client chỉ gọi Backend Node.js qua `src/lib/request.ts` hoặc service wrapper dùng `src/lib/request.ts`.
* Không dùng `fetch` rải rác trong component/page để gọi backend.
* Realtime comment phải nhận qua SSE từ Backend Node.js.
* Không tự tạo API path mới nếu backend chưa có.
* Không đưa secrets hoặc internal keys vào client.
* Không gửi Bearer token tự quản lý theo auth flow cũ.
* Backend request từ client phải dùng `credentials: "include"` và để `src/lib/request.ts` tự gắn Clerk token nếu session đang active.

Không lưu hoặc expose các biến sau trong client:

```txt
DATABASE_URL
CLERK_SECRET_KEY
NODE_INTERNAL_API_KEY
COLLECTOR_CONTROL_API_KEY
PROVIDER_API_TOKEN
GHN_TOKEN
VTP_TOKEN
```

Chỉ biến bắt đầu bằng `NEXT_PUBLIC_` mới được phép xuất hiện trong browser.

---

## Auth contract hiện tại

Client dùng Clerk làm auth provider.

Quy tắc:

* Login/register dùng Clerk client SDK.
* Sau khi Clerk login/register `complete`, gọi `setActive(...)` để active session.
* API backend xác thực bằng Clerk session.
* `src/lib/request.ts` mặc định gửi `credentials: "include"`.
* `src/lib/request.ts` tự gắn `Authorization: Bearer <Clerk token>` khi Clerk đã active.
* Không tự đọc/gửi access token trong component.
* Chỉ `ClerkTokenSync` và `src/lib/request.ts` được xử lý token.
* Không tự gọi `/me/bootstrap` nhiều lần trong cùng một flow.

Sau login/register thành công:

```txt
1. Clerk signIn/signUp complete.
2. setActive(session).
3. Nếu register có TikTok ID thì tạo default live channel qua backend.
4. Redirect trực tiếp vào dashboard.
5. DashboardProvider/useAuth bootstrap một lần để lấy app user/shop/license/channels.
```

---

## API base URL

Client dùng:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

Tất cả API path trong client là path tương đối so với `NEXT_PUBLIC_API_URL`.

Ví dụ:

```txt
NEXT_PUBLIC_API_URL=http://localhost:3001/api
request("/me/bootstrap")
→ http://localhost:3001/api/me/bootstrap
```

Không viết:

```txt
request("/api/me/bootstrap")
```

nếu `NEXT_PUBLIC_API_URL` đã có `/api`.

---

## API client được phép gọi

### Me / Bootstrap

```txt
GET  /me/bootstrap
```

`/me/bootstrap` chỉ dùng để khởi tạo app/session context, gồm:

* backend user
* user license
* current shop
* shop list
* shop role nếu có
* canUseApp
* default live channel
* shop channels

Không dùng bootstrap thay cho mọi API màn hình. Dữ liệu riêng từng màn nên có API riêng nếu backend đã hỗ trợ.

---

### Shops

```txt
GET    /shops
POST   /shops
GET    /shops/:shopId
PATCH  /shops/:shopId
DELETE /shops/:shopId
```

---

### Shop channels

Kênh live của shop, gồm TikTok hiện tại và Facebook sau này.

```txt
GET    /shops/:shopId/channels
POST   /shops/:shopId/channels
PATCH  /shops/:shopId/channels/:channelId
DELETE /shops/:shopId/channels/:channelId
```

`shop_channels` có thể gồm:

```txt
platform = tiktok
platform = facebook
```

---

### Shop settings

Cài đặt mặc định của shop.

```txt
GET   /shops/:shopId/settings
PATCH /shops/:shopId/settings
```

Các setting chính:

* phí vận chuyển mặc định
* cọc mặc định
* đồng giá sản phẩm
* kích thước sản phẩm mặc định để tính ship
* cấu hình tạo khách hàng từ comment
* cấu hình nhận diện comment tạo đơn

---

### Live stream

```txt
GET  /live-stream/events
POST /live-stream/start
POST /live-stream/stop
```

Client không gọi Python `/start` hoặc `/stop` trực tiếp.

---

### Live sessions

```txt
GET /live-sessions
GET /live-sessions/history
GET /live-sessions/:sessionId
GET /live-sessions/:sessionId/comments
GET /live-sessions/:sessionId/orders
```

Một phiên live là lịch sử live.

Không cần tạo bảng/UI `live_history` riêng nếu backend đã dùng `live_sessions`.

---

### Comments

```txt
GET /live-sessions/:sessionId/comments
```

Comment realtime chính vẫn nhận qua SSE.

API list comment chỉ dùng cho:

* load lại phiên live
* xem lịch sử live
* recovery khi reload page

---

### Customers

```txt
GET    /customers
POST   /customers
GET    /customers/:customerId
PATCH  /customers/:customerId
DELETE /customers/:customerId
```

Một comment có thể tạo thành customer.

Customer có thể update thông tin:

* tên
* số điện thoại
* ghi chú
* địa chỉ
* avatar/platform username

---

### Customer addresses

```txt
GET    /customers/:customerId/addresses
POST   /customers/:customerId/addresses
PATCH  /customers/:customerId/addresses/:addressId
DELETE /customers/:customerId/addresses/:addressId
```

Một khách hàng có nhiều địa chỉ giao hàng.

---

### Orders

```txt
GET    /orders
POST   /orders
POST   /orders/from-comment
GET    /orders/:orderId
PATCH  /orders/:orderId
DELETE /orders/:orderId
PATCH  /orders/:orderId/deposit-status
PATCH  /orders/:orderId/status
```

Một comment có thể tạo thành đơn hàng.

Một phiên live có nhiều đơn hàng.

Một khách hàng có nhiều đơn hàng.

---

### Products

```txt
GET    /products
POST   /products
GET    /products/:productId
PATCH  /products/:productId
DELETE /products/:productId
```

---

### Product variants

```txt
GET    /products/:productId/variants
POST   /products/:productId/variants
PATCH  /products/:productId/variants/:variantId
DELETE /products/:productId/variants/:variantId
```

Dùng cho setup sản phẩm trước live:

* mã sản phẩm
* màu
* size
* giá
* tồn kho nếu có
* cân nặng/kích thước nếu có

---

### Shipping providers

```txt
GET    /shipping/providers
GET    /shops/:shopId/shipping-providers
POST   /shops/:shopId/shipping-providers
PATCH  /shops/:shopId/shipping-providers/:providerId
DELETE /shops/:shopId/shipping-providers/:providerId
```

Một shop có nhiều provider vận chuyển:

* GHN
* Viettel Post
* GHTK
* manual

Provider tokens/secrets không được trả về client.

---

### License

```txt
GET  /licenses/current
POST /licenses/refresh
```

License gắn với user, không gắn với shop.

Mặc định user mới có license 1 tháng.

Client chỉ đọc `canUseApp`, `plan`, `expiresAt`, `limits`.

Backend là nơi quyết định user có được dùng app hay không.

---

## Flow bootstrap/app state

```txt
1. App/dashboard mở.
2. Clerk session đã active hoặc đang loading.
3. Khi Clerk loaded và signed-in, gọi GET /me/bootstrap một lần trong useAuth/DashboardProvider.
4. Map response backend thành AuthUser trong client.
5. Dashboard dùng AuthUser để biết user, license, currentShop, channels, canUseApp.
6. Chỉ refresh bootstrap khi login/register hoàn tất, logout, user bấm refresh thủ công, hoặc sau mutation cần sync app identity như đổi current shop/default channel.
```

Quy tắc tránh gọi bootstrap dư:

* Không gọi bootstrap ở từng tab dashboard.
* Không gọi bootstrap trong mỗi component con nếu DashboardProvider đã có state.
* Không gọi bootstrap sau mỗi route transition nội bộ.
* Login/register nên redirect thẳng vào dashboard thay vì đi qua page trung gian gây bootstrap thêm lần nữa.
* Sau khi đổi default channel/current shop, có thể gọi `refreshAuth()` một lần để sync lại app state.

---

## Flow màn Live

```txt
1. Dashboard đã bootstrap user/license/shop/channel.
2. Nếu canUseApp = false, không cho start live.
3. Mở SSE /live-stream/events khi vào màn live và user đủ quyền dùng app.
4. User chọn hoặc nhập TikTok username.
5. Gọi POST /live-stream/start.
6. Backend tạo live_session và gọi Python Collector.
7. Client nhận event PING/LIVE_CONNECTED/COMMENT/LIVE_ERROR/LIVE_DISCONNECTED/COLLECTOR_STOPPED.
8. Render comment realtime.
9. Nếu comment trùng id thì update comment cũ, không append duplicate.
10. User bấm tạo khách hàng hoặc tạo đơn.
11. Tạo đơn gọi POST /orders/from-comment.
12. User bấm dừng live.
13. Gọi POST /live-stream/stop.
14. Khi rời màn live phải close EventSource.
15. Gọi lại history/orders nếu màn hiện tại cần dữ liệu mới.
```

---

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

* Khi rời màn live phải close `EventSource`.
* Không mở nhiều EventSource song song cho cùng một session nếu không cần.
* Comment trùng id thì update comment cũ, không append duplicate.
* Comment có `priority_level = high` thì đưa vào tab ưu tiên.
* Comment có `can_create_order = true` thì hiển thị nút tạo đơn rõ hơn.
* SSE phải đi qua backend `/live-stream/events`, không gọi collector.
* Nếu React Native sau này cần realtime tốt hơn, backend có thể bổ sung WebSocket, nhưng Next.js hiện dùng SSE.

---

## Business rules client cần hiểu

Client chỉ render và gọi API, không tự quyết business logic cuối cùng.

Database/business model backend:

```txt
1 user có 1 license.
1 user có nhiều shop.
1 shop có nhiều live channels.
1 live channel có platform: tiktok, facebook sau này.
1 shop có nhiều live sessions.
1 live session có nhiều comments.
1 live session có nhiều orders.
1 comment có thể tạo customer.
1 comment có thể tạo order.
1 customer có nhiều orders.
1 customer có nhiều shipping addresses.
1 order có nhiều order items.
1 shop có nhiều shipping providers.
1 shop có settings mặc định cho order/shipping/product.
```

Client được phép dùng model này để render UI, nhưng quyền ghi/kiểm tra hợp lệ do backend quyết định.

---

## Quy tắc state/dashboard

* `DashboardProvider` là nơi điều phối auth state, live state và order manager state cho dashboard.
* Page trong `app/dashboard/*` nên mỏng, chủ yếu lấy context và render component màn hình.
* Không duplicate state lớn ở nhiều page nếu đã có trong DashboardProvider/hook chung.
* Bottom navigation không prefetch toàn bộ route khi mount nếu gây nhiều request `_rsc`.
* Chỉ prefetch khi user tương tác và cache route đã prefetch.
* UI mobile phải tôn trọng `h-dvh`, safe-area, fixed footer/bottom nav và scroll container riêng.
* Nếu có footer/bottom nav fixed, nội dung scroll phải có padding-bottom đủ để không bị che.
* Với màn live comment, data là trung tâm. Control phụ nên thu gọn, auto-hide hoặc đưa vào bottom sheet.

---

## Env

### Local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

### Production

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
```

Quy tắc env:

* Chỉ biến bắt đầu bằng `NEXT_PUBLIC_` mới được expose ra browser.
* Không đưa database/internal/service secrets vào `.env.local.example` của client.
* Không hardcode URL backend trong component.
* Dùng `NEXT_PUBLIC_API_URL` qua request wrapper.

---

## Commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
```

Nếu project không có script `typecheck`, dùng `npm run build` để kiểm tra TypeScript/Next.js build.

---

## Khi sửa code

Trước khi sửa:

1. Đọc file liên quan.
2. Xác định flow hiện tại và API nào được gọi.
3. Kiểm tra API đó có trong danh sách backend đã hỗ trợ không.
4. Không tự tạo API path mới nếu backend chưa có.
5. Với task hiểu flow lớn, dùng GitNexus trước khi đọc nhiều file.
6. Với UI từ Figma, dùng Figma MCP nếu có link/frame.

Sau khi sửa:

1. Chạy `npm run build` hoặc typecheck nếu có.
2. Với UI/frontend change, chạy app và kiểm tra màn hình nếu có thể.
3. Kiểm tra Network không còn call Neon/Python/collector trực tiếp.
4. Kiểm tra request backend đi qua `src/lib/request.ts` hoặc service wrapper.
5. Kiểm tra SSE vẫn nhận `PING`/`COMMENT` nếu đụng live flow.
6. Không commit trừ khi user yêu cầu.

---

# Frontend Code Rules

## Next.js rules

* Ưu tiên App Router trong `src/app`.
* Chỉ thêm `"use client"` khi component thật sự cần:

  * `useState`
  * `useEffect`
  * event handler
  * `localStorage`
  * `EventSource`
  * Clerk client hooks
  * React Hook Form
* Không đặt `"use client"` ở page/layout nếu có thể giữ server component.
* Với dashboard hiện tại, nếu layout/page cần context client thì được dùng client component nhưng không lan rộng không cần thiết.
* Không viết logic API trực tiếp trong component lớn.
* Tách logic thành:

  * `src/api/`
  * `src/features/`
  * `src/hooks/`
  * `src/lib/`
  * `src/types/`
* Page chỉ nên điều phối layout/context và gọi component.
* Component UI nên nhỏ, dễ đọc, dễ reuse.
* Không gọi API trực tiếp bằng `fetch` rải rác trong component.
* Mọi API phải đi qua `src/lib/request.ts` hoặc service wrapper.

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

---

## TypeScript/code style

* Ưu tiên type rõ ở API response và props public của component.
* Không dùng `any` nếu có thể định nghĩa type đơn giản.
* Không thêm abstraction khi chưa cần.
* Không thêm fallback/validation cho case không thể xảy ra trong internal code.
* Chỉ validate ở boundary:

  * form input
  * API response
  * external service/SSE
* Không thêm comment giải thích code đang làm gì.
* Chỉ comment khi có constraint/why không hiển nhiên.
* Không để dead code, import không dùng hoặc compatibility shim không cần thiết.

---

## UI/Tailwind rules

* Ưu tiên Tailwind class trực tiếp cho component nhỏ/vừa.
* Giữ mobile-first vì app chính đang tối ưu mobile width.
* Với màn có bottom nav/fixed footer, scroll container phải dùng `min-h-0`, `overflow-y-auto`, `pb-*` phù hợp.
* Dùng `h-dvh` thay vì `h-screen` cho màn full height trên mobile nếu liên quan viewport.
* Dùng safe-area khi có top/bottom fixed area:

  * `env(safe-area-inset-top)`
  * `env(safe-area-inset-bottom)`
* Không dùng remote image URL tạm từ Figma trong code lâu dài.
* Animation mobile nên nhẹ:

  * duration 180ms - 280ms
  * ưu tiên `transform` + `opacity`
  * tránh animate `height`, `width`, `top`, `left`
* Dùng skeleton loading theo layout thật, hạn chế spinner.

---

# Figma Design Workflow

Repo client có thể dùng Figma MCP trong Claude Code để code UI sát design.

Quy tắc:

* Chỉ dùng Figma MCP trong repo client.
* Không dùng Figma MCP trong backend hoặc Python collector.
* Khi user đưa Figma link, phải đọc design context trước khi code.
* Không đoán layout nếu Figma MCP có thể đọc được design.
* Ưu tiên map design sang React + Tailwind CSS.
* Giữ đúng spacing, font size, border radius, color, shadow theo Figma.
* Nếu design có component lặp lại, tạo component React riêng khi thật sự giúp code dễ đọc.
* Không hardcode quá nhiều nếu có thể tách constants/components, nhưng không over-abstract.
* Không phụ thuộc vào Figma asset URL tạm thời trong production code nếu chưa download/commit asset.
* Nếu thiếu asset/icon/image, báo rõ asset nào thiếu và dùng placeholder hợp lý nếu user đồng ý.
* Nếu Figma không đọc được, yêu cầu user check quyền share hoặc export screenshot.

Flow code UI từ Figma:

```txt
1. Nhận Figma link hoặc node/frame.
2. Dùng Figma MCP đọc design context.
3. Xác định page/component cần sửa trong Next.js.
4. Đọc file UI tương ứng.
5. Code bằng React + Tailwind CSS.
6. So sánh lại spacing/layout chính với Figma.
7. Chạy npm run build nếu có.
8. Nếu có thể, mở dev server và kiểm tra UI ở mobile width.
```

Prompt mẫu:

```txt
Use Figma MCP to inspect this Figma frame: <link>. Then update the corresponding Next.js page/component to match the design using Tailwind CSS. Do not change backend API logic.
```

---

# GitNexus Rules

Repo này dùng GitNexus để giảm context/token khi làm việc với Claude Code.

## Mục tiêu

* Giúp Claude Code hiểu cấu trúc repo trước khi đọc nhiều file.
* Giảm việc grep/read toàn bộ codebase.
* Ưu tiên tìm đúng file, đúng flow, đúng dependency trước khi sửa code.
* Tránh sửa nhầm file vì thiếu context.
* Tránh nạp quá nhiều file vào context.

## Quy tắc bắt buộc

* Khi task yêu cầu hiểu flow lớn, phải dùng GitNexus trước khi đọc nhiều file.
* Không đọc toàn bộ repo nếu GitNexus đã có index.
* Không grep lan man qua nhiều thư mục nếu có thể hỏi GitNexus trước.
* Không mở quá nhiều file cùng lúc.
* Chỉ đọc những file GitNexus hoặc architect-agent xác định là liên quan.
* Trước khi sửa API route handler, dùng GitNexus `api_impact` nếu route đã được index.
* Trước refactor/rename symbol dùng nhiều nơi, dùng GitNexus `impact` hoặc `rename` dry-run.
* Sau refactor lớn, đổi nhiều function, đổi route, đổi service, phải re-index GitNexus.
* Sau khi git pull hoặc merge branch lớn, phải re-index GitNexus.
* Không để GitNexus tự ghi đè `CLAUDE.md`.
* Luôn chạy GitNexus với `--skip-agents-md` hoặc dùng `.gitnexusrc` có `skipContextFiles: true`.

## Commands

Index repo:

```bash
gitnexus analyze --skip-agents-md
```

Nếu repo dùng wrapper riêng:

```bash
node .gitnexus/run.cjs analyze --skip-agents-md
```

---

# Do Not

* Do not call Neon directly from client.
* Do not call Python collector directly from client.
* Do not expose Clerk secret key.
* Do not expose database URL.
* Do not expose internal backend key.
* Do not expose shipping provider tokens.
* Do not restore Supabase client logic.
* Do not create backend API paths that do not exist.
* Do not bypass `src/lib/request.ts`.
* Do not commit unless the user explicitly asks.
