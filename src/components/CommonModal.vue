<template>
  <modal name="common_modal" :width="450" :height="'auto'">
    <div class="modal-container">
      <div class="modal-body">
        <p v-html="message"/>
      </div>
      <div class="modal-footer">
        <button @click="$emit('close')">{{_L.OK}}</button>
      </div>
    </div>
  </modal>
</template>

<script>
  import {mapGetters} from "vuex";

  export default {
    name: "CommonModal",
    props: ['message'],
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style scoped>
  .modal-body {
    overflow-y: auto;
    line-height: 1.5;
    text-align: center;
  }
</style>
