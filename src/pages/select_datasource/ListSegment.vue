<template>
  <div class="area-list">
    <slot name="listMessage"></slot>
    <!-- セグメント一覧 -->
    <ul class="list">
      <li v-for="(data, i) in set.list">
        <ul class="item-block">
          <!-- 1 -->
          <p class="toggle" @click="toggle(data._folder)">
            <ComponentsToggle :toggle-flg="isToggle(data._folder)"/>
            {{ data._folder }}
          </p>
          <li class="item-check" v-if="isToggle(data._folder)" v-for="child in data._child">
            <input type="checkbox" :id="setChkId(child._key)" :value="child._key" v-model="set.checked_keyword">
            <label :for="setChkId(child._key)">{{ child._label }}</label>
          </li>
          <ul class="item-block" v-if="isToggle(data._folder)" v-for="(data2, i2) in data._hierarchy">
            <!-- 2 -->
            <p class="toggle" v-if="isToggle(data._folder)" @click="toggle(data2._folder)">
              <ComponentsToggle :toggle-flg="isToggle(data2._folder)"/>
              {{ data2._folder }}
            </p>
            <li class="item-check" v-if="isToggle(data2._folder)" v-for="child in data2._child">
              <input type="checkbox" :id="setChkId(child._key)" :value="child._key" v-model="set.checked_keyword">
              <label :for="setChkId(child._key)">{{ child._label }}</label>
            </li>
            <ul class="item-block" v-if="data2._hierarchy.length > 0" v-for="(data3, i3) in data2._hierarchy">
              <!-- 3 -->
              <p class="toggle" v-if="isToggle(data2._folder)" @click="toggle(data3._folder)">
                <ComponentsToggle :toggle-flg="isToggle(data3._folder)"/>
                {{ data3._folder }}
              </p>
              <li class="item-check" v-if="isToggle(data3._folder)" v-for="child in data3._child">
                <input type="checkbox" :id="setChkId(child._key)" :value="child._key" v-model="set.checked_keyword">
                <label :for="setChkId(child._key)">{{ child._label }}</label>
              </li>
              <ul class="item-block" v-if="data3._hierarchy.length > 0" v-for="(data4, i4) in data3._hierarchy">
                <!-- 4 -->
                <p class="toggle" v-if="isToggle(data3._folder)" @click="toggle(data4._folder)">
                  <ComponentsToggle :toggle-flg="isToggle(data4._folder)"/>
                  {{ data4._folder }}
                </p>
                <li class="item-check" v-if="isToggle(data4._folder)" v-for="child in data4._child">
                  <input type="checkbox" :id="setChkId(child._key)" :value="child._key" v-model="set.checked_keyword">
                  <label :for="setChkId(child._key)">{{ child._label }}</label>
                </li>
              </ul>
            </ul>
          </ul>
        </ul>
      </li>
    </ul>
    <!-- 過去セグメント一覧 -->
    <p class="list-title" v-if="set.past_list.length > 0">{{_L.DS_PAST_SEGMENT}}</p>
    <ul class="past-list">
      <li v-for="(item, i) in set.past_list" :key="i">
        <!-- マージなし -->
        <ul class="item-block" v-if="!item._is_merge">
          <p class="toggle" @click="toggle(item._folder)">
            <ComponentsToggle :toggle-flg="isToggle(item._folder)"/>
            {{ item._folder }}
          </p>
          <ComponentsMergeInfo :keyword="$parent.matchHierarchyInfo(item._ds_list)"/>
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
          <ComponentsMergeInfo :keyword="$parent.matchHierarchyInfo(item._ds_list)"/>
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
          <span v-for="data in $parent.matchHierarchyInfo(item.data_source_keywords)">{{ data._label }}<br/></span>
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

  .list ul ul,
  .list ul li,
  .past-list ul ul,
  .past-list ul li {
    margin-left: 1em;
  }

  .list > li,
  .list > li > ul {
    margin-left: 0;
  }

  .list ul li.label,
  .past-list ul li.label {
    margin-left: 2em;
    font-size: small;
  }

  .list > ul,
  .past-list > li,
  .past-list > li > ul {
    margin-left: 0px;
    /*margin-top: 0.5em;*/
  }

</style>
