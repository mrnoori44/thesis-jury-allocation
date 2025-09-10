<template>
  <div class="p-6 min-h-screen bg-slate-50 rtl">
    <div class="max-w-5xl mx-auto">
      <h1 class="text-2xl font-semibold mb-4">پنل ادمین — درخواست‌های ثبت‌نام</h1>

      <section class="bg-white shadow rounded p-4">
        <p class="text-sm text-gray-600 mb-4">
          در این صفحه می‌توانید حساب‌های دانشجویی در انتظار را ببینید و تایید یا رد کنید.
        </p>

        <div v-if="loading" class="py-10 text-center">در حال بارگذاری...</div>

        <div v-else>
          <table v-if="pending.length" class="w-full table-auto text-right">
            <thead>
              <tr class="text-sm text-gray-500 border-b">
                <th class="py-2 px-3">نام کامل</th>
                <th class="py-2 px-3">شماره دانشجویی</th>
                <th class="py-2 px-3">تاریخ ثبت‌نام</th>
                <th class="py-2 px-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pending" :key="p.id" class="hover:bg-gray-50">
                <td class="py-3 px-3">{{ p.full_name || "—" }}</td>
                <td class="py-3 px-3">{{ p.student_number || "—" }}</td>
                <td class="py-3 px-3">{{ formatDate(p.created_at) }}</td>
                <td class="py-3 px-3">
                  <div class="flex gap-2 justify-end">
                    <button
                      @click="approve(p.id)"
                      class="px-3 py-1 rounded bg-green-600 text-white text-sm"
                    >
                      تایید
                    </button>
                    <button
                      @click="reject(p.id)"
                      class="px-3 py-1 rounded bg-red-500 text-white text-sm"
                    >
                      رد
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="py-8 text-center text-gray-600">
            درخواست معوقه‌ای وجود ندارد.
          </div>
        </div>
      </section>

      <!-- quick stats / actions -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-white shadow rounded p-4">
          <div class="text-sm text-gray-500">کل کاربران</div>
          <div class="text-2xl font-bold mt-2">{{ stats.totalUsers ?? "—" }}</div>
        </div>
        <div class="bg-white shadow rounded p-4">
          <div class="text-sm text-gray-500">دانشجویان معوق</div>
          <div class="text-2xl font-bold mt-2">{{ stats.pendingStudents ?? "—" }}</div>
        </div>
        <div class="bg-white shadow rounded p-4">
          <div class="text-sm text-gray-500">اساتید</div>
          <div class="text-2xl font-bold mt-2">{{ stats.professors ?? "—" }}</div>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const pending = ref<Array<any>>([]);
const loading = ref(true);
const stats = ref<any>({});
const router = useRouter();

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("fa-IR");
}

async function fetchPending() {
  loading.value = true;
  try {
    const res = await $fetch<{ pending?: any[]; stats?: any }>("/api/admin/pending");
    pending.value = res.pending ?? [];
    stats.value = res.stats ?? {};
  } catch (e) {
    console.error("failed to load pending", e);
    // optional: show toast
  } finally {
    loading.value = false;
  }
}

async function approve(id: string) {
  if (!confirm("آیا مطمئن هستید که می‌خواهید این حساب را تایید کنید؟")) return;
  try {
    await $fetch("/api/admin/approve", { method: "POST", body: { id } });
    await fetchPending();
    alert("حساب تایید شد و ایمیل اطلاع‌رسانی ارسال شد.");
  } catch (e) {
    console.error(e);
    alert("خطا در تایید حساب");
  }
}

async function reject(id: string) {
  const reason = prompt("علت رد را وارد کنید (اختیاری):");
  try {
    await $fetch("/api/admin/reject", { method: "POST", body: { id, reason } });
    await fetchPending();
    alert("حساب رد شد.");
  } catch (e) {
    console.error(e);
    alert("خطا در رد حساب");
  }
}

onMounted(() => {
  fetchPending();
});
</script>
<style scoped>
.rtl {
  direction: rtl;
}
</style>
