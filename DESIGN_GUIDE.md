# Mobile design nhẹ cho Next.js web app

## Hướng đang dùng trong project

Project đã chuyển sang:

- Không dùng `useContext`.
- Dùng `SWR` làm auth store/cache nhẹ trong `src/hooks/useAuth.ts`.
- Dùng `Tailwind CSS` để viết UI nhanh bằng utility class.
- Giữ CSS cũ trong `globals.css` để không phá giao diện đã clone từ React Native.

## Gợi ý UI library

### Nhẹ nhất: Tailwind CSS + component tự viết

Nên dùng hướng này trước vì app của bạn là mobile-first, màn hình không quá phức tạp. Chỉ cần tự tạo các component cơ bản:

- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- Card
- Bottom sheet
- Modal
- Tabs
- Toast

Ưu điểm: nhẹ, dễ sửa giao diện giống app mobile, không bị phụ thuộc UI library nặng.

### Khi cần component mobile có sẵn: antd-mobile

Nếu sau này cần sẵn các component như `Popup`, `Toast`, `Dialog`, `Tabs`, `Picker`, `Form`, có thể cài:

```bash
npm install antd-mobile
```

Dùng khi cần tốc độ làm UI nhanh. Không nên cài ngay nếu app hiện tại chỉ cần form, list comment, tab, card đơn hàng.

## Cấu trúc nên đi tiếp

```text
src/
  app/
  hooks/
    useAuth.ts
    useTikTokLiveSocket.ts
  components/
    ui/
      Button.tsx
      Input.tsx
  screens/
    AuthScreen.tsx
    DashboardScreen.tsx
```

## Nguyên tắc UI mobile

- Width app nên giới hạn `max-width: 560px`, giống bản hiện tại.
- Bottom nav fixed/sticky ở dưới.
- Comment realtime dùng list đơn giản, tránh table trên mobile.
- Mỗi đơn hàng nên là card, không nên dùng bảng nhiều cột.
- Form nhập đơn nên dùng bottom sheet hoặc modal toàn màn hình.
