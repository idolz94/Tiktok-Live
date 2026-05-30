"use client";

import { createClient } from "@/lib/supabase/client";
import { phoneToAuthEmail } from "@/utils/phone";

export type SignUpPayload = {
  fullName: string;
  phone: string;
  password: string;
  tiktokId: string;
};

export type SignInPayload = {
  phone: string;
  password: string;
};

export async function signUpApi(payload: SignUpPayload) {
  const supabase = createClient();

  const rawPhone = payload.phone;
  const authEmail = phoneToAuthEmail(rawPhone);

  const { data, error } = await supabase.auth.signUp({
    email: authEmail,
    password: payload.password,
    options: {
      data: {
        full_name: payload.fullName,
        phone: rawPhone,
        tiktok_id: payload.tiktokId,
        default_tiktok_username: payload.tiktokId,
        shop_name: `${payload.fullName}'s Shop`,
        login_type: "phone_password",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signInApi(payload: SignInPayload) {
  const supabase = createClient();

  const authEmail = phoneToAuthEmail(payload.phone);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password: payload.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOutApi() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
}