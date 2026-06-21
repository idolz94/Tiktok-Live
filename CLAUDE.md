# Project Structure

Project sử dụng cấu trúc **feature-first**, kết hợp với các thư mục dùng chung toàn ứng dụng.

```txt
src/
├── app/
├── api/
├── components/
│   ├── ui/
│   └── shared/
├── constants/
├── features/
├── hooks/
├── lib/
├── providers/
├── schemas/
├── types/
└── utils/
```

Không bắt buộc tạo sẵn tất cả thư mục. Chỉ tạo khi project thực sự cần sử dụng.

---

## `src/app`

Chứa Next.js App Router:

```txt
src/app/
├── layout.tsx
├── page.tsx
├── loading.tsx
├── error.tsx
├── not-found.tsx
├── (auth)/
└── dashboard/
```

Quy tắc:

* Chỉ chịu trách nhiệm routing, layout và compose screen/component.
* `page.tsx` phải mỏng.
* Không viết API call trực tiếp trong `page.tsx`.
* Không chứa business logic lớn.
* Không chứa form dài hoặc JSX hàng trăm dòng.
* Route nên import screen từ `src/features`.
* Với task UI, ưu tiên xác minh bằng `npm run typecheck`, `npm run lint`, `npm run build` trong `tiktok-live-nextjs` khi cần.

Ví dụ:

```tsx
import { ShippingProviderScreen } from "@/features/shipping";

export default function ShippingPage() {
  return <ShippingProviderScreen />;
}
```

---

## `src/api`

Chứa các hàm gọi Backend API dùng chung.

```txt
src/api/
├── authApi.ts
├── bootstrapApi.ts
├── shopsApi.ts
├── ordersApi.ts
├── customersApi.ts
├── productsApi.ts
├── licensesApi.ts
└── shippingProvidersApi.ts
```

Quy tắc:

* API call phải dùng Axios instance/request wrapper được cấu hình tại `src/lib/request.ts`.
* Không import `axios` trực tiếp trong component.
* Không gọi `fetch` hoặc `axios` trực tiếp trong page/component.
* Mỗi file API nên phụ trách một resource hoặc một business domain.
* API function chỉ gọi request, map payload cơ bản và trả dữ liệu.
* Không chứa UI state, toast, modal hoặc React hook trong API file.
* Request và response phải có TypeScript type rõ ràng.
* Không tự tạo endpoint chưa tồn tại ở Backend.

Ví dụ:

```ts
import { request } from "@/lib/request";
import type {
  CreateOrderPayload,
  Order,
  OrderListParams,
} from "@/types/order";

export async function getOrdersApi(
  params?: OrderListParams,
): Promise<Order[]> {
  const response = await request.get<Order[]>("/orders", {
    params,
  });

  return response.data;
}

export async function createOrderApi(
  payload: CreateOrderPayload,
): Promise<Order> {
  const response = await request.post<Order>("/orders", payload);

  return response.data;
}
```

Nếu API chỉ được sử dụng trong một feature, ưu tiên đặt tại:

```txt
src/features/<feature>/api/
```

Ví dụ:

```txt
src/features/shipping/api/shippingProvidersApi.ts
src/features/live/api/liveStreamApi.ts
```

Không duplicate cùng một API function ở cả `src/api` và `src/features`.

---

## `src/components`

Chứa component UI dùng chung.

```txt
src/components/
├── ui/
└── shared/
```

### `src/components/ui`

Chứa UI primitive, không có business logic của Lumi.

Ví dụ:

```txt
src/components/ui/
├── Button.tsx
├── Input.tsx
├── Textarea.tsx
├── Avatar.tsx
├── Checkbox.tsx
├── RadioGroup.tsx
├── Select.tsx
├── Switch.tsx
├── Badge.tsx
├── Modal.tsx
├── AlertDialog.tsx
├── Drawer.tsx
├── BottomSheet.tsx
├── Skeleton.tsx
├── Spinner.tsx
└── FormField.tsx
```

Quy tắc:

* Không gọi API.
* Không import feature.
* Không biết đến order, customer, shop, TikTok hoặc shipping provider.
* Chỉ nhận dữ liệu và callback qua props.
* Props phải nhỏ, rõ ràng và reusable.
* Ưu tiên composition.
* Không tạo component với quá nhiều boolean props.

Ví dụ đúng:

```tsx
<Button variant="destructive" onClick={onDelete}>
  Xóa đơn hàng
</Button>
```

Không nên:

```tsx
<Button
  isDeleteOrder
  isGhtk
  isCustomerScreen
  showWarning
  useMobileLayout
/>
```

### `src/components/shared`

Chứa component dùng chung giữa nhiều feature nhưng có UI đặc trưng của Lumi.

Ví dụ:

```txt
src/components/shared/
├── PageHeader.tsx
├── MobileBottomNavigation.tsx
├── EmptyState.tsx
├── ErrorState.tsx
├── ConfirmDeleteDialog.tsx
├── CurrencyText.tsx
├── StatusBadge.tsx
├── AccountAvatar.tsx
└── Pagination.tsx
```

Chỉ đưa component vào `shared` khi:

* Được sử dụng bởi ít nhất hai feature.
* Có API props rõ ràng.
* Không chứa business logic riêng của một feature.
* Việc dùng chung giúp giảm duplicate thực tế.

Không đưa component vào `shared` chỉ vì nghĩ rằng sau này có thể sẽ dùng lại.

---

## `src/constants`

Chứa constant dùng chung, không thay đổi trong runtime.

```txt
src/constants/
├── routes.ts
├── queryKeys.ts
├── orderStatuses.ts
├── liveEvents.ts
├── shippingProviders.ts
├── limits.ts
└── storageKeys.ts
```

Ví dụ:

```ts
export const ROUTES = {
  dashboard: "/dashboard",
  live: "/dashboard/live",
  orders: "/dashboard/orders",
  customers: "/dashboard/customers",
  settings: "/dashboard/settings",
} as const;
```

Quy tắc:

* Không chứa dữ liệu lấy từ API.
* Không chứa secret hoặc environment variable.
* Không đưa tất cả constant vào một file `constants.ts` khổng lồ.
* Chia file theo domain.
* Constant chỉ dùng trong một feature nên đặt trong feature đó.

Ví dụ:

```txt
src/features/live/constants/liveEvents.ts
```

---

## `src/features`

Chứa toàn bộ code theo business feature.

```txt
src/features/
├── dashboard/
├── live/
├── orders/
├── customers/
├── products/
├── reports/
├── settings/
├── shipping/
├── onboarding/
└── licenses/
```

Mỗi feature có thể có:

```txt
src/features/shipping/
├── api/
├── components/
├── constants/
├── hooks/
├── schemas/
├── types/
├── utils/
└── index.ts
```

Chỉ tạo những folder feature thực sự cần.

Ví dụ đầy đủ:

```txt
src/features/shipping/
├── api/
│   └── shippingProvidersApi.ts
├── components/
│   ├── ShippingProviderScreen.tsx
│   ├── ShippingProviderList.tsx
│   ├── ShippingProviderCard.tsx
│   ├── ProviderConnectionDrawer.tsx
│   └── forms/
│       ├── GhtkConnectionForm.tsx
│       ├── GhnConnectionForm.tsx
│       └── ViettelPostConnectionForm.tsx
├── hooks/
│   ├── useShippingProviders.ts
│   └── useProviderConnection.ts
├── schemas/
│   └── shippingProvider.schema.ts
├── types/
│   └── shippingProvider.types.ts
└── index.ts
```

Quy tắc:

* Component chỉ dùng trong một feature phải nằm trong feature đó.
* Hook chỉ phục vụ một feature phải nằm trong feature đó.
* Schema, type, constant chỉ dùng trong feature phải nằm trong feature đó.
* Không đưa code feature-specific vào folder global.
* Một feature không import trực tiếp internal file của feature khác.
* Cross-feature dependency phải thông qua public export hoặc được điều phối ở screen/page.

---

## `src/hooks`

Chứa hook dùng chung toàn ứng dụng.

```txt
src/hooks/
├── useDebounce.ts
├── useDisclosure.ts
├── useMediaQuery.ts
├── useScrollDirection.ts
├── usePrevious.ts
└── useMounted.ts
```

Quy tắc:

* Chỉ chứa hook được sử dụng bởi nhiều feature.
* Hook riêng của order đặt trong `src/features/orders/hooks`.
* Hook riêng của shipping đặt trong `src/features/shipping/hooks`.
* Không tạo hook chỉ để bọc một dòng code đơn giản.
* Hook không render JSX.
* Hook API phức tạp nên gọi function từ API layer, không tự viết request rải rác.

Ví dụ:

```ts
export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((current) => !current),
  };
}
```

---

## `src/lib`

Chứa infrastructure và integration dùng chung.

```txt
src/lib/
├── request.ts
├── clerk.ts
├── env.ts
├── queryClient.ts
├── cn.ts
├── formatCurrency.ts
├── formatDate.ts
└── logger.ts
```

### `src/lib/request.ts`

Đây là nơi duy nhất cấu hình Axios instance/request wrapper:

```ts
import axios from "axios";

export const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});
```

`request.ts` chịu trách nhiệm:

* Base URL.
* `credentials`/`withCredentials`.
* Clerk Authorization token.
* Request interceptor.
* Response interceptor.
* Chuẩn hóa lỗi API.
* Xử lý unauthorized chung nếu cần.

Quy tắc:

* Chỉ `src/lib/request.ts` được khởi tạo Axios instance.
* Không tạo Axios instance riêng cho mỗi feature.
* Không import Axios trực tiếp trong component.
* Không hardcode backend URL.
* Không thêm provider secret vào request client.

---

## `src/providers`

Chứa React Context Provider dùng ở cấp ứng dụng hoặc dashboard.

```txt
src/providers/
├── AppProviders.tsx
├── DashboardProvider.tsx
├── AuthProvider.tsx
├── ClerkTokenSync.tsx
└── ToastProvider.tsx
```

Quy tắc:

* Chỉ dùng provider cho state thực sự cần chia sẻ ở nhiều route/component.
* Không đưa toàn bộ state feature vào `DashboardProvider`.
* State của customer, order, shipping form nên nằm trong feature tương ứng.
* Không tạo context cho state chỉ dùng trong một component tree nhỏ.
* Provider không được gọi API lặp lại không cần thiết.

---

## `src/schemas`

Chứa Zod schema dùng chung giữa nhiều feature.

```txt
src/schemas/
├── pagination.schema.ts
├── common.schema.ts
└── address.schema.ts
```

Quy tắc:

* Schema riêng của feature nằm trong feature.
* Chỉ validate tại boundary:

  * form input
  * API response bên ngoài
  * SSE event
  * URL/search params
* Không validate lại dữ liệu internal đã có type rõ ràng nếu không cần thiết.

Ví dụ:

```txt
src/features/customers/schemas/customer.schema.ts
src/features/shipping/schemas/shippingProvider.schema.ts
```

---

## `src/types`

Chứa TypeScript type dùng chung toàn ứng dụng.

```txt
src/types/
├── api.ts
├── pagination.ts
├── common.ts
└── database.ts
```

Quy tắc:

* Type chỉ dùng trong một feature phải đặt trong feature.
* Không tạo một file `types.ts` chứa toàn bộ type của ứng dụng.
* Không duplicate type API ở nhiều file.
* Ưu tiên type rõ ràng cho:

  * API response
  * API payload
  * component public props
  * SSE events
  * context value

Ví dụ:

```txt
src/features/orders/types/order.types.ts
src/features/live/types/liveEvent.types.ts
src/features/shipping/types/shippingProvider.types.ts
```

---

## `src/utils`

Chứa pure utility function không phụ thuộc React.

```txt
src/utils/
├── normalizePhoneNumber.ts
├── calculateOrderTotal.ts
├── removeVietnameseAccents.ts
└── buildSearchParams.ts
```

Quy tắc:

* Utility function phải pure khi có thể.
* Không gọi API.
* Không đọc React state.
* Không chứa side effect không rõ ràng.
* Utility chỉ dùng trong một feature nên đặt trong feature đó.
* Không tạo file `helpers.ts` hoặc `utils.ts` quá lớn.

---

## Public assets

Asset tĩnh đặt trong:

```txt
public/
├── images/
├── icons/
├── fonts/
└── logos/
```

Quy tắc:

* Không dùng URL asset tạm thời từ Figma trong production.
* Tên file dùng lowercase và kebab-case.
* Không lưu secret hoặc JSON nội bộ trong `public`.
* Asset trong `public` có thể truy cập công khai từ browser.

---

## Naming convention

Component:

```txt
PascalCase.tsx
```

Ví dụ:

```txt
ShippingProviderCard.tsx
CustomerAddressForm.tsx
ConfirmDeleteDialog.tsx
```

Hook:

```txt
useCamelCase.ts
```

Ví dụ:

```txt
useShippingProviders.ts
useOrderCreation.ts
useDebounce.ts
```

API:

```txt
camelCaseApi.ts
```

Ví dụ:

```txt
ordersApi.ts
customersApi.ts
shippingProvidersApi.ts
```

Schema:

```txt
camelCase.schema.ts
```

Ví dụ:

```txt
order.schema.ts
customerAddress.schema.ts
```

Types:

```txt
camelCase.types.ts
```

Ví dụ:

```txt
order.types.ts
shippingProvider.types.ts
```

Constants:

```txt
camelCase.ts
```

Ví dụ:

```txt
orderStatuses.ts
shippingProviders.ts
liveEvents.ts
```

---

## Import direction

Dependency direction được phép:

```txt
app
  ↓
features
  ↓
components/shared
  ↓
components/ui
  ↓
lib, hooks, constants, schemas, types, utils
```

Quy tắc:

* `components/ui` không import từ `features`.
* `lib` không import UI component.
* `api` không import React component.
* `types` không import component.
* Feature không import private internal file của feature khác.
* Tránh circular dependency.
* Không dùng relative import quá sâu như:

```ts
import { Button } from "../../../../components/ui/Button";
```

Ưu tiên alias:

```ts
import { Button } from "@/components/ui/Button";
```

## Component responsibility

Nguyên tắc chính:

```txt
Small and focused
+ reusable when appropriate
+ do not split excessively
```

Tương ứng:

* Component phải nhỏ, tập trung và có một trách nhiệm rõ ràng.
* Ưu tiên tái sử dụng component khi có nhu cầu sử dụng thực tế.
* Không chia component thành quá nhiều file nhỏ nếu việc đó làm flow khó đọc và khó bảo trì hơn.

### Small and focused

Mỗi component nên xử lý một phần UI hoặc một interaction rõ ràng.

Ví dụ:

```txt
ShippingProviderScreen
→ điều phối màn hình vận chuyển

ShippingProviderList
→ render danh sách provider

ShippingProviderCard
→ render một provider

GhtkConnectionForm
→ render và quản lý form kết nối GHTK

useProviderConnection
→ xử lý state và submit flow

shippingProvidersApi
→ gọi Backend API
```

Không để một component vừa:

* Gọi nhiều API không liên quan.
* Quản lý nhiều nhóm state độc lập.
* Validate nhiều form.
* Xử lý nhiều modal hoặc drawer.
* Render nhiều section không liên quan.
* Chứa business logic phức tạp.
* Chứa toàn bộ màn hình trong một file lớn.

Component có thể điều phối nhiều component con nếu đó là trách nhiệm chính của một `Screen`, `Layout` hoặc `Form`.

---

### Reusable when appropriate

Trước khi tạo component mới:

1. Kiểm tra `src/components/ui`.
2. Kiểm tra `src/components/shared`.
3. Kiểm tra component trong feature hiện tại.
4. Chỉ tạo mới khi chưa có component phù hợp.

Ưu tiên tái sử dụng khi:

* Cùng một UI xuất hiện ở ít nhất hai nơi.
* Cùng một interaction được sử dụng ở nhiều feature.
* Component có props API rõ ràng.
* Component không phụ thuộc business logic riêng của một feature.
* Việc tái sử dụng giúp giao diện nhất quán và giảm duplicate.

Ví dụ component có thể dùng chung:

```txt
Button
Input
Avatar
AlertDialog
BottomSheet
PageHeader
EmptyState
StatusBadge
CurrencyText
ConfirmDeleteDialog
```

Không copy/paste một block JSX lớn giữa nhiều màn hình.

Không đưa component vào `src/components/shared` chỉ vì nghĩ rằng có thể sẽ dùng lại trong tương lai.

Component chỉ dùng trong một feature phải nằm trong feature đó:

```txt
src/features/shipping/components/ShippingProviderCard.tsx
src/features/orders/components/OrderSummaryCard.tsx
src/features/customers/components/CustomerAddressForm.tsx
```

Chỉ chuyển component sang shared khi có nhu cầu reuse thực tế.

---

### Prefer composition

Ưu tiên composition thay vì tạo một component tổng quát với quá nhiều điều kiện.

Không nên:

```tsx
<ProviderForm
  isGhtk
  isGhn={false}
  isViettelPost={false}
  showToken
  showPartnerCode
  showPassword={false}
  compact
  editable
/>
```

Nên:

```tsx
<ProviderConnectionLayout>
  <GhtkConnectionForm />
</ProviderConnectionLayout>
```

Các provider có flow khác nhau nên có component riêng:

```txt
GhtkConnectionForm
GhnConnectionForm
ViettelPostConnectionForm
```

Các phần UI thực sự giống nhau có thể dùng chung:

```txt
ProviderConnectionLayout
ProviderCredentialField
ProviderGuideCard
ConnectionSubmitButton
```

---

### Do not split excessively

Không chia nhỏ component chỉ để giảm số dòng.

Không cần tách khi:

* Component chỉ được sử dụng một lần.
* Phần JSX ngắn và dễ hiểu.
* Component con chỉ bọc một thẻ HTML đơn giản.
* Component con cần nhận quá nhiều props từ component cha.
* Việc tách khiến người đọc phải mở nhiều file mới hiểu được một flow đơn giản.
* Component mới không có tên hoặc trách nhiệm rõ ràng.
* Logic và UI vẫn gắn chặt với nhau và không có giá trị reuse.

Ví dụ không cần thiết:

```txt
OrderCard.tsx
├── OrderCardContainer.tsx
├── OrderCardHeaderWrapper.tsx
├── OrderCardTitleText.tsx
├── OrderCardPriceText.tsx
└── OrderCardButtonWrapper.tsx
```

Trong trường hợp đơn giản, nên giữ:

```txt
OrderCard.tsx
```

Chỉ tách các phần có trách nhiệm rõ ràng:

```txt
OrderCard.tsx
OrderStatusBadge.tsx
OrderCustomerSummary.tsx
OrderActions.tsx
```

---

### Signals for extraction

Xem xét tách component khi:

* File vượt khoảng 250–300 dòng.
* File chứa nhiều section UI độc lập.
* Có nhiều form trong cùng một file.
* Có nhiều modal hoặc drawer.
* Có nhiều nhóm state không liên quan.
* Có nhiều `useEffect` xử lý các flow khác nhau.
* JSX bị lặp lại.
* Một phần UI có thể được đặt tên rõ ràng.
* Một phần UI được sử dụng ở nhiều nơi.
* Component khó đọc nếu phải scroll nhiều lần.
* Thay đổi một chức năng dễ ảnh hưởng chức năng không liên quan.

File vượt khoảng 500 dòng thường phải được xem xét refactor, trừ khi có lý do rõ ràng để giữ nguyên.

Số dòng chỉ là tín hiệu, không phải quy tắc bắt buộc.

---

### Extraction order

Khi refactor component lớn, ưu tiên theo thứ tự:

```txt
1. Tách API call sang API layer.
2. Tách validation sang schema.
3. Tách state và workflow phức tạp sang custom hook.
4. Tách các section UI có trách nhiệm rõ ràng.
5. Tái sử dụng UI component hiện có.
6. Chỉ chuyển component sang shared khi có reuse thực tế.
```

Sau khi tách component:

* Giữ nguyên behavior hiện tại.
* Giữ nguyên API contract.
* Kiểm tra import không tạo circular dependency.
* Chạy typecheck, lint hoặc build.
* Không tạo abstraction mới nếu chưa có nhu cầu thực tế.

