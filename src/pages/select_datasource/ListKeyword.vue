<template>
  <div class="area-list">
    <slot name="listMessage"></slot>
    <!-- キーワード一覧 -->
    <ul class="list">
      <li class="item-check" v-for="(item, i) in set.list" :key="i">
        <input type="checkbox" :id="setChkId(item._key)" :value="item._key" v-model="set.checked_keyword">
        <label :for="setChkId(item._key)">{{ item._label }}</label>
      </li>
    </ul>
    <!-- 過去キーワード一覧 -->
    <p class="list-title" v-if="set.past_list.length > 0">{{_L.DS_PAST_KEYWORD}}</p>
    <ul class="past-list">
      <li v-for="(item, i) in set.past_list" :key="i">
        <!-- マージなし -->
        <ul class="item-block" v-if="!item._is_merge">
          <p class="toggle" @click="toggle(item._folder)">
            <ComponentsToggle :toggle-flg="isToggle(item._folder)"/>
            {{ item._folder }}
          </p>
          <li class="item-check" v-if="isToggle(item._folder)" v-for="(data, ii) in item._child" :key="ii">
            <input type="checkbox" :id="setChkId(data._key)" :value="data._key" v-model="set.checked_past_keyword">
            <label :for="setChkId(data._key)">{{ data._label }}</label>
          </li>
        </ul>
        <!-- マージあり -->
        <ul class="item-block" v-if="item._is_merge">
          <p class="toggle" @click="toggle(item._folder)">
            <ComponentsToggle :toggle-flg="isToggle(item._folder)"/>
            {{ item._folder }}
          </p>
          <ComponentsMergeInfo :keyword="item._ds_list"/>
          <li class="item-check" v-if="isToggle(item._folder)" v-for="(data, ii) in item._child" :key="ii">
            <input type="checkbox" :id="setChkId(data._key)" :value="data._key" v-model="set.checked_past_keyword">
            <label :for="setChkId(data._key)">{{ data._label }}</label>
          </li>
        </ul>
      </li>
    </ul>
    <!-- マージキーワード一覧 -->
    <ul v-if="!isResult" class="merge-list">
      <li class="item-check" v-for="(item, i) in set.merged_list" :key="i">
        <input type="checkbox" :id="setChkId(item.merged_keyword)" :value="item.merged_keyword" v-model="set.checked_merged_keyword">
        <label :for="setChkId(item.merged_keyword)">{{ item.merged_keyword }}</label>
        <span class="merge-cancel-icon" @click="$parent.releaseMerge(item.merged_keyword)">
          <font-awesome-icon class="icon" :icon="['fas', 'times']" />
        </span>
        <p class="merge-keyword-list">
          <span v-for="data in item.data_source_keywords">{{ data._label }}<br/></span>
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import ComponentsToggle from "./ComponentsToggle";
  import ComponentsMergeInfo from "./ComponentsMergeInfo";

  export default {
    name: "ListKeyword",
    components: {ComponentsToggle, ComponentsMergeInfo},
    props: {
      set: {type: Object, required: true},
      isResult: {type: Boolean, required: true},
    },
    methods: {
      // 検索結果エリアと選択中のデータソースエリアでチェックボックスのIDを異ならせる
      setChkId: function(id) {
        return this.isResult ? id : 'selected_'+id
      },
      // 開閉操作の制御
      isToggle: function (key) {
        return this.set.toggle_status.indexOf(key) >= 0;
      },
      toggle: function (key) {
        if (this.set.toggle_status.indexOf(key) >= 0) {
          this.set.toggle_status = this.set.toggle_status.filter(n => n !== key)
        } else {
          this.set.toggle_status.push(key)
        }
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

  .list,
  .past-list,
  .merge-list {
    margin-bottom: 1em;
  }

  .list:empty,
  .past-list:empty,
  .merge-list:empty {
    margin-bottom: 0;
  }

  .past-list ul li {
    margin-left: 1em;
  }

  .past-list ul li.label {
    margin-left: 2em;
    font-size: small;
  }

  .past-list > li:not(:last-child) {
    margin-bottom: 0.5rem;
  }

</style>
