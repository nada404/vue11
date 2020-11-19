<template>
  <div>
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <div class="main-title-div">
      <h1 class="main-title">{{_L.CATEGORY_LIST_GRAPH}}</h1>
    </div>
    <div class="content-div">
      <table>
        <tr v-for="(dat, idx) in graphData" :key="idx" @click="categoryClicked(idx)">
          <td>
            <div class="graph-div-l">
              <BarExt :chart-data="dat" :options="optionsS"/>
            </div>
          </td>
          <td>
            <div class="graph-div-r">
              <h2>{{dat.labels[0]}}</h2>
              <HorizontalBarExt :chart-data="dat.detail" :options="optionsD"/>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import BarExt from "@/pages/view_categories/graph/BarExt";
  import HorizontalBarExt from "@/pages/view_categories/graph/HorizontalBarExt";
  import CategoryCommon from "@/pages/view_categories/CategoryCommon";
  import axios from 'axios';
  import globals from '@/static2/mixins/globals';

  export default {
    name: "CategoryDetailGraph",
    components: {BarExt, HorizontalBarExt,},
    mixins: [globals, CategoryCommon,],
    props: {
      id: null,
      params: null,
    },
    data: function () {
      return {
        page_ready_flg: true,
        graphData: null,
        optionsS: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: "Category Relevance",
          },
          legend: {
            display: false,
          },
        },
        optionsD: {
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
       * カテゴリー（表内の１行）がクリックされたときの処理
       * @param index クリックされた行のインデックス
       */
      categoryClicked(index) {
        var cat = this.categories[index];
        this.goToDetail(cat.categoryId, cat.categoryName);
      },
      /**
       * API応答をストアに保存
       * @param response API応答
       * @param category どのカテゴリに関するデータか
       */
      storeResponse: function (response, category) {
        var idx = this.categories.findIndex(cat => (cat.categoryId == category.categoryId));
        var choices = [];
        response.datasets.forEach(ds => {
          var choice = {
            choiceId: ds.label_id,
            choice: ds.label,
            score: [].concat(ds.score),
          };
          choices.push(choice);
        });
        var cat = Object.assign({}, category);
        Object.assign(cat, {
          dataSourceKeyword: [].concat(response.data_source_keyword),
          choices: choices,
        });
        this.$store.commit("replaceCategory", {
          tabId: this.tabInfo.tabId,
          categoryIndex: idx,
          category: cat,
        });
      },
      /**
       * グラフ用データを充填
       */
      fillGraphData: function () {
        if (!this.categories) return;
        var dataList = [];
        this.categories.forEach(cat => {
          var data = this.createChartData(
            this.tabInfo.dataSourceKeyword,
            [cat,],
            [cat.categoryName,],
          );
          if (cat.choices) {
            data.detail = this.createChartData(
              cat.dataSourceKeyword,
              cat.choices,
              cat.choices.map(cho => cho.choice),
            );
          }
          dataList.push(data);
        });
        this.graphData = dataList;
      },
      /**
       * API応答を非同期で呼び出す
       * @param cat カテゴリ
       */
      async storeResponseByAsync (cat) {
        console.log("CategoryListGraph::storeResponseByAsync Start");
        this.page_ready_flg = false;
        var req = this.createRequest(cat);
        // console.log("CategoryListGraph req = " + JSON.stringify(req, null, 2));
          console.log("CategoryListGraph::storeResponseByAsync 1");

        // API: COM-005 呼び出し
        let res;
        if (this.host_name) {
          console.log("CategoryListGraph::storeResponseByAsync 2");
          let url = this.host_name + '/app/table_list/get_analysis_data/';
          let headers = this.getTokenHeaders();
          let params = req;
          await axios.post(url, params, {headers: headers})
            .then(response => {
              this.check_login(response);
              this.check_status(response);
              res = response.data;
              console.log("CategoryListGraph::storeResponseByAsync axios");
            }).catch(error => {
              this.raiseSystemError(error);
            });
        } else {
          let response = require('@/test/com005_' + cat.categoryId + '.json');
          this.check_status(response);
          this.check_error(response);
          res = response.data;
        }
        // console.log("CategoryListGraph res = " + JSON.stringify(res, null, 2));
        console.log("CategoryListGraph::storeResponseByAsync 3");

        this.hasApiError = (res.err_flg == 1);
        if (this.hasApiError) {
          this.$store.commit("setActiveTabIndex", this.$store.state.activeTabIndexPre);
          this.$store.commit("removeTab", this.params.tabId);
          this.$emit("message", this._L.API_ERR);
          this.$destroy();
          return true;
        }
        console.log("CategoryListGraph::storeResponseByAsync 4");
        this.storeResponse(res, cat);
        console.log("CategoryListGraph::storeResponseByAsync 5");
        this.fillGraphData();
        console.log("CategoryListGraph::storeResponseByAsync 6");
        if (!this.tabInfo.isLoaded) {
          this.$store.commit("setTabLoaded", this.tabInfo.tabId);
        }
        this.page_ready_flg = true;
        console.log("CategoryListGraph::storeResponseByAsync End");
      },
      rendering : function() {
        this.$nextTick(function () {
          if (this.tabInfo.isLoaded) {
            this.fillGraphData();
            console.log("CategoryListGraph::mounted async is loaded End");
            return;
          }
          (async () => {
            console.log("CategoryListGraph::mounted async Start");
            await this.categories.some(cat => {
              console.log("CategoryListGraph::mounted async some Start");
              this.storeResponseByAsync(cat);
              console.log("CategoryListGraph::mounted async some End");
            });
            console.log("CategoryListGraph::mounted async End");
          })();
        });
      }
    },
    /**
     * mount時の処理
     */
    mounted() {
      if (this.hasApiError) return;
      console.log("CategoryListGraph::mounted Start");
      this.rendering();
      console.log("CategoryListGraph::mounted End");
    },
    watch: {
      tabInfo: {
        handler: function() {
          console.log("CategoryListGraph::watch tabInfo Start");
          this.rendering();
          console.log("CategoryListGraph::watch tabInfo End");
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
    width: 100%;
    overflow: hidden;
  }

  .content-div table {
    width: 100%;
  }

  .content-div table th,
  .content-div table td {
    border: solid 1px #CCC;
    padding: 4px;
  }

  .graph-div-l {
    float: left;
    width: 200px;
  }

  .graph-div-r {
    float: left;
    width: 100%;
  }
</style>
