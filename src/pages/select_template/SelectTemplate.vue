<template>
  <div class="select-template">
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <!-- 読込画面 END -->
    <div v-show="page_ready_flg">
      <div class="area-center-search">
        <input class="search-keyword-input"
               v-model="searchKeyword" :placeholder="_L.TEMPLATE_SEARCH_PLACEHOLDER"
               :maxlength="this.$store.state.const.VALIDATE.TEMPLATE_NAME.MAX_LENGTH"/>
      </div>
      <div class="select-template-area">
        <span v-if="this.filterList.length == 0">{{_L.TEMPLATE_MSG_NO_RESULT}}</span>
        <div v-for="template in filterList"
             v-on:click='selectedTemplateId=template.template_id'
             :class="['template-block', checkSelected(template.template_id) ? 'selected' : '']">
          <p class="title">{{template.template_name}}</p>
          <img class="template-image" src="@/static2/images/img_template.png">
        </div>
        <div class="template-block" style="visibility: hidden; height: 50px;"></div> <!-- 左揃え用のダミータグ -->
        <div class="template-block" style="visibility: hidden; height: 50px;"></div> <!-- 左揃え用のダミータグ -->
        <div class="template-block" style="visibility: hidden; height: 50px;"></div> <!-- 左揃え用のダミータグ -->
      </div>
      <br/>
      <br/>
      <p class="area-button right">
        <router-link to="/SelectDatasource" class="button">{{_L.TEMPLATE_BACK}}</router-link>
        <span class="button" v-on:click="analyze">{{_L.TEMPLATE_ANALYZE}}</span>
      </p>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import axios from 'axios';
  import globals from '@/static2/mixins/globals';

  export default {
    name: 'SelectTemplate',
    mixins: [globals,],
    data: function () {
      return {
        page_ready_flg: false,
        searchKeyword: "",
        selectedTemplateId: "",
        templateList: [],
        temp_dataSources: [],
      }
    },
    mounted() {
      this.apiGetTemplate();
    },
    methods: {
      /* API: COM-004 */
      async apiGetTemplate() {
        await this.readyFlg(false);
        if (this.host_name) {
          await axios({
            method: 'get',
            headers: this.getTokenHeaders(),
            url: this.host_name + '/app/table_list/get_template/',
            // url:  'https://g9340cyuz6.execute-api.ap-northeast-1.amazonaws.com/sqtest1/get-com004/', //モック
            params: { search_string: "" }  // this.searchKeyword
          }).then(response => {
            this.check_login(response);
            (async () => {
              await this.setResponse(response);
            })();
          }).catch(error => {
            this.raiseSystemError(error);
          });
        } else {
          let response = require('@/test/com004.json');
          await this.setResponse(response);
        }
        await this.readyFlg(true);
      },
      async setResponse(response) {
        this.check_status(response);
        this.check_error(response);
        this.templateList = response.data.template_list;
      },
      /* ページ読込中のフラグ */
      readyFlg: function (status) {
        this.page_ready_flg = status;
      },
      /* 内部method */
      checkSelected(templateId) {
        return this.selectedTemplateId == templateId;
      },
      analyze() {
        if (this.selectedTemplateId == "") {
          this.$emit("message", this._L.TEMPLATE_ERR_REQUIRE);
          return;
        }
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
          //searchMethodFlg: 0,
        });

        let tabId = Date.now().toString().split("").reverse().join("");
        let tmpSortCriteria = dataSources[0].mergedKeyword;
        if (dataSources[0].getMonth) {
          tmpSortCriteria = dataSources[0].getMonth + "_" + tmpSortCriteria;
        }
        let options = {
          tabId: tabId,
          name: tabId,
          tabType: "CategoryList",
          combinationId: comId,
          parentTabId: null,
          searchString: "",
          sortCriteria: tmpSortCriteria,
          sortKey: 1,
        };
        this.$store.commit("addTab", options);
      },
    },
    computed: {
      filterList: function () {
        // テンプレート選択状態クリア
        this.selectedTemplateId = "";
        // 検索実行
        if (this.searchKeyword == "") {
          return this.templateList;
        }
        let filterList = [];
        for (let i in this.templateList) {
          let template = this.templateList[i]
          if (template.template_name.indexOf(this.searchKeyword) !== -1) {
            filterList.push(template);
          }
        }
        return filterList;
      },
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style scoped>
  .select-template {
    margin: 40px;
    padding: 40px 80px;
    background-color: #FFF;
    border: 1px solid #E5E5E5;
  }

  .area-center-search {
    padding-bottom: 40px;
    text-align: center;
  }

  .area-center-search .search-keyword-input {
    width: 500px;
    height: 1.7rem;
    padding-left: 4px;
    /*background: #FFF url("../../static2/images/icon_search.png") no-repeat 98%;*/
    /*background-size: 15px;*/
    border-width: 1px;
  }

  .select-template-area {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  }

  .template-block {
    display: inline-flex;
    flex-direction: column;
    margin: 10px;
    width: 160px;
    height: 200px;
    text-align: center;
    box-sizing: border-box;
    border: 2px solid #A0A0A0;
    cursor: pointer;
  }

  .template-block:hover {
    opacity: 0.7;
  }

  .template-block.selected {
    /*background-color: #F9F9F9;*/
    border: 2px solid #4BACC6;
    /*border-top-width: 2px;*/
  }

  .template-block .title {
    padding: 10px 0;
    width: 100%;
    font-size: 14px;
    font-weight: bold;
    color: #FFFFFF;
    background-color: #A0A0A0;
    word-break: break-word;
  }

  .template-block.selected .title {
    background-color: #4BACC6;
  }

  .template-block .template-image {
    width: 120px;
    margin: auto;
  }

  @media screen and ( max-width: 1200px ) {
    /* 画面幅を縮めたときに検索ボックスの横幅を100%にする */
    .area-center-search .search-keyword-input {
      width: 100%;
    }

  }
</style>
