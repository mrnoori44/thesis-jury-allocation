<template>
  <div class="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">اطلاعات هیئت داور</h1>
      <NuxtLink to="/student" class="text-sm text-indigo-600 hover:text-indigo-700"
        >بازگشت به داشبورد</NuxtLink
      >
    </div>

    <div v-if="pending" class="text-slate-500">در حال بارگذاری…</div>
    <div v-else-if="error" class="text-rose-600">خطا در دریافت اطلاعات</div>

    <div v-else>
      <!-- Request summary -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <p class="text-slate-900 font-semibold">{{ req?.title }}</p>
        <p class="text-slate-600 mt-1">
          حوزه: <span class="font-medium text-slate-800">{{ req?.field }}</span>
          <span class="mx-2">|</span>
          وضعیت:
          <span class="font-medium text-slate-800">{{ statusText(req?.status) }}</span>
        </p>
        <p class="text-slate-600 mt-1">
          تاریخ پیشنهادی: {{ toFaDate(req?.proposed_date) }}
          <span v-if="req?.proposed_location"> | محل: {{ req?.proposed_location }}</span>
        </p>
      </div>

      <!-- Jury list -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 mt-5">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900">داور(ها)</h2>
          <button
            @click="refresh()"
            class="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            به‌روزرسانی
          </button>
        </div>

        <p v-if="jury.length === 0" class="text-slate-500 mt-3">
          هنوز داوری پذیرش نکرده است. (در صورت عدم پذیرش طی ۶ ساعت، درخواست لغو می‌شود.)
        </p>

        <div v-else class="mt-4 grid gap-3">
          <div
            v-for="m in jury"
            :key="m.allocation_id"
            class="rounded-2xl border border-slate-200 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-slate-900">{{ m.professor_name || "—" }}</p>
                <p class="text-xs text-slate-500 mt-0.5">
                  شناسه پروفایل: {{ m.professor_profile_id }}
                </p>
              </div>
              <div class="text-xs text-slate-600">
                پذیرفته در: {{ toFaDateTime(m.accepted_at) }}
              </div>
            </div>

            <div v-if="m.preferred_fields?.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="f in m.preferred_fields"
                :key="f"
                class="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
              >
                {{ f }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <div class="mt-6">
        <NuxtLink
          :to="`/student/requests/${route.params.id}`"
          class="text-sm text-indigo-600 hover:text-indigo-700"
        >
          مشاهده جزئیات درخواست
        </NuxtLink>
      </div>
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
      status: string;
      proposed_date: string | null;
      proposed_location: string | null;
      created_at: string;
      student_profile_id: string;
    };
    jury: Array<{
      allocation_id: string;
      professor_profile_id: string;
      professor_name: string | null;
      preferred_fields: string[];
      accepted_at: string | null;
    }>;
  };
};

const { data, pending, error, refresh } = await useFetch<Resp>(
  `/api/student/requests/${route.params.id}/jury`,
  { method: "GET" }
);

const req = computed(() => data.value?.data.request);
const jury = computed(() => data.value?.data.jury ?? []);

function toFaDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}
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
</script>
