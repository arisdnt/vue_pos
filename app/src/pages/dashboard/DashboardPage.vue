<template>
  <WinPage>
    <WinPageHeader title="Dashboard">
      <template #actions>
        <div class="today-date">{{ formatTodayFull() }}</div>
        <WinButton variant="default" @click="fetchDashboardData" :loading="loading">Refresh</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <div class="dashboard-layout">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <DashboardStatCard :icon="DollarSign" icon-bg="var(--win-accent)" label="Penjualan Hari Ini" :value="formatCurrency(todayStats.totalSales)" :subtitle="`${todayStats.totalOrders} transaksi`" />
          <DashboardStatCard :icon="ShoppingCart" icon-bg="#2ecc71" label="Transaksi" :value="todayStats.totalOrders" :subtitle="`Rata-rata ${formatCurrency(todayStats.avgOrderValue)}`" />
          <DashboardStatCard :icon="Package" icon-bg="#9b59b6" label="Produk" :value="productCount" />
          <DashboardStatCard :icon="Users" icon-bg="#e67e22" label="Pelanggan" :value="customerCount" />
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <WinCard class="chart-card" no-padding>
            <DashboardSalesChart :data="weeklySales" :max-value="maxWeeklySale" />
          </WinCard>
          <WinCard class="chart-card" no-padding>
            <DashboardTopProducts :data="topProducts" />
          </WinCard>
        </div>

        <!-- Recent Orders -->
        <WinCard class="orders-card" no-padding>
          <DashboardRecentOrders :data="recentOrders" />
        </WinCard>
      </div>

      <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
    </WinPageContent>
  </WinPage>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinButton, WinAlert } from '@/components/base'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import DashboardSalesChart from '@/components/dashboard/DashboardSalesChart.vue'
import DashboardTopProducts from '@/components/dashboard/DashboardTopProducts.vue'
import DashboardRecentOrders from '@/components/dashboard/DashboardRecentOrders.vue'
import { useDashboard } from '@/composables/useDashboard'

const { loading, error, todayStats, weeklySales, topProducts, recentOrders, productCount, customerCount, maxWeeklySale, fetchDashboardData, formatCurrency } = useDashboard()

function formatTodayFull(): string {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

onMounted(() => { fetchDashboardData() })
</script>

<style scoped>
.dashboard-layout { display: flex; flex-direction: column; gap: 16px; }
.today-date { font-size: 13px; color: var(--win-text-secondary); margin-right: 12px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.charts-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px; }
.chart-card { height: 280px; }
.orders-card { max-height: 320px; }

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
