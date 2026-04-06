/**
 * Salin file ini menjadi `config.js` dan isi nilai dari Admin → Pengaturan → Widget chat.
 * File `config.js` di-gitignore agar site key tidak ter-commit.
 *
 * Pastikan origin halaman ini terdaftar di "Allowed origins" widget (mis. http://localhost:5173).
 */
window.__CS_AI_WIDGET_CONFIG__ = {
  apiBaseUrl: 'http://localhost:9100',
  publicId: 'GANTI_PUBLIC_ID',
  siteKey: 'GANTI_PUBLIC_ID.GANTI_SECRET',
}
