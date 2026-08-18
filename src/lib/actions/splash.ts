"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SPLASH_COOKIE = "hp_splash_seen";

async function markSplashSeen() {
  const store = await cookies();
  store.set(SPLASH_COOKIE, "1", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function dismissSplashAction() {
  await markSplashSeen();
}

export async function dismissSplashAndGoAction(path: string) {
  await markSplashSeen();
  redirect(path);
}
