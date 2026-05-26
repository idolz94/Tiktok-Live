# TikTok Live Next.js Web App

Bản này được clone từ `src` React Native sang Next.js web app.

## Update mới

- Đã bỏ `useContext` / `AuthProvider`.
- Auth hiện dùng `SWR` trong `src/hooks/useAuth.ts`.
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

## WebSocket Python

Mặc định app đọc URL từ `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8765
NEXT_PUBLIC_TIKTOK_USERNAME=conlavungday02
```

Nếu Python server đang chạy IP khác, sửa `NEXT_PUBLIC_WS_URL` rồi restart `npm run dev`.

## Những phần đã chuyển

- Login/Register UI
- Dashboard
- Kết nối WebSocket TikTok Live
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
- Nếu deploy lên domain thật, Python socket cũng phải deploy lên server thật và dùng `wss://...` thay vì `ws://localhost:8765`.

# Tiktok-Live
