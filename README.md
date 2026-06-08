# TikTok Live Next.js Web App

Bản này được clone từ `src` React Native sang Next.js web app.

## Update mới

- Đã bỏ `useContext` / `AuthProvider`.
- Auth dùng hook `src/hooks/useAuth.ts`.
- Đã thêm `Tailwind CSS`.
- Có sẵn component nhẹ tự viết ở `src/components/ui/Button.tsx` và `src/components/ui/Input.tsx`.
- Có file `DESIGN_GUIDE.md` để chọn hướng UI mobile nhẹ.

## Chạy dev

```bash
cd tiktok-live-nextjs
npm install
cp .env.local.example .env.local
npm run dev
```

Mở:

```text
http://localhost:3000
```

Tài khoản demo:

```text
0816507286 / 123456
admin / 123456
```

## Backend & SSE

App kết nối backend qua biến môi trường trong `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TIKTOK_USERNAME=your_tiktok_username
```

Backend cần expose các endpoint:

- `POST /live-stream/start` — bắt đầu collector TikTok Live
- `GET /live-stream/events` — SSE stream nhận comment realtime
- `POST /live-stream/stop` — dừng collector

Nếu deploy lên domain thật, đảm bảo backend chạy HTTPS và `NEXT_PUBLIC_API_URL` trỏ đúng host.

## Những phần đã chuyển

- Login/Register UI
- Dashboard
- Kết nối TikTok Live qua SSE/backend API
- Realtime comment
- Tạo đơn từ comment
- Bộ lọc đơn
- Khách hàng
- Vận đơn
- Báo cáo
- Cài đặt username TikTok riêng cho mỗi web/app
- Tổng quan đơn hàng + in hoá đơn bằng trình duyệt

## Lưu ý

- Không còn `ios/`, `android/`, CocoaPods, Xcode.
- Đây là web app, chạy bằng browser.
- Nếu deploy lên domain thật, backend cần hỗ trợ REST API và SSE qua HTTPS.

# Tiktok-Live
