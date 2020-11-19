<template>
  <div class="no-select">
    <!-- 読込画面 START -->
    <div class="fix-spinner" v-if="!page_ready_flg">
      <font-awesome-icon class="spinner" :icon="['fa', 'spinner']"/>
      <span class="loading-text">Loading...</span>
    </div>
    <!-- 読込画面 END -->
    <div class="select-ds-container" v-show="page_ready_flg">
      <div class="select-ds-list area-left">
        <div class="select-ds-list-ttl">
          <p class="search-keyword-label">{{_L.DS_SEARCH_RESULT}}</p>
          <p class="search-keyword-input">
            <input v-model="searchKeyword" :placeholder="_L.DS_SEARCH_PLACEHOLDER" @keyup.enter="search">
            <img class="search-keyword-icon" src="@/static2/images/icon_search.png" @click="search">
          </p>
        </div>
        <div class="area-list-container">
          <ListSegment :set="result" :is-result="true">
            <template v-slot:listMessage>
              <p v-if="countResult() === 0">{{_L.DS_MSG_NO_RESULT}}</p>
            </template>
          </ListSegment>
        </div>
      </div>
      <div class="select-ds-middle">
        <p class="area-btn no-select add" @click="add">{{">"}}</p>
        <p class="area-btn no-select delete" @click="remove">{{"<"}}</p>
        <p class="area-btn no-select merge" @click="show">
          <img class="merge-icon" alt="" src="@/static2/images/icon_merge.png">
          <span class="area-btn-label">{{_L.DS_MERGE_BUTTON}}</span>
        </p>
      </div>
      <div class="select-ds-list area-right">
        <div class="select-ds-list-ttl">
          <p class="selected-ttl">{{_L.DS_SELECTED}}</p>
        </div>
        <div class="area-list-container">
          <ListSegment :set="selected" :is-result="false">
            <template v-slot:listMessage>
              <p v-if="countSelected() === 0">{{_L.DS_MSG_NO_SELECTED}}</p>
            </template>
          </ListSegment>
        </div>
      </div>
    </div>
    <MergeModal @close="hide" @addMerge="addMerge" :modal-name="modalName"/>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import axios from "axios";
  import globals from '@/static2/mixins/globals';
  import ListSegment from "./ListSegment";
  import MergeModal from "./MergeModal";

  export default {
    name: 'SelectDatasourceSegment',
    mixins: [globals,],
    components: {ListSegment, MergeModal},
    data: function () {
      return {
        page_ready_flg: false,
        modalName: "merge_modal_segment",
        searchKeyword: "", // 検索キーワード
        result: {  // 検索結果セグメント
          toggle_status: [], // 開閉状態
          list: [],
          past_list: [], // (過去)
          checked_keyword: [], // チェック状態:検索結果セグメント
          checked_past_keyword: [], // チェック状態:検索結果セグメント(過去)
        },
        selected: {  // 選択済みデータソース
          toggle_status: [], // 開閉状態
          list: [],
          past_list: [],
          merged_list: [],
          checked_keyword: [],
          checked_past_keyword: [],
          checked_merged_keyword: [],
        },
        mapHierarchy: new Map(),
        mapDatasource: new Map(),
      }
    },
    mounted() {
      this.init();
      this.mapDatasource = new Map();
      this.mapHierarchy = new Map();
      // this.apiGetDatasource();
      this.page_ready_flg = true;
    },
    methods: {
      /* store */
      init: function () {
        let temp = this.$store.state.tempDataSource.segment;
        let beforeSelected = temp.selectedCount;
        if (beforeSelected > 0) {
          let json = JSON.parse(JSON.stringify(temp.selectedJson));
          this.selected.list = json.list;
          this.selected.past_list = json.past_list;
          this.selected.merged_list = json.merged_list;
        } else {
          this.selected.list = [];
          this.selected.past_list = [];
          this.selected.merged_list = [];
        }
      },
      saveSelected: function () {
        let keys = [];
        this.findObj(keys, this.selected.list, '_key');
        this.findObj(keys, this.selected.past_list, '_key');
        let target = keys.map(key => this.mapDatasource.get(key));
        let mergeTarget = this.selected.merged_list.map(key => key._datasource);
        target = target.concat(mergeTarget);
        this.$store.commit('setTempDataSource', {
          ds: 'segment',
          json: JSON.parse(JSON.stringify(this.selected)),
          cnt: target.filter(Boolean).length,
          target: target.filter(Boolean)
        });
      },
      /* API: COM-001 */
      async apiGetDatasource() {
        await this.readyFlg(false);
        if (this.host_name) {
          await axios({
            method: 'get',
            headers: this.getTokenHeaders(),
            url: this.host_name + '/app/table_list/get_segment/',
            // url: 'https://g9340cyuz6.execute-api.ap-northeast-1.amazonaws.com/sqtest1/get-com001/',
            params: {
              search_string: this.searchKeyword,
              department_cd: this.$store.state.departmentCd
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
          if (this.searchKeyword == "") {
            response = require('@/test/com001.json');
          } else {
            response = require('@/test/com001_filter.json');
          }
          await this.setResponse(response);
        }
        await this.readyFlg(true);
      },
      /* セグメントの階層を取得する循環関数 */
      getHierarchy: function (initFlg, h) {
        let res = [];
        for (let i = 0; i < h.length; i++) {
          let folder = h[i].hierarchy_name;
          let hierarchy = [];
          if (h[i].hierarchy === undefined || h[i].hierarchy.length == 0) {
            // 階層終わり
          } else {
            // 階層続く
            hierarchy = this.getHierarchy(initFlg, h[i].hierarchy);
          }
          let _keys = [];
          if (h[i].segment_set === undefined || h[i].segment_set.length == 0) {
            // データなし
          } else {
            // データあり
            for (let j = 0; j < h[i].segment_set.length; j++) {
              let segment = h[i].segment_set[j];
              let id = segment.segment_id;
              let label = segment.segment_name;
              let signal = segment.signal_data;
              _keys.push({
                '_label': label,
                '_key': id
              });
              if (initFlg) {
                this.mapDatasource.set(id, {
                  'dataSourceDivision': 2,
                  'segmentId': [id],
                  'mergedKeyword': label,
                  'dataSourceKeywords': [label],
                  'signalData': [signal],
                  'getMonth': ""
                });
              }
            }
          }
          res.push({
            '_folder': folder,
            '_child': _keys,
            '_hierarchy': hierarchy
          });
        }
        return res;
      },
      /* 過去セグメントの階層を取得する循環関数 */
      getPastHierarchy: function (initFlg, h, res) {
        for (let i = 0; i < h.length; i++) {
          let hierarchy = [];
          if (h[i].hierarchy === undefined || h[i].hierarchy.length == 0) {
            // 階層終わり
          } else {
            // 階層続く
            hierarchy = this.getHierarchy(initFlg, h[i].hierarchy);
          }
          let _keys = [];
          if (h[i].segment_set === undefined || h[i].segment_set.length == 0) {
            // データなし
          } else {
            // データあり
            for (let j = 0; j < h[i].segment_set.length; j++) {
              let segment = h[i].segment_set[j];
              let isMerge, folder, segmentId, dsList;
              if (segment.merged_name === undefined || segment.merged_name.length == 0) {
                isMerge = false;
                folder = segment.segment_name[0];
                segmentId = [segment.segment_id[0]];
                dsList = [segment.segment_name[0]];
              } else {
                isMerge = true;
                folder = segment.merged_name;
                segmentId = segment.segment_id;
                dsList = segment.segment_name;
              }
              let _keys = [];
              let data = segment.get_month;
              for (let k = 0; k < data.length; k++) {
                let id = data[k] + "_" + folder;
                _keys.push({
                  '_label': data[k],
                  '_key': id
                });
                if (initFlg) {
                  this.mapDatasource.set(id, {
                    'dataSourceDivision': 2,
                    'segmentId': segmentId,
                    'mergedKeyword': folder,
                    'dataSourceKeywords': dsList,
                    'signalData': [],
                    'getMonth': data[k]
                  });
                }
              }
              res.push({
                '_child': _keys,
                '_is_merge': isMerge,
                '_folder': folder,
                '_ds_list': dsList
              });
            }
          }
        }
        return res;
      },
      joinHierarchyInfo: function () {
        // 階層情報を結合したセグメント情報Mapを作成する
        let symbol = '>';
        return this.doJoinHierarchyInfo(
          this.newObj(this.result.list),
          new Map(),
          null,
          symbol,
          new Map());
      },
      /**
       * 階層情報を結合したセグメント情報Mapを作成するための循環関数
       * @param h  検索対象Object
       * @param tempMap 循環関数内で検索した値を保持するためだけに持ちまわるMap
       * @param parentKey 親キー('_'で結合したインデックス)
       * @param symbol セグメント階層情報を結合する記号
       * @param resMap 返却用Map
       */
      doJoinHierarchyInfo: function (h, tempMap, parentKey, symbol, resMap) {
        for (let i = 0; i < h.length; i++) {
          let setKey = (parentKey == null) ? i : parentKey + "_" + i;
          let fName = h[i]._folder;
          if (tempMap.has(parentKey)) {
            let arr = tempMap.get(parentKey);
            arr.push(fName);
            tempMap.set(setKey, arr);
          } else {
            tempMap.set(setKey, [fName]);
          }
          if (h[i]._child !== undefined || h[i]._child.length > 0) {
            for (let j = 0; j < h[i]._child.length; j++) {
              let label = h[i]._child[j]._label;
              let hierarchy = tempMap.get(setKey).join(symbol);
              resMap.set(label, hierarchy + symbol + label)
            }
          }
          if (h[i]._hierarchy != undefined || h[i]._hierarchy.length > 0) {
            this.doJoinHierarchyInfo(h[i]._hierarchy, tempMap, setKey, symbol, resMap);
          }
        }
        return resMap;
      },

      async setResponse(response) {
        this.check_status(response);
        this.check_error(response);

        // 初期表示時のみ
        let initFlg = (this.mapDatasource.size == 0);

        // セグメント設定
        this.result.list = [];
        let res = response.data.hierarchy;
        if (res !== undefined) {
          this.result.list = this.getHierarchy(initFlg, res);
        }

        // 過去セグメント設定
        this.result.past_list = [];
        let res2 = response.data.past_hierarchy;
        if (res2 !== undefined) {
          this.result.past_list = this.getPastHierarchy(initFlg, res2, []);
        }

        // 過去セグメントの階層情報設定
        this.mapHierarchy = this.joinHierarchyInfo();
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
          + this.selected.past_list.length
          + this.selected.merged_list.length;
      },
      // セグメント名に階層情報を付加して返却
      matchHierarchyInfo: function (segmentArray) {
        let res = [];
        for (let i = 0; i < segmentArray.length; i++) {
          let segment = segmentArray[i];
          res.push(this.mapHierarchy.has(segment) ? this.mapHierarchy.get(segment) : segment);
        }
        return res;
      },
      /* 検索 */
      search: function () {
        // 検索キーワード桁数チェック
        let maxLength = this.$store.state.const.VALIDATE.DATASOURCE.SEGMENT.MAX_LENGTH;
        if (this.searchKeyword.length > maxLength) {
          this.$emit("message", this.format(this._L.DS_ERR_SEARCH_MAX, maxLength));
          return;
        }
        // チェック状態初期化
        this.result.checked_keyword = [];
        this.result.checked_past_keyword = [];
        this.result.checked_merged_keyword = [];
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
        // セグメントの場合
        if (this.result.checked_keyword.length > 0) {
          // 階層情報が可変なセグメントを追加
          this.doAdd(this.selected.list, this.result.list, this.result.checked_keyword);
          // セグメントを含まない階層が追加されている場合は削除
          this.removeEmptyFolder(this.selected.list)
          // 変数に変更が入ったことを知らせて、選択済みデータソースエリアを再描画
          this.selected.list = this.newObj(this.selected.list);
        }
        // 過去セグメントの場合
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
      /**
       * result->selected チェックを入れたセグメントと階層情報を追加する循環関数
       * @param target  selected.list
       * @param result  result.list
       * @param checked result.checked_keyword
       */
      doAdd: function (target, result, checked) {
        for (let i = 0; i < result.length; i++) {
          if (target === undefined) {
            target = [];
          }
          let info = result[i];
          if (target[i] === undefined || target[i]._folder != info._folder) {
            target.splice(i, 0, {
              _folder: this.newObj(info._folder)
            });
          }
          if (info._child !== undefined || info._child.length > 0) {
            for (let ii = 0; ii < info._child.length; ii++) {
              let data = info._child[ii];
              if (checked.includes(data._key)) {
                if (target[i]._child === undefined) {
                  target[i]._child = [];
                }
                  if (target[i]._child.some((l) => l._key == data._key)) {
                    // すでに選択済みのセグメントをチェックしている場合はエラー
                    this.$emit("message", this._L.DS_ERR_ADD_DUPLICATE);
                  } else {
                    target[i]._child.push(this.newObj(data));
                  }
              }
            }
          }
          if (info._hierarchy !== undefined || info._hierarchy.length > 0) {
            if (target[i] === undefined) {
              target[i] = {
                _folder: this.newObj(info._folder),
                _hierarchy: []
              };
            } else if (target[i]._hierarchy === undefined) {
              target[i]._hierarchy = [];
            }
            this.doAdd(target[i]._hierarchy, info._hierarchy, checked);
          } else {
            continue;
          }
        }
      },
      /**
       * 引数の配列から空の階層情報を削除
       */
      removeEmptyFolder: function (target) {
        let isDelete = false;
        do {
          isDelete = false;
          isDelete = this.doRemoveEmptyFolder(target, isDelete);
        } while (isDelete);
      },
      doRemoveEmptyFolder: function (target, isDelete) {
        for (let i = 0; i < target.length; i++) {
          if (target[i]._hierarchy === undefined || target[i]._hierarchy.length == 0) {
            if (JSON.stringify(target[i]).indexOf("\"_child\"") < 0) {
              target.splice(i, 1);
              isDelete = true;
            }
          } else {
            if (JSON.stringify(target[i]).indexOf("\"_child\"") < 0) {
              target.splice(i, 1);
              isDelete = true;
            } else {
              this.doRemoveEmptyFolder(target[i]._hierarchy, isDelete);
            }
          }
        }
        return isDelete;
      },
      /* 削除ボタン押下時 */
      remove: function () {
        if (this.selected.checked_keyword.length == 0
          && this.selected.checked_past_keyword.length == 0
          && this.selected.checked_merged_keyword.length == 0) {
          // チェックなしの場合エラー
          this.$emit("message", this._L.DS_ERR_DEL_REQUIRE);
          return;
        }

        // セグメントの場合
        if (this.selected.checked_keyword.length > 0) {
          // 階層情報が可変なセグメントを追加
          this.doRemove(this.selected.list, this.selected.checked_keyword);
          // セグメントを含まない階層が追加されている場合は削除
          this.removeEmptyFolder(this.selected.list)
          // 変数に変更が入ったことを知らせて、選択済みデータソースエリアを再描画
          this.selected.list = this.newObj(this.selected.list);
        }

        // 過去セグメントの場合
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

        // マージ済みセグメントの場合
        if (this.selected.checked_merged_keyword.length > 0) {
          let selected_merged_list = [];
          for (let i = 0; i < this.selected.merged_list.length; i++) {
            let info = this.selected.merged_list[i];
            if (!this.selected.checked_merged_keyword.includes(info.merged_keyword)) {
              selected_merged_list.push(this.newObj(info));
            }
          }
          this.selected.merged_list = selected_merged_list;
        }

        // チェック状態は初期化
        this.selected.checked_keyword = [];
        this.selected.checked_past_keyword = [];
        this.selected.checked_merged_keyword = [];

        this.saveSelected();  // 選択情報をstoreに保持
      },
      /**
       * result<-selected チェックを入れたセグメントと階層情報を削除する循環関数
       * @param target  selected.list
       * @param checked result.checked_keyword
       */
      doRemove: function (target, checked) {
        for (let i = 0; i < target.length; i++) {
          if (target[i]._child !== undefined) {
            target[i]._child = target[i]._child.filter(d => !checked.includes(d._key))
            if (target[i]._child.length == 0) {
              delete target[i]._child
            }
          }
          if (target[i]._hierarchy !== undefined || target[i]._hierarchy.length > 0) {
            this.doRemove(target[i]._hierarchy, checked);
          } else {
            continue;
          }
        }
      },
      /* マージモーダル制御 */
      /* マージボタン押下時 */
      show: function () {
        if (this.selected.checked_past_keyword.length > 0) {
          // 過去セグメントはマージ不可
          this.$emit("message", this._L.DS_ERR_MERGE_PAST);
          return;
        } else if (this.selected.checked_keyword.length < 2) {
          // 最低チェック数
          this.$emit("message", this._L.DS_ERR_MERGE_REQUIRE);
          return;
        }
        this.mergeName = "";
        this.$modal.show(this.modalName);
      },
      /* マージモーダル閉じる */
      hide: function () {
        this.$modal.hide(this.modalName);
      },
      /* マージ実行 */
      addMerge: function (mergeName) {
        this.hide();
        let minLength = this.$store.state.const.VALIDATE.DATASOURCE.MERGE_NAME.MIN_LENGTH;
        if (this.selected.merged_list.some((l) => l.merged_keyword == [mergeName])){
          // 同じマージ名は入力不可
          this.$emit("message", this._L.DS_ERR_MERGE_DUPLICATE);
        } else if (mergeName.length < minLength) {
          this.$emit("message", this.format(this._L.DS_ERR_SEARCH_MIN, minLength));
        } else {
          // マージ名が存在するかチェックし、存在しない場合のみマージ実行
          this.readyFlg(false);
          if (this.host_name) {
            axios({
              method: 'get',
              headers: this.getTokenHeaders(),
              url: this.host_name + '/app/table_list/get_segment/',
              params: {
                search_string: mergeName,
                department_cd: this.$store.state.departmentCd
              }
            }).then(response => {
              this.check_login(response);
              this.check_status(response);
              this.check_error(response);
              let keywords = response.data.keywords;
              if (keywords === undefined || keywords.length == 0 || !this.inKeywords(mergeName, keywords)) {
                this.funcAddMerge(mergeName);
              } else {
                // 重複しているキーワードがあるため、マージ不可
                this.$emit("message", this._L.DS_ERR_MERGE_DUPLICATE);
              }
              this.readyFlg(true);
            }).catch(error => {
              this.raiseSystemError(error);
            });
          } else {
            // ローカルでは返却値が固定値になるため、マージ可
            this.funcAddMerge(mergeName);
            this.readyFlg(true);
          }
        }
      },
      funcAddMerge: function(mergeName) {
        let segments = [];
        this.doAddMerge(segments, this.selected.list, this.selected.checked_keyword);
        let id = segments.map(item => item._key);
        let label = segments.map(item => item._label)
        let signalData = id.map(key => this.mapDatasource.get(key).signalData[0]);
        this.selected.merged_list.push({
          merged_keyword: mergeName,
          data_source_keywords: segments,
          _datasource: {
            'dataSourceDivision': 2,
            'segmentId': id,
            'mergedKeyword': mergeName,
            'dataSourceKeywords': label,
            'signalData': signalData,
            'getMonth': ""
          }
        });
        this.saveSelected();  // 選択情報をstoreに保持
      },
      /**
       * result->merge->selected チェックを入れたセグメント情報を配列化する循環関数
       * @param target  selected.list
       * @param checked result.checked_keyword
       */
      doAddMerge: function (target, result, checked) {
        for (let i = 0; i < result.length; i++) {
          if (result[i]._child !== undefined) {
            for (let ii = 0; ii < result[i]._child.length; ii++) {
              let data = result[i]._child[ii];
              if (checked.includes(data._key)) {
                target.push(this.newObj(data))
              }
            }
          }
          if (result[i]._hierarchy !== undefined || result[i]._hierarchy.length > 0) {
            this.doAddMerge(target, result[i]._hierarchy, checked);
          }
        }
      },
      /* マージ解除 */
      releaseMerge: function (targetMergedKeyword) {
        // 追加対象のセグメント配列を作成
        let paramArray = [];
        let addKeywords = this.selected.merged_list.find((l) => l => l.merged_keyword == targetMergedKeyword);
        for (let i = 0; i < addKeywords.data_source_keywords.length; i++) {
          paramArray.push(addKeywords.data_source_keywords[i]._key);
        }

        // マージ元セグメントを追加する（2020/06/11 右側のキーワードをマージする仕様に変更したので、該当処理は不要）
        // this.doAdd(this.selected.list, this.result.list, paramArray);
        // セグメントを含まない階層が追加されている場合は削除
        this.removeEmptyFolder(this.selected.list)
        // 変数に変更が入ったことを知らせて、選択済みデータソースエリアを再描画
        this.selected.list = this.newObj(this.selected.list);

        // マージ後セグメントを削除
        let deletedList = this.selected.merged_list.filter(l => l.merged_keyword != targetMergedKeyword);
        this.selected.merged_list = deletedList;

        this.saveSelected();  // 選択情報をstoreに保持
      },
      /* 重複しているキーワードがあるかどうかをチェック */
      inKeywords: function (mergeName, keywords) {
        return keywords.some(keyword => {
          return keyword.keyword.split(":").some(v => {
            return v.trim() == mergeName;
          });
        })
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
