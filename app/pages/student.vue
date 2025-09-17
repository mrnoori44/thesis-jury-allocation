<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden"
    dir="rtl"
  >
    <!-- decorative blobs -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-24 -right-24 h-[26rem] w-[26rem] rounded-full bg-indigo-200/30 blur-3xl"
    ></div>
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-24 -left-24 h-[22rem] w-[22rem] rounded-full bg-fuchsia-200/25 blur-3xl"
    ></div>

    <!-- Header -->
    <header class="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
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
      <div class="text-slate-600 text-sm">داشبورد دانشجو</div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile & Password -->
        <section class="lg:col-span-1 space-y-6">
          <!-- Profile Card -->
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 shadow-sm border border-slate-100"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-extrabold text-slate-800">پروفایل</h2>
              <button type="button" class="text-sm text-indigo-600 hover:text-indigo-700">
                ویرایش
              </button>
            </div>
            <div class="mt-4 space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">نام و نام خانوادگی</span>
                <span class="font-medium text-slate-800">{{ profile.fullName }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">شماره دانشجویی</span>
                <span class="font-medium text-slate-800">{{
                  profile.studentNumber
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">ایمیل</span>
                <span class="font-medium text-slate-800">{{ profile.email }}</span>
              </div>
            </div>
          </div>

          <!-- Change Password Card (UI only) -->
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 shadow-sm border border-slate-100"
          >
            <h3 class="text-base font-extrabold text-slate-800">تغییر گذرواژه</h3>
            <p class="text-xs text-slate-500 mt-1">
              (فقط طراحی — منطق بعداً اضافه می‌شود)
            </p>
            <form class="mt-4 space-y-4" @submit.prevent>
              <div>
                <label class="block text-sm mb-1 text-slate-700">گذرواژه فعلی</label>
                <input
                  type="password"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label class="block text-sm mb-1 text-slate-700">گذرواژه جدید</label>
                <input
                  type="password"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="حداقل ۸ کاراکتر"
                />
              </div>
              <div>
                <label class="block text-sm mb-1 text-slate-700"
                  >تکرار گذرواژه جدید</label
                >
                <input
                  type="password"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="تکرار گذرواژه"
                />
              </div>
              <button
                type="button"
                class="w-full rounded-2xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 active:scale-[.99] transition shadow"
              >
                ثبت تغییر
              </button>
            </form>
          </div>
        </section>

        <!-- CTA + Requests -->
        <section class="lg:col-span-2 space-y-6">
          <!-- New Request CTA -->
          <div
            class="rounded-3xl bg-gradient-to-l from-indigo-600 to-indigo-500 text-white p-6 shadow-sm"
          >
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-extrabold">درخواست پایان‌نامه جدید</h2>
                <p class="text-white/90 text-sm mt-1">
                  برای تخصیص داوران، اطلاعات پایان‌نامه خود را ثبت کنید.
                </p>
              </div>
              <NuxtLink
                to="/student/requests/new"
                class="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white text-indigo-700 font-semibold hover:bg-slate-50 active:scale-[.99] transition shadow"
              >
                ایجاد درخواست جدید
              </NuxtLink>
            </div>
          </div>

          <!-- Requests List -->
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 shadow-sm border border-slate-100"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-base font-extrabold text-slate-800">درخواست‌های من</h3>
              <div class="text-xs text-slate-500">
                (فقط نمایش نمونه — بدون اتصال سرور)
              </div>
            </div>

            <!-- Table (md+) -->
            <div
              class="mt-4 hidden md:block overflow-hidden rounded-2xl border border-slate-100"
            >
              <table class="w-full text-sm rtl text-right">
                <thead class="bg-slate-50 text-slate-600">
                  <tr>
                    <th class="px-4 py-3 font-medium">عنوان</th>
                    <th class="px-4 py-3 font-medium">تاریخ ثبت</th>
                    <th class="px-4 py-3 font-medium">وضعیت</th>
                    <th class="px-4 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="req in requests" :key="req.id">
                    <td class="px-4 py-3 align-top">
                      <div class="font-medium text-slate-800">{{ req.title }}</div>
                      <div class="text-xs text-slate-500">رشته: {{ req.field }}</div>
                    </td>
                    <td class="px-4 py-3 text-slate-600">{{ req.createdAt }}</td>
                    <td class="px-4 py-3">
                      <span
                        :class="statusChipClass(req.status)"
                        class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                      >
                        <span
                          class="h-1.5 w-1.5 rounded-full"
                          :class="dotClass(req.status)"
                        ></span>
                        {{ statusText(req.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <NuxtLink
                          :to="`/student/requests/${req.id}`"
                          class="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >جزئیات</NuxtLink
                        >
                        <button
                          v-if="req.hasAllocation"
                          @click="openAllocation(req)"
                          class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          تخصیص داور
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cards (mobile) -->
            <div class="mt-4 md:hidden space-y-3">
              <div
                v-for="req in requests"
                :key="req.id"
                class="rounded-2xl border border-slate-100 bg-white p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="font-semibold text-slate-800">{{ req.title }}</div>
                    <div class="text-xs text-slate-500 mt-1">رشته: {{ req.field }}</div>
                  </div>
                  <span
                    :class="statusChipClass(req.status)"
                    class="shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full"
                      :class="dotClass(req.status)"
                    ></span>
                    {{ statusText(req.status) }}
                  </span>
                </div>
                <div class="mt-3 text-xs text-slate-600">ثبت: {{ req.createdAt }}</div>
                <div class="mt-3 flex items-center gap-2">
                  <NuxtLink
                    :to="`/student/requests/${req.id}`"
                    class="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >جزئیات</NuxtLink
                  >
                  <button
                    v-if="req.hasAllocation"
                    @click="openAllocation(req)"
                    class="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    تخصیص داور
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Allocation Modal -->
    <div
      v-if="allocationOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="allocationOpen = false"></div>
      <div
        class="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 border border-slate-100 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-extrabold text-slate-800">جزئیات تخصیص داور</h4>
          <button
            @click="allocationOpen = false"
            class="text-slate-500 hover:text-slate-700"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>
        <p class="text-sm text-slate-600 mt-1">
          عنوان:
          <span class="font-medium text-slate-800">{{ selectedRequest?.title }}</span>
        </p>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="(m, i) in selectedRequest?.jury || []"
            :key="i"
            class="rounded-2xl border border-slate-100 p-4"
          >
            <div class="text-sm text-slate-500">نام داور</div>
            <div class="font-semibold text-slate-800">{{ m.name }}</div>
            <div class="mt-2 text-sm text-slate-600">نقش: {{ m.role }}</div>
            <div class="text-sm text-slate-600">ایمیل: {{ m.email }}</div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-2xl border border-slate-100 p-4">
            <div class="text-sm text-slate-500">زمان جلسه</div>
            <div class="font-semibold text-slate-800">
              {{ selectedRequest?.defense?.datetime }}
            </div>
          </div>
          <div class="rounded-2xl border border-slate-100 p-4">
            <div class="text-sm text-slate-500">محل/لینک</div>
            <div class="font-semibold text-slate-800 truncate">
              {{ selectedRequest?.defense?.place }}
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <NuxtLink
            :to="`/student/requests/${selectedRequest?.id}`"
            class="px-4 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >رفتن به صفحه درخواست</NuxtLink
          >
          <button
            @click="allocationOpen = false"
            class="px-4 py-2 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            بستن
          </button>
        </div>
      </div>
    </div>

    <footer class="text-center text-xs text-slate-500 pb-8 px-4">
      <p>© {{ new Date().getFullYear() }} سامانه تخصیص داور — همه حقوق محفوظ است.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
// UI-only Student Dashboard. No server logic; sample data is local.
import { ref, computed } from "vue";
useHead({ title: "داشبورد دانشجو", htmlAttrs: { lang: "fa", dir: "rtl" } });

// Mock profile (replace with real session/profile later)
const profile = ref({
  fullName: "یگانه محمدی",
  studentNumber: "۹۹۱۲۳۴۵۶",
  email: "y.mohammadi@university.ac.ir",
});

// Sample requests list for UI
const requests = ref([
  {
    id: "req_01",
    title: "تحلیل شبکه‌های عصبی در تشخیص گفتار فارسی",
    field: "مهندسی کامپیوتر - هوش مصنوعی",
    createdAt: "۱۴۰۴/۰۶/۲۶",
    status: "review",
    hasAllocation: false,
  },
  {
    id: "req_02",
    title: "بهینه‌سازی زمان‌بندی جلسات دفاع با الگوریتم ژنتیک",
    field: "مهندسی صنایع",
    createdAt: "۱۴۰۴/۰۶/۲۰",
    status: "allocated",
    hasAllocation: true,
    jury: [
      { name: "دکتر نادری", role: "داور داخلی", email: "naderi@uni.ac.ir" },
      { name: "دکتر راستی", role: "داور خارجی", email: "rasti@uni.ac.ir" },
    ],
    defense: {
      datetime: "۱۴۰۴/۰۷/۰۵ — ساعت ۱۰:۳۰",
      place: "سالن دفاع ۲، دانشکده صنایع / Zoom: uni.zoom/xyz",
    },
  },
  {
    id: "req_03",
    title: "بازیابی پیشرفته تصاویر پزشکی با یادگیری عمیق",
    field: "مهندسی برق - پردازش تصویر",
    createdAt: "۱۴۰۴/۰۵/۱۲",
    status: "needs_fix",
    hasAllocation: false,
  },
]);

// Status helpers
function statusText(s: string) {
  return s === "review"
    ? "در حال بررسی"
    : s === "allocated"
    ? "تخصیص داده شد"
    : s === "needs_fix"
    ? "نیاز به اصلاح"
    : s;
}
function statusChipClass(s: string) {
  if (s === "allocated")
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (s === "needs_fix") return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-50 text-slate-700 border border-slate-200";
}
function dotClass(s: string) {
  if (s === "allocated") return "bg-emerald-600";
  if (s === "needs_fix") return "bg-amber-600";
  return "bg-slate-500";
}

// Allocation modal state
const allocationOpen = ref(false);
const selectedRequest = ref<any>(null);
function openAllocation(req: any) {
  selectedRequest.value = req;
  allocationOpen.value = true;
}
</script>

<style scoped>
/* light fade for allocations */
</style>
