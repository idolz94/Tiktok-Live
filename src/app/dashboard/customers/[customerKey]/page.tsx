"use client";

import { useParams, useRouter } from "next/navigation";
import CustomerDetailView from "@/screens/dashboard/components/CustomerDetailView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardCustomerDetailPage() {
  const params = useParams<{ customerKey: string }>();
  const router = useRouter();
  const { orderManager } = useDashboardContext();

  const customerKey = decodeURIComponent(params.customerKey || "");
  const customer = orderManager.customers.find((item) => {
    return (item.customerTikTokUsername || item.username) === customerKey;
  });

  if (!customer) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto flex min-h-screen max-w-155 flex-col items-center justify-center bg-white px-6 text-center">
          <p className="text-[16px] font-semibold text-[#2b2b2b]">Không tìm thấy khách hàng</p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard/customers")}
            className="mt-4 rounded-full bg-[#ff6b8a] px-5 py-3 text-[14px] font-semibold text-white"
          >
            Quay lại Khách hàng
          </button>
        </div>
      </main>
    );
  }

  return <CustomerDetailView customer={customer} onBack={() => router.back()} />;
}
