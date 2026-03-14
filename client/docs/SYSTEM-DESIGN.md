# Hệ Thống Frontend: Kiến Trúc & Ngôn Ngữ Thiết Kế

Đây là tài liệu hợp nhất quy định về kiến trúc hệ thống, luồng dữ liệu, quy tắc clean code và hệ thống thiết kế (Design System) của hệ thống Frontend tại AtomEcom.

---

## PHẦN 1: TỔNG QUAN KIẾN TRÚC (SYSTEM DESIGN)

### 1.1. Triết Lý Cốt Lõi & Package Sử Dụng Chung (Shared Package)

Kiến trúc frontend ưu tiên sự phân tách rõ trách nhiệm, ứng dụng mạnh mẽ package shared trong mô hình monorepo (`@atomecom/shared`).

- **Nguồn Chân Lý Duy Nhất (Single Source of Truth):** Toàn bộ Zod schema kiểm tra dữ liệu, TypeScript Interfaces, Error Codes (`ErrorCatalogCodes`, `ErrorUserCodes`), và Enums (`PRODUCT_STATUS`) đều được kéo từ workspace `shared`.
- **Luật Bất Thành Văn:** Tuyệt đối không tự định nghĩa lại types, schemas, hoặc mã lỗi ở Client (Frontend) nếu nó đã tồn tại hoặc có thể tải tái sử dụng từ thư viện `shared`.
- **Kiểm tra dữ liệu khắt khe tại Client:** Zod Schema tạo ở backend được định nghĩa trong `shared` và móc thẳng vào `react-hook-form` thông qua biến kết nối `@hookform/resolvers/zod`. Điều này đảm bảo logic Validation hai đầu (Client - Server) là giống hệt nhau 100%.

### 1.2. Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Ngôn ngữ:** TypeScript
- **Styling:** Tailwind CSS v4 & Next Themes
- **Data Fetching & Cache:** TanStack Query + Axios
- **Quản lý State Toàn cục:** Zustand (chỉ cho Global UI state)
- **Quản lý State Bảng/Danh sách:** URL Query Params (`useTableParams`)
- **Quản lý Form:** React Hook Form + Zod
- **UI Components:** Shadcn UI (đã custom sâu) + Lucide React
- **Đa ngôn ngữ (i18n):** react-i18next

### 1.3. Mô Hình 4 Lớp Kiến Trúc

Áp dụng Clean Architecture tùy biến cho React:

1. **Lớp Giao Diện - Presentation Layer (`app/`, `components/`)**: Chỉ quản trị JSX, render UI và state độc lập cục bộ. Next.js App Router lo layout/routing tĩnh/động.
2. **Lớp Trạng Thái - Hook/State Layer (`hooks/`, `store/`)**:
   - `useStore.ts` (Zustand): Xử lý hiển thị Darkmode, Sidebar, Session toàn cục.
   - Custom Hooks (vd: `useProducts`): Đóng gói React Query, ánh xạ mã lỗi, trigger toast thông báo, gọi `invalidateQueries` sau khi Fetch API.
3. **Lớp Dịch Vụ - Service Layer (`services/`)**: Các hàm gọi thuần túy lên backend (Axios calls), nhả về raw data hoặc throw `AxiosError`. Lớp này ngây ngô hoàn toàn với UI (nghiêm cấm bật bật toast tại đây).
4. **Lớp Hạ Tầng - Infra Layer (`lib/axios.ts`)**: Singleton Axios đóng vai lõi mạng, quản lý Interceptor hứng lỗi 401 tự động xoay tua (refresh token) ngầm với người dùng, và chặn Queue API tránh Request trùng lặp.

### 1.4. Chiến Lược Xử Lý Lỗi UI (Graceful Degradation)

Thay vì để app sập tung tóe, ta cô lập các lỗi:

1. Code Lỗi (Error Codes) gửi từ BE như `NAME_MUST_BE_AT_LEAST_2_CHARS`.
2. Truyền thẳng cho React Query Hook `onError`. Hook bỏ mã Code vào i18n (`t(lỗi)`), bắn ra Toast UI.
3. **Global Error Boundary (`error.tsx`) & Not Found (`not-found.tsx`)**: Bảo vệ app thành khối phòng thủ cuối cùng. Nó chặn màn hình lỗi trắng (White Screen of Death) và chỉ hiện lên 1 giao diện báo Lỗi Tạp Chí thanh lịch với tuỳ chọn báo cáo, ấn tải lại.

---

## PHẦN 2: QUY TẮC CLEAN CODE FRONTEND

> **Nguyên tắc vàng:** Code phải đọc được như một câu truyện. Người mới vào dự án mở file `page.tsx` lên phải hiểu ngay trang đó làm gì mà không cần đọc từng dòng logic chi tiết.

### 2.1. Quy Tắc "Skeletal Page" (Trang Khung Xương)

File `page.tsx` trong thư mục `app/` chỉ đóng vai trò **điều phối viên**, KHÔNG phải thợ thủ công.

**✅ Cho phép trong `page.tsx`:**

- Import và render các Component-khối (`<ProductHeader />`, `<ProductFilters />`, `<ProductTable />`)
- Khai báo hooks cấp cao (`useTableParams`, `useProducts`, `useStudioManager`)
- Định nghĩa các handler đơn giản (delegate: gọi hàm từ hook)

**❌ Cấm trong `page.tsx`:**

- JSX chi tiết (TableRow, FormField, Badge, Icon kèm logic inline)
- CSS/className dài hơn 2 dòng
- Logic tính toán phức tạp (filter, map, reduce dữ liệu)
- Inline function > 3 dòng

```tsx
// ❌ SAI — Page trở thành thợ thủ công
export default function ProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between py-6">
        <h1 className="text-3xl font-editorial">Sản phẩm</h1>
        <Button onClick={() => setOpen(true)}>Thêm mới</Button>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} />
      <table>
        {products.map(p => (
          <tr key={p.id}>
            <td>{p.name}</td>
            {/* ...100 dòng JSX... */}
          </tr>
        ))}
      </table>
    </div>
  );
}

// ✅ ĐÚNG — Page chỉ là điều phối viên
export default function ProductsPage() {
  const { params, setParams } = useTableParams({ limit: 20 });
  const { products, pagination } = useProducts({ ... });

  return (
    <div className="h-full flex flex-col p-6 md:p-8">
      <ProductHeader onCreateAction={handleCreate} />
      <ProductFilters />
      <ProductTable products={products} onSort={handleSort} />
      <StudioPagination pagination={pagination} />
    </div>
  );
}
```

### 2.2. Quy Tắc Quản Lý Trạng Thái (State Management Rules)

Ba loại state và nơi chúng thuộc về:

| Loại State                                | Công cụ                       | Ví dụ                                       | Quy tắc                                                                         |
| ----------------------------------------- | ----------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------- |
| **Server State** (Dữ liệu từ DB)          | TanStack Query                | Danh sách sản phẩm, chi tiết user           | Hook trả về data + pagination đã parse sẵn. Dùng `extractData()` thay `as any`. |
| **View State** (Trạng thái hiển thị bảng) | URL Params (`useTableParams`) | Search, Filter, Sort, Page                  | Đẩy lên URL để hỗ trợ Bookmark, Back/Forward, Share link.                       |
| **Global UI State**                       | Zustand                       | Dark mode, Sidebar open/close, Auth session | Chỉ dùng cho state cần tồn tại xuyên suốt nhiều trang khác nhau.                |
| **Local UI State**                        | `useState`                    | Modal open/close, step form wizard          | Chỉ dùng cho state **chỉ sống trong 1 component**, không chia sẻ.               |

**❌ Tuyệt đối cấm:**

- Dùng `useState` cho search, filter, pagination ở `page.tsx` rồi truyền qua props → **Dùng `useTableParams`**
- Dùng Zustand cho filter/sort bảng → Dùng URL Params
- Truyền hàm callback 3+ tầng (Prop Drilling) → Component con tự gọi `useTableParams()`

### 2.3. Quy Tắc "Zero Prop Drilling" (Không Truyền Props Xuyên Tầng)

Các component Filter và Search phải **tự quản lý trạng thái** bằng cách gọi `useTableParams()` bên trong chính mình.

```tsx
// ❌ SAI — Prop Drilling tại page
<UserFilters
  searchQuery={params.q}
  onSearchChange={(v) => setParams({ q: v })}
  statusFilter={params.status}
  onStatusChange={(v) => setParams({ status: v })}
  roleFilter={params.role}
  onRoleChange={(v) => setParams({ role: v })}
  // ...10 props nữa...
/>

// ✅ ĐÚNG — Component tự quản
<UserFilters
  visibleColumns={visibleColumns}        // Chỉ truyền state UI thuần tuý
  onToggleColumn={handleToggleColumn}
/>

// Bên trong UserFilters:
export function UserFilters({ visibleColumns, onToggleColumn }) {
  const { params, setParams, clearParams } = useTableParams(); // Tự lấy
  // ...render filters sử dụng params trực tiếp...
}
```

### 2.4. Quy Tắc Loại Bỏ `as any` (Type Safety)

Cấm sử dụng `as any` để ép kiểu dữ liệu API response. Sử dụng helper tại `lib/api-utils.ts`:

```tsx
import { extractData, extractPagination } from '@/lib/api-utils';

// ❌ SAI
const product = (response as any)?.data || null;

// ✅ ĐÚNG
const product = extractData(response); // Trả về T | null, type-safe
const pagination = extractPagination(response); // Trả về PaginationData | null
```

**Trường hợp ngoại lệ cho phép `as any`:**

- Cast enum/union type khi TypeScript không suy luận được (ví dụ: dynamic variant string)
- Phải kèm comment giải thích lý do

### 2.5. Quy Tắc Cấu Trúc Thư Mục Component (Block-Based Colocation)

Áp dụng cấu trúc phân cấp dựa trên luồng Giao Diện (UI Blocks / Feature-sliced) để phản ánh trực tiếp cấu trúc màn hình (Mapping 1:1 với UI).

```
src/components/dashboard/
├── studio/                          ← SHARED: Dùng chung cho mọi module
│   ├── sortable-header.tsx
│   ├── ...
│
├── catalog/                         ← DOMAIN: Sản phẩm, Thương hiệu, Danh mục
│   ├── product/                     ← (Mọi khía cạnh của Product)
│   │   ├── toolbar/                 ← Cụm công cụ trên cùng (Header, Filter, Search)
│   │   ├── metrics/                 ← Cụm thẻ thống kê số liệu (Stat Cards)
│   │   ├── table/                   ← Cụm hiển thị dữ liệu dạng bảng/lưới (Table, Grid, Pagination)
│   │   └── overlays/                ← Cụm giao diện đè lên trên (Sheet, Dialogs, Form)
│   ├── brand/
│   └── category/
│
└── users/                           ← DOMAIN: Quản lý người dùng
    ├── toolbar/                     ← Trực quan mapping header (UserHeader, UserFilters)
    ├── metrics/                     ← Thống kê (UserStats)
    ├── table/                       ← Bộ phân thân danh sách (UserTable, Row)
    └── overlays/                    ← Biểu mẫu (UserFormOverlay, UserDetailSheet)
```

**Quy tắc đặt tên file:**

- Shared component: `studio-{tên}.tsx`
- Domain component: `[module]-[tên].tsx` (VD: `product-form.tsx`, `user-row.tsx`). Khi đã nằm trong cụm khối khép kín (ví dụ: `table/`), có thể giản lược: `table.tsx` thay vì `product-table.tsx`.
- Component phục vụ duy nhất 1 luồng: Luôn được Colocate sát cùng cấp component chính.
- Không tạo file `index.ts` re-export (Ưu tiên import tường minh từ file gốc).

### 2.6. Quy Tắc Gom Nhóm Thư Mục (Grouping Rule)

Để mã nguồn dễ dàng mở rộng, áp dụng "Quy Tắc Mảnh Ghép Giao Diện":

1.  **Nhất Quán Theo Khu Vực (Visual Zones):** Một Component thuộc khoảng Không gian/Khu vực nào thì đặt vào chính thư mục đại diện cho phần đó.
    - `toolbar/`: Thao tác bao quát (Filters, Global Actions, Search).
    - `metrics/`: Tổng hợp thông tin, KPI trước khi vào chi tiết.
    - `table/`: (Hoặc `grid/`) Lõi hiển thị danh sách dữ liệu.
    - `overlays/`: Bất cứ thứ gì Modal/Sheet bật nổi lên không tuân theo luồng Flow thông thường.
2.  **Đóng Gói Chức Năng (Encapsulation):** Nếu component `stats.tsx` cần import 1 component nhỏ `stat-item.tsx` (chỉ dùng duy nhất cho stats), thì gom tất cả đặt khép kín nội bộ trong thư mục `metrics/`.
3.  **Tự Hoại (Easily Deletable):** Tổ chức module sao cho khi xóa bỏ một cụm UI (VD: `metrics/`), nhà phát triển chỉ cần xóa đúng 1 dòng Component từ trang cha `page.tsx` và xóa nguyên bộ thư mục, mà không làm gãy mã nguồn các luồng khác.

### 2.7. Quy Tắc Viết Custom Hook (Data Hook Convention)

Mỗi entity (Product, Brand, User...) có 1 file hook duy nhất đặt tại `hooks/use-{entity}.ts`:

```tsx
// hooks/use-products.ts
// Hook danh sách (list) — trả về data + pagination ĐÃ PARSE SẴN
export const useProducts = (filters: ProductFilter) => {
  // ...useQuery + mutations...
  return {
    products: data?.data || [], // ✅ Đã unwrap SuccessResponse
    pagination: { totalElements, totalPages, currentPage }, // ✅ Đã map field
    isLoading,
    isFetching,
    createProduct,
    updateProduct,
    deleteProduct, // Mutations
    isCreating,
    isUpdating,
  };
};

// Hook đơn lẻ (detail) — trả về raw query, consumer dùng extractData()
export const useProduct = (id: string | null) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
  });
};
```

**Quy tắc:**

- Hook list phải parse pagination bên trong, KHÔNG để page parse manual
- Hook detail trả raw useQuery, page dùng `extractData()` để unwrap
- Mọi mutation phải `invalidateQueries` sau thành công
- Toast thông báo phải nằm trong hook, KHÔNG nằm ở page

### 2.8. Quy Tắc Viết Service (Service Layer Convention)

Service tại `services/{entity}.service.ts` là lớp **ngây ngô thuần túy**:

```tsx
// ✅ Service chỉ làm 2 việc: Gọi API + Trả Response
export const productService = {
  getProducts: async (filters) => {
    const response = await api.get<SuccessResponse<Product[]>>('/products', {
      params: filters,
    });
    return response.data;
  },
};

// ❌ KHÔNG ĐƯỢC làm trong Service:
// - Gọi toast
// - Truy cập store/state
// - Xử lý logic business
// - Import React hooks
```

### 2.9. Quy Tắc TypeScript Nghiêm Ngặt

| Quy tắc                               | Mô tả                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Cấm `any`**                         | Trừ trường hợp ngoại lệ có comment. Dùng `unknown` + type guard nếu cần.                      |
| **Cấm interface cục bộ trùng shared** | Nếu `Sku`, `Product` đã có ở `@atomecom/shared`, KHÔNG tạo lại `InventoryItem` tại component. |
| **Bắt buộc type props**               | Mọi component phải có interface `{Component}Props` rõ ràng.                                   |
| **Return type cho hooks**             | Hook trả object phải type rõ ràng, tránh infer quá sâu.                                       |
| **Generic cho API helper**            | `extractData<T>()` phải được dùng thay vì cast manual.                                        |

### 2.10. Quy Tắc Tổ Chức Import

Thứ tự import trong mọi file `.tsx`:

```tsx
// 1. React & Framework
import React, { useState, useMemo } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// 3. Shared package types & enums
import { Product, PRODUCT_STATUS } from '@atomecom/shared';

// 4. Internal hooks
import { useProducts } from '@/hooks/use-products';
import { useTableParams } from '@/hooks/use-table-params';

// 5. Internal utilities
import { extractData } from '@/lib/api-utils';
import { cn } from '@/lib/utils';

// 6. UI Components (shadcn)
import { Button } from '@/components/ui/button';

// 7. Domain components (cùng module)
import { ProductTable } from '@/components/dashboard/catalog/product/product-table';

// 8. Studio shared components
import { StudioPagination } from '@/components/dashboard/studio/studio-pagination';
```

### 2.11. Checklist Trước Khi Merge (PR Review)

Mọi Pull Request phải đảm bảo:

- [ ] `page.tsx` không chứa JSX chi tiết (< 100 dòng render)
- [ ] Không có `useState` cho search/filter/pagination ở page level
- [ ] Không có `as any` mới (dùng `extractData`)
- [ ] Component filter tự quản bằng `useTableParams()`
- [ ] Types import từ `@atomecom/shared`, không tạo lại local
- [ ] Toast nằm trong hook, không nằm ở page/component
- [ ] File đặt đúng folder (`studio/` cho shared, `{module}/` cho domain)
- [ ] Tên file theo convention: `{module}-{tên}.tsx`

---

## PHẦN 3: THIẾT KẾ GIAO DIỆN (NEO-EDITORIAL DESIGN SYSTEM)

> **Triết lý Thiết kế:** Mọi trang quản trị (Dashboard) khi bật lên phải cho người dùng cảm giác như đang cầm một cuốn **Tạp chí công nghệ cao cấp**. Typography kiểm soát mọi thứ. Không gian trắng (Whitespace) được bố trí có chủ ý. Lược bỏ hoàn toàn những hình hộp trang trí diêm dúa.

### 3.1. Phân định ranh giới: Storefront (Cửa hàng) vs. Dashboard (Quản trị)

Sự khác biệt cốt lõi nằm ở mục đích sử dụng, yêu cầu 2 ngôn ngữ thiết kế (Vibe) tách biệt rõ ràng dưới cùng một vỏ bọc Neo-Editorial:

- **Storefront (B2C):** Được phép sử dụng tối đa tính nghệ thuật. Ưu tiên font Serif (`font-editorial`) cỡ lớn, bố cục bất đối xứng, khoảng trắng bay bổng để tạo Cảm xúc (Emotion) và nhận diện thương hiệu.
- **Admin Dashboard (B2B/Enterprise):** Đặt tính **Thực dụng (Utility)** lên tối thượng.
  - KHÔNG lạm dụng font chữ Serif (`font-editorial`) cho tiêu đề trang hệ thống hay con số dữ liệu quan trọng vì chúng sẽ gây mất tập trung, hỏng đường nét khi có dấu tiếng Việt.
  - Phải dùng **Sans-serif (`font-sans`, `font-black`)** hoặc **Monospace (`font-mono`)** cho các chỉ số KPI, bảng biểu để đảm bảo dữ liệu quét nhanh, rõ ràng nhất.
  - Loại bỏ các thẻ `<h1 className="text-5xl font-editorial">` thừa thãi trên top đầu màn hình, thay thế bằng Hệ thống **Breadcrumb** gọn gàng kết nối liền mạch với Header để tiết kiệm "Đất diễn" (Vertical Real Estate) cho biểu đồ.

### 3.2. Phân tầng Font Chữ Cơ Bản

- **Tiêu đề phân khu (Module Headlines):** Cắm chết với `DM Serif Display` (`font-editorial`). Chỉ định cho tên mảng lớn (Vd: Catalog, Users) HOẶC dùng cho những đoạn nhấn mạnh ở Storefront.
- **Dữ liệu số & Tiêu đề thực dụng (Dashboards):** Bắt buộc dùng hệ `font-sans` kết hợp nét siêu đậm (`font-black`) để hiển thị KPI (GMV, Active Carts).
- **Văn bản / UI (Body):** Xài dòng `Plus Jakarta Sans` (`font-sans`). Chuyên dùng cho Nhãn Input (Labels), đoạn miêu tả (Description). Bắt buộc: KHÔNG BAO GIỜ mang font Serif trang trí nhồi nhét vào Label.
- **Mã vạch / Code:** `System Monospace` (`font-mono`) luôn luôn ghim vào các mã SKU, Đường dẫn tĩnh (Slugs), ID sản phẩm.

### 3.3. Kiến Trúc Đa Giao Diện (Multi-Vibe System)

Để hệ thống có khả năng linh hoạt về trải nghiệm người dùng tùy theo từng ngách (Niche) bán hàng, hệ thống quy định **Kiến trúc Vibe linh hoạt:**

#### 3.3.1. Kỷ luật Vibe (Core Rules)

1. **Không Hardcode giá trị trong JSX:**
   - Không được viết: `bg-[#FFF]`, `text-[#000]`, `bg-blue-500`, `rounded-lg`, `font-sans`.
   - Phải xài biến Semantic: `bg-background`, `text-success`, `rounded-[var(--radius)]`, `font-vibe-heading`.

2. **Cấu trúc một Vibe (Atomic Vibe Anatomy):**
   - Mỗi Vibe trong `globals.css` phải định nghĩa đủ 4 trụ cột thông qua CSS Variables:
     - **Colors**: `--background`, `--foreground`, `--primary`, `--success`, `--warning`, `--info`, `--danger-soft`.
     - **Typography**: `--font-heading`, `--font-body`.
     - **Geometry**: `--radius`.
   - Khi tạo Vibe mới (VD: `data-vibe="luxury"`), chỉ cần khai báo block biến mới trong CSS và đổi thuộc tính `data-vibe` ở thẻ `<html>`.

#### 3.3.2. Bảng màu Trạng thái (Semantic Status Tokens)

- Tránh dùng trực tiếp class Tailwind gốc (`emerald-500`, `amber-500`...) trong dashboard.
- Sử dụng hệ thống token:
  - `success`: Active, Verified.
  - `warning`: Pending, Attention needed.
  - `danger-soft`: Banned, Restricted (mềm hơn destructive).
  - `info`: Processing, Metadata.
- **Cách dùng:** `<div className="text-success bg-success/10 border-success/20">...</div>`.

#### 3.3.3. Luật Inverted Action (Màu âm bản)

- Nút hành động chính (Primary) trên Dashboard phải luôn dùng hệ nghịch đảo: `bg-foreground text-background` (Đen trên Trắng ở Light mode, Trắng trên Đen ở Dark mode).

#### 3.3.4. Hướng dẫn Triển khai (Implementation Guide)

Để thay đổi "linh hồn" giao diện tại `globals.css`:

- **Geometry**: Điều chỉnh `--radius` (0px cho Brutalist, 12px cho Modern).
- **Typography**: Gán font tương ứng vào `--font-vibe-heading` và `--font-vibe-body`.
- **Spacing**: Tuân thủ **Rule of 12** (`p-3`, `p-6`, `p-12`).
- **Colors**: Thay đổi sắc độ của success/warning nhưng giữ nguyên tên biến CSS.

### 3.4. Quy Tắc Hình Học & Không Gian (Spacing)

- **Đường Nét Mảnh (Editorial Dividers):** Chia cắt layout bằng `border-b border-border/10`. Lược bỏ Shadow (Shadow là kẻ thù của Minimalist).
- **Radius hẹp**: Mặc định dùng `rounded-[var(--radius)]`. Dashboard thường dùng hệ Radius hẹp để giữ nét chặt chém của Tạp chí.

### 3.5. Label Sinh Trắc (Biometric Labels)

- Các Form Labels tiêu đề ngách nhỏ luôn phải tuân theo trật tự:
  ```css
  text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60
  ```
  (Chữ siêu nhỏ, viết hoa toàn khối, nhồi khoảng cách chữ dãn thật rộng, màu chữ bị đánh chìm đi để làm nổi bật dòng input gõ text hiện lên sau đó).

### 3.6. Studio Overlay & Stepped Layout (Nhất quán Xem/Thêm/Sửa)

Để loại bỏ sự đứt gãy trong trải nghiệm (UX Friction), tất cả các thao tác tương tác dữ liệu phải tuân thủ:

1. **Centered Card Overlay:** Không dùng Drawer (trượt ngang) hoặc Modal nhỏ. Sử dụng một thẻ Card lớn nằm chính giữa màn hình với hiệu ứng Backdrop Blur mạnh. Một container duy nhất dùng chung cho cả Xem chi tiết, Thêm mới và Chỉnh sửa.
2. **Loại bỏ cuộn trang (No Scrolling):** Các form phức tạp không được để dài lê thê. Phải sử dụng **Step Form (Thanh tiến trình)** để chia nhỏ dữ liệu thành các bước (VD: Thông tin chung -> Nội dung -> Tồn kho). Chiều cao Form được cố định để người dùng tập trung hoàn toàn.
3. **Commercial Language:** Ưu tiên tiếng Việt thương mại, trực diện thay vì các thuật ngữ kỹ thuật hoặc tiếng Anh (VD: dùng "Quản lý tồn kho" thay vì "Inventory", "Tư liệu thương hiệu" thay vì "Brand Media").

### 3.7. Trải nghiệm Visual Asset Picking

Thay thế hoàn toàn việc dán link URL thủ công bằng trải nghiệm thị giác (Visual First):

- Sử dụng các thẻ ảnh (Image Cards) trực quan có xem trước (Preview).
- Cho phép thao tác trực tiếp (Xóa, Thay đổi) ngay trên thành phần hiển thị ảnh.
- Đồng bộ hóa kích thước hiển thị (Aspect Ratio) giữa Form nhập liệu và View chi tiết.

### 3.8. Kỷ luật UX "Studio Archive"

Mọi giao diện phải mang lại cảm giác của một phiên làm việc (Session) chuyên nghiệp:

- **Header Định danh:** Luôn bắt đầu bằng biểu tượng lớn, mã phiên ID và tiêu đề trang nhã.
- **Footer Cố định:** Thanh hành động (Action Bar) luôn nằm cuối trang/overlay, tích hợp hiệu ứng Glassmorphism.

---

## PHẦN 4: QUY TẮC BỔ SUNG & ĐỀ XUẤT NÂNG CAO

### 4.1. Error Boundary ở Component Level

Ngoài Global Error Boundary, mỗi vùng dữ liệu trong trang nên có Error Boundary riêng để tránh lỗi ở một bảng làm sập cả trang:

```tsx
<ErrorBoundary fallback={<StudioEmptyState title="Đã xảy ra lỗi" />}>
  <ProductTable products={products} />
</ErrorBoundary>
```

### 4.2. Loading & Optimistic UI

- **Skeleton Loading:** Mọi bảng phải có Skeleton placeholder khi đang tải dữ liệu lần đầu, KHÔNG hiện trang trắng.
- **Optimistic Updates:** Cho các thao tác nhanh (toggle status, cập nhật tên), cân nhắc dùng `useMutation` với `onMutate` để cập nhật UI ngay trước khi API trả về.
- **`placeholderData: previousData`:** TanStack Query phải giữ dữ liệu cũ khi đang fetch trang mới (tránh nhấp nháy).

### 4.3. Accessibility (A11Y) Tối Thiểu

- Mọi `<Button>` phải có text hoặc `aria-label` rõ ràng
- Mọi `<img>` phải có `alt` text
- Form fields phải liên kết với `<label>` (hoặc `aria-label`)
- Focus ring phải visible khi navigate bằng keyboard

### 4.4. Performance Guidelines

- **Lazy Loading:** Overlay/Dialog components nên dùng `React.lazy()` vì chúng chỉ render khi mở
- **Memoization:** `useMemo` cho các computed values tốn kém (VD: filter/sort data phức tạp client-side)
- **Debounce Search:** Mọi ô search phải debounce >= 300ms trước khi trigger API call
- **Image Optimization:** Dùng `next/image` thay vì `<img>` tag trực tiếp

> Thiết lập này giúp đội ngũ giữ vững kỷ luật 2 con đường song song: Thẩm mỹ thị giác chuẩn mực thời trang cao cấp và Logic mã nguồn đơn giản sạch sẽ dễ mở rộng.

---

Phụ lục: Danh sách tệp tin nền tảng

- `client/src/app/globals.css`: Nơi chứa linh hồn của các Vibe.
- `client/src/components/ui/`: Các nguyên tử UI (Button, Badge, Input) đã được Vibe-hoá.
- `client/src/components/dashboard/studio/`: Các cấu trúc Layout cấp cao tuân thủ Vibe Geometry.
