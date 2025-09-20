<template>
  <div class="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">جزئیات درخواست دعوت</h1>
      <NuxtLink to="/professor" class="text-sm text-indigo-600 hover:text-indigo-700"
        >بازگشت به داشبورد</NuxtLink
      >
    </div>

    <!-- States -->
    <div v-if="pending" class="text-slate-500">در حال بارگذاری…</div>
    <div v-else-if="error" class="text-rose-600">خطا در دریافت اطلاعات</div>

    <div v-else class="space-y-6">
      <!-- Thesis card -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-900 font-semibold">{{ thesis?.title }}</p>
            <p class="text-slate-600 mt-1">
              دانشجو:
              <span class="font-medium text-slate-800">{{ studentName || "—" }}</span>
              <span class="mx-2">|</span>
              حوزه: <span class="font-medium text-slate-800">{{ thesis?.field }}</span>
            </p>
          </div>
          <span
            class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            :class="chip(allocation?.status || '')"
          >
            <span
              class="h-2 w-2 rounded-full"
              :class="dot(allocation?.status || '')"
            ></span>
            {{ statusText(allocation?.status || "") }}
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div class="rounded-xl border border-slate-200 p-3">
            <div class="text-slate-500">تاریخ دعوت</div>
            <div class="font-medium text-slate-800">
              {{ toFaDateTime(allocation?.invited_at) }}
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 p-3">
            <div class="text-slate-500">تاریخ پیشنهادی</div>
            <div class="font-medium text-slate-800">
              {{ toFaDateTime(thesis?.proposed_date) }}
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 p-3">
            <div class="text-slate-500">محل پیشنهادی</div>
            <div class="font-medium text-slate-800">
              {{ thesis?.proposed_location || "—" }}
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="text-slate-500 text-sm">چکیده</div>
          <p class="text-slate-700 text-sm leading-7 mt-1">
            {{ thesis?.abstract || "—" }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900">اقدامات</h2>
          <div class="text-xs text-slate-500">
            وضعیت فعلی: {{ statusText(allocation?.status || "") }}
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            v-if="allocation?.status === 'invited'"
            @click="onAccept"
            :disabled="actionPending"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {{ actionPending ? "در حال ارسال…" : "پذیرش" }}
          </button>
          <button
            v-if="allocation?.status === 'invited'"
            @click="onDecline"
            :disabled="actionPending"
            class="rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {{ actionPending ? "در حال ارسال…" : "رد" }}
          </button>
          <button
            @click="refresh()"
            class="rounded-xl border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            به‌روزرسانی
          </button>
        </div>

        <p v-if="message" class="mt-3 text-sm" :class="messageClass">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth-professor" as any });

const route = useRoute();

type Resp = {
  ok: boolean;
  data: {
    thesis: {
      id: string;
      title: string;
      field: string;
      abstract: string | null;
      status: string;
      created_at: string;
      proposed_date: string | null;
      proposed_location: string | null;
      student_profile_id: string | null;
    };
    allocation: {
      id: string;
      status: "invited" | "accepted" | "declined" | "expired" | string;
      invited_at: string | null;
      responded_at: string | null;
    };
    student_name: string | null;
  };
};

const { data, pending, error, refresh } = await useFetch<Resp>(
  `/api/professor/requests/${route.params.id}`,
  { method: "GET" }
);

const thesis = computed(() => data.value?.data.thesis);
const allocation = computed(() => data.value?.data.allocation);
const studentName = computed(() => data.value?.data.student_name ?? null);

const actionPending = ref(false);
const message = ref("");
const messageClass = computed(() =>
  message.value.includes("خطا") ? "text-rose-600" : "text-emerald-600"
);

const onAccept = async () => {
  if (!allocation.value?.id) return;
  actionPending.value = true;
  message.value = "";
  try {
    await $fetch(`/api/professor/allocations/${allocation.value.id}/accept`, {
      method: "POST",
    });
    message.value = "پذیرفته شد.";
    await refresh();
  } catch (e: any) {
    message.value = `خطا در پذیرش: ${e?.statusMessage || ""}`;
  } finally {
    actionPending.value = false;
  }
};

const onDecline = async () => {
  if (!allocation.value?.id) return;
  actionPending.value = true;
  message.value = "";
  try {
    await $fetch(`/api/professor/allocations/${allocation.value.id}/decline`, {
      method: "POST",
    });
    message.value = "رد شد.";
    await refresh();
  } catch (e: any) {
    message.value = `خطا در رد: ${e?.statusMessage || ""}`;
  } finally {
    actionPending.value = false;
  }
};

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
function statusText(s: string) {
  switch (s) {
    case "invited":
      return "در انتظار پاسخ";
    case "accepted":
      return "پذیرفته شد";
    case "declined":
      return "رد شد";
    case "expired":
      return "منقضی";
    default:
      return s;
  }
}
function chip(s: string) {
  if (s === "accepted") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "declined") return "bg-rose-50 text-rose-700 border border-rose-200";
  if (s === "expired") return "bg-slate-50 text-slate-600 border border-slate-200";
  return "bg-indigo-50 text-indigo-700 border border-indigo-200";
}
function dot(s: string) {
  if (s === "accepted") return "bg-emerald-600";
  if (s === "declined") return "bg-rose-600";
  if (s === "expired") return "bg-slate-500";
  return "bg-indigo-600";
}
</script>
