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
        قبلاً ثبت‌نام کرده‌اید؟
        <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-700 font-semibold"
          >ورود</NuxtLink
        >
      </nav>
    </header>

    <!-- Sign up card -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Slogan / feature side (hidden on small) -->
        <section class="hidden lg:block">
          <Transition name="fade" appear>
            <div
              class="rounded-3xl bg-white/60 backdrop-blur p-8 shadow-sm border border-slate-100"
            >
              <h1 class="text-2xl font-extrabold text-slate-800 leading-[1.6]">
                ثبت‌نام دانشجو در سامانه تخصیص داور
              </h1>
              <p class="mt-4 text-slate-600 leading-7">
                با ایجاد حساب، به ابزارهای هماهنگی جلسات دفاع، تطبیق تخصص داوران و
                اعلان‌های به‌موقع دسترسی خواهید داشت. طراحی سبک و سازگار با موبایل.
              </p>
              <ul class="mt-6 space-y-3 text-slate-700">
                <li class="flex items-start gap-3">
                  <span class="i">✔</span
                  ><span>اطلاعات هویتی دانشجو (نام، شماره دانشجویی)</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="i">✔</span><span>تأیید ایمیل با کد ۶ رقمی</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="i">✔</span><span>پیوند خودکار به پروفایل پس از تأیید</span>
                </li>
              </ul>
            </div>
          </Transition>
        </section>

        <!-- Form side (design only; your script & handlers stay intact) -->
        <section>
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 sm:p-8 shadow-sm border border-slate-100"
          >
            <h2 class="text-xl sm:text-2xl font-extrabold text-slate-800">
              ثبت‌نام دانشجو
            </h2>
            <p class="mt-2 text-slate-600 text-sm">
              لطفاً اطلاعات زیر را تکمیل کنید. تمام فیلدها به زبان فارسی برچسب‌گذاری
              شده‌اند.
            </p>

            <form @submit.prevent="submit" class="mt-6 space-y-4">
              <div>
                <label class="text-sm block mb-1 text-slate-700"
                  >نام و نام خانوادگی</label
                >
                <input
                  v-model="form.full_name"
                  required
                  type="text"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="مثلاً: علی رضایی"
                />
              </div>

              <div>
                <label class="text-sm block mb-1 text-slate-700">شماره دانشجویی</label>
                <input
                  v-model="form.student_number"
                  required
                  type="text"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="مثلاً: ۹۹۱۲۳۴۵۶"
                />
              </div>

              <div>
                <label class="text-sm block mb-1 text-slate-700">ایمیل دانشگاهی</label>
                <div class="relative">
                  <input
                    v-model="form.email"
                    required
                    type="email"
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
                <label class="text-sm block mb-1 text-slate-700">گذرواژه</label>
                <input
                  v-model="form.password"
                  required
                  type="password"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="حداقل ۸ کاراکتر"
                />
              </div>

              <button
                :disabled="loading"
                type="submit"
                class="w-full rounded-2xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 active:scale-[.99] transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span v-if="!loading">ثبت‌نام</span>
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
                  در حال ارسال...
                </span>
              </button>

              <div
                v-if="message"
                class="text-sm mt-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 p-3"
              >
                {{ message }}
              </div>
              <div
                v-if="error"
                class="text-sm mt-2 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3"
              >
                {{ error }}
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <!-- OTP Modal -->
    <div v-if="showOtpModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50"></div>
      <div
        class="relative bg-white rounded-3xl shadow-lg p-6 sm:p-8 w-full max-w-md border border-slate-100"
      >
        <h2 class="text-xl font-extrabold mb-2 text-slate-800">کد تأیید را وارد کنید</h2>
        <p class="text-sm text-slate-600 mb-4">
          یک کد ۶ رقمی به ایمیل
          <strong class="font-semibold">{{ form.email }}</strong> ارسال شده است. برای
          تکمیل ثبت‌نام، کد را وارد کنید.
        </p>

        <div class="space-y-4">
          <input
            v-model="otpCode"
            maxlength="10"
            class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 text-center text-lg bg-white/90"
            placeholder="۱۲۳۴۵۶"
          />

          <div class="flex items-center justify-between gap-3">
            <button
              @click="verifyOtp"
              :disabled="verifying"
              class="px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="!verifying">تأیید</span>
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
                در حال بررسی...
              </span>
            </button>

            <button
              @click="resendCode"
              :disabled="resendCooldown > 0"
              class="px-3 py-2 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="resendCooldown === 0">ارسال مجدد کد</span>
              <span v-else>ارسال مجدد تا {{ resendCooldown }} ثانیه</span>
            </button>
          </div>

          <div
            v-if="otpError"
            class="text-sm mt-1 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3"
          >
            {{ otpError }}
          </div>
          <div
            v-if="otpInfo"
            class="text-sm mt-1 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 p-3"
          >
            {{ otpInfo }}
          </div>

          <div class="flex justify-end mt-2">
            <button
              @click="cancelOtp"
              class="text-sm text-slate-600 hover:text-slate-800"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>

    <footer class="text-center text-xs text-slate-500 pb-8 px-4">
      <p>© {{ new Date().getFullYear() }} سامانه تخصیص داور — همه حقوق محفوظ است.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Signup page with OTP modal and typed Supabase client.
//
// - Uses supabase.auth.signUp() to create the user (password + email).
// - Inserts a signup_requests row (optional but recommended) so we keep full_name & student_number until finalization.
// - Opens OTP modal (assumes your Supabase email template uses {{ .Token }}).
// - Verifies OTP with supabase.auth.verifyOtp({ email, token, type: 'email' }).
// - On success redirects to /login.
//
// Make sure:
// - types/database.types exports `Database` (the type you already have).
// - Supabase Confirm email template contains {{ .Token }} (OTP).
// - You restart the dev server after changing types.

import { ref, reactive, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useSupabaseClient } from "#imports";
import type { Database } from "~~/types/database.types"; // uses your project's path

// typed supabase client
const rawSupabase = useSupabaseClient();
const supabase = (rawSupabase as unknown) as SupabaseClient<Database>;

const router = useRouter();

// form data
const form = reactive({
  full_name: "",
  student_number: "",
  email: "",
  password: "",
});

const loading = ref(false);
const message = ref("");
const error = ref("");

// OTP modal state
const showOtpModal = ref(false);
const otpCode = ref("");
const verifying = ref(false);
const otpError = ref("");
const otpInfo = ref("");

// resend cooldown (seconds)
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

function startResendCooldown(seconds = 360) {
  resendCooldown.value = seconds;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    resendCooldown.value -= 1;
    if (resendCooldown.value <= 0) {
      if (cooldownTimer) clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

// Main submit - sign up and open OTP modal
async function submit() {
  loading.value = true;
  message.value = "";
  error.value = "";

  try {
    // 1) Sign up the user with Supabase auth (password + email)
    const { data: signData, error: signErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signErr) {
      error.value = signErr.message || "خطا در ثبت نام";
      return;
    }

    // 2) Insert a signup_requests row to keep name/student_number until finalization
    //    This is optional but recommended so you don't lose the provided metadata.
    //    user_id may be undefined if Supabase does not return a user until confirmation;
    //    we store the id if available, otherwise null and finalize will link by email later.
    try {
      await supabase.from("signup_requests").insert({
        email: form.email,
        full_name: form.full_name || null,
        student_number: form.student_number || null,
        status: "pending_confirmation",
        user_id: (signData?.user?.id as string) ?? null,
      } as Database["public"]["Tables"]["signup_requests"]["Insert"]);
    } catch (e) {
      // not fatal — log for debugging
      console.warn("signup_requests insert error", e);
    }

    // 3) Show OTP modal (Supabase should have sent an OTP if template is configured)
    showOtpModal.value = true;
    otpError.value = "";
    otpInfo.value = "یک کد تایید ۶ رقمی به ایمیل شما ارسال خواهد شد";
    startResendCooldown(30);
    message.value = "کد تأیید ارسال شد. لطفاً ایمیل خود را بررسی کنید.";
  } catch (e: any) {
    console.error(e);
    error.value = e?.message || "خطای غیرمنتظره";
  } finally {
    loading.value = false;
  }
}

// Verify OTP - uses supabase.auth.verifyOtp
async function verifyOtp() {
  otpError.value = "";
  otpInfo.value = "";
  verifying.value = true;

  try {
    if (!otpCode.value || otpCode.value.trim().length === 0) {
      otpError.value = "لطفاً کد تأیید را وارد کنید.";
      return;
    }

    // Verify the OTP token sent by Supabase email template
    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email: form.email,
      token: otpCode.value.trim(),
      type: "email", // use 'email' for signup/verification OTP
    });

    if (verifyErr) {
      otpError.value = verifyErr.message || "کد نامعتبر یا منقضی شده است";
      return;
    }

    // success: navigate to login page
    otpInfo.value = "ایمیل شما تأیید شد. در حال انتقال به صفحه ورود...";

    // short delay for UX
    setTimeout(() => {
      showOtpModal.value = false;
      router.push("/login");
    }, 800);
  } catch (e: any) {
    console.error(e);
    otpError.value = e?.message || "خطای اعتبارسنجی";
  } finally {
    verifying.value = false;
  }
}

// Resend code using signInWithOtp (the normal client-side method to cause Supabase to re-send OTP)
async function resendCode() {
  if (resendCooldown.value > 0) return;
  otpError.value = "";
  otpInfo.value = "در حال ارسال مجدد کد...";
  try {
    const { data, error: resendErr } = await supabase.auth.signInWithOtp({
      email: form.email,
    });
    if (resendErr) {
      otpError.value = resendErr.message || "ارسال مجدد ناموفق";
      return;
    }
    otpInfo.value = "کد مجدداً ارسال شد. لطفاً ایمیل خود را بررسی کنید.";
    startResendCooldown(30);
  } catch (e: any) {
    console.error(e);
    otpError.value = e?.message || "ارسال مجدد ناموفق";
  }
}

// Cancel OTP modal and optionally sign out to clear session
async function cancelOtp() {
  showOtpModal.value = false;
  otpCode.value = "";
  otpError.value = "";
  otpInfo.value = "";
  try {
    await supabase.auth.signOut();
  } catch (_) {}
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
