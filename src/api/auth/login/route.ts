import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Vui lòng nhập email và mật khẩu." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: error.message || "Đăng nhập thất bại.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error("LOGIN_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Server lỗi khi đăng nhập.",
      },
      { status: 500 }
    );
  }
}