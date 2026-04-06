# CS-AI Widget — Dokumentasi Implementasi

Widget chat CS-AI adalah embed JavaScript yang berjalan dalam **Shadow DOM** sehingga tidak bentrok dengan style situs Anda.

---

## Daftar Isi

1. [Persiapan](#1-persiapan)
2. [Cara Cepat (HTML / PHP / WordPress)](#2-cara-cepat-html--php--wordpress)
3. [Next.js / React (SPA)](#3-nextjs--react-spa)
4. [Konfigurasi Init](#4-konfigurasi-init)
5. [Branding & Tampilan](#5-branding--tampilan)
6. [Allowed Origins](#6-allowed-origins)
7. [Menjalankan Demo Lokal](#7-menjalankan-demo-lokal)
8. [Keamanan Site Key](#8-keamanan-site-key)

---

## 1. Persiapan

### 1.1 Build widget bundle

Di folder `cs-ai-api` (atau root monorepo):

```bash
npm run build:widget
```

Perintah ini mengkompilasi `cs-ai-widget/src/main.ts` → `cs-ai-api/public-widget/widget.js` dan otomatis disajikan oleh API di:

```
{apiBaseUrl}/widget-static/widget.js
```

### 1.2 Buat widget di Admin

1. Login ke Admin → **Pengaturan → Widget chat**
2. Klik **Buat Widget Baru**, isi nama dan allowed origins
3. Salin **`publicId`** dan **`siteKey`** — site key hanya ditampilkan sekali saat buat/rotasi key

---

## 2. Cara Cepat (HTML / PHP / WordPress)

Tambahkan dua blok berikut sebelum `</body>`:

```html
<!-- 1. Muat bundle widget -->
<script src="https://api.yourdomain.com/widget-static/widget.js" defer></script>

<!-- 2. Inisialisasi -->
<script>
  window.addEventListener('DOMContentLoaded', function () {
    if (window.CsAiWidget) {
      window.CsAiWidget.init({
        apiBaseUrl: 'https://api.yourdomain.com',
        publicId:   'YOUR_PUBLIC_ID',
        siteKey:    'YOUR_PUBLIC_ID.YOUR_SECRET',
      });
    }
  });
</script>
```

> **WordPress**: tambahkan via plugin **Insert Headers and Footers** atau langsung di `functions.php` menggunakan `wp_enqueue_script`.

---

## 3. Next.js / React (SPA)

Gunakan `useEffect` — jangan panggil `init` di sisi server (SSR).

```tsx
// components/CsAiWidget.tsx
'use client'

import { useEffect } from 'react'

export default function CsAiWidget() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `${process.env.NEXT_PUBLIC_CS_API_URL}/widget-static/widget.js`
    script.defer = true
    script.onload = () => {
      if ((window as any).CsAiWidget) {
        (window as any).CsAiWidget.init({
          apiBaseUrl: process.env.NEXT_PUBLIC_CS_API_URL!,
          publicId:   process.env.NEXT_PUBLIC_CS_PUBLIC_ID!,
          siteKey:    process.env.NEXT_PUBLIC_CS_SITE_KEY!,
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return null
}
```

Tambahkan di `app/layout.tsx`:

```tsx
import CsAiWidget from '@/components/CsAiWidget'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <CsAiWidget />
      </body>
    </html>
  )
}
```

File `.env.local`:

```env
NEXT_PUBLIC_CS_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_CS_PUBLIC_ID=your_public_id
NEXT_PUBLIC_CS_SITE_KEY=your_public_id.your_secret
```

---

## 4. Konfigurasi Init

```ts
CsAiWidget.init(options)
```

| Parameter    | Tipe          | Wajib | Keterangan                                                                 |
|--------------|---------------|-------|----------------------------------------------------------------------------|
| `apiBaseUrl` | `string`      | ✅    | Base URL API CS-AI, tanpa trailing slash. Contoh: `https://api.yourdomain.com` |
| `publicId`   | `string`      | ✅    | ID publik widget, didapat dari halaman pengaturan widget di Admin           |
| `siteKey`    | `string`      | ✅    | Format: `publicId.secret` — didapat saat buat/rotasi widget                |
| `container`  | `HTMLElement` | ❌    | Target mount widget. Default: `document.body`                              |
| `locale`     | `'id' \| 'en'`| ❌    | Bahasa awal widget. Default: localStorage → bahasa browser → `id`          |

### Contoh dengan semua opsi

```html
<script>
  window.CsAiWidget.init({
    apiBaseUrl: 'https://api.yourdomain.com',
    publicId:   '9870aa11782b49e15301612a',
    siteKey:    '9870aa11782b49e15301612a.fd8a69872f8268d1af23659c69d155a5071ef5b4c3accd4a',
    locale:     'id',
    container:  document.getElementById('chat-container'), // opsional
  });
</script>
```

---

## 5. Branding & Tampilan

Branding dikonfigurasi di **Admin → Pengaturan → Widget chat → Edit**, bukan di kode embed. Perubahan langsung aktif tanpa rebuild.

| Pengaturan         | Keterangan                                                |
|--------------------|-----------------------------------------------------------|
| **Nama widget**    | Judul yang muncul di header chat                          |
| **Logo**           | Gambar di pojok kiri header (disarankan 1:1, min 80×80px) |
| **Warna utama**    | Warna aksen (tombol, bubble user, indikator aktif)        |
| **Greeting title** | Teks judul header — override nama widget jika diisi        |
| **Greeting subtitle** | Teks kecil di bawah judul                             |
| **Consent text**   | Teks persetujuan sebelum chat dimulai                     |

---

## 6. Allowed Origins

Widget hanya bisa dimuat dari origin yang terdaftar. Tambahkan origin situs Anda di Admin → **Pengaturan → Widget chat → Edit → Allowed Origins**.

| Contoh origin             | Keterangan                  |
|---------------------------|-----------------------------|
| `https://yourdomain.com`  | Produksi                    |
| `https://www.yourdomain.com` | Dengan www               |
| `http://localhost:5173`   | Dev lokal (Vite)            |
| `http://localhost:3000`   | Dev lokal (Next.js)         |

> ⚠️ Origin `file://` tidak didukung — gunakan server lokal (`npm start` / `npx serve`).

---

## 7. Menjalankan Demo Lokal

```bash
# 1. Build widget
cd cs-ai-api && npm run build:widget

# 2. Pastikan API berjalan
npm run start:dev

# 3. Buat config.js dari template
cd ../cs-ai-implementation
cp config.example.js config.js
# Edit config.js: isi apiBaseUrl, publicId, siteKey

# 4. Jalankan server statis
npm start
# Buka http://localhost:5173
```

---

## 8. Keamanan Site Key

- **Jangan commit** `config.js` atau file env yang berisi `siteKey` ke repositori publik
- `config.js` sudah masuk `.gitignore` di folder ini
- Gunakan environment variable untuk produksi
- Jika site key bocor, lakukan **rotasi** di Admin → Pengaturan → Widget chat → **Rotasi key** — key lama langsung tidak valid

---

## Struktur File (folder ini)

| File                | Keterangan                                        |
|---------------------|---------------------------------------------------|
| `index.html`        | Demo embed — memuat widget dari API               |
| `config.example.js` | Template konfigurasi — salin ke `config.js`       |
| `config.js`         | **Gitignored** — berisi `publicId` & `siteKey`    |
| `package.json`      | Menjalankan server statis via `npm start`         |
