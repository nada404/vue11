import {mapGetters} from "vuex";

export default {
  data: function () {
    return {
      graphColors: [
        this.rgba("#1E9C9F"),
        this.rgba("#566876"),
        this.rgba("#01B280"),
        this.rgba("#FACB1E"),
        this.rgba("#6464AA"),
        this.rgba("#9C9F1E"),
        this.rgba("#687656"),
        this.rgba("#B28001"),
        this.rgba("#CB1EFA"),
        this.rgba("#64AA64"),
      ],
      graphColorsCircle: [
        "#F9C6C9",
        "#FAEDCB",
        "#F2C6DE",
        "#F7D9C4",
        "#DBCDF0",
        "#E2CFC4",
        "#C6DEF1",
        "#D2D2CF",
        "#C9E4DE",
        "#E2E2DF",
      ],
      hasApiError: false,
    };
  },
  computed: {
    ...mapGetters({
      _L: 'x_language',
    }),
    tabBar: function () {
      return this.$parent.$parent
    },
    combination: function () {
      return this.$store.state.combinations.find(c => (c.combinationId == this.tabInfo.combinationId));
    },
    categories: function () {
      return this.tabInfo.categories;
    },
    category: function () {
      return this.tabInfo.categories.find(cat => cat.categoryId == this.params.categoryId);
    },
    tabInfoList: function () {
      return this.$store.state.tabs;
    },
    tabInfo: function () {
      return this.tabInfoList[this.$store.state.activeTabIndex];
    },
    newTabId: function () {
      return Date.now().toString().split("").reverse().join("");
    },
  },
  methods: {
    /**
     * RGBA文字列を取得
     * @param hex 16進数表現
     * @returns RGBA文字列
     */
    rgba: function (hex) {
      var a = [];
      var alpha = 0.6;
      a.push(parseInt(hex.substr(1, 2), 16));
      a.push(parseInt(hex.substr(3, 2), 16));
      a.push(parseInt(hex.substr(5, 2), 16));
      a.push(alpha);
      var s = "rgba(" + a.join(", ") + ")";
      return s;
    },
    /**
     * カテゴリー詳細画面に移動
     * @param categoryId カテゴリーID
     * @param categoryName カテゴリー名
     */
    goToDetail: function (categoryId, categoryName) {
      var founds = this.tabInfoList
        .filter(info => (info.tabType == "CategoryDetail"))
        .filter(info => (info.categoryId == categoryId))
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
        name: categoryName,
        tabType: "CategoryDetail",
        categoryId: categoryId,
        categoryName: categoryName,
        parentTabId: this.params.tabId,
        isLoaded: false,
      });
      this.$store.commit("addTab", tabInfo);
    },
    /**
     * 指定のカテゴリーが詳細データ取得済か
     * @param category カテゴリー情報
     * @returns true:取得済、false:未取得
     */
    hasDetail: function (category) {
      if (!category.choices) return false;
      return true;
    },
    /**
     * 指定のタブにフォーカス移動
     * @param tabId タブID
     * @returns true:移動成功、false:移動失敗
     */
    moveFocusToTab: function (tabId) {
      if (this.tabInfoList.length <= 0) return false;
      if (!tabId) {
        var idx = this.$store.state.activeTabIndex;
        if (idx < 0) {
          idx = this.tabInfoList.length - 1;
        }
        tabId = this.tabInfoList[idx].tabId;
      }
      var hash = "#" + tabId;
      var tab = this.tabBar.findTab(hash);
      if (!tab) return false;
      this.tabBar.selectTab(hash);
      var idx = this.tabBar.getTabIndex(hash);
      this.$store.commit('setActiveTabIndex', idx);
      return true;
    },
    /**
     * API要求を生成
     * @param category どのカテゴリーに関するAPI要求か
     * @returns API要求（JSONオブジェクト）
     */
    createRequest(category) {
      var com = this.combination;
      var tab = this.tabInfo;
      var dataSources = [];
      com.dataSources.forEach(src => {
        dataSources.push(
          {
            data_source_division: src.dataSourceDivision,
            segment_id: [].concat(src.segmentId),
            merged_keyword: src.mergedKeyword,
            data_source_keywords: [].concat(src.dataSourceKeywords),
            signal_data: [].concat(src.signalData),
            get_month: src.getMonth,
          }
        );
      });
      var req = {
        data_sources: dataSources,
        department_cd: com.departmentCd,
        template_id: com.templateId,
        category_id: ((category) ? category.categoryId : null),
        search_string: tab.searchString,
        sort_criteria: tab.sortCriteria,
        sort_key: tab.sortKey,
      };
      return req;
    },
    /**
     * API要求を生成
     * @param category どのカテゴリーに関するAPI要求か
     * @returns API要求（JSONオブジェクト）
     */
    createWebscoreRequest() {
      var req = {
        start_date: this.$store.state.startDate,
        end_date: this.$store.state.endDate,
        signal_data: this.$store.state.signalDatas,
      };
      return req;
    },
    /**
     * グラフ用データを生成
     * @param legends 凡例
     * @param items キーワードごとのデータ群の配列
     * @param labels キーワードの配列
     * @returns {{datasets: [], labels: *}}
     */
    createChartData: function (legends, items, labels) {
      var datasets = [];
      legends.forEach((legend, i) => {
        var data = [];
        var color = [];
        var border = [];
        items.forEach((item, j) => {
          data.push(item.score[i]);
          if (this.params.graphType == "Circle") {
            color.push(this.graphColorsCircle[j % 10]);
            border.push("#A0A0A0");
          } else {
            color = this.graphColors[i % 10];
            border = color;
          }
        });
        datasets.push({
          label: legend,
          fill: (this.params.graphType != "Line"),
          lineTension: 0,
          data: data,
          backgroundColor: color,
          borderColor: border,
          borderWidth: 1,
        });
      });
      return {
        labels: labels,
        datasets: datasets,
      };
    },
    /**
     * グラフ用データを生成
     * @param legends 凡例
     * @param items キーワードごとのデータ群の配列
     * @param labels キーワードの配列
     * @returns {{datasets: [], labels: *}}
     */
    createChartWebscoreData: function (legends, items, labels) {
      var datasets = [];
      var data = [];
      var color = [];
      var border = [];
      items.forEach((item, j) => {
        data.push(item.score[0]);
        if (this.params.graphType == "Circle") {
          color.push(this.graphColorsCircle[j % 10]);
          border.push("#A0A0A0");
        } else {
          color = this.graphColors[0 % 10];
          border = color;
        }
      });
      datasets.push({
        label: legends[0],
        fill: (this.params.graphType != "Line"),
        lineTension: 0,
        data: data,
        backgroundColor: color,
        borderColor: border,
        borderWidth: 1,
      });
      return {
        labels: labels,
        datasets: datasets,
      };
    },
  },
}
