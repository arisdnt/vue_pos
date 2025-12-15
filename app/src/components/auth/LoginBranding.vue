<template>
  <div class="login-branding">
    <div class="brand-icon">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="white">
        <rect x="5" y="5" width="70" height="70" rx="4" stroke="white" stroke-width="2" fill="none"/>
        <rect x="15" y="25" width="50" height="8" fill="white"/>
        <rect x="15" y="40" width="35" height="6" fill="white" opacity="0.7"/>
        <rect x="15" y="52" width="50" height="6" fill="white" opacity="0.5"/>
        <circle cx="60" cy="60" r="12" fill="white"/>
        <text x="60" y="65" text-anchor="middle" fill="#0078d4" font-size="14" font-weight="bold">Rp</text>
      </svg>
    </div>
    <h1 class="brand-title">VuePOS Indonesia</h1>
    <p class="brand-tagline">Sistem Point of Sale Modern untuk Bisnis Anda</p>
    
    <div class="brand-features">
      <div class="feature-item">
        <span class="feature-icon">✓</span>
        <span>Multi-Store & Multi-User</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">✓</span>
        <span>Offline-First Architecture</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">✓</span>
        <span>Laporan Real-time</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">✓</span>
        <span>Support PPN 11%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-branding {
  color: white;
  text-align: center;
  max-width: 400px;
}

.brand-icon {
  margin-bottom: 24px;
}

.brand-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.brand-tagline {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 32px 0;
}

.brand-features {
  text-align: left;
  margin-top: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
}

.feature-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
</style>
