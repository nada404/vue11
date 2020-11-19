<template>
  <div id="divDataResult" class="tab-view-container">
    <div>
      <tabs id="tabs" v-bind:options="{useUrlFragment: false,}">
        <tab
          v-for="(o, i) in tabInfoList"
          :key="o.tabId"
          :id="o.tabId"
          :name="getTabName(o)"
          @click="tabClicked(i)">
          <div class="tab-panels-container">
            <category-list v-if="isCurrent(o, i, 'CategoryList')" :id="o.tabId" :params="o"
                           @message="passModalMessage"/>
            <category-list-graph v-if="isCurrent(o, i, 'CategoryListGraph')" :id="o.tabId" :params="o"
                                 @message="passModalMessage"/>
            <category-detail v-if="isCurrent(o, i, 'CategoryDetail')" :id="o.tabId" :params="o"
                             @message="passModalMessage"/>
            <category-detail-graph v-if="isCurrent(o, i, 'CategoryDetailGraph')" :id="o.tabId" :params="o"
                                   @message="passModalMessage"/>
            <webscore-graph v-if="isCurrent(o, i, 'WebscoreGraph')" :id="o.tabId" :params="o"
                                   @message="passModalMessage"/>
            <webscore-graph v-if="isCurrent(o, i, 'TimeSeriesAnalysisGraph')" :id="o.tabId" :params="o"
                                   @message="passModalMessage"/>
            <keyword-list v-if="isCurrent(o, i, 'KeywordList')" :id="o.tabId" :params="o"
                          @message="passModalMessage"/>
            <img src="@/static2/images/icon_circle_open_w.png" class="tab-closer" :id="'tab-closer-' + o.tabId"
                 @click="closeTab(o.tabId)"/>
          </div>
        </tab>
      </tabs>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue';
  import globals from '@/static2/mixins/globals'
  import {mapGetters} from "vuex";
  import {Tabs, Tab} from 'vue-tabs-component';
  import CategoryCommon from "@/pages/view_categories/CategoryCommon";
  import CategoryList from '@/pages/view_categories/CategoryList';
  import CategoryListGraph from '@/pages/view_categories/CategoryListGraph';
  import CategoryDetail from '@/pages/view_categories/CategoryDetail';
  import CategoryDetailGraph from '@/pages/view_categories/CategoryDetailGraph';
  import WebscoreGraph from '@/pages/view_categories/WebscoreGraph';
  import TimeSeriesAnalysisGraph from '@/pages/view_categories/TimeSeriesAnalysisGraph';
  import KeywordList from '@/pages/view_categories/KeywordList';

  Vue.component('tabs', Tabs);
  Vue.component('tab', Tab);
  Vue.component('category-list', CategoryList);
  Vue.component('category-list-graph', CategoryListGraph);
  Vue.component('category-detail', CategoryDetail);
  Vue.component('category-detail-graph', CategoryDetailGraph);
  Vue.component('webscore-graph', WebscoreGraph);
  Vue.component('timeseries-analysis-graph', TimeSeriesAnalysisGraph);
  Vue.component('keyword-list', KeywordList);
  export default {
    name: 'dataResult',
    components: {Tabs, Tab,},
    mixins: [globals, CategoryCommon,],
    computed: {
      tabBar: function () {
        if (!this.$children || this.$children.length <= 0) return;
        return this.$children[0];
      },
      activeTabIndex: function () {
        return this.$store.state.activeTabIndex;
      },
    },
    methods: {
      isCurrent: function (info, index, type) {
        if (info.tabType != type) return false;
        if (index != this.activeTabIndex) return false;
        return true;
      },
      getTabSetSeq: function (info) {
        if (1 < info.tabSetSeq) return " (" + info.tabSetSeq + ")";
        return "";
      },
      getTabName: function (info) {
        var ret;
        switch (info.tabType) {
          case "CategoryList":
            ret = this._L.CATEGORY_LIST + this.getTabSetSeq(info);
            break;
          case "WebscoreGraph":
            ret = this._L.WEB_SCORE_ANALYSIS + this.getTabSetSeq(info);
            break;
          case "TimeSeriesAnalysisGraph":
            ret = this._L.TIME_SERIES_ANALYSIS + this.getTabSetSeq(info);
            break;
          case "CategoryListGraph":
            ret = this._L.CATEGORY_LIST_GRAPH + this.getTabSetSeq(info);
            break;
          case "CategoryDetail":
            ret = info.name;
            break;
          case "CategoryDetailGraph":
            ret = this.format(this._L.CATEGORY_DETAIL_GRAPH, info.name, this.getGraphName(info));
            break;
            case "KeywordList":
              ret = this._L.KEYWORD_LIST + this.getTabSetSeq(info);
              break;
          default:
            ret = "(unknown)";
            break;
        }
        return ret;
      },
      getGraphName: function (tabInfo) {
        switch (tabInfo.graphType) {
          case "Bar":
            return this._L.GRAPH_NAME_BAR;
            break;
          case "Circle":
            return this._L.GRAPH_NAME_CIRCLE;
            break;
          case "Line":
            return this._L.GRAPH_NAME_LINE;
            break;
          case "Radar":
            return this._L.GRAPH_NAME_RADAR;
            break;
          default:
            return "?";
            break;
        }
      },
      setTabCloseButton: function () {
        document.querySelectorAll("#tabs .tabs-component-tab-a").forEach(a => {
          var id = a.getAttribute("href").substr(1);
          var imgOrg = document.querySelector("#tab-closer-" + id);
          var listItem = a.parentElement;
          listItem.querySelectorAll(".tab-close-trigger").forEach(elm => elm.remove());
          var img = document.importNode(imgOrg);
          img.removeAttribute("id");
          img.setAttribute("class", "tab-close-trigger");
          img.addEventListener("click", function () {
            imgOrg.click();
          });
          listItem.insertBefore(img, listItem.firstChild);
        });
      },
      setTabNameEllipsis: function () {
        document.querySelectorAll(".tabs-component-tab-a").forEach(a => {
          a.parentElement.querySelectorAll(".tab-name-ellipsis").forEach(elm => elm.remove());
          if (a.scrollWidth <= a.clientWidth) return;
          a.addEventListener("mouseover", this.showTooltip);
          a.addEventListener("mouseout", this.hideTooltip);
          var dots = document.createElement("span");
          dots.append(this._L.TAB_NAME_ELLIPSIS);
          dots.setAttribute("class", "tab-name-ellipsis");
          dots.style.left = a.clientWidth + "px";
          a.parentElement.appendChild(dots);
        });
      },
      showTooltip: function (event) {
        $(event.target).showBalloon({
          contents: event.target.textContent,
          classname: "tooltip",
          tipSize: 0,
          css: {
            border: "dotted 1px #0f0f0f",
            backgroundColor: "#ffffff",
            color: "#000000",
            padding: "12px",
            fontSize: "10pt",
            opacity: "1",
            showDuration: 0,
            showAnimation: null,
            hideDuration: 0,
            hideAnimation: null,
          },
        });
      },
      hideTooltip: function (event) {
        $(event.target).hideBalloon();
      },
      closeTab: function (tabId) {
        this.$store.commit("removeTab", tabId);
      },
      tabClicked: function (event) {
        var idx = this.tabInfoList.findIndex(info => (event.target.hash.substr(1) == info.tabId));
        this.$store.commit('setActiveTabIndex', idx);
      },
      setTabClicked: function () {
        this.tabBar.$el.querySelectorAll(".tabs-component-tab-a").forEach((a, i) => {
          a.addEventListener("click", this.tabClicked);
        })
      },
      passModalMessage(msg) {
        this.$emit("message", msg);
      },
    },
    mounted() {
      if (this.tabInfoList.length <= 0) {
        this.$router.replace("/SelectDatasource");
        return;
      }
      this.$nextTick(function () {
        this.setTabClicked();
        this.setTabCloseButton();
        this.setTabNameEllipsis();
        this.moveFocusToTab();
      });
    },
    updated() {
      if (this.tabInfoList.length <= 0) {
        this.$router.replace("/SelectDatasource");
        return;
      }
      this.$nextTick(function () {
        this.setTabClicked();
        this.setTabCloseButton();
        this.setTabNameEllipsis();
        this.moveFocusToTab();
      });
    },
  }
</script>

<style src='./style.css'>
</style>
