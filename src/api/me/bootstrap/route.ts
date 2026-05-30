import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type LicenseReason =
  | null
  | "NO_USER"
  | "NO_SHOP"
  | "NO_LICENSE"
  | "TRIAL_EXPIRED"
  | "LICENSE_INACTIVE";

function checkCanUseApp(shop: any): {
  canUseApp: boolean;
  reason: LicenseReason;
} {
  if (!shop) {
    return {
      canUseApp: false,
      reason: "NO_SHOP",
    };
  }

  const licenseStatus = shop.license_status;
  const trialEndsAt = shop.trial_ends_at;

  if (licenseStatus === "active") {
    return {
      canUseApp: true,
      reason: null,
    };
  }

  if (licenseStatus === "trialing") {
    if (!trialEndsAt) {
      return {
        canUseApp: false,
        reason: "NO_LICENSE",
      };
    }

    const now = Date.now();
    const trialEndTime = new Date(trialEndsAt).getTime();

    if (Number.isNaN(trialEndTime)) {
      return {
        canUseApp: false,
        reason: "NO_LICENSE",
      };
    }

    if (trialEndTime > now) {
      return {
        canUseApp: true,
        reason: null,
      };
    }

    return {
      canUseApp: false,
      reason: "TRIAL_EXPIRED",
    };
  }

  return {
    canUseApp: false,
    reason: "LICENSE_INACTIVE",
  };
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({
        user: null,
        shop: null,
        member: null,
        canUseApp: false,
        reason: "NO_USER",
      });
    }

    const admin = createSupabaseAdminClient();

    const { data: member, error: memberError } = await admin
      .from("shop_members")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError) {
      return NextResponse.json(
        {
          user,
          shop: null,
          member: null,
          canUseApp: false,
          reason: "NO_SHOP",
          message: memberError.message,
        },
        { status: 500 }
      );
    }

    if (!member?.shop_id) {
      return NextResponse.json({
        user,
        shop: null,
        member: null,
        canUseApp: false,
        reason: "NO_SHOP",
      });
    }

    const { data: shop, error: shopError } = await admin
      .from("shops")
      .select("*")
      .eq("id", member.shop_id)
      .maybeSingle();

    if (shopError) {
      return NextResponse.json(
        {
          user,
          shop: null,
          member,
          canUseApp: false,
          reason: "NO_SHOP",
          message: shopError.message,
        },
        { status: 500 }
      );
    }

    const license = checkCanUseApp(shop);

    return NextResponse.json({
      user,
      shop,
      member,
      canUseApp: license.canUseApp,
      reason: license.reason,
    });
  } catch (error) {
    console.error("ME_BOOTSTRAP_ERROR", error);

    return NextResponse.json(
      {
        user: null,
        shop: null,
        member: null,
        canUseApp: false,
        reason: "NO_USER",
        message: "Server lỗi khi lấy thông tin tài khoản.",
      },
      { status: 500 }
    );
  }
}