<template>
  <div class="side">
    <div class="side-area">
      <p class="side-title">{{_L.DATA_SOURCE}}</p>
      <span class="title-link" v-if="this.currentDataSources.length > 0">
        <a @click="editDataSource">
          <img class="edit-icon" alt="" src="@/static2/images/icon_edit_w.png">
          {{_L.EDIT}}
        </a>
      </span>
      <div class="side-main">
        <p v-if="this.currentDataSources.length == 0">
          {{_L.NO_DATA_SOURCE_SELECTED}}
        </p>
        <ul v-else>
          <li v-for="(item, idx) in this.displayCurrentDataSources" v-bind:key="idx"
              class="side-selected-item" :title="item">
            {{item}}
          </li>
        </ul>
      </div>
    </div>
    <div class="side-area">
      <p class="side-title">{{_L.FILTER}}</p>
      <div class="side-main" v-if="this.currentDataSources.length == 0">
        {{_L.NO_DATA_SOURCE_SELECTED}}
      </div>
      <div class="side-main area-filter" v-if="this.currentDataSources.length > 0">
        <p class="item">
          <input class="search-keyword-input" v-model="searchKeyword" :placeholder="_L.SIDE_SEARCH_PLACEHOLDER"
                 :disabled="!isEnabledSearch"/>
        </p>
        <p class="item">
          <span class="item-label">{{_L.SORT_LABEL}}</span>
          <select class="item-value" v-model="selectedSortOrder" :disabled="!isEnabledSort">
            <option :value="0">{{ _L.SORT_ASC }}</option>
            <option :value="1">{{ _L.SORT_DESC }}</option>
          </select>
        </p>
        <p class="item">
          <span class="item-label">{{_L.REFERENCE_LABEL}}</span>
          <select class="item-value" v-model="selectedSortKey" :disabled="!isEnabledSort">
            <option v-for="(item, idx) in this.displayCurrentDataSources" :value="item" :key="idx">
              {{ item }}
            </option>
          </select>
        </p>
        <p class="area-button right">
          <span v-if="(isEnabledSearch || isEnabledSort)" @click="doFilter" class="button">{{_L.EXECUTE}}</span>
          <span v-if="(!isEnabledSearch && !isEnabledSort)" class="button disabled">{{_L.EXECUTE}}</span>
        </p>
      </div>
    </div>
    <div class="side-area">
      <p class="side-title">{{_L.GRAPH}}</p>
      <div class="side-area-toggle" :class='{close:!isShowGraphArea}' @click="toggleGraphArea"></div>
      <div class="side-main" :class='{close:!isShowGraphArea}'>
        <div v-if="!isShowGraphArea">{{_L.MSG_BEFORE_CATEGORY_DETAIL_GRAPH}}</div>
        <div v-if="isShowGraphArea">
          <ComponentsGraph :idkey="'Bar'" :icon="'graph_bar_w.png'" :label="_L.GRAPH_NAME_BAR" @pass="passGraphStatus"
                           @message="passModalMessage"/>
          <ComponentsGraph :idkey="'Circle'" :icon="'graph_circle_w.png'" :label="_L.GRAPH_NAME_CIRCLE"
                           @pass="passGraphStatus" @message="passModalMessage"/>
          <ComponentsGraph :idkey="'Line'" :icon="'graph_line_w.png'" :label="_L.GRAPH_NAME_LINE"
                           @pass="passGraphStatus" @message="passModalMessage"/>
          <ComponentsGraph :idkey="'Radar'" :icon="'graph_radar_w.png'" :label="_L.GRAPH_NAME_RADAR"
                           @pass="passGraphStatus" @message="passModalMessage"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import globals from '@/static2/mixins/globals';
  import ComponentsGraph from "./ComponentsGraph";

  export default {
    name: "MenuSide",
    mixins: [globals,],
    components: {ComponentsGraph},
    data: function () {
      return {
        temp_combinationId: "",
        temp_dataSourceName: '',
        temp_dataSources: [],
        temp_tabName: '',
        temp_tabType: '',
        // filter area
        sortOptions: [],
        searchKeyword: '',
        selectedSortOrder: 0,
        selectedSortKey: '',
        // other
        modalMessage: "",
      };
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
      displayCurrentDataSources: function() {
        let dataSources = this.currentDataSources;
        let displayItems = [];
        for (let i = 0; i < dataSources.length; i++) {
          displayItems.push(this.getDatasourceKey(dataSources[i]));
        }
        return displayItems;
      },
      currentDataSources: function () {
        if (this.$store.state.combinations.length <= 0) return [];
        if (this.$store.state.tabs.length <= 0) return [];
        if (this.$store.state.activeTabIndex < 0) return [];
        var tab = this.$store.state.tabs[this.$store.state.activeTabIndex];
        var com = this.$store.state.combinations.find(c => (c.combinationId == tab.combinationId));
        return com.dataSources;
      },
      currentTabInfo: function () {
        if (this.$store.state.tabs.length <= 0) return null;
        if (this.$store.state.activeTabIndex < 0) return null;
        let tabInfo = this.$store.state.tabs[this.$store.state.activeTabIndex];
        return tabInfo;
      },
      isEnabledSearch: function () {
        if (this.currentTabInfo != null) {
          let tabType = this.currentTabInfo.tabType;
          if (tabType == "CategoryList") return true;
          if (tabType == "CategoryListGraph") return false;
          if (tabType == "CategoryDetail") return false;
          if (tabType == "CategoryDetailGraph") return false;
          if (tabType == "KeywordList") return false;
        }
        return false;
      },
      isEnabledSort: function () {
        if (this.currentTabInfo != null) {
          let tabType = this.currentTabInfo.tabType;
          if (tabType == "CategoryList") return true;
          if (tabType == "CategoryListGraph") return false;
          if (tabType == "CategoryDetail") return true;
          if (tabType == "CategoryDetailGraph") return false;
          if (tabType == "KeywordList") return true;
        }
        return false;
      },
      isShowGraphArea: function () {
        if (this.currentTabInfo != null) {
          let tabType = this.currentTabInfo.tabType;
          if (tabType == "CategoryList") return false;
          if (tabType == "CategoryListGraph") return false;
          if (tabType == "CategoryDetail") return true;
          if (tabType == "CategoryDetailGraph") return true;
          if (tabType == "KeywordList") return false;
        }
        return false;
      },
    },
    methods: {
      editDataSource: function () {
        this.$store.commit('setTempDataSourceWithComId');
        switch (this.currentTabInfo.tabType) {
          case "WebscoreGraph":
            this.$router.push("/SelectWebscore");
            break;
          case "TimeSeriesAnalysisGraph":
            this.$router.push("/SelectTimeSeriesAnalysis");
            break;
          default:
            this.$router.push("/SelectDatasource");
            break;
        }
      },
      toggleGraphArea: function (event) {
        $(event.target).toggleClass('close');
        $(event.target).next('.side-main').toggleClass('close');
      },
      doFilter: function () {
        let tabInfo = this.$store.state.tabs[this.$store.state.activeTabIndex];
        this.$store.commit("replaceFilter", {
          tabId: tabInfo.tabId,
          searchString: this.searchKeyword,
          sortCriteria: this.selectedSortKey,
          sortKey: this.selectedSortOrder,
          isLoaded: false,
        });
        if (!this.$router.currentRoute.path.endsWith("/DataResult")) {
          this.$router.push("/DataResult");
        }
      },
      passGraphStatus: function (flg) {
        this.$emit('updateGraphStatus', flg);
      },
      setFilter: function (tabInfo) {
        this.searchKeyword = (tabInfo.tabType != "CategoryDetail") && (tabInfo.searchString) ? tabInfo.searchString : "";
        this.selectedSortOrder = (tabInfo.sortKey) ? tabInfo.sortKey : 0;
        this.selectedSortKey = (tabInfo.sortCriteria) ? tabInfo.sortCriteria : "";
      },
      passModalMessage(msg) {
        this.$emit("message", msg);
      },
    },
    watch: {
      currentTabInfo: function (val) {
        if (!val) return;
        // ソート初期値設定
        if (this.currentTabInfo) {
          this.setFilter(this.currentTabInfo);
        }
      },
    },
    mounted() {
      this.sortOptions = [
        {id: 0, name: this._L.SORT_ASC},
        {id: 1, name: this._L.SORT_DESC}
      ];
      if (this.currentTabInfo) {
        this.setFilter(this.currentTabInfo);
      }
    },
  }
</script>

<style scoped>
  .side-area {
    margin-bottom: 60px;
  }

  .side-title {
    display: inline-block;
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: bold;
    vertical-align: text-top;
  }

  .side-area-toggle {
    background: transparent url("../static2/images/icon_circle_close_w.png") no-repeat 50% 50%;
    width: 20px;
    height: 20px;
    display: inline-block;
  }

  .side-area-toggle.close {
    background: transparent url("../static2/images/icon_circle_open_w.png") no-repeat 50% 50%;
  }

  .side-main {
    display: block;
    font-size: 14px;
  }

  .side-main.close {
    display: none;
  }

  .side-main .side-selected-item {
    display: block;
    width: 18em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .area-filter .item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: .8rem;
  }

  .area-filter .search-keyword-input {
    width: 100%;
  }

  .area-filter .item-label {
    width: 30%;
  }

  .area-filter .item-value {
    width: 70%;
  }

  .area-filter .item-value:disabled {
    background-color: #EBEBE4;
  }


  .side .title-link {
    display: inline-block;
    float: right;
    font-size: 14px;
  }

  .side .title-link .edit-icon {
    width: 15px;
  }

  .div-category-modal {
    text-align: center;
    line-height: 1.5;
  }
</style>
