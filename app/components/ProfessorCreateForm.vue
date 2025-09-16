<template>
  <form @submit.prevent="onSubmit" class="space-y-4 rtl" dir="rtl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm text-gray-600 mb-1">نام و نام‌خانوادگی</label>
        <input v-model.trim="form.full_name" type="text" class="w-full border rounded px-3 py-2" placeholder="مثلاً: دکتر علی رضایی" required />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">ایمیل</label>
        <input v-model.trim="form.email" type="email" class="w-full border rounded px-3 py-2 ltr" placeholder="example@university.edu" required />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">شماره/کد استادی</label>
        <input v-model.trim="form.professor_number" type="text" class="w-full border rounded px-3 py-2" placeholder="مثلاً: 123456" required />
      </div>
      <div>
        <label class="block text-sm text-gray-600 mb-1">مدرک تحصیلی</label>
        <input v-model.trim="form.degree" type="text" class="w-full border rounded px-3 py-2" placeholder="مثلاً: دکتری مهندسی برق" required />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm text-gray-600 mb-1">حوزه/رشته علمی (امکان انتخاب چندگانه)</label>
        <select v-model="form.field_of_science" class="w-full border rounded px-3 py-2" multiple size="6" required>
          <option v-for="opt in fieldOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">برای انتخاب چند مورد کلید Ctrl (یا Cmd در مک) را نگه دارید.</p>
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm text-gray-600 mb-1">رمز عبور اولیه</label>
        <input v-model="form.password" type="password" class="w-full border rounded px-3 py-2 ltr" placeholder="رمز عبور قوی انتخاب کنید" required minlength="8" />
        <p class="text-xs text-gray-500 mt-1">حداقل ۸ کاراکتر؛ ترجیحاً شامل حروف بزرگ/کوچک، عدد و نماد.</p>
      </div>
    </div>

    <div class="flex items-center gap-3 pt-2">
      <button type="submit" :disabled="submitting" class="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
        {{ submitting ? "در حال ایجاد..." : "ایجاد و ارسال ایمیل" }}
      </button>
      <button type="button" @click="reset" class="px-3 py-2 rounded border">بازنشانی فرم</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

type CreateProfessorPayload = {
  full_name: string
  email: string
  professor_number: string
  degree: string
  field_of_science: string[]
  password: string
}

const emit = defineEmits<{ (e: 'created', payload: { profileId: string, userId: string }): void }>()

const form = reactive<CreateProfessorPayload>({
  full_name: '',
  email: '',
  professor_number: '',
  degree: '',
  field_of_science: [],
  password: '',
})

const fieldOptions = [
  'مهندسی کامپیوتر',
  'مهندسی برق',
  'مهندسی عمران',
  'ریاضی',
  'فیزیک',
  'شیمی',
  'زیست‌شناسی',
  'علوم پزشکی',
  'مدیریت',
  'اقتصاد',
  'روان‌شناسی',
  'ادبیات',
  'معماری',
  'هنر',
]

const submitting = ref(false)

function reset() {
  form.full_name = ''
  form.email = ''
  form.professor_number = ''
  form.degree = ''
  form.field_of_science = []
  form.password = ''
}

async function onSubmit() {
  if (!form.field_of_science.length) {
    return alert('حداقل یک رشته علمی انتخاب کنید.')
  }
  submitting.value = true
  try {
    const res = await $fetch('/api/admin/professors.create', {
      method: 'POST',
      body: { ...form },
    })
    // @ts-ignore
    const { profileId, userId } = res || {}
    emit('created', { profileId, userId })
    reset()
    alert('حساب استاد با موفقیت ایجاد شد و ایمیل ارسال گردید.')
  } catch (e: any) {
    console.error(e)
    const msg = e?.data?.statusMessage || e?.message || 'ایجاد حساب با مشکل مواجه شد.'
    alert(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.rtl { direction: rtl; }
.ltr { direction: ltr; }
</style>
