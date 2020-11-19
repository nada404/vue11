<template>
  <span class="toggle-icon"><font-awesome-icon v-if="toggleFlg" :icon="['far', 'minus-square']"/><font-awesome-icon
    v-if="!toggleFlg" :icon="['far', 'plus-square']"/></span>
</template>

<script>
  export default {
    name: "ComponentsToggle",
    props: {
      toggleFlg: {
        type: Boolean,
        required: true
      },
    },
  }
</script>

<style scoped>
  .toggle-icon {
    margin-right: .5em;
  }
</style>
