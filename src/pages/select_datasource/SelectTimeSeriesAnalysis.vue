<template>
  <div class="select-ds">
    <p class="select-ds-ttl">{{_L.MENU_SELECT_TIMESERIES_ANALYSIS}}</p>
    <br/>
    <!-- 期間検索 -->
    <div class="analysis-period" aligh="right" style="display: inline">
      <label>{{_L.SEARCH_PERIOD}}</label>
      <input type="date" name="period-start">
      <label>~</label>
      <input type="date" name="period-end">
    </div>
    <br/>
    <br/>
    <br/>
    <br/>
    <!-- Webスコア分析 -->
    <div class="area-toggle" v-bind:class='{open:isKeywordActive}' v-on:click='isKeywordActive=!isKeywordActive'>
      <p class="select-ds-ttl">{{_L.TIME_SERIES_ANALYSIS}}</p>
    </div>
    <p class="description">{{_L.TIME_SERIES_ANALYSIS_DESCRIPTION}}</p>
    <div class="select-ds-main" v-bind:class='{open:isKeywordActive}'>
      <SelectTimeSeriesAnalysisKeyword @message="passModalMessage"/>
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
  import SelectTimeSeriesAnalysisKeyword from "./SelectTimeSeriesAnalysisKeyword";

  export default {
    name: 'SelectWebscore',
    mixins: [globals,],
    components: {SelectTimeSeriesAnalysisKeyword,},
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
          tabType: "TimeSeriesAnalysisGraph",
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
