<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden"
  >
    <!-- Decorative, ultra‑light blobs -->
    <div
      aria-hidden="true"
      class="pointer-events-none select-none absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl"
    ></div>
    <div
      aria-hidden="true"
      class="pointer-events-none select-none absolute -bottom-32 -left-24 h-[26rem] w-[26rem] rounded-full bg-fuchsia-200/30 blur-3xl"
    ></div>

    <!-- Header -->
    <header class="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div
          class="h-10 w-10 rounded-xl bg-indigo-600 text-white font-bold grid place-items-center shadow-sm"
        >
          دا
        </div>
        <span class="text-slate-700 font-semibold hidden sm:block"
          >سامانه تخصیص داور</span
        >
      </div>
      <nav class="flex items-center gap-2 sm:gap-3">
        <NuxtLink
          to="/login"
          aria-label="ورود"
          class="px-4 py-2 rounded-xl border border-slate-300/80 text-slate-700 hover:bg-white/80 hover:shadow-sm active:scale-[.98] transition"
        >
          ورود
        </NuxtLink>
        <NuxtLink
          to="/signup"
          aria-label="ثبت‌نام"
          class="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-[.98] transition"
        >
          ثبت‌نام
        </NuxtLink>
      </nav>
    </header>

    <!-- Hero -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-16 sm:pb-28">
      <Transition name="fade" appear>
        <section class="text-center">
          <h1
            class="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-[1.3] text-slate-800"
          >
            سامانه تخصیص داور برای جلسات دفاع پایان نامه
          </h1>
          <p class="mt-5 sm:mt-6 text-slate-600 text-sm sm:text-base max-w-3xl mx-auto">
            پلتفرمی دانشگاهی برای <span class="font-semibold">تطبیق هوشمند</span> تخصص
            داوران با موضوع پایان‌نامه‌ها، زمان‌بندی ساده و شفاف، و کاهش تداخل‌ها.
            طراحی‌شده برای گروه‌های آموزشی، مدیران تحصیلات تکمیلی، اساتید و دانشجویان تا
            فرآیند دفاع با کیفیت، سرعت و عدالت بیشتری انجام شود.
          </p>

          <div class="mt-8 sm:mt-10 flex items-center justify-center gap-3 sm:gap-4">
            <NuxtLink
              to="/signup"
              aria-label="رفتن به صفحه ثبت‌نام"
              class="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm sm:text-base hover:bg-indigo-700 shadow hover:shadow-md transition"
            >
              شروع با ثبت‌نام
            </NuxtLink>
            <NuxtLink
              to="/login"
              aria-label="رفتن به صفحه ورود"
              class="px-6 py-3 rounded-2xl border border-slate-300/80 bg-white/70 backdrop-blur text-slate-700 text-sm sm:text-base hover:bg-white shadow-sm hover:shadow-md transition"
            >
              ورود اعضا
            </NuxtLink>
          </div>

          <!-- Quick value props -->
          <div class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-right">
            <article
              class="rounded-2xl bg-white/70 backdrop-blur p-5 shadow-sm border border-slate-100"
            >
              <h3 class="font-semibold text-slate-800 mb-1.5">تطبیق هوشمند تخصص</h3>
              <p class="text-slate-600 text-sm leading-6">
                الگوریتم امتیازدهی برای هم‌راستاسازی کلیدواژه‌ها، حوزه‌ها و سوابق پژوهشی
                داور با موضوع دفاع.
              </p>
            </article>
            <article
              class="rounded-2xl bg-white/70 backdrop-blur p-5 shadow-sm border border-slate-100"
            >
              <h3 class="font-semibold text-slate-800 mb-1.5">تقویم و هماهنگی سریع</h3>
              <p class="text-slate-600 text-sm leading-6">
                پیشنهاد بازه‌های زمانی بدون تداخل و اعلان‌های به‌موقع برای اعضای کمیته
                دفاع.
              </p>
            </article>
            <article
              class="rounded-2xl bg-white/70 backdrop-blur p-5 shadow-sm border border-slate-100"
            >
              <h3 class="font-semibold text-slate-800 mb-1.5">داشبورد دانشگاهی</h3>
              <p class="text-slate-600 text-sm leading-6">
                نمای کلی آمار جلسات، وضعیت داوری‌ها و شاخص‌های کیفیت فرآیند در سطح گروه و
                دانشکده.
              </p>
            </article>
          </div>
        </section>
      </Transition>
    </main>

    <!-- Footer -->
    <footer class="text-center text-xs text-slate-500 pb-8 px-4">
      <p>© {{ new Date().getFullYear() }} سامانه تخصیص داور — همه حقوق محفوظ است.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: "سامانه تخصیص داور برای جلسات دفاع پایان نامه",
  htmlAttrs: { dir: "rtl", lang: "fa" },
  meta: [
    {
      name: "description",
      content:
        "سامانه دانشگاهی برای تخصیص هوشمند داوران به جلسات دفاع پایان‌نامه با زمان‌بندی ساده، بدون تداخل و داشبورد مدیریتی.",
    },
    { property: "og:title", content: "سامانه تخصیص داور برای جلسات دفاع پایان نامه" },
    {
      property: "og:description",
      content:
        "تطبیق تخصص، هماهنگی سریع، و داشبورد دانشگاهی — تجربه‌ای سبک و سریع برای مدیریت فرآیند دفاع.",
    },
  ],
});
</script>

<style scoped>
/* ultra-light enter animation (no heavy libs) */
.fade-enter-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
