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
