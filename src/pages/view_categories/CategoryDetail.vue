<template>
  <div>
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <!-- 読込画面 END -->
    <div class="main-title-div">
      <h1 class="main-title">{{params.name}}</h1>
    </div>
    <div v-if="graphData" class="content-div">
      <HorizontalBarExt :id="id" :chart-data="graphData" :options="options"/>
    </div>
  </div>
</template>

<script>
  import HorizontalBarExt from "@/pages/view_categories/graph/HorizontalBarExt";
  import CategoryCommon from "@/pages/view_categories/CategoryCommon";
  import axios from 'axios';
  import globals from '@/static2/mixins/globals';

  export default {
    name: "CategoryDetail",
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
        },
      };
    },
    methods: {
      /**
       * カテゴリー一覧（グラフ）で取得したカテゴリー情報を複製
       */
      copyCategory: function () {
        var parentTab = this.tabInfoList.find(tab => (tab.tabId == this.tabInfo.parentTabId));
        this.$store.commit("updateTab", {
          tabId: this.params.tabId,
          searchString: "", // this.tabInfo.searchString,
          sortCriteria: this.tabInfo.sortCriteria,
          sortKey: this.tabInfo.sortKey,
          categoryName: this.tabInfo.categoryName,
          dataSourceKeyword: this.category.dataSourceKeyword,
          choices: [].concat(this.category.choices),
        });
      },
      /**
       * API応答をストアに保存
       * @param response API応答
       */
      storeResponse: function (response) {
        var choices = response.datasets.map(ds => {
          return {
            choiceId: ds.label_id,
            choice: ds.label,
            score: [].concat(ds.score),
          };
        });
        this.$store.commit("updateTab", {
          tabId: this.tabInfo.tabId,
          searchString: this.tabInfo.searchString,
          sortCriteria: this.tabInfo.sortCriteria,
          sortKey: this.tabInfo.sortKey,
          categoryName: this.tabInfo.categoryName,
          dataSourceKeyword: response.data_source_keyword,
          choices: choices,
        });
      },
      /**
       * グラフ用データを充填
       */
      fillGraphData: function () {
        if (!this.tabInfo.choices) return;
        var direction = (this.tabInfo.sortKey == 0) ? -1 : 1;
        var choices = [].concat(this.tabInfo.choices);
        choices.sort(function compare(a, b) {
          return direction * (b.score[0] - a.score[0]);
        });
        this.graphData = this.createChartData(
          this.tabInfo.dataSourceKeyword,
          choices,
          choices.map(cho => cho.choice),
        );
        this.tabInfo.isLoaded = true;
      },
      async getData() {
        // CategoryListからならAPI呼び出し
        var req = this.createRequest(this.category);

        // API: COM-005 呼び出し
        let res;
        if (this.host_name) {
          let url = this.host_name + '/app/table_list/get_analysis_data/';
          let headers = this.getTokenHeaders();
          let params = req;
          await axios.post(url, params, {headers: headers})
            .then(response => {
              this.check_login(response);
              this.check_status(response);
              res = response.data;
            }).catch(error => {
              this.raiseSystemError(error);
              this.page_ready_flg = true;
            });
        } else {
          let response = require('@/test/com005_' + this.category.categoryId + '.json');
          this.check_status(response);
          this.check_error(response);
          res = response.data;
        }
        //console.log("CategoryDetail res = " + JSON.stringify(res, null, 2));
        return res;
      },
      rendering : function() {
        console.log("CategoryDetail::rendering Start");
        this.$nextTick(function () {
          console.log("CategoryDetail::rendering nextTick Start");
          if (this.tabInfo.isLoaded) {
            this.fillGraphData();
            console.log("CategoryDetail::rendering nextTick is loaded");
            return;
          }
          console.log("CategoryDetail::rendering nextTick 1");
          if (this.hasDetail(this.category)) {
            // CategoryListGraphからならstoreのcategoryをtabのカテゴリにコピー
            console.log("CategoryDetail::rendering nextTick copy");
            this.copyCategory();
            this.fillGraphData();
            return;
          }

          // カテゴリ一覧画面のキーワードを除去
          this.$store.commit("updateTab", {
            tabId: this.params.tabId,
            searchString: "",
          });

          console.log("CategoryDetail::rendering nextTick 2");
          (async () => {
            this.page_ready_flg = false;
            console.log("CategoryDetail::rendering nextTick async 1");
            let res = await this.getData();
            console.log("CategoryDetail::rendering nextTick async 2");
            this.hasApiError = (res.err_flg == 1);
            if (this.hasApiError) {
              console.log("CategoryDetail::rendering nextTick async haserror");
              this.$store.commit("setActiveTabIndex", this.$store.state.activeTabIndexPre);
              this.$store.commit("removeTab", this.params.tabId);
              this.$emit("message", this._L.API_ERR);
              this.$destroy();
              return;
            }
            console.log("CategoryDetail::rendering nextTick async 3");
            this.storeResponse(res);
            console.log("CategoryDetail::rendering nextTick async 4");
            this.fillGraphData();
            console.log("CategoryDetail::rendering nextTick async 5");
            this.page_ready_flg = true;
          })();
          console.log("CategoryDetail::rendering nextTick End");
        });
        console.log("CategoryDetail::rendering End");
      }
    },
    /**
     * mount時の処理
     */
    mounted() {
      if (this.hasApiError) return;
      console.log("CategoryDetail::mounted Start");
      this.rendering();
      console.log("CategoryDetail::mounted End");
    },
    watch: {
      tabInfo: {
        handler: function() {
          console.log("CategoryDetail::watch tabInfo Start");
          this.rendering();
          console.log("CategoryDetail::watch tabInfo End");
        },
        deep: true
      },
    },
  }

</script>

<style scoped>
  .main-title-div {
    overflow: hidden;
    margin: 0px 0px 8px 0px;
  }

  .main-title {
    float: left;
    padding: 16px 16px 16px 0px;
  }

  .content-div {
    /*width: 80%;*/
    /*height: 80%;*/
    /*border: dotted 1px black;*/
  }
</style>
