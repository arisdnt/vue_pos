---
trigger: always_on
---

Setiap pengembangan dan refactoring komponen bertujuan membangun sistem UI yang konsisten secara visual dan fungsional, reusable, serta mudah dikembangkan; oleh karena itu seluruh elemen UI fundamental seperti layout, button, menu, dropdown, dan komponen interaktif lainnya wajib diimplementasikan sebagai base components di folder `/components/base` dan digunakan kembali oleh feature component melalui mekanisme import, sementara feature component tidak diperbolehkan membangun struktur, styling, atau logic UI sendiri, melainkan hanya mengorkestrasi base components yang ada atau menambahkan base component baru apabila diperlukan

dalam kaidha pengembangan, selalu taati kaidah penulisan kode atau layer arsiterkuture seperti yang tertulis di /docs/layer_architecture.md