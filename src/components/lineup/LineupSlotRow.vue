<script setup>
import { computed } from 'vue'
import UiSelectField from '@/components/ui/UiSelectField.vue'
import { availablePlayersForSlot } from '@/domain/lineup.js'
import { useI18n } from '@/i18n/index.js'

const props = defineProps({
  lineupSlot: { type: Object, required: true },
  slots: { type: Array, required: true },
  roster: { type: Array, required: true },
})
const emit = defineEmits(['assign'])
const { t } = useI18n()

/** Only players not already placed elsewhere — plus whoever holds this slot. */
const options = computed(() =>
  availablePlayersForSlot(props.roster, props.slots, props.lineupSlot).map((player) => ({
    value: player.id,
    label: player.name,
  })),
)
</script>

<template>
  <div class="slot-row">
    <span class="slot-label" :class="{ 'slot-label--gk': lineupSlot.isGoalkeeper }">{{
      lineupSlot.label
    }}</span>
    <UiSelectField
      :model-value="lineupSlot.playerId"
      :options="options"
      :placeholder="t('choosePlayerOption')"
      @update:model-value="emit('assign', $event ? Number($event) : null)"
    />
  </div>
</template>

<style scoped>
.slot-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
}

.slot-row:last-child {
  border-bottom: none;
}

.slot-label {
  width: 100px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--chalk-dim);
}

.slot-label--gk {
  color: var(--amber);
}
</style>
