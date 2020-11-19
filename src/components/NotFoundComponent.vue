<template>
  <div style="padding: 20px">
    404エラー
  </div>
</template>

<script>
  import globals from '@/static2/mixins/globals'
  import {mapGetters} from 'vuex'

  export default {
    name: 'NotFoundComponent',
    mixins: [globals],
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style scoped></style>
