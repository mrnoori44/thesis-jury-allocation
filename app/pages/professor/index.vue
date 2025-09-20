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
      <div class="text-slate-600 text-sm">داشبورد استاد</div>
    </header>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile & Password column -->
        <section class="lg:col-span-1 space-y-6">
          <!-- Editable Profile Card (UI only) -->
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 shadow-sm border border-slate-100"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-extrabold text-slate-800">پروفایل استاد</h2>
              <button type="button" class="text-sm text-indigo-600 hover:text-indigo-700">
                ذخیره
              </button>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              (فقط طراحی — بعداً به جدول پروفایل استاد متصل می‌شود)
            </p>

            <form class="mt-4 space-y-4" @submit.prevent>
              <div>
                <label class="block text-sm mb-1 text-slate-700"
                  >نام و نام خانوادگی</label
                >
                <input
                  v-model="profile.fullName"
                  type="text"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="مثلاً: دکتر الهام رحیمی"
                />
              </div>
              <div>
                <label class="block text-sm mb-1 text-slate-700">ایمیل دانشگاهی</label>
                <input
                  v-model="profile.email"
                  type="email"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                  placeholder="example@university.ac.ir"
                />
              </div>
              <div>
                <label class="block text-sm mb-1 text-slate-700">دانشگاه</label>
                <select
                  v-model="profile.university"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                >
                  <option value="">انتخاب دانشگاه</option>
                  <option v-for="u in universities" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm mb-1 text-slate-700">گروه/دانشکده</label>
                <select
                  v-model="profile.department"
                  class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                >
                  <option value="">انتخاب گروه آموزشی</option>
                  <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>

              <!-- Topics chip input -->
              <div>
                <label class="block text-sm mb-1 text-slate-700"
                  >حوزه‌های تخصصی مرتبط</label
                >
                <div class="rounded-2xl border border-slate-300/80 bg-white/90 p-2">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(t, i) in topics"
                      :key="i"
                      class="inline-flex items-center gap-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 text-xs font-semibold"
                    >
                      {{ t }}
                      <button
                        type="button"
                        class="text-indigo-700/70 hover:text-indigo-900"
                        @click="removeTopic(i)"
                        aria-label="حذف"
                      >
                        ✕
                      </button>
                    </span>
                    <input v-model="topicInput" @keydown.enter.prevent="addTopic"
                    @keydown.",".prevent="addTopic" placeholder="مثلاً: هوش مصنوعی"
                    class="flex-1 min-w-[8rem] px-2 py-1 outline-none text-sm
                    bg-transparent" />
                  </div>
                </div>
                <p class="text-xs text-slate-500 mt-1">
                  برای افزودن، Enter بزنید. برای حذف، روی ✕ کلیک کنید.
                </p>
              </div>

              <!-- Optional links -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm mb-1 text-slate-700">Google Scholar</label>
                  <input
                    v-model="profile.scholar"
                    type="url"
                    class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                    placeholder="https://scholar.google.com/citations?..."
                  />
                </div>
                <div>
                  <label class="block text-sm mb-1 text-slate-700">ORCID</label>
                  <input
                    v-model="profile.orcid"
                    type="text"
                    class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
              </div>

              <!-- CV upload (UI only) -->
              <div>
                <label class="block text-sm mb-2 text-slate-700">رزومه (اختیاری)</label>
                <div
                  class="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-center text-slate-500"
                >
                  <p class="text-sm">
                    برای بارگذاری رزومه اینجا کلیک کنید یا فایل را بکشید و رها کنید
                  </p>
                </div>
              </div>
            </form>
          </div>

          <!-- Change Password Card -->
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 shadow-sm border border-slate-100"
          >
            <h3 class="text-base font-extrabold text-slate-800">
              تغییر گذرواژه (پیشنهادی)
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              گذرواژه فعلی توسط ادمین تخصیص یافته است. لطفاً آن را تغییر دهید.
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
                ثبت تغییر گذرواژه
              </button>
            </form>
          </div>
        </section>

        <!-- Availability CTA + Incoming Requests -->
        <section class="lg:col-span-2 space-y-6">
          <!-- Availability CTA -->
          <div
            class="rounded-3xl bg-gradient-to-l from-indigo-600 to-indigo-500 text-white p-6 shadow-sm"
          >
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-extrabold">مدیریت بازه‌های زمانی آزاد</h2>
                <p class="text-white/90 text-sm mt-1">
                  لطفاً زمان‌های آزاد خود را ثبت کنید تا در تخصیص‌ها لحاظ شود.
                </p>
              </div>
              <NuxtLink
                to="/professor/availability"
                class="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white text-indigo-700 font-semibold hover:bg-slate-50 active:scale-[.99] transition shadow"
              >
                رفتن به صفحه زمان‌های آزاد
              </NuxtLink>
            </div>
          </div>

          <!-- Incoming Requests -->
          <div
            class="rounded-3xl bg-white/70 backdrop-blur p-6 shadow-sm border border-slate-100"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-base font-extrabold text-slate-800">درخواست‌های ورودی</h3>
              <div class="flex items-center gap-2">
                <button
                  @click="refreshIncoming()"
                  class="text-sm rounded-xl border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  به‌روزرسانی
                </button>
                <div class="text-xs text-slate-500" v-if="incomingPending">
                  در حال بارگذاری…
                </div>
              </div>
            </div>

            <p v-if="incomingError" class="mt-3 text-rose-600 text-sm">
              خطا در دریافت درخواست‌ها
            </p>
            <p
              v-else-if="!incoming.length && !incomingPending"
              class="mt-3 text-slate-500 text-sm"
            >
              درخواستی موجود نیست.
            </p>

            <!-- Content when we have data -->
            <div v-else>
              <!-- Table (md+) -->

              <div
                class="mt-4 hidden md:block overflow-hidden rounded-2xl border border-slate-100"
              >
                <table class="w-full text-sm rtl text-right">
                  <thead class="bg-slate-50 text-slate-600">
                    <tr>
                      <th class="px-4 py-3 font-medium">عنوان پایان‌نامه</th>
                      <th class="px-4 py-3 font-medium">دانشجو</th>
                      <th class="px-4 py-3 font-medium">حوزه</th>
                      <th class="px-4 py-3 font-medium">تاریخ دعوت</th>
                      <th class="px-4 py-3 font-medium">وضعیت</th>
                      <th class="px-4 py-3 font-medium">عملیات</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 bg-white">
                    <tr v-for="req in incoming" :key="req.allocation_id">
                      <td class="px-4 py-3 align-top">
                        <div class="font-medium text-slate-800">{{ req.title }}</div>
                        <div class="text-xs text-slate-500">
                          محل پیشنهادی: {{ req.proposed_location || "—" }}
                        </div>
                      </td>
                      <td class="px-4 py-3 text-slate-700">
                        {{ req.student_name || "—" }}
                      </td>
                      <td class="px-4 py-3 text-slate-600">{{ req.field }}</td>
                      <td class="px-4 py-3 text-slate-600">
                        {{ toFaDateTime(req.invited_at) }}
                      </td>
                      <td class="px-4 py-3">
                        <span
                          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                          :class="chip(req.status)"
                        >
                          <span
                            class="h-2 w-2 rounded-full"
                            :class="dot(req.status)"
                          ></span>
                          {{ statusText(req.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <button
                            @click="openDetails(req)"
                            class="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            جزئیات
                          </button>
                          <button
                            v-if="req.status === 'invited'"
                            @click="openDecision(req, 'accept')"
                            class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            پذیرش
                          </button>
                          <button
                            v-if="req.status === 'invited'"
                            @click="openDecision(req, 'reject')"
                            class="px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                          >
                            رد
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
                  v-for="req in incoming"
                  :key="req.allocation_id"
                  class="rounded-2xl border border-slate-100 bg-white p-4"
                >
                  <div class="font-semibold text-slate-800">{{ req.title }}</div>
                  <div class="text-xs text-slate-500 mt-1">
                    دانشجو: {{ req.student_name || "—" }} — حوزه: {{ req.field }}
                  </div>
                  <div class="text-xs text-slate-500 mt-1">
                    دعوت: {{ toFaDateTime(req.invited_at) }}
                  </div>
                  <div class="mt-3 flex items-center gap-2">
                    <button
                      @click="openDetails(req)"
                      class="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      جزئیات
                    </button>
                    <button
                      v-if="req.status === 'invited'"
                      @click="openDecision(req, 'accept')"
                      class="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      پذیرش
                    </button>
                    <button
                      v-if="req.status === 'invited'"
                      @click="openDecision(req, 'reject')"
                      class="px-3 py-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                    >
                      رد
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Request Details Modal -->
    <div v-if="detailsOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="detailsOpen = false"></div>
      <div
        class="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 border border-slate-100 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-extrabold text-slate-800">جزئیات درخواست</h4>
          <button
            @click="detailsOpen = false"
            class="text-slate-500 hover:text-slate-700"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div class="rounded-2xl border border-slate-100 p-4">
            <div class="text-slate-500">عنوان</div>
            <div class="font-semibold text-slate-800">{{ selected?.title }}</div>
          </div>
          <div class="rounded-2xl border border-slate-100 p-4">
            <div class="text-slate-500">دانشجو</div>
            <div class="font-semibold text-slate-800">
              {{ selected?.student_name || "—" }}
            </div>
          </div>
          <div class="rounded-2xl border border-slate-100 p-4">
            <div class="text-slate-500">حوزه</div>
            <div class="font-semibold text-slate-800">{{ selected?.field }}</div>
          </div>
          <div class="rounded-2xl border border-slate-100 p-4">
            <div class="text-slate-500">تاریخ دعوت</div>
            <div class="font-semibold text-slate-800">
              {{ toFaDateTime(selected?.invited_at) }}
            </div>
          </div>
        </div>
        <div class="mt-4">
          <div class="text-slate-500 text-sm">چکیده</div>
          <p class="text-slate-700 text-sm leading-7 mt-1">
            {{ selected?.abstract || "—" }}
          </p>
        </div>
        <div class="mt-6 flex items-center justify-end gap-2">
          <NuxtLink
            :to="`/professor/requests/${selected?.thesis_id}`"
            class="px-4 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            رفتن به صفحه درخواست
          </NuxtLink>
          <button
            @click="detailsOpen = false"
            class="px-4 py-2 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            بستن
          </button>
        </div>
      </div>
    </div>

    <!-- Decision Modal -->
    <div v-if="decisionOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="decisionOpen = false"></div>
      <div
        class="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 border border-slate-100 shadow-lg"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-extrabold text-slate-800">
            {{ decisionType === "accept" ? "پذیرش درخواست" : "رد درخواست" }}
          </h4>
          <button
            @click="decisionOpen = false"
            class="text-slate-500 hover:text-slate-700"
            aria-label="بستن"
          >
            ✕
          </button>
        </div>
        <p class="text-sm text-slate-600 mt-2">
          عنوان: <span class="font-medium text-slate-800">{{ selected?.title }}</span>
        </p>

        <div v-if="decisionType === 'reject'" class="mt-4">
          <label class="block text-sm mb-1 text-slate-700">دلیل رد (اختیاری)</label>
          <textarea
            v-model="rejectReason"
            rows="4"
            class="w-full rounded-2xl border-slate-300/80 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3 bg-white/90"
            placeholder="مثلاً: موضوع خارج از حوزه تخصصی من است"
          ></textarea>
        </div>

        <div class="mt-6 flex items-center justify-end gap-2">
          <button
            @click="decisionOpen = false"
            class="px-4 py-2 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            :disabled="actionPending"
            @click="confirmDecision"
            class="px-4 py-2 rounded-2xl"
            :class="
              decisionType === 'accept'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-rose-600 text-white hover:bg-rose-700'
            "
          >
            {{
              actionPending
                ? "در حال ارسال…"
                : decisionType === "accept"
                ? "تایید پذیرش"
                : "تایید رد"
            }}
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
definePageMeta({ middleware: "auth-professor" as any });
useHead({ title: "داشبورد استاد", htmlAttrs: { lang: "fa", dir: "rtl" } });

// --- UI-only profile left as-is ---
const universities = [
  "دانشگاه تهران",
  "دانشگاه صنعتی اصفهان",
  "دانشگاه شیراز",
  "دانشگاه تبریز",
];
const departments = ["مهندسی کامپیوتر", "مهندسی صنایع", "مهندسی برق", "مدیریت فناوری"];
const profile = ref({
  fullName: "دکتر الهام رحیمی",
  email: "e.rahimi@university.ac.ir",
  university: "",
  department: "",
  scholar: "",
  orcid: "",
});
const topics = ref<string[]>(["یادگیری ماشین", "زمان‌بندی", "بهینه‌سازی"]);
const topicInput = ref("");
function addTopic() {
  const v = topicInput.value.trim();
  if (!v) return;
  if (!topics.value.includes(v)) topics.value.push(v);
  topicInput.value = "";
}
function removeTopic(i: number) {
  topics.value.splice(i, 1);
}

// --- Incoming invitations (real) ---
type IncomingItem = {
  allocation_id: string;
  thesis_id: string;
  status: "invited" | "accepted" | "declined" | "expired" | string;
  invited_at: string | null;
  responded_at: string | null;
  title: string;
  field: string;
  abstract: string | null;
  created_at: string | null;
  proposed_date: string | null;
  proposed_location: string | null;
  student_name: string | null;
};
type IncomingResp = { ok: boolean; data: IncomingItem[] };

const {
  data: incomingRes,
  pending: incomingPending,
  error: incomingError,
  refresh: refreshIncoming,
} = await useFetch<IncomingResp>("/api/professor/incoming", { method: "GET" });

const incoming = computed(() => incomingRes.value?.data ?? []);

// --- Decision modal state & actions ---
const detailsOpen = ref(false);
const decisionOpen = ref(false);
const selected = ref<IncomingItem | null>(null);
const decisionType = ref<"accept" | "reject" | "none">("none");
const rejectReason = ref(""); // currently not sent; add to decline API if you add a column
const actionPending = ref(false);

function openDetails(req: IncomingItem) {
  selected.value = req;
  detailsOpen.value = true;
}
function openDecision(req: IncomingItem, type: "accept" | "reject") {
  selected.value = req;
  decisionType.value = type;
  rejectReason.value = "";
  decisionOpen.value = true;
}

async function confirmDecision() {
  if (!selected.value) return;
  actionPending.value = true;
  try {
    if (decisionType.value === "accept") {
      await $fetch(`/api/professor/allocations/${selected.value.allocation_id}/accept`, {
        method: "POST",
      });
    } else {
      await $fetch(`/api/professor/allocations/${selected.value.allocation_id}/decline`, {
        method: "POST",
      });
      // if you add a "note" column later, send body: { reason: rejectReason.value }
    }
    decisionOpen.value = false;
    await refreshIncoming();
  } catch (e: any) {
    // optional: toast; for now just close modal
    decisionOpen.value = false;
  } finally {
    actionPending.value = false;
  }
}

// --- helpers ---
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
    case "invited":
      return "در انتظار پاسخ";
    case "accepted":
      return "پذیرفته شد";
    case "declined":
      return "رد شد";
    case "expired":
      return "منقضی";
    default:
      return s || "";
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

<style scoped></style>
