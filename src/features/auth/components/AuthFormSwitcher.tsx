"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import anime from "animejs";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import {
  authModeHref,
  parseAuthMode,
  type AuthMode,
} from "@/features/auth/types";

type AuthFormSwitcherProps = {
  mode: AuthMode;
  onNavigate: (mode: AuthMode) => void;
};

function AuthFormBody({ mode, onNavigate }: AuthFormSwitcherProps) {
  if (mode === "register") {
    return <RegisterForm embedded onNavigate={onNavigate} />;
  }
  if (mode === "forgot") {
    return <ForgotPasswordForm embedded onNavigate={onNavigate} />;
  }
  return <LoginForm embedded onNavigate={onNavigate} />;
}

/**
 * Right-panel form host — swaps login / register / forgot with anime.js.
 */
export function AuthFormSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = parseAuthMode(searchParams.get("mode"));
  const panelRef = useRef<HTMLDivElement>(null);
  const prevMode = useRef(mode);

  const onNavigate = (next: AuthMode) => {
    router.replace(authModeHref(next), { scroll: false });
  };

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    if (prevMode.current === mode) {
      anime.set(el, { opacity: 1, translateY: 0 });
      return;
    }
    prevMode.current = mode;

    anime.remove(el);
    anime({
      targets: el,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 420,
      easing: "easeOutExpo",
    });
  }, [mode]);

  return (
    <div ref={panelRef} className="w-full">
      <AuthFormBody mode={mode} onNavigate={onNavigate} />
    </div>
  );
}
