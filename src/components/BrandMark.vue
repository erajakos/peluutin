<template>
  <!-- A ball at the centre of a plan that only sort of goes where it was drawn. -->
  <svg
    class="logo-mark"
    viewBox="0 0 160 160"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M20,132 C36,108 34,88 62,86 S 104,64 128,28"
      fill="none"
      stroke="var(--amber)"
      stroke-width="3"
      stroke-linecap="round"
      stroke-dasharray="9 5 7 6 5 8 3 10 2 12"
    />
    <polygon points="128,28 116,30 123,17" fill="var(--amber)" />
    <circle
      cx="80"
      cy="80"
      r="46"
      fill="none"
      stroke="var(--amber)"
      stroke-width="2"
      stroke-dasharray="3 4"
    />
    <circle cx="80" cy="80" r="30" fill="var(--chalk)" />
    <polygon points="80,64 91,72 87,86 73,86 69,72" fill="var(--bg)" />
    <path d="M80,64 L80,52" stroke="var(--bg)" stroke-width="2.4" stroke-linecap="round" />
    <path d="M91,72 L103,66" stroke="var(--bg)" stroke-width="2.4" stroke-linecap="round" />
    <path d="M87,86 L96,98" stroke="var(--bg)" stroke-width="2.4" stroke-linecap="round" />
    <path d="M73,86 L64,98" stroke="var(--bg)" stroke-width="2.4" stroke-linecap="round" />
    <path d="M69,72 L57,66" stroke="var(--bg)" stroke-width="2.4" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.logo-mark {
  width: 150px;
  height: 150px;
  margin-bottom: 22px;
}
</style>
