/* jshint unused:false */

import Vuex from 'vuex'
import Vue from 'vue'
import createPersistedState from 'vuex-persistedstate'

import language from './modules/x_language.js'
import message from './modules/x_message.js'
import * as constants from './constants/constants'

// console.log
let isDebug = false;

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    const: constants,
    userName: "",
    departmentCd: "",
    combinations: [],
    tabs: [],
    signalDatas: [],
    activeTabIndex: -1,
    activeTabIndexPre: -1,
    tabSetSeqMax: 0,
    startDate: "",
    endDate: "",
    tempDataSource: {
      keyword: {
        selectedJson: "",
        selectedCount: 0,
        target: []
      },
      segment: {
        selectedJson: "",
        selectedCount: 0,
        target: []
      }
    },
  },
  getters: {
    tabMaxHasReached: function (state) {
      return (state.const.TAB_MAX <= state.tabs.length);
    },
  },
  mutations: {
    setUserName(state, val) {
      state.userName = val;
    },
    setDepartmentCd(state, val) {
      state.departmentCd = val;
    },
    setTempDataSource(state, combination) {
      if (isDebug) console.log("store.js | mutations | setTempDataSource | START");
      state.tempDataSource[combination.ds] = {
        selectedJson: combination.json,
        selectedCount: combination.cnt,
        target: combination.target
      };
      if (isDebug) console.log("store.js | mutations | setTempDataSource | END");
    },
    setTempDataSourceWithComId(state) {
      let combinationId = state.tabs[state.activeTabIndex].combinationId;
      let temp = state.combinations.find(c => (c.combinationId == combinationId)).tempDataSource;
    },
    clearTempDataSource(state) {
      state.tempDataSource = {
        keyword: {
          selectedJson: "",
          selectedCount: 0,
          target: []
        },
        segment: {
          selectedJson: "",
          selectedCount: 0,
          target: []
        }
      };
    },
    addCombination(state, combination) {
      if (isDebug) console.log("store.js | mutations | addCombination | START");
      state.combinations.push(combination);
      if (isDebug) console.log("store.js | mutations | addCombination |   END");
    },
    addTab(state, tabInfo) {
      if (isDebug) console.log("store.js | mutations | addTab | START");
      tabInfo.isLoaded = false;
      if (tabInfo.tabType == "CategoryList" || tabInfo.tabType == "WebscoreGraph" || tabInfo.tabType == "TimeSeriesAnalysisGraph") {
        state.tabSetSeqMax++;
        tabInfo.tabSetSeq = state.tabSetSeqMax;
      }
      state.tabs.push(tabInfo);
      state.activeTabIndexPre = state.activeTabIndex;
      state.activeTabIndex = state.tabs.length - 1;
      if (isDebug) console.log("store.js | mutations | addTab |   END");
    },
    removeTab(state, tabId) {
      if (isDebug) console.log("store.js | mutations | removeTab | START tabId = " + tabId);
      if (state.tabs.length <= 0) {
        state.activeTabIndexPre = -1;
        state.activeTabIndex = -1;
        return;
      }
      var actIdx = state.activeTabIndex;
      var delIdx = state.tabs.findIndex(info => (info.tabId == tabId))
      if (isDebug) console.log("removeTab act=" + actIdx + ", del=" + delIdx);
      if (delIdx < 0) return;
      state.tabs.splice(delIdx, 1);
      var cnt = state.tabs.length;
      if (cnt <= 0) {
        state.activeTabIndexPre = -1;
        state.activeTabIndex = -1;
        return;
      }
      var newIdx;
      if ((0 <= actIdx) && (actIdx < cnt)) {
        if (delIdx < actIdx) {
          newIdx = actIdx - 1;
        } else {
          newIdx = actIdx;
        }
      } else {
        newIdx = cnt - 1;
      }
      state.activeTabIndexPre = actIdx;
      state.activeTabIndex = newIdx;
      if (isDebug) console.log("store.js | mutations | removeTab |   END");
    },
    clearTabs(state) {
      if (isDebug) console.log("store.js | mutations | clearTabs | START");
      state.tabs.splice(0);
      state.activeTabIndexPre = -1;
      state.activeTabIndex = -1;
      if (isDebug) console.log("store.js | mutations | clearTabs |   END");
    },
    setActiveTabIndex(state, index) {
      if (isDebug) console.log("store.js | mutations | setActiveTabIndex | START");
      if (index == state.activeTabIndex) return;
      state.activeTabIndexPre = state.activeTabIndex;
      state.activeTabIndex = index;
      if (isDebug) console.log("store.js | mutations | setActiveTabIndex |   END");
    },
    setTabLoaded(state, tabId) {
      if (isDebug) console.log("store.js | mutations | setTabLoaded | START");
      var tab = state.tabs.find(tab => (tab.tabId == tabId));
      tab.isLoaded = true;
      if (isDebug) console.log("store.js | mutations | setTabLoaded |   END");
    },
    clearSignalDatas(state) {
      if (isDebug) console.log("store.js | mutations | clearSignalDatas | START");
      state.signalDatas.splice(0);
      if (isDebug) console.log("store.js | mutations | clearSignalDatas |   END");
    },
    addSignalData(state, params) {
      if (isDebug) console.log("store.js | mutations | addSignalData | START");
      state.signalDatas.push(params);
      if (isDebug) console.log("store.js | mutations | addSignalData |   END");
    },
    setPeriod(state, params) {
      if (isDebug) console.log("store.js | mutations | setPeriod | START");
      state.startDate = params.startDate;
      state.endDate = params.endDate;
      if (isDebug) console.log("store.js | mutations | setPeriod |   END");
    },
    // replaceDataSourceKeyword(state, params) {
    //   if (isDebug) console.log("store.js | mutations | replaceDataSourceKeyword | START");
    //   state.combinations.find(c => (c.combinationId == params.combinationId)).dataSourceKeyword = params.dataSourceKeyword;
    //   if (isDebug) console.log("store.js | mutations | replaceDataSourceKeyword |   END");
    // },
    replaceFilter(state, params) {
      if (isDebug) console.log("store.js | mutations | replaceFilter | START");
      var info = state.tabs.find(info => (info.tabId == params.tabId));
      info.searchString = params.searchString;
      info.sortCriteria = params.sortCriteria;
      info.sortKey = params.sortKey;
      info.isLoaded = params.isLoaded;
      if (isDebug) console.log("store.js | mutations | replaceFilter |   END");
    },
    replaceCategories(state, params) {
      if (isDebug) console.log("store.js | mutations | replaceCategories | START");
      var tabInfo = state.tabs.find(t => (t.tabId == params.tabId));
      tabInfo.dataSourceKeyword = params.dataSourceKeyword;
      tabInfo.categories = params.categories;
      if (isDebug) console.log("store.js | mutations | replaceCategories |   END");
    },
    replaceCategory(state, params) {
      if (isDebug) console.log("store.js | mutations | replaceCategory | START");
      var tabInfo = state.tabs.find(t => (t.tabId == params.tabId));
      tabInfo.categories[params.categoryIndex] = params.category;
      if (isDebug) console.log("store.js | mutations | replaceCategory |   END");
    },
    updateTab(state, params) {
      if (isDebug) console.log("store.js | mutations | updateTab | START");
      var tab = state.tabs.find(tab => tab.tabId == params.tabId);
      Object.assign(tab, params);
      if (isDebug) console.log("store.js | mutations | updateTab |   END");
    },
  },
  actions: {},
  strict: process.env.NODE_ENV !== 'production',
  plugins: [createPersistedState({storage: window.sessionStorage})],
  modules: {
    language,
    message
  }
})
