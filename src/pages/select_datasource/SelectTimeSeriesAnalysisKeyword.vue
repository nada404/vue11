<template>
  <div class="no-select">
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <!-- 読込画面 END -->
    <!-- 検索期間 -->
    <div class="analysis-period" aligh="right" style="display: inline">
      <label>{{_L.SEARCH_PERIOD}}</label>
      <select name="period-start">
      </select>
      <label>~</label>
      <select name="period-end">
      </select>
    </div>
    <br/>
    <br/>
    <div class="select-ds-container">
      <div class="select-ds-list area-left">
        <div class="select-ds-list-ttl">
          <p class="search-keyword-label">{{_L.DS_SEARCH_RESULT}}</p>
          <p class="search-keyword-input">
            <input v-model="searchKeyword" :placeholder="_L.DS_SEARCH_PLACEHOLDER" @keyup.enter="search">
            <img class="search-keyword-icon" src="@/static2/images/icon_search.png" @click="search">
          </p>
        </div>
        <div class="area-list-container">
          <ListKeyword :set="result" :is-result="true">
            <template v-slot:listMessage>
              <p v-if="countResult() === 0">{{_L.DS_MSG_NO_RESULT}}</p>
            </template>
          </ListKeyword>
        </div>
      </div>
      <div class="select-ds-middle">
        <p class="area-btn no-select add" @click="add">{{">"}}</p>
        <p class="area-btn no-select delete" @click="remove">{{"<"}}</p>
      </div>
      <div class="select-ds-list area-right">
        <div class="select-ds-list-ttl">
          <p class="selected-ttl">{{_L.DS_SELECTED}}</p>
        </div>
        <div class="area-list-container">
          <ListKeyword :set="selected" :is-result="false">
            <template v-slot:listMessage>
              <p v-if="countSelected() === 0">{{_L.DS_MSG_NO_SELECTED}}</p>
            </template>
          </ListKeyword>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import axios from "axios";
  import globals from '@/static2/mixins/globals';
  import ListKeyword from "./ListKeyword";

  export default {
    name: 'SelectTimeSeriesAnalysisKeyword',
    mixins: [globals,],
    components: {ListKeyword,},
    data: function () {
      return {
        page_ready_flg: false,
        searchKeyword: "", // 検索キーワード
        result: {  // 検索結果キーワード
          toggle_status: [], // 開閉状態
          list: [],
          past_list: [], // (過去)
          checked_keyword: [], // チェック状態:検索結果キーワード
          checked_past_keyword: [], // チェック状態:検索結果キーワード(過去)
        },
        selected: {  // 選択済みデータソース
          toggle_status: [], // 開閉状態
          list: [],
          past_list: [],
          checked_keyword: [],
          checked_past_keyword: [],
        },
        mapDatasource: new Map(),
      }
    },
    mounted() {
      this.mapDatasource = new Map();
      this.init();
      // this.apiGetDatasource();
      this.page_ready_flg = true;
    },
    methods: {
      /* store */
      init: function () {
        let temp = this.$store.state.tempDataSource.keyword;
        let beforeSelected = temp.selectedCount;
        if (beforeSelected > 0) {
          let json = JSON.parse(JSON.stringify(temp.selectedJson));
          this.selected.list = json.list;
          this.selected.past_list = json.past_list;
          // 初期表示時にAPIを呼ばないので、mapDatasourceを保持しなす必要がある
          for (let i = 0; i < temp.target.length; i++) {
            this.mapDatasource.set(this.getDatasourceKey(temp.target[i]), temp.target[i]);
          }
        } else {
          this.selected.list = [];
          this.selected.past_list = [];
        }
      },
      saveSelected: function () {
        let keys = [];
        this.findObj(keys, this.selected.list, '_key');
        this.findObj(keys, this.selected.past_list, '_key');

        let target = keys.map(key => this.mapDatasource.get(key));
        this.$store.commit('setTempDataSource', {
          ds: 'keyword',
          json: JSON.parse(JSON.stringify(this.selected)),
          cnt: target.filter(Boolean).length,
          target: target.filter(Boolean)
        })
                
        this.$store.commit('clearSignalDatas');;
        for (let i = 0; i < keys.length; i++) {
          let signalData = this.mapDatasource.get(keys[i]).signalData[0];
          this.$store.commit('addSignalData', signalData);
        }
        
        let startDate = document.getElementsByName('period-start')[0].value;
        let endDate = document.getElementsByName('period-end')[0].value;
       
        this.$store.commit('setPeriod', {
          startDate: startDate,
          endDate: endDate
        });
      },
      /* API: COM-003 */
      async apiGetDatasource() {
        await this.readyFlg(false);
        if (this.host_name) {
          await axios({
            method: 'get',
            headers: this.getTokenHeaders(),
            url: this.host_name + '/app/table_list/keyword_search/',
            // url: 'https://g9340cyuz6.execute-api.ap-northeast-1.amazonaws.com/sqtest1/get-com003/',
            params: {
              search_string: this.searchKeyword
            }
          }).then(response => {
            this.check_login(response);
            (async () => {
              await this.setResponse(response);
            })();
          }).catch(error => {
            this.raiseSystemError(error);
          });
        } else {
          let response;
          if (this.searchKeyword.length == 2) {
            response = require('@/test/com003_filter.json');
          } else {
            response = require('@/test/com003.json');
          }
          await this.setResponse(response);
        }
        await this.readyFlg(true);
      },

      async setResponse(response) {
        this.check_status(response);
        this.check_error(response);

        // 初期表示時のみ
        // let initFlg = (this.mapDatasource.size == 0);
        let initFlg = true;

        // キーワード設定
        let res = response.data.keywords;
        this.result.list = [];
        if (res !== undefined) {
          for (let i = 0; i < res.length; i++) {
            let keyword = res[i].keyword;
            this.result.list.push({
              '_label': keyword,
              '_key': keyword
            });
            if (initFlg) {
              this.mapDatasource.set(keyword, {
                'dataSourceDivision': 1,
                'dataSourceKeywords': [keyword],
                'signalData': [res[i].signal_data],
                'getMonth': ""
              });
            }
          }
        }

        // 過去キーワード設定
        let res2 = response.data.search_historys;
        this.result.past_list = [];
        if (res2 !== undefined) {
          for (let i = 0; i < res2.length; i++) {
            let folder, dsList;
            folder = res2[i].data_source_keywords[0];
            dsList = [folder];
            let _keys = [];
            let data = res2[i].get_month;
            for (let j = 0; j < data.length; j++) {
              let id = data[j] + "_" + folder;
              _keys.push({
                '_label': data[j],
                '_key': id
              });
              if (initFlg) {
                this.mapDatasource.set(id, {
                  'dataSourceDivision': 1,
                  // 'segmentId', null
                  'mergedKeyword': folder,
                  'dataSourceKeywords': dsList,
                  'signalData': [],
                  'getMonth': data[j]
                });
              }
            }
            this.result.past_list.push({
              '_child': _keys,
              '_is_merge': false,
              '_folder': folder,
              '_ds_list': dsList
            });
          }
        }
      },

      /* ページ読込中のフラグ */
      readyFlg: function (status) {
        this.page_ready_flg = status;
      },

      /* 内部 method */
      countResult: function () {
        return this.result.list.length
          + this.result.past_list.length;
      },
      countSelected: function () {
        return this.selected.list.length
          + this.selected.past_list.length;
      },
      /* 検索 */
      search: function () {
        // 検索キーワード必須チェック
        let minLength = this.$store.state.const.VALIDATE.DATASOURCE.KEYWORD.MIN_LENGTH;
        let trimSearchKey = this.searchKeyword.trim();
        if (trimSearchKey.length < minLength) {
          this.$emit("message", this.format(this._L.DS_ERR_SEARCH_MIN, minLength));
          return;
        }
        // 検索キーワードMAX桁数チェック
        let maxLength = this.$store.state.const.VALIDATE.DATASOURCE.KEYWORD.MAX_LENGTH;
        if (this.searchKeyword.length > maxLength) {
          this.$emit("message", this.format(this._L.DS_ERR_SEARCH_MAX, maxLength));
          return;
        }
        // チェック状態初期化
        this.result.checked_keyword = [];
        this.result.checked_past_keyword = [];
        // 検索
        this.apiGetDatasource();
      },
      /* 追加ボタン押下時 */
      add: function () {
        if (this.result.checked_keyword.length == 0
          && this.result.checked_past_keyword.length == 0) {
          this.$emit("message", this._L.DS_ERR_ADD_REQUIRE);
          return;
        }
        // キーワードの場合
        if (this.result.checked_keyword.length > 0) {
          for (let i = 0; i < this.result.list.length; i++) {
            let data = this.result.list[i];
            if (this.result.checked_keyword.includes(data._key)) {
              if (this.selected.list.some((l) => l._key == [data._key])) {
                // すでに選択済みのキーワードをチェックしている場合はエラー
                this.$emit("message", this._L.DS_ERR_ADD_DUPLICATE);
              } else {
                this.selected.list.push(data);
              }
            }
          }
        }
        // 過去キーワードの場合
        if (this.result.checked_past_keyword.length > 0) {
          for (let i = 0; i < this.result.past_list.length; i++) {
            let info = this.result.past_list[i];
            for (let ii = 0; ii < info._child.length; ii++) {
              let data = info._child[ii];
              if (this.result.checked_past_keyword.includes(data._key)) {
                let matchIndex = this.selected.past_list.findIndex((l) => l._folder == info._folder);
                if (matchIndex == -1) {
                  let cloneInfo = this.newObj(info);
                  cloneInfo._child = [data];
                  this.selected.past_list.push(cloneInfo);
                } else {
                  if (this.selected.past_list[matchIndex]._child.some((l) => l._key == data._key)) {
                    // すでに選択済みのキーワードをチェックしている場合はエラー
                    this.$emit("message", this._L.DS_ERR_ADD_DUPLICATE);
                  } else {
                    this.selected.past_list[matchIndex]._child.push(this.newObj(data));
                  }
                }
              }
            }
          }
        }
        this.saveSelected();  // 選択情報をstoreに保持
      },
      /* 削除ボタン押下時 */
      remove: function () {
        if (this.selected.checked_keyword.length == 0
          && this.selected.checked_past_keyword.length == 0) {
          // チェックなしの場合エラー
          this.$emit("message", this._L.DS_ERR_DEL_REQUIRE);
          return;
        }

        // キーワードの場合
        if (this.selected.checked_keyword.length > 0) {
          let deletedList = [];
          for (let i = 0; i < this.selected.list.length; i++) {
            if (!this.selected.checked_keyword.includes(this.selected.list[i]._key)) {
              deletedList.push(this.newObj(this.selected.list[i]));
            }
          }
          this.selected.list = deletedList;
        }

        // 過去キーワードの場合
        if (this.selected.checked_past_keyword.length > 0) {
          let deletedPastList = [];
          for (let i = 0; i < this.selected.past_list.length; i++) {
            let info = this.selected.past_list[i];
            let deletedChild = [];
            for (let ii = 0; ii < info._child.length; ii++) {
              let data = info._child[ii];
              if (!this.selected.checked_past_keyword.includes(data._key)) {
                deletedChild.push(this.newObj(data));
              }
            }
            if (deletedChild.length > 0) {
              let cloneInfo = this.newObj(info);
              cloneInfo._child = this.newObj(deletedChild);
              deletedPastList.push(cloneInfo);
            }
          }
          this.selected.past_list = deletedPastList;
        }

        // チェック状態は初期化
        this.selected.checked_keyword = [];
        this.selected.checked_past_keyword = [];

        this.saveSelected();  // 選択情報をstoreに保持
      },
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style scoped>
</style>
