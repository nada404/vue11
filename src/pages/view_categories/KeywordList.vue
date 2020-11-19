<template>
  <div>
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <div class="main-title-div">
      <h1 class="main-title">{{_L.KEYWORD_LIST}}</h1>
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
    name: "KeywordList",
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
        tmpKeywords: [],
        tmpDataSourceKeyword: [],
      };
    },
    computed: {
      keywords: function () {
        return this.tabInfo.keywords;
      }
    },
    methods: {
      /**
       * API応答からキーワード情報を一時配列に取得
       * @param response API応答
       */
      addKeyword: function (response) {
        response.datasets.forEach(ds => {
          var choice = {
            choiceId: ds.label_id,
            choice: ds.label,
            score: [].concat(ds.score),
          };
          this.tmpKeywords.push(choice);
        });
        this.tmpDataSourceKeyword = response.data_source_keyword;
      },
      /**
       * キーワード配列をストアに保存
       */
      storeKeywords: function () {
        this.$store.commit("updateTab", {
          tabId: this.tabInfo.tabId,
          keywords: this.tmpKeywords,
          dataSourceKeyword: this.tmpDataSourceKeyword,
        });
      },
      /**
       * グラフ用データを充填
       */
      fillGraphData: function () {
        // if (!this.tabInfo.keywords) return;
        var direction = (this.tabInfo.sortKey == 0) ? -1 : 1;
        var list = [].concat(this.tabInfo.keywords);
        list.sort(function compare(a, b) {
          return direction * (b.score[0] - a.score[0]);
        });
        this.tabInfo.keywords = list;
        this.graphData = this.createChartData(
          this.tabInfo.dataSourceKeyword,
          list,
          list.map(kw => kw.choice),
        );
      },
      /**
       * APIを非同期で呼び出す
       * @param cat カテゴリ
       */
      async addKeywordByAsync () {
        console.log("KeywordList::addKeywordByAsync Start");
        console.log("KeywordList::addKeywordByAsync 1");
        let axiosArray = []
        let url = this.host_name + '/app/table_list/get_analysis_data/';
        let headers = this.getTokenHeaders();
        this.categories.some(cat => {
          var req = this.createRequest(cat);
          let newPromise = axios({
              method: 'post',
              url: url,
              data: req,
              headers: headers
            })
          axiosArray.push(newPromise)
          console.log("KeywordList::addKeywordByAsync promiss array created");
        });
        console.log("KeywordList::addKeywordByAsync 2");
        // API: COM-005 呼び出し
        await axios
              .all(axiosArray)
              .then(responses => {
                const allResponse = {};
                allResponse.servers = [];
                console.log("KeywordList::addKeywordByAsync axios then start");
                for(const res of responses ) {
                  this.check_login(res);
                  this.check_status(res);
                  this.hasApiError = (res.err_flg == 1);
                  if(!this.hasApiError) {
                    this.addKeyword(res.data);
                  }
                  console.log("KeywordList::addKeywordByAsync then loop");
                }
                console.log("KeywordList::addKeywordByAsync axios then end");
              })
              .catch(error => {
                this.raiseSystemError(error);
              });
        console.log("KeywordList::addKeywordByAsync 3");
        // 以下はすべてのAPI実行が完了してから
        this.storeKeywords();
        console.log("KeywordList::addKeywordByAsync 4");
        this.fillGraphData();
        console.log("KeywordList::addKeywordByAsync 5");
        if (!this.tabInfo.isLoaded) {
          this.$store.commit("setTabLoaded", this.tabInfo.tabId);
        }
        console.log("KeywordList::addKeywordByAsync End");
      },
      rendering : function() {
        this.$nextTick(function () {
          if (this.tabInfo.isLoaded) {
            this.fillGraphData();
            console.log("KeywordList::mounted async is loaded End");
            return;
          }
          (async () => {
            console.log("KeywordList::mounted async Start");
            this.page_ready_flg = false;
            console.log("KeywordList::mounted async 1");
            this.tmpKeywords.splice(0);
            await this.addKeywordByAsync();
            this.page_ready_flg = true;
            console.log("KeywordList::mounted async End");
          })();
        });
      },
    },
    /**
     * mount時の処理
     */
    mounted() {
      console.log("KeywordList::mounted Start");
      this.rendering();
      console.log("KeywordList::mounted End");
    },
    watch: {
      tabInfo: {
        handler: function() {
          console.log("KeywordList::watch tabInfo Start");
          this.rendering();
          console.log("KeywordList::watch tabInfo End");
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
</style>
