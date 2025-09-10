<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 rtl p-6">
    <div class="w-full max-w-md bg-white rounded shadow p-6">
      <h1 class="text-2xl font-semibold mb-4 text-right">ورود ادمین</h1>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="text-sm block mb-1">ایمیل</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border rounded px-3 py-2"
            placeholder="admin@example.com"
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

        <div class="flex justify-between items-center">
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">
            ورود
          </button>
          <div v-if="loading" class="text-sm text-gray-500">در حال ورود...</div>
        </div>

        <div v-if="error" class="text-sm text-red-600">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSupabaseClient, useSupabaseUser } from "#imports"; // auto-imported by module

const supabase = useSupabaseClient();
const currentUser = useSupabaseUser(); // reactive, if logged in

const router = useRouter();
const form = ref({ email: "", password: "" });
const loading = ref(false);
const error = ref<string | null>(null);

async function submit() {
  loading.value = true;
  error.value = null;
  try {
    // sign in
    const { data, error: signInErr } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password,
    });
    console.log("signIn data:", data, "signInErr:", signInErr);

    if (signInErr) {
      error.value = signInErr.message || "خطا در ورود";
      return;
    }

    const user = data.user;
    if (!user) {
      error.value = "کاربر یافت نشد";
      return;
    }

    const userId = data?.user?.id;
    console.log("signed in user id:", userId);

    // verify profile role + approved
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role,approved")
      .eq("id", user.id)
      .single();

    console.log("profile query result:", profile, "profileErr:", profileErr);

    if (profileErr || !profile) {
      // sign out non-admin to avoid leaving session
      await supabase.auth.signOut();
      error.value = "پروفایل یافت نشد";
      return;
    }

    // ensure TypeScript knows the shape of profile
    const typedProfile = profile as { role: string; approved: boolean };

    if (typedProfile.role !== "admin" || !typedProfile.approved) {
      await supabase.auth.signOut();
      error.value = "این حساب دسترسی ادمین ندارد یا تایید نشده است.";
      return;
    }

    // success
    router.push("/admin");
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
