<script setup>
defineProps({
  /** Which drawing goes on the left: 'ball', 'calendar', 'book' or 'info'. */
  icon: { type: String, required: true },
  title: { type: String, required: true },
  note: { type: String, default: '' },
  /** The one thing the coach came here to do. */
  primary: { type: Boolean, default: false },
})
</script>

<template>
  <button type="button" class="tile" :class="{ 'tile--primary': primary }">
    <span class="icon" aria-hidden="true">
      <!-- A ball, drawn the way the crest draws one. -->
      <svg v-if="icon === 'ball'" viewBox="0 0 24 24">
        <g class="line">
          <circle cx="12" cy="12" r="9.2" />
          <polygon points="12,8.4 15.2,10.7 14,14.5 10,14.5 8.8,10.7" />
          <path d="M12 8.4V4.2" />
          <path d="m15.2 10.7 4-1.3" />
          <path d="m14 14.5 2.5 3.4" />
          <path d="m10 14.5-2.5 3.4" />
          <path d="M8.8 10.7l-4-1.3" />
        </g>
      </svg>

      <!-- A calendar: days, which is how the matches are filed. -->
      <svg v-else-if="icon === 'calendar'" viewBox="0 0 24 24">
        <g class="line">
          <rect x="3.2" y="5" width="17.6" height="16" rx="2.6" />
          <path d="M3.2 10h17.6M8 3v4M16 3v4" />
          <path d="M7.5 14h3M13.5 14h3M7.5 17.5h3M13.5 17.5h3" />
        </g>
      </svg>

      <!-- An open book: how the thing works. -->
      <svg v-else-if="icon === 'book'" viewBox="0 0 24 24">
        <g class="line">
          <path
            d="M12 6.4C10.2 5 7.8 4.4 4 4.4v13.2c3.8 0 6.2.6 8 2 1.8-1.4 4.2-2 8-2V4.4c-3.8 0-6.2.6-8 2Z"
          />
          <path d="M12 6.4v13.2" />
        </g>
      </svg>

      <!-- A plain i: about the app itself. -->
      <svg v-else viewBox="0 0 24 24">
        <g class="line">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5.5" />
          <path d="M12 7.6v.9" />
        </g>
      </svg>
    </span>

    <span class="words">
      <span class="title">{{ title }}</span>
      <span v-if="note" class="note">{{ note }}</span>
    </span>

    <span class="chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="m9.5 5.5 7 6.5-7 6.5" /></svg>
    </span>
  </button>
</template>

<style scoped>
.tile {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 15px 16px;
  border-radius: 14px;
  border: 1px solid var(--line-strong);
  background: var(--panel);
  color: var(--chalk);
  text-align: left;
}

.tile:active {
  transform: translateY(1px);
}

/* The match itself: filled, larger, unmistakably the thing to press. */
.tile--primary {
  background: var(--amber);
  border-color: var(--amber);
  color: var(--amber-ink);
  padding: 19px 16px;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.28);
}

.icon {
  display: flex;
  flex-shrink: 0;
}

.icon svg {
  width: 30px;
  height: 30px;
}

.tile--primary .icon svg {
  width: 34px;
  height: 34px;
}

.icon .line {
  fill: none;
  stroke: var(--amber-text);
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* All four are drawn the same way: one weight of line, no fills. */
.tile--primary .icon .line {
  stroke: var(--amber-ink);
}

.words {
  flex: 1;
  min-width: 0;
}

.title {
  display: block;
  font-size: 17px;
  font-weight: 700;
}

.tile--primary .title {
  font-size: 19.5px;
}

.note {
  display: block;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--chalk-dim);
  margin-top: 2px;
}

.chevron {
  flex-shrink: 0;
  color: var(--chalk-dim);
  display: flex;
}

.tile--primary .chevron {
  color: rgba(42, 27, 4, 0.5);
}

.chevron svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
