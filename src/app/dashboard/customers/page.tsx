"use client";

import CustomersView from "@/screens/dashboard/components/CustomersView";
import { useDashboardContext } from "@/screens/dashboard/DashboardContext";

export default function DashboardCustomersPage() {
  const { orderManager } = useDashboardContext();

  return <CustomersView customers={orderManager.customers} />;
}
