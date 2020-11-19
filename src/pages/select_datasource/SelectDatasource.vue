<template>
  <div class="select-ds">
    <p class="select-ds-ttl">{{_L.MENU_SELECT_DATASOURCE}}</p>
    <br/>
    <!-- キーワード選択 -->
    <div class="area-toggle" v-bind:class='{open:isKeywordActive}' v-on:click='isKeywordActive=!isKeywordActive'>
      <p class="select-ds-ttl">{{_L.KEYWORD_SEARCH}}</p>
    </div>
    <p class="description">{{_L.KEYWORD_SEARCH_DESCRIPTION}}</p>
    <div class="select-ds-main" v-bind:class='{open:isKeywordActive}'>
      <SelectDatasourceKeyword @message="passModalMessage"/>
    </div>
    <!-- セグメント選択 -->
    <div class="area-toggle" v-bind:class='{open:isSegmentActive}' v-on:click='isSegmentActive=!isSegmentActive'>
      <p class="select-ds-ttl">{{_L.SEGMENT_SEARCH}}</p>
    </div>
    <p class="description">{{_L.SEGMENT_SEARCH_DESCRIPTION}}</p>
    <div class="select-ds-main" v-bind:class='{open:isSegmentActive}'>
      <SelectDatasourceSegment @message="passModalMessage"/>
    </div>
    <br/>
    <p class="area-button right">
      <a class="button" @click="validate">{{_L.OK}}</a>
    </p>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import globals from '@/static2/mixins/globals';
  import SelectDatasourceKeyword from "./SelectDatasourceKeyword";
  import SelectDatasourceSegment from "./SelectDatasourceSegment";

  export default {
    name: 'SelectDatasource',
    mixins: [globals,],
    components: {SelectDatasourceKeyword, SelectDatasourceSegment,},
    data: function () {
      return {
        isKeywordActive: false,
        isSegmentActive: false,
      }
    },
    methods: {
      validate: function () {
        let keyCnt =  this.$store.state.tempDataSource.keyword.selectedCount;
        let segCnt =  this.$store.state.tempDataSource.segment.selectedCount;

        // データソース未選択
        if ((keyCnt + segCnt) == 0) {
          this.$emit("message", this._L.DS_ERR_SELECTED_REQUIRE);
          return;
        }

        // データソース選択件数上限
        let max = this.$store.state.const.VALIDATE.DATASOURCE.MAX_SELECTED;
        if ((keyCnt + segCnt) > max) {
          let msg = this.format(this._L.DS_ERR_SELECTED_MAX, max)
          this.$emit("message", msg);
          return;
        }

        // テンプレート選択画面へ
        this.$router.push("/SelectTemplate");
      },
      passModalMessage(msg) {
        this.$emit("message", msg);
      },
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style src='./style.css'></style>
