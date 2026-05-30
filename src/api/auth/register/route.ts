import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const TRIAL_DAYS = 365;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const shopName = String(body.shopName || "Shop của tôi").trim();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Vui lòng nhập email." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signUpError) {
      return NextResponse.json(
        {
          ok: false,
          message: signUpError.message || "Đăng ký thất bại.",
        },
        { status: 400 }
      );
    }

    const user = signUpData.user;

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "Không tạo được tài khoản. Vui lòng thử lại.",
        },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();

    const trialEndsAt = new Date(
      Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: shop, error: shopError } = await admin
      .from("shops")
      .insert({
        name: shopName || "Shop của tôi",
        owner_id: user.id,
        license_status: "trialing",
        trial_ends_at: trialEndsAt,
      })
      .select("*")
      .single();

    if (shopError || !shop) {
      return NextResponse.json(
        {
          ok: false,
          message:
            shopError?.message ||
            "Tài khoản đã tạo nhưng chưa tạo được shop dùng thử.",
        },
        { status: 500 }
      );
    }

    const { error: memberError } = await admin.from("shop_members").insert({
      shop_id: shop.id,
      user_id: user.id,
      role: "owner",
    });

    if (memberError) {
      return NextResponse.json(
        {
          ok: false,
          message:
            memberError.message ||
            "Tài khoản đã tạo nhưng chưa gắn được user vào shop.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Đăng ký thành công.",
      user,
      shop,
      canUseApp: true,
      reason: null,
    });
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Server lỗi khi đăng ký tài khoản.",
      },
      { status: 500 }
    );
  }
}