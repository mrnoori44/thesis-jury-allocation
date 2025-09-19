<template>
  <div class="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">جزئیات درخواست</h1>
      <NuxtLink to="/student" class="text-sm text-indigo-600 hover:text-indigo-700"
        >بازگشت</NuxtLink
      >
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-5">
      <p class="text-slate-900 font-semibold">{{ req?.title }}</p>
      <p class="text-slate-600 mt-1">حوزه: {{ req?.field }}</p>
      <p class="text-slate-600 mt-1">وضعیت: {{ statusText(req?.status) }}</p>
      <p class="text-slate-600 mt-1">
        تاریخ پیشنهادی: {{ toFaDateTime(req?.proposed_date) }}
      </p>
      <p class="text-slate-600 mt-1" v-if="req?.proposed_location">
        محل: {{ req?.proposed_location }}
      </p>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-5 mt-5">
      <h2 class="text-base font-semibold text-slate-900 mb-3">دعوت‌ها</h2>
      <p v-if="pending" class="text-slate-500">در حال بارگذاری…</p>
      <p v-else-if="error" class="text-rose-600">خطا در دریافت اطلاعات</p>
      <p v-else-if="!invitations.length" class="text-slate-500">
        هنوز دعوتی ارسال نشده است.
      </p>
      <ul v-else class="space-y-2">
        <li
          v-for="inv in invitations"
          :key="inv.id"
          class="flex items-center justify-between rounded-xl border border-slate-200 p-3"
        >
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-2 w-2 rounded-full"
              :class="dotClass(inv.status)"
            ></span>
            <span class="text-slate-800 text-sm">وضعیت: {{ inv.status }}</span>
          </div>
          <div class="text-xs text-slate-500">
            دعوت: {{ toFaDateTime(inv.invited_at) }}
            <span v-if="inv.responded_at">
              | پاسخ: {{ toFaDateTime(inv.responded_at) }}</span
            >
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth-student" as any });
const route = useRoute();

type Resp = {
  ok: boolean;
  data: {
    request: {
      id: string;
      title: string;
      field: string;
      abstract: string | null;
      status: string;
      proposed_date: string | null;
      proposed_location: string | null;
      created_at: string;
      student_profile_id: string;
    };
    invitations: Array<{
      id: string;
      professor_profile_id: string;
      status: string;
      invited_at: string | null;
      responded_at: string | null;
    }>;
  };
};

const { data, pending, error } = await useFetch<Resp>(
  `/api/student/requests/${route.params.id}`,
  { method: "GET" }
);
const req = computed(() => data.value?.data.request);
const invitations = computed(() => data.value?.data.invitations ?? []);

function toFaDateTime(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
function statusText(s?: string) {
  switch (s) {
    case "matching":
      return "در حال بررسی";
    case "inviting":
      return "در حال دعوت";
    case "assigned":
      return "تخصیص داده شد";
    case "cancelled":
      return "لغو شد";
    case "draft":
      return "پیش‌نویس";
    default:
      return s || "";
  }
}
function dotClass(s: string) {
  if (s === "accepted") return "bg-emerald-600";
  if (s === "declined") return "bg-rose-600";
  if (s === "expired") return "bg-slate-400";
  return "bg-indigo-600"; // invited
}
</script>
