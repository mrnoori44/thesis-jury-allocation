<!-- pages/student.vue -->
<template>
  <div class="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">داشبورد دانشجو</h1>
        <p class="mt-1 text-sm text-slate-600">
          از اینجا می‌توانید وضعیت درخواست‌های تخصیص هیئت داور را پیگیری کنید.
        </p>
      </div>

      <!-- Create Request (approval-gated) -->
      <div class="flex items-center gap-3">
        <NuxtLink
          v-if="studentProfile?.approved"
          to="/student/requests/new"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
        >
          <Icon name="lucide:plus" class="h-5 w-5" />
          ثبت درخواست جدید
        </NuxtLink>
        <span v-else class="text-sm text-slate-500">
          حساب شما هنوز تأیید نشده است؛ پس از تأیید می‌توانید درخواست ثبت کنید.
        </span>
      </div>
    </div>

    <!-- Profile card -->
    <div class="mb-8 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-1">
        <div class="flex items-start gap-3">
          <div class="mt-1 h-10 w-10 rounded-full bg-slate-100"></div>
          <div>
            <p class="font-semibold text-slate-900">
              {{ studentProfile?.full_name ?? "—" }}
            </p>
            <p class="text-sm text-slate-600">نقش: دانشجو</p>
            <p
              class="mt-1 text-sm"
              :class="studentProfile?.approved ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ studentProfile?.approved ? "تأیید شده" : "در انتظار تأیید" }}
            </p>
          </div>
        </div>

        <div
          class="mt-4 grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200"
        >
          <div class="p-3 text-center">
            <p class="text-xs text-slate-500">تعداد درخواست‌ها</p>
            <p class="mt-1 font-semibold text-slate-900">
              {{ studentStats?.total_requests ?? 0 }}
            </p>
          </div>
          <div class="p-3 text-center">
            <p class="text-xs text-slate-500">آخرین وضعیت</p>
            <p class="mt-1 text-xs font-medium text-slate-800">
              {{
                studentStats?.latest_status ? statusText(studentStats.latest_status) : "—"
              }}
            </p>
          </div>
          <div class="p-3 text-center">
            <p class="text-xs text-slate-500">تاریخ آخرین</p>
            <p class="mt-1 text-xs font-medium text-slate-800">
              {{ toFaDateTime(studentStats?.latest_created_at) }}
            </p>
          </div>
        </div>

        <!-- Profile loading/error -->
        <p v-if="profilePending" class="mt-3 text-sm text-slate-500">
          در حال بارگذاری پروفایل…
        </p>
        <p v-else-if="profileError" class="mt-3 text-sm text-rose-600">
          خطا در دریافت پروفایل
        </p>
      </div>

      <!-- Quick tips / actions -->
      <div class="rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
        <h2 class="mb-2 text-base font-semibold text-slate-900">میان‌برها</h2>
        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink
            to="/student/requests/new"
            class="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            :class="studentProfile?.approved ? '' : 'pointer-events-none opacity-50'"
          >
            ثبت درخواست جدید
          </NuxtLink>
          <NuxtLink
            to="/student"
            class="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            تازه‌سازی
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Requests section -->
    <div class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-base font-semibold text-slate-900">لیست درخواست‌ها</h2>
        <div class="flex items-center gap-2">
          <button
            @click="refreshAll"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Icon name="lucide:rotate-ccw" class="h-4 w-4" />
            به‌روزرسانی
          </button>
        </div>
      </div>

      <!-- Loading / error / empty states -->
      <p v-if="requestsPending" class="text-slate-500">در حال بارگذاری درخواست‌ها…</p>
      <p v-else-if="requestsError" class="text-rose-600">خطا در دریافت درخواست‌ها</p>
      <p v-else-if="!requests.length" class="text-slate-500">درخواستی ثبت نشده است.</p>

      <!-- Desktop table -->
      <div v-else class="hidden md:block overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr class="text-right text-xs text-slate-500">
              <th class="px-4 py-2 font-medium">عنوان</th>
              <th class="px-4 py-2 font-medium">حوزه</th>
              <th class="px-4 py-2 font-medium">تاریخ ثبت</th>
              <th class="px-4 py-2 font-medium">تاریخ پیشنهادی دفاع</th>
              <th class="px-4 py-2 font-medium">وضعیت</th>
              <th class="px-4 py-2 font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="req in requests"
              :key="req.id"
              class="rounded-xl bg-white shadow-sm ring-1 ring-slate-100"
            >
              <td class="px-4 py-3 font-medium text-slate-900">{{ req.title }}</td>
              <td class="px-4 py-3 text-slate-700">{{ req.field }}</td>
              <td class="px-4 py-3 text-slate-600">{{ toFaDateTime(req.created_at) }}</td>
              <td class="px-4 py-3 text-slate-600">
                {{ toFaDateTime(req.proposed_date) }}
                <span v-if="req.proposed_location" class="text-xs text-slate-500">
                  | {{ req.proposed_location }}</span
                >
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                  :class="statusChipClass(req.status)"
                >
                  <span class="h-2 w-2 rounded-full" :class="dotClass(req.status)" />
                  {{ statusText(req.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="`/student/requests/${req.id}`"
                    class="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    جزئیات
                  </NuxtLink>
                  <button
                    v-if="req.has_allocation || req.status === 'assigned'"
                    @click="openAllocation(req)"
                    class="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                  >
                    تخصیص داور
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="grid gap-3 md:hidden">
        <div
          v-for="req in requests"
          :key="req.id"
          class="rounded-2xl border border-slate-200 p-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="font-semibold text-slate-900">{{ req.title }}</p>
              <p class="mt-0.5 text-sm text-slate-600">{{ req.field }}</p>
            </div>
            <span
              class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
              :class="statusChipClass(req.status)"
            >
              <span class="h-2 w-2 rounded-full" :class="dotClass(req.status)" />
              {{ statusText(req.status) }}
            </span>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div>
              <p class="text-slate-500">ثبت</p>
              <p class="mt-0.5">{{ toFaDateTime(req.created_at) }}</p>
            </div>
            <div>
              <p class="text-slate-500">پیشنهادی</p>
              <p class="mt-0.5">
                {{ toFaDateTime(req.proposed_date) }}
                <span v-if="req.proposed_location" class="text-xs">
                  | {{ req.proposed_location }}</span
                >
              </p>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-2">
            <NuxtLink
              :to="`/student/requests/${req.id}`"
              class="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              جزئیات
            </NuxtLink>
            <button
              v-if="req.has_allocation || req.status === 'assigned'"
              @click="openAllocation(req)"
              class="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              تخصیص داور
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ["auth-student"] as any });

import type { Database } from "~~/types/database.types";

// ---- Fetch profile (real) ----
type ProfileApi = {
  ok: boolean;
  data: {
    profile: { id: string; role: string; approved: boolean; full_name: string };
    stats: {
      total_requests: number;
      latest_status: string | null;
      latest_created_at: string | null;
    };
  };
};
const {
  data: profileRes,
  pending: profilePending,
  error: profileError,
  refresh: refreshProfile,
} = await useFetch<ProfileApi>("/api/student/profile", { method: "GET" });
const studentProfile = computed(() => profileRes.value?.data?.profile);
const studentStats = computed(() => profileRes.value?.data?.stats);

// ---- Fetch requests (real) ----
type RequestsApi = {
  ok: boolean;
  data: Array<{
    id: string;
    title: string;
    field: string;
    status: "draft" | "matching" | "inviting" | "assigned" | "cancelled" | string;
    created_at: string;
    proposed_date: string | null;
    proposed_location: string | null;
    has_allocation: boolean;
  }>;
};

const {
  data: requestsRes,
  pending: requestsPending,
  error: requestsError,
  refresh: refreshRequests,
} = await useFetch<RequestsApi>("/api/student/requests", { method: "GET" });

const requests = computed(() => requestsRes.value?.data ?? []);

// ---- Helpers ----
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
      return s;
  }
}
function statusChipClass(s: string) {
  if (s === "assigned") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "cancelled") return "bg-rose-50 text-rose-700 border border-rose-200";
  return "bg-slate-50 text-slate-700 border border-slate-200";
}
function dotClass(s: string) {
  if (s === "assigned") return "bg-emerald-600";
  if (s === "cancelled") return "bg-rose-600";
  return "bg-slate-500";
}

// Placeholder action; wire to allocation modal/page later
function openAllocation(req: any) {
  // For MVP, navigate to request details where allocations are shown
  navigateTo(`/student/requests/${req.id}`);
}

// Refresh both sections
function refreshAll() {
  refreshProfile();
  refreshRequests();
}
</script>
