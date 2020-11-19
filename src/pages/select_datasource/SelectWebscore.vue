<template>
  <div class="select-ds">
    <p class="select-ds-ttl">{{_L.MENU_SELECT_TREND}}</p>
    <br/>
    <!-- Webスコア分析 -->
    <div class="area-toggle" v-bind:class='{open:isKeywordActive}' v-on:click='isKeywordActive=!isKeywordActive'>
      <p class="select-ds-ttl">{{_L.WEB_SCORE_ANALYSIS}}</p>
    </div>
    <p class="description">{{_L.WEB_SCORE_ANALYSIS_DESCRIPTION}}</p>
    <div class="select-ds-main" v-bind:class='{open:isKeywordActive}'>
      <SelectWebscoreKeyword @message="passModalMessage"/>
    </div>
    <br/>
    <p class="area-button right">
      <a class="button" @click="analyze">{{_L.OK}}</a>
    </p>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import globals from '@/static2/mixins/globals';
  import SelectWebscoreKeyword from "./SelectWebscoreKeyword";

  export default {
    name: 'SelectWebscore',
    mixins: [globals,],
    components: {SelectWebscoreKeyword,},
    data: function () {
      return {
        isKeywordActive: false,
      }
    },
    methods: {
      analyze() {
        this.addTab_categoryList();
        if (!this.$router.currentRoute.path.endsWith("/DataResult")) {
          this.$router.push("/DataResult");
        }
      },
      // store操作
      addTab_categoryList: function () {
        let tempKeyword = this.$store.state.tempDataSource.keyword.target;
        let tempSegment = this.$store.state.tempDataSource.segment.target;
        let dataSources = tempKeyword.concat(tempSegment);

        if (this.$store.getters.tabMaxHasReached) {
          this.$emit("message", this._L.TABS_REACHED_MAX);
          return;
        }

        let comId = Date.now().toString().split("").reverse().join("");
        this.$store.commit("addCombination", {
          combinationId: comId,
          dataSources: dataSources,
          tempDataSource: this.$store.state.tempDataSource,
          departmentCd: this.$store.state.departmentCd,
          templateId: this.selectedTemplateId,
        });
        
        let tabId = Date.now().toString().split("").reverse().join("");
        let options = {
          tabId: tabId,
          name: tabId,
          tabType: "WebscoreGraph",
          combinationId: comId,
          parentTabId: null,
          searchString: "",
          sortCriteria: null,
          sortKey: 1,
        };
        this.$store.commit("addTab", options);
      },
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
        this.$router.push("/DataResult");
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
