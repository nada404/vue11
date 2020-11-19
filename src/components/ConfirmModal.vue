<template>
  <modal name="confirm_modal" :width="450" :height="'auto'">
    <div class="modal-container">
      <div class="modal-body">
        <p>{{_L.MSG_CLEAR_TABS}}</p>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')">{{_L.CANCEL}}</button>
        <button @click="$emit('ok')">{{_L.OK}}</button>
      </div>
    </div>
  </modal>
</template>

<script>
  import {mapGetters} from "vuex";

  export default {
    name: "ConfirmModal",
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style scoped>
</style>
