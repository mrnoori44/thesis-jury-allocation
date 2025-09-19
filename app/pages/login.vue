<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden rtl"
    dir="rtl"
  >
    <!-- Decorative, ultra‑light blobs -->
    <div
      aria-hidden="true"
      class="pointer-events-none select-none absolute -top-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-indigo-200/30 blur-3xl"
    ></div>
    <div
      aria-hidden="true"
      class="pointer-events-none select-none absolute -bottom-24 -left-24 h-[22rem] w-[22rem] rounded-full bg-fuchsia-200/25 blur-3xl"
    ></div>

    <!-- Header -->
    <header class="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-xl bg-indigo-600 text-white font-bold grid place-items-center shadow-sm"
        >
          دا
        </div>
        <span class="text-slate-700 font-semibold hidden sm:block"
          >سامانه تخصیص داور</span
        >
      </NuxtLink>
      <nav class="text-sm text-slate-600 hidden sm:block">
        حساب ندارید؟
        <NuxtLink to="/signup" class="text-indigo-600 hover:text-indigo-700 font-semibold"
          >ثبت‌نام</NuxtLink
        >
      </nav>
    </header>

    <!-- Auth card -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Slogan / feature side (hidden on small) -->
        <section class="hidden lg:block">
          <Transition name="fade" appear>
            <div
              class="rounded-3xl bg-white/60 backdrop-blur p-8 shadow-sm border border-slate-100"
            >
              <h1 class="text-2xl font-extrabold text-slate-800 leading-[1.6]">
                سامانه تخصیص داور برای جلسات دفاع پایان نامه
              </h1>
              <p class="mt-4 text-slate-600 leading-7">
                ورود اعضا برای مدیریت دعوت داوران، هماهنگی تقویم دفاع و مشاهده وضعیت
                پرونده‌ها. سبک، سریع و سازگار با موبایل.
              </p>
              <ul class="mt-6 space-y-3 text-slate-700">
                <li class="flex items-start gap-3">
                  <span class="i">✔</span><span>تطبیق هوشمند تخصص با موضوع دفاع</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="i">✔</span><span>هماهنگی زمان بدون تداخل</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="i">✔</span><span>داشبورد گزارش‌های دانشگاهی</span>
                </li>
              </ul>
            </div>
          </Transition>
        </section>

        <!-- Form side (uses your existing script & submit handler) -->
        <section>
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 sm:p-8 shadow-sm border border-slate-100"
          >
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-800">
              ورود به سامانه
            </h2>
            <p class="mt-2 text-slate-600 text-sm">
              لطفاً ایمیل دانشگاهی و گذرواژه خود را وارد کنید.
            </p>

            <form @submit.prevent="submit" class="mt-6 space-y-4">
              <div>
                <label class="text-sm block mb-1 text-slate-700">ایمیل</label>
                <div class="relative">
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 pr-10 bg-white/90"
                    placeholder="example@university.ac.ir"
                  />
                  <svg
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path d="M4 8l8 5 8-5" />
                    <path d="M4 8v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                  </svg>
                </div>
              </div>

              <div>
                <label class="text-sm block mb-1 text-slate-700">رمز عبور</label>
                <div class="relative">
                  <input
                    v-model="form.password"
                    type="password"
                    required
                    class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 pr-10 bg-white/90"
                    placeholder="••••••••"
                  />
                  <svg
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="flex items-center gap-2 text-sm text-slate-600 select-none">
                  <input
                    type="checkbox"
                    class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  مرا به خاطر بسپار
                </label>
                <NuxtLink
                  to="/forgot"
                  class="text-sm text-indigo-600 hover:text-indigo-700"
                  >فراموشی گذرواژه</NuxtLink
                >
              </div>

              <button
                :disabled="loading"
                type="submit"
                class="w-full rounded-2xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 active:scale-[.99] transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="!loading">ورود</span>
                <span v-else class="inline-flex items-center gap-2">
                  <svg
                    class="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <circle cx="12" cy="12" r="9" opacity=".25" />
                    <path d="M21 12a9 9 0 0 1-9 9" />
                  </svg>
                  در حال ورود...
                </span>
              </button>

              <p class="text-center text-sm text-slate-600">
                حساب ندارید؟
                <NuxtLink
                  to="/signup"
                  class="text-indigo-600 hover:text-indigo-700 font-semibold"
                  >ثبت‌نام</NuxtLink
                >
              </p>

              <div
                v-if="error"
                class="text-sm mt-2 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3"
              >
                {{ error }}
              </div>
              <div
                v-if="info"
                class="text-sm mt-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 p-3"
              >
                {{ info }}
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <footer class="text-center text-xs text-slate-500 pb-8 px-4">
      <p>© {{ new Date().getFullYear() }} سامانه تخصیص داور — همه حقوق محفوظ است.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// English comments throughout this script.

// Imports
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSupabaseClient } from "#imports"; // provided by @nuxt/supabase module

// create supabase client (auto-configured by the Nuxt module)
const supabase = useSupabaseClient();
const router = useRouter();

// reactive form state
const form = ref({ email: "", password: "" });
const loading = ref(false);
const error = ref<string | null>(null);
const info = ref<string | null>(null);

// Main submit handler:
// 1. Sign in with Supabase using email & password.
// 2. Call server finalize endpoint to create profile if needed.
// 3. Fetch the profile row from `profiles` and redirect based on role + approved.
// 4. If user is not approved, sign out and show info message.
async function submit() {
  error.value = null;
  info.value = null;
  loading.value = true;

  try {
    // 1) Sign in the user
    // Using signInWithPassword (supabase-js v2)
    const { data: signData, error: signErr } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password,
    });

    if (signErr) {
      // Authentication errors (wrong password, unconfirmed email, etc.)
      error.value = signErr.message || "Error signing in";
      return;
    }

    const user = signData.user;
    if (!user) {
      error.value = "User not found";
      return;
    }

    // 2) Finalize profile creation on the server if needed.
    // This endpoint will create a profiles row (approved=false) for new confirmed users.
    // We call it here after sign-in so it runs under the user's session (RLS-friendly).
    try {
      await $fetch("/api/auth/finalize", { method: "POST" });
    } catch (e) {
      // Non-fatal: finalize may fail if the user is already finalized or other minor issues.
      // We continue and try to read the profile below.
      console.warn("finalize failed:", e);
    }

    // 3) Fetch profile to check role and approval.
    const { data: profile, error: profileErr } = (await supabase
      .from("profiles")
      .select("role,approved")
      .eq("id", user.id)
      .single()) as any;

    if (profileErr || !profile) {
      // If profile cannot be read, sign out and show an error to avoid leaving a session.
      console.error("profileErr", profileErr);
      await supabase.auth.signOut();
      error.value = "Error reading profile — please contact support";
      return;
    }

    // 4) Route the user based on role and approved flag.
    const role = profile.role as string;
    const approved = !!profile.approved;

    if (role === "admin") {
      // Admins go to admin dashboard
      router.push("/admin");
      return;
    }

    if (role === "student") {
      if (approved) {
        router.push("/student/index");
      } else {
        // Not approved yet: sign out and show an informational message.
        await supabase.auth.signOut();
        info.value =
          "حساب شما هنوز توسط مدیر تایید نشده است. پس از تایید می‌توانید وارد شوید.";
      }
      return;
    }

    if (role === "professor") {
      if (approved) {
        router.push("/professor");
      } else {
        await supabase.auth.signOut();
        info.value = "حساب شما هنوز تایید نشده است. لطفاً با مدیریت تماس بگیرید.";
      }
      return;
    }

    // Unknown role: sign out and show error
    await supabase.auth.signOut();
    error.value = "Invalid user role — please contact support";
  } catch (e: any) {
    // Generic fallback error handling
    console.error(e);
    error.value = e?.message || "Internal error";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.rtl {
  direction: rtl;
}
.fade-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
