<template>
  <div>
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <!-- 読込画面 END -->
    <div v-if="graphData" class="content-div">
      <LineExt :id="id" :chart-data="graphData" :options="options"/>
    </div>
  </div>
</template>

<script>
  import LineExt from "@/pages/view_categories/graph/LineExt";
  import CategoryCommon from "@/pages/view_categories/CategoryCommon";
  import axios from 'axios';
  import globals from '@/static2/mixins/globals';

  export default {
    name: "WebscoreGraph",
    components: {LineExt,},
    mixins: [globals, CategoryCommon,],
    props: {
      id: null,
      params: null,
    },
    data: function () {
      return {
        graphColors: [
          this.rgba("#0000FF"),
          this.rgba("#FF0000"),
          this.rgba("#01B280"),
          this.rgba("#FACB1E"),
          this.rgba("#6464AA"),
          this.rgba("#9C9F1E"),
          this.rgba("#687656"),
          this.rgba("#B28001"),
          this.rgba("#CB1EFA"),
          this.rgba("#64AA64"),
        ],
        page_ready_flg: true,
        responseData:null,
        graphData: null,
        title:"",
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
       * API応答をストアに保存
       * @param response API応答
       */
      storeResponse: function (response) {
        this.$store.commit("updateTab", {
          tabId: this.tabInfo.tabId,
          searchString: this.tabInfo.searchString,
          sortCriteria: this.tabInfo.sortCriteria,
          sortKey: this.tabInfo.sortKey,
          categoryName: this.tabInfo.categoryName,
        });
      },
      /**
       * グラフ用データを充填
       */
      fillGraphData: function () {
        //this.responseData.data.forEach(data => {
        //  console.log("WebscoreGraph::rendering Start");
        //  };
        // });
        var keys = Object.keys(this.responseData);
        var labels = [];
        var datasets = [];
        for(var i = 0; i < keys.length; i++) {
          var keyword = keys[i];
          while(true) {
            var indexStart = keyword.indexOf('&#x');
            var indexEnd = 0;
            var code16 = "";
            var code16_ = "";
            if(indexStart == -1) {
              break;
            }
            indexEnd = keyword.indexOf(';', indexStart);
            code16 = keyword.substr(indexStart, indexEnd - indexStart + 1);
            code16_ = code16.replace('&#x', '');
            code16_ = code16_.replace(';', '');
            keyword = keyword.replace(code16, String.fromCharCode(parseInt(code16_, 16)));
          }
          
          var dataDetails = Object.values(this.responseData);
          labels = Object.keys(dataDetails[i]).map((date) => date.replace(/-/g, '/'));
          for(var j = 0; j < labels.length; j++) {
            if(j%5 != 0)
            {
              labels[j] = "";
            }
          }

          var data = [];
          data = Object.values(dataDetails[i]);
          
          for(var j = 0; j < data.length; j++) {
            if(data[j] == "")
            {
              data[j] = null;
            }
          }
          
          datasets.push({
            label: keyword,
            data: data,
            fill: false,
            borderColor: this.graphColors[i % 10],
            borderWidth: 3,
          });
        }
       
       this.graphData = {
        //labels: labels.map((date) => date.split("")),
        labels: labels,
        datasets: datasets,
       }
      },
      async getData() {
        // WebscoreGraphからならAPI呼び出し
        var req = this.createWebscoreRequest();
        let res;

        if (this.host_name) {
          let params = req;
          await axios({
            method: 'get',
            headers: this.getTokenHeaders(),
            url: this.host_name + '/app/table_list/get_webscore/',
            //url:  'http://localhost' + '/app/table_list/get_webscore/',
            params: params
          }).then(response => {
            res = response.data;
          }).catch(error => {
            this.raiseSystemError(error);
          });
        } else {
          let response = require('@/test/com007.json');
          res = response.data;
        }
        return res;
      },
      rendering : function() {
        console.log("WebscoreGraph::rendering Start");
        this.$nextTick(function () {
          console.log("WebscoreGraph::rendering nextTick Start");
          if (this.tabInfo.isLoaded) {
            this.fillGraphData();
            console.log("WebscoreGraph::rendering nextTick is loaded");
            return;
          }
          console.log("WebscoreGraph::rendering nextTick 1");

          // カテゴリ一覧画面のキーワードを除去
          this.$store.commit("updateTab", {
            tabId: this.params.tabId,
            searchString: "",
          });

          console.log("WebscoreGraph::rendering nextTick 2");
          (async () => {
            this.page_ready_flg = false;
            console.log("WebscoreGraph::rendering nextTick async 1");
            let res = await this.getData();
            console.log("WebscoreGraph::rendering nextTick async 2");
            this.hasApiError = (res.err_flg == 1);
            if (this.hasApiError) {
              console.log("WebscoreGraph::rendering nextTick async haserror");
              this.$store.commit("setActiveTabIndex", this.$store.state.activeTabIndexPre);
              this.$store.commit("removeTab", this.params.tabId);
              this.$emit("message", this._L.API_ERR);
              this.$destroy();
              return;
            }
            console.log("WebscoreGraph::rendering nextTick async 3");
            this.responseData = res.data;
            console.log("WebscoreGraph::rendering nextTick async 4");
            this.fillGraphData();
            console.log("WebscoreGraph::rendering nextTick async 5");
            this.page_ready_flg = true;
          })();
          console.log("WebscoreGraph::rendering nextTick End");
        });
        console.log("WebscoreGraph::rendering End");
      }
    },
    /**
     * mount時の処理
     */
    mounted() {
      if (this.hasApiError) return;
      console.log("WebscoreGraph::mounted Start");
      this.rendering();
      console.log("WebscoreGraph::mounted End");
    },
    watch: {
      tabInfo: {
        handler: function() {
          console.log("WebscoreGraph::watch tabInfo Start");
          this.rendering();
          console.log("WebscoreGraph::watch tabInfo End");
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
