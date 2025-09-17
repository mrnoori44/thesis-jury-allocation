<template>
  <div class="min-h-screen flex items-center justify-center p-6 rtl bg-slate-50">
    <div class="w-full max-w-md bg-white rounded shadow px-6 py-6">
      <h1 class="text-2xl mb-4 text-right font-semibold">ثبت نام دانشجو</h1>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="text-sm block mb-1">نام و نام خانوادگی</label>
          <input
            v-model="form.full_name"
            required
            type="text"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="text-sm block mb-1">شماره دانشجویی</label>
          <input
            v-model="form.student_number"
            required
            type="text"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="text-sm block mb-1">ایمیل</label>
          <input
            v-model="form.email"
            required
            type="email"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label class="text-sm block mb-1">رمز عبور</label>
          <input
            v-model="form.password"
            required
            type="password"
            class="w-full border rounded px-3 py-2"
          />
        </div>

        <div class="flex items-center justify-between">
          <button
            :disabled="loading"
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded"
          >
            ثبت نام
          </button>
          <div v-if="loading" class="text-sm text-gray-500">در حال ارسال...</div>
        </div>

        <div v-if="message" class="text-sm text-green-700">{{ message }}</div>
        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </form>
    </div>
    <!-- OTP Modal -->
    <div v-if="showOtpModal" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="bg-white rounded shadow-lg p-6 w-full max-w-md z-60">
        <h2 class="text-lg font-semibold mb-2">Enter verification code</h2>
        <p class="text-sm text-gray-600 mb-4">
          We sent a 6-digit code to <strong>{{ form.email }}</strong
          >. Enter it here to complete signup.
        </p>

        <div class="space-y-3">
          <input
            v-model="otpCode"
            maxlength="10"
            class="w-full border rounded px-3 py-2 text-center text-lg"
            placeholder="123456"
          />

          <div class="flex items-center justify-between">
            <button
              @click="verifyOtp"
              :disabled="verifying"
              class="px-4 py-2 bg-green-600 text-white rounded"
            >
              Verify
            </button>

            <button
              @click="resendCode"
              :disabled="resendCooldown > 0"
              class="px-3 py-2 border rounded text-sm"
            >
              <span v-if="resendCooldown === 0">Resend code</span>
              <span v-else>Resend in {{ resendCooldown }}s</span>
            </button>
          </div>

          <div v-if="otpError" class="text-sm text-red-600">{{ otpError }}</div>
          <div v-if="otpInfo" class="text-sm text-blue-600">{{ otpInfo }}</div>

          <div class="flex justify-end gap-2 mt-4">
            <button @click="cancelOtp" class="text-sm text-gray-600">Cancel</button>
          </div>
        </div>
      </div>
    </div>
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
    otpInfo.value = "یک کد تایید ۶رقمی به ایمیل شما فرستاده خواهد شد";
    startResendCooldown(30);
    message.value = "کد تایید فرستاده شد. لطفا ایمیل خود را بررسی کنید.";
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
      otpError.value = "لطفا کد تایید را وارد کنید.";
      return;
    }

    // Verify the OTP token sent by Supabase email template
    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email: form.email,
      token: otpCode.value.trim(),
      type: "email", // use 'email' for signup/verification OTP
    });

    if (verifyErr) {
      otpError.value = verifyErr.message || "کد نامعتبر یا منقضی شده";
      return;
    }

    // success: navigate to login page
    otpInfo.value = "ایمیل شما تایید شد. درحال رفتن به صفحه ورود...";

    // short delay for UX
    setTimeout(() => {
      showOtpModal.value = false;
      router.push("/login");
    }, 800);
  } catch (e: any) {
    console.error(e);
    otpError.value = e?.message || "خطای اعتبار سنجی";
  } finally {
    verifying.value = false;
  }
}

// Resend code using signInWithOtp (the normal client-side method to cause Supabase to re-send OTP)
async function resendCode() {
  if (resendCooldown.value > 0) return;
  otpError.value = "";
  otpInfo.value = "فرستادن دوباره کد...";
  try {
    const { data, error: resendErr } = await supabase.auth.signInWithOtp({
      email: form.email,
    });
    if (resendErr) {
      otpError.value = resendErr.message || "ارسال مجدد ناموفق";
      return;
    }
    otpInfo.value = "کد مجدد ارسال شد. لطفا ایمیل خود را چک کنید";
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
</style>
