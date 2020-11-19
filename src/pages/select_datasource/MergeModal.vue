<template>
  <modal :name="modalName" :width="450" :height="'auto'">
    <ValidationObserver v-slot="{ invalid }">
      <form @submit.prevent="onSubmit">
        <div class="modal-container">
          <div class="modal-body">
            <p>{{_L.MERGE_MODAL_MSG}}</p>
            <p class="input-text">
              <ValidationProvider name="mergeName"
                                  :rules="'required|max:'+$store.state.const.VALIDATE.DATASOURCE.MERGE_NAME.MAX_LENGTH+'|min:'+$store.state.const.VALIDATE.DATASOURCE.MERGE_NAME.MIN_LENGTH"
                                  v-slot="{ errors }">
                <input type="text" v-model="mergeName" placeholder="">
                <span class="error-message">{{ errors[0] }}</span>
              </ValidationProvider>
            </p>
          </div>
          <div class="modal-footer">
            <button type="reset" @click="$emit('close'), clear()">{{_L.MERGE_MODAL_CANCEL}}</button>
            <button type="submit" :disabled="invalid">{{_L.OK}}</button>
          </div>
        </div>
      </form>
    </ValidationObserver>
  </modal>
</template>

<script>
  import {mapGetters} from "vuex";
  import {ValidationObserver, ValidationProvider} from "vee-validate";

  export default{
    name: "MergeModal",
    props: ['modalName'],
    components: {ValidationObserver, ValidationProvider},
    data: function () {
      return {
        mergeName: "",
      }
    },
    methods: {
      clear: function () {
        Object.assign(this.$data, this.$options.data.call(this))
      },
      onSubmit() {
        let trimSearchKey = this.mergeName.trim();
        this.$emit('addMerge', trimSearchKey);
        this.clear();
      }
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style scoped>
  .modal-body {
    /*overflow-y: auto;*/
  }

  .error-message {
    display: inline-block;
    font-size: 12px;
    color: #F00;
  }
</style>
