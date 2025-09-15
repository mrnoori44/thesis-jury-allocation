<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 rtl p-6">
    <div class="w-full max-w-md bg-white rounded shadow p-6">
      <h1 class="text-2xl font-semibold mb-4 text-right">ورود</h1>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="text-sm block mb-1">ایمیل</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="example@uni.edu"
          />
        </div>

        <div>
          <label class="text-sm block mb-1">رمز عبور</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="رمز عبور"
          />
        </div>

        <div class="flex items-center justify-between">
          <button
            :disabled="loading"
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded"
          >
            ورود
          </button>
          <div v-if="loading" class="text-sm text-gray-500">در حال ورود...</div>
        </div>

        <div v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</div>
        <div v-if="info" class="text-sm text-blue-600 mt-2">{{ info }}</div>
      </form>
    </div>
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
        router.push("/student");
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
</style>
