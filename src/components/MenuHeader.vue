<template>
  <div class="header">
    <div class="logo">
      <img alt="SQREEM" src="@/static2/images/logo.png">
    </div>
    <div class="user-area">
      <span>{{greeting}}</span>
    </div>
    <div class="language-area">
      <img class="language-icon" alt="language" src="@/static2/images/icon_language.png">
      <div class="language-select">
        <select v-model="lang_id">
          <option v-for="(opt, idx) in lang_list" v-bind:key="idx" v-bind:value="opt.value">
            {{ opt.text }}
          </option>
        </select>
      </div>
    </div>
    <nav class="header-menu-container">
      <div class="menu-item">
        <a @click="beforeTopMenu">
          <font-awesome-icon class="icon" :icon="['fas', 'hand-pointer']" />
          {{_L.MENU_TOP}}
        </a>
        <a @click="beforeMenuSelectDatasource">
          <font-awesome-icon class="icon" :icon="['fas', 'hand-pointer']" />
          {{_L.MENU_SELECT_DATASOURCE}}
        </a>
        <a @click="beforeMenuSelectWebscore">
          <font-awesome-icon class="icon" :icon="['fas', 'hand-pointer']" />
          {{_L.MENU_SELECT_TREND}}
        </a>
        <a @click="beforeMenuSelecTimeSeriesAnalysis">
          <font-awesome-icon class="icon" :icon="['fas', 'hand-pointer']" />
          {{_L.MENU_SELECT_TIMESERIES_ANALYSIS}}
        </a>
      </div>
    </nav>
    <ConfirmModal @close="hideModal" @ok="activeMenuItem"/>
  </div>
</template>

<script>
  import globals from '@/static2/mixins/globals'
  import {mapGetters, mapActions} from 'vuex';
  import {X_LANGUAGE} from '@/store/mutation-types';
  import language from "@/locale/language";
  import {localize} from 'vee-validate';
  import ConfirmModal from "./ConfirmModal";

  export default {
    name: "MenuHeader",
    components: {ConfirmModal},
    mixins: [globals, language],
    methods: {
      ...mapActions([
        X_LANGUAGE,
      ]),
      change_lang: function (lang_id) {
        this.X_LANGUAGE(eval("this." + lang_id));
        // vee-validateのエラーメッセージ多言語化
        localize(lang_id)
      },
      beforeTopMenu: function () {
        this.activeMenuItem = this.topMenu;
        this.menuTransition();
      },
      beforeMenuSelectDatasource: function () {
        this.activeMenuItem = this.menuSelectDatasource;
        this.menuTransition();
      },
      beforeMenuSelectWebscore: function () {
        this.activeMenuItem = this.menuSelectWebscore;
        this.menuTransition();
      },
      beforeMenuSelecTimeSeriesAnalysis: function () {
        this.activeMenuItem = this.menuSelecTimeSeriesAnalysis;
        this.menuTransition();
      },
      hideModal() {
        this.$modal.hide('confirm_modal');
      },
      menuTransition() {
        if (this.$store.state.tabs.length > 0) {
          // タブが1つ以上開かれている場合のみ、遷移確認モーダル表示
          this.$modal.show('confirm_modal');
        } else {
          this.activeMenuItem();
        }
     },
      topMenu() {
        this.hideModal();
        // タブ情報クリア
        this.$store.commit("clearTabs");
        // データソース情報クリア
        this.$store.commit("clearTempDataSource");
        // データソース選択画面へ遷移
        this.$router.push("/TopMenu");
      },
      menuSelectDatasource() {
        this.hideModal();
        // タブ情報クリア
        this.$store.commit("clearTabs");
        // データソース情報クリア
        this.$store.commit("clearTempDataSource");
        // データソース選択画面へ遷移
        this.$router.push("/SelectDatasource");
      },
      menuSelectWebscore() {
        this.hideModal();
        // タブ情報クリア
        this.$store.commit("clearTabs");
        // データソース情報クリア
        this.$store.commit("clearTempDataSource");
        // データソース選択画面へ遷移
        this.$router.push("/SelectWebscore");
      },
      menuSelecTimeSeriesAnalysis() {
        this.hideModal();
        // タブ情報クリア
        this.$store.commit("clearTabs");
        // データソース情報クリア
        this.$store.commit("clearTempDataSource");
        // データソース選択画面へ遷移
        this.$router.push("/SelectTimeSeriesAnalysis");
      },
    },
    data: function () {
      return {
        activeMenuItem: null,
        lang_id: 'ja',
        path: this.$router.path,
      };
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
      greeting: function () {
        let username = this.$store.state.userName;
        return this.format(this._L.GREETING, username);
      },
    },
    created: function () {
      this.change_lang("ja");
    },
    watch: {
      'lang_id': function (val, oldVal) {
        console.log("MenuHeader.vue | watch | lang_id | val = " + val + " | oldVal = " + oldVal);
        this.change_lang(val);
      }
    },
  }
</script>

<style scoped>
  .logo {
    display: inline-block;
  }

  .logo img {
    height: 60px;
  }

  .user-area {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 14px;
  }

  .language-area {
    position: absolute;
    right: 20px;
    bottom: 10px;
    height: 30px;
  }

  .language-area .language-icon {
    width: 30px;
    line-height: 30px;
  }

  .language-area .language-select {
    float: right;
    line-height: 30px;
    margin-left: 10px;
  }

  .header-menu-container {
    display: block;
    margin-left: 300px;
    height: 25px;
    line-height: 25px;
  }

  .header-menu-container .menu-item {
    display: inline-flex;
    margin-right: 8px;
    padding: 0 8px;
    background-color: #f7f7f7;
    border-radius: 4px;
  }
  .header-menu-container .menu-item:first-child {
    margin-left: 0;
  }
  .header-menu-container .menu-item:last-child {
    margin-right: 0;
  }

  .header-menu-container .menu-item .icon {
    margin-right: 5px;
    width: 15px;
  }

  .header-menu-container .menu-item a {
    text-decoration: none;
    color: #777;
    font-size: 14px;
    cursor: pointer;
  }

  .header-menu-container .menu-item a:hover {
    opacity: 0.5;
  }
  
  nav a {
    margin: 5px;
  }
</style>
