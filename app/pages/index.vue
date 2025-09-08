<template>
    <div class="min-h-screen bg-gray-50 text-gray-900" dir="rtl">
        <header class="bg-white shadow-sm">
            <div class="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-semibold">تخصیص داوران پایان‌نامه</h1>
                    <p class="text-sm text-gray-500">صفحهٔ آغازین با Nuxt + Tailwind — متون به فارسی ترجمه شده‌اند</p>
                </div>

                <button
                    @click="openNew = !openNew"
                    class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm text-sm"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    تخصیص جدید
                </button>
            </div>
        </header>

        <main class="max-w-4xl mx-auto px-6 py-8">
            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
                <input
                    v-model="query"
                    type="search"
                    placeholder="جستجوی دانشجویان، استاد راهنما یا توضیحات..."
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />

                <div class="flex gap-2">
                    <button @click="reset" class="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50">
                        بازنشانی
                    </button>
                    <button @click="shuffle" class="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-sm hover:bg-indigo-100">
                        ترتیب تصادفی
                    </button>
                </div>
            </div>

            <section v-if="openNew" class="mb-6 bg-white p-4 rounded-md shadow-sm">
                <form @submit.prevent="addItem" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input v-model="newItem.title" required placeholder="نام دانشجو"
                                 class="col-span-1 md:col-span-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" />
                    <input v-model="newItem.supervisor" placeholder="استاد راهنما"
                                 class="col-span-1 md:col-span-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-200" />
                    <div class="flex gap-2 items-center">
                        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md">افزودن</button>
                        <button type="button" @click="openNew = false" class="px-4 py-2 bg-gray-100 rounded-md">انصراف</button>
                    </div>
                </form>
            </section>

            <section>
                <h2 class="text-lg font-medium mb-4">تخصیص‌ها ({{ filtered.length }})</h2>

                <div class="grid gap-4 md:grid-cols-2">
                    <article
                        v-for="item in filtered"
                        :key="item.id"
                        class="bg-white p-4 rounded-md shadow-sm border border-gray-100"
                    >
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-semibold text-sm">{{ item.title }}</h3>
                                <p class="text-xs text-gray-500">{{ item.supervisor || 'تخصیص‌نشده' }}</p>
                            </div>

                            <div class="flex items-center gap-2">
                                <button @click="edit(item)" class="text-indigo-600 hover:underline text-sm">ویرایش</button>
                                <button @click="remove(item.id)" class="text-red-600 hover:underline text-sm">حذف</button>
                            </div>
                        </div>

                        <p class="mt-3 text-sm text-gray-600">{{ item.note }}</p>
                    </article>

                    <div v-if="filtered.length === 0" class="col-span-full text-center text-gray-500 py-8">
                        هیچ تخصیصی یافت نشد. برای شروع یک تخصیص جدید اضافه کنید.
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const openNew = ref(false)
const query = ref('')
const items = ref([
    { id: 1, title: 'آلیس جانسون', supervisor: 'دکتر اسمیت', note: 'پایان‌نامهٔ یادگیری ماشین' },
    { id: 2, title: 'باب لی', supervisor: 'پروفسور کومار', note: 'سیستم‌های توزیع‌شده' },
    { id: 3, title: 'کارول نگوین', supervisor: '', note: 'در انتظار تخصیص' }
])

const newItem = ref({ title: '', supervisor: '', note: '' })

const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter(i =>
        (i.title || '').toLowerCase().includes(q) ||
        (i.supervisor || '').toLowerCase().includes(q) ||
        (i.note || '').toLowerCase().includes(q)
    )
})

function addItem() {
    const id = items.value.length ? Math.max(...items.value.map(i => i.id)) + 1 : 1
    items.value.unshift({ id, title: newItem.value.title, supervisor: newItem.value.supervisor, note: newItem.value.note })
    newItem.value = { title: '', supervisor: '', note: '' }
    openNew.value = false
}

function remove(id) {
    items.value = items.value.filter(i => i.id !== id)
}

function edit(item) {
    newItem.value = { title: item.title, supervisor: item.supervisor, note: item.note }
    openNew.value = true
    remove(item.id)
}

function reset() {
    query.value = ''
}

function shuffle() {
    for (let i = items.value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[items.value[i], items.value[j]] = [items.value[j], items.value[i]]
    }
}
</script>

<style scoped>
/* Small helper: keep maximum width consistent across pages */
</style>
    