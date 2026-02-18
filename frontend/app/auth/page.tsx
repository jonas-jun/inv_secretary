"use client";

/**
 * app/auth/page.tsx
 * ──────────────────
 * 로그인 / 회원가입 페이지. Supabase Auth UI 사용.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  // 이미 로그인된 경우 홈으로 리디렉션
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") router.replace("/");
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex justify-center pt-10">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-3xl">📈</span>
          <h1 className="mt-2 text-lg font-bold text-slate-900">StockInsight</h1>
          <p className="text-sm text-slate-500 mt-1">로그인하여 워치리스트를 이용하세요</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          localization={{
            variables: {
              sign_in: { email_label: "이메일", password_label: "비밀번호", button_label: "로그인" },
              sign_up: { email_label: "이메일", password_label: "비밀번호", button_label: "회원가입" },
            },
          }}
        />
      </div>
    </div>
  );
}
