<template>
  <header class="topbar">
    <div class="brand">问策就医全流程辅助系统</div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  z-index: 1000;
}

.brand {
  color: #2563eb; /* blue tone */
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.2px;
}
</style>