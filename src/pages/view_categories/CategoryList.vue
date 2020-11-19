<template>
  <div>
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <!-- 読込画面 END -->
    <div class="main-title-div">
      <h1 class="main-title">{{_L.CATEGORY_LIST}}</h1>
      <router-link v-if="isNotEmpty" id="linkKeyword" to="/KeywordListGraph" class="keyword-icon-area" exact>
        <div @mouseover="showTooltip($event, _L.HELP_GO_TO_KEYWORD_LIST_GRAPH)" @mouseout="hideTooltip">
          <font-awesome-icon class="keyword-icon" :alt="_L.KEYWORD_LIST" @click.prevent="goToKeywordList"
                             :icon="['fas', 'address-book']"/>
        </div>
      </router-link>
      <router-link v-if="isNotEmpty" id="linkGraph" to="/CategoryListGraph" exact>
        <div @mouseover="showTooltip($event, _L.HELP_GO_TO_CATEGORY_LIST_GRAPH)" class="graph-icon-area"
             @mouseout="hideTooltip">
          <img class="graph-icon" alt="graph" src="@/static2/images/graph_bar.png" @click.prevent="goToGraph"/>
        </div>
      </router-link>
    </div>
    <div v-if="isNotEmpty && graphData" class="content-div">
      <HorizontalBarExt :id="id" :chart-data="graphData" :options="options"/>
    </div>
    <div v-if="!isNotEmpty" class="content-div">
      <p v-html="_L.MSG_NO_CATEGORY"/>
    </div>
  </div>
</template>

<script>
  import HorizontalBarExt from "@/pages/view_categories/graph/HorizontalBarExt";
  import CategoryCommon from "@/pages/view_categories/CategoryCommon";
  import axios from 'axios';
  import globals from '@/static2/mixins/globals';
  import {mapGetters} from "vuex";

  export default {
    name: "CategoryList",
    components: {HorizontalBarExt,},
    mixins: [globals, CategoryCommon,],
    props: {
      id: null,
      params: null,
    },
    data: function () {
      return {
        page_ready_flg: true,
        graphData: null,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: "top",
          },
          onClick: this.graphClicked,
        },
        categories: [],
      };
    },
    methods: {
      showTooltip: function (event, contents) {
        var t = event.target;
        while (t && t.tagName != "DIV") t = t.parentNode;
        if (!t) return;
        $(t).showBalloon({
          contents: contents,
          position: "top",
          classname: "tooltip",
          tipSize: 16,
          css: {
            border: "solid 1px black",
            backgroundColor: "#f0f0f0",
            color: "#000000",
            padding: "12px",
            fontSize: "10pt",
            opacity: "1",
          },
        });
      },
      hideTooltip: function (event) {
        var t = event.target;
        while (t && t.tagName != "DIV") t = t.parentNode;
        if (!t) return;
        $(t).hideBalloon();
      },
      /**
       * カテゴリー一覧（グラフ）を表示
       */
      goToGraph: function () {
        $(".tooltip").hide();
        var founds = this.tabInfoList
          .filter(info => (info.tabType == "CategoryListGraph"))
          .filter(info => (info.parentTabId == this.params.tabId));
        if (0 < founds.length) {
          var hasMoved = this.moveFocusToTab(founds[0].tabId);
          if (hasMoved) return;
        }
        if (this.$store.getters.tabMaxHasReached) {
          this.$emit("message", this._L.TABS_REACHED_MAX);
          return;
        }
        var tabInfo = {};
        tabInfo = Object.assign(tabInfo, this.params);
        tabInfo = Object.assign(tabInfo, {
          tabId: this.newTabId,
          tabType: "CategoryListGraph",
          parentTabId: this.params.tabId,
          isLoaded: false,
        });
        this.$store.commit("addTab", tabInfo);
      },
      /**
       * キーワード一覧を表示
       */
      goToKeywordList: function () {
        $(".tooltip").hide();
        var founds = this.tabInfoList
          .filter(info => (info.tabType == "KeywordList"))
          .filter(info => (info.parentTabId == this.params.tabId));
        if (0 < founds.length) {
          var hasMoved = this.moveFocusToTab(founds[0].tabId);
          if (hasMoved) return;
        }
        if (this.$store.getters.tabMaxHasReached) {
          this.$emit("message", this._L.TABS_REACHED_MAX);
          return;
        }
        var tabInfo = {};
        tabInfo = Object.assign(tabInfo, this.params);
        tabInfo = Object.assign(tabInfo, {
          tabId: this.newTabId,
          tabType: "KeywordList",
          parentTabId: this.params.tabId,
          isLoaded: false,
        });
        this.$store.commit("addTab", tabInfo);
      },
      /**
       * グラフがクリックされたときの処理
       * @param event イベント
       * @param elements クリックされたカテゴリ
       */
      graphClicked: function (event, elements) {
        if (elements.length <= 0) return;
        var category = this.categories[elements[0]._index];
        this.goToDetail(category.categoryId, category.categoryName);
      },
      /**
       * API応答をストアに保存
       * @param response API応答
       */
      storeResponse: function (response) {
        var cats = [];
        response.datasets.forEach(ds => {
          var cat = {
            categoryId: ds.label_id,
            combinationId: this.combination.combinationId,
            categoryName: ds.label,
            score: [].concat(ds.score),
          };
          cats.push(cat);
        });
        this.$store.commit("replaceCategories", {
          tabId: this.tabInfo.tabId,
          dataSourceKeyword: response.data_source_keyword,
          categories: cats,
        });
      },
      /**
       * グラフ用データを充填
       */
      fillGraphData: function () {
        if (!this.tabInfo.categories) return;
        var direction = (this.tabInfo.sortKey == 0) ? -1 : 1;
        var categories = [].concat(this.tabInfo.categories);
        categories.sort(function compare(a, b) {
          return direction * (b.score[0] - a.score[0]);
        });
        this.categories = categories;
        this.graphData = this.createChartData(
          this.tabInfo.dataSourceKeyword,
          categories,
          categories.map(cat => cat.categoryName),
        );
      },
      async getData() {
        var res;
        console.log("CategoryList::getData 1");
        // API: COM-005 呼び出し
        let req = this.createRequest();
        console.log("CategoryList::getData 2");
        let url = this.host_name + "/app/table_list/get_analysis_data/";
        let headers = this.getTokenHeaders();
        let params = req;
        console.log("CategoryList::getData 3");
        if (this.host_name) {
          await axios
            .post(url, params, { headers: headers })
            .then(response => {
              this.check_login(response);
              this.check_status(response);
              res = response.data;
              console.log("CategoryList::getData axios");
            })
            .catch(error => {
              this.raiseSystemError(error);
              this.page_ready_flg = true;
            });
        } else {
          let response = require("@/test/com005_without_CategoryId.json");
          this.check_status(response);
          this.check_error(response);
          res = response.data;
        }
        console.log("CategoryList::getData 4");
        return res;
      },
      rendering : function() {
        console.log("CategoryList::rendering Start");
        this.$nextTick(function () {
          if (this.tabInfo.isLoaded) {
            this.fillGraphData();
            console.log("CategoryList::rendering nextTick");
            return;
          }
          console.log("CategoryList::rendering is loaded End");
          (async () => {
            console.log("CategoryList::rendering async Start");
            this.page_ready_flg = false;
            let res = await this.getData();
            this.hasApiError = res.err_flg == 1;
            if (this.hasApiError) {
              this.$store.commit(
                "setActiveTabIndex",
                this.$store.state.activeTabIndexPre
              );
              this.$store.commit("removeTab", this.params.tabId);
              this.$emit("message", this._L.API_ERR);
              this.$destroy();
              return;
            }
            this.storeResponse(res);
            this.fillGraphData();
            this.$store.commit("setTabLoaded", this.tabInfo.tabId);
            this.page_ready_flg = true;
            console.log("CategoryList::rendering async End");
          })();
        });
        console.log("CategoryList::rendering End");
      }
    },
    /**
     * mount時の処理
     */
    mounted() {
      if (this.hasApiError) return;
      this.rendering();
      console.log("CategoryList::mounted End");
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
      isNotEmpty: function() {
        if (!this.categories) return false;
        return (0 < this.categories.length);
      }
    },
    watch: {
      tabInfo: {
        handler: function() {
          console.log("CategoryList::watch tabInfo Start");
          this.rendering();
          console.log("CategoryList::watch tabInfo End");
        },
        deep: true
      },
    },
  }
</script>

<style>

</style>
<style scoped>
  .main-title-div {
    overflow: hidden;
    margin: 0px 0px 8px 0px;
  }

  .main-title {
    float: left;
    padding: 16px 16px 16px 0px;
  }

  .keyword-icon-area {
    float: left;
    height: 48px;
    width: 48px;
    text-align: center;
    margin: 0 .5em;
  }

  .keyword-icon {
    height: 44px;
    width: 44px;
    color: black;
  }

  .graph-icon-area {
    float: left;
    height: 48px;
    width: 48px;
    text-align: center;
    margin: 0 .5em;
  }

  .graph-icon {
    float: left;
    height: 48px;
  }
</style>
