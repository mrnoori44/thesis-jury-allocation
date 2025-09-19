<template>
  <div class="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-slate-900">ثبت درخواست جدید</h1>
      <NuxtLink to="/student" class="text-sm text-indigo-600 hover:text-indigo-700"
        >بازگشت به داشبورد</NuxtLink
      >
    </div>

    <form
      class="rounded-2xl border border-slate-200 bg-white p-5 space-y-5"
      @submit.prevent="onSubmit"
    >
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >عنوان پایان‌نامه</label
        >
        <input
          v-model.trim="form.title"
          type="text"
          class="w-full rounded-xl border border-slate-300 px-3 py-2"
          placeholder="مثلاً: طراحی سامانه تخصیص هیئت داور"
        />
        <p v-if="errors.title" class="mt-1 text-xs text-rose-600">{{ errors.title }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">حوزه موضوعی</label>
        <select
          v-model="form.field"
          class="w-full rounded-xl border border-slate-300 px-3 py-2"
        >
          <option disabled value="">انتخاب کنید…</option>
          <option v-for="f in fields" :key="f" :value="f">{{ f }}</option>
        </select>
        <p v-if="errors.field" class="mt-1 text-xs text-rose-600">{{ errors.field }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1"
          >چکیده (اختیاری)</label
        >
        <textarea
          v-model.trim="form.abstract"
          rows="4"
          class="w-full rounded-xl border border-slate-300 px-3 py-2"
          placeholder="چکیده کوتاهی از موضوع پایان‌نامه بنویسید…"
        ></textarea>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >تاریخ پیشنهادی دفاع (اختیاری)</label
          >
          <input
            v-model="form.proposed_date"
            type="date"
            class="w-full rounded-xl border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >محل پیشنهادی (اختیاری)</label
          >
          <input
            v-model.trim="form.proposed_location"
            type="text"
            class="w-full rounded-xl border border-slate-300 px-3 py-2"
            placeholder="اتاق دفاع ۳۰۱"
          />
        </div>
      </div>

      <div class="flex items-center gap-3 pt-2">
        <button
          type="submit"
          :disabled="pending"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ pending ? "در حال ثبت…" : "ثبت درخواست" }}
        </button>
        <p v-if="errorMsg" class="text-rose-600 text-sm">{{ errorMsg }}</p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth-student" as any });

type CreateReqPayload = {
  title: string;
  field: string;
  abstract?: string;
  proposed_date?: string | null;
  proposed_location?: string | null;
};

const fields = [
  "هوش مصنوعی",
  "شبکه‌های کامپیوتری",
  "پایگاه‌داده‌ها",
  "امنیت اطلاعات",
  "مهندسی نرم‌افزار",
  "تعامل انسان و کامپیوتر",
  "انرژی‌های تجدیدپذیر",
  "الکترونیک قدرت",
  "مخابرات",
  "کنترل",
  "مکانیک سیالات",
  "انتقال حرارت",
  "طراحی صنعتی",
  "سازه",
  "ژئوتکنیک",
  "حمل‌ونقل",
  "بیوشیمی",
  "فرآیندهای شیمیایی",
  "مدیریت فناوری",
  "کارآفرینی",
  "بازاریابی",
  "مالی",
  "حقوق خصوصی",
  "حقوق بین‌الملل",
  "پزشکی عمومی",
];

const form = reactive<CreateReqPayload>({
  title: "",
  field: "",
  abstract: "",
  proposed_date: "",
  proposed_location: "",
});

const errors = reactive<{ [k in keyof CreateReqPayload]?: string }>({});
const errorMsg = ref<string>("");

function validate() {
  errors.title = form.title ? "" : "عنوان الزامی است.";
  errors.field = form.field ? "" : "حوزه الزامی است.";
  return !errors.title && !errors.field;
}

const pending = ref(false);

async function onSubmit() {
  errorMsg.value = "";
  if (!validate()) return;
  pending.value = true;
  try {
    const res = await $fetch<{ ok: boolean; data: { id: string } }>(
      "/api/student/requests",
      { method: "POST", body: form }
    );
    if (res?.ok && res.data?.id) {
      await navigateTo(`/student/requests/${res.data.id}`);
    } else {
      errorMsg.value = "ثبت ناموفق بود.";
    }
  } catch (e: any) {
    errorMsg.value = e?.statusMessage || "خطا در ثبت درخواست";
  } finally {
    pending.value = false;
  }
}
</script>
