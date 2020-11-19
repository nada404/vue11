<template>
  <div class="graph-area">
    <div class="graph-btn">
      <img :id="idkey+'parents'" class="graph-btn-img"
           :src="require(`@/static2/images/${this.icon}`)"
           @click="openBalloon"/>
      <span class="graph-btn-txt">{{label}}</span>
    </div>
    <div :id="idkey" v-show="isFocused" class="balloon">
      <ul style="list-style: none;">
        <li v-for="item in selectionKeywords" :key="item.choiceId">
          <input type="checkbox" :id="idkey+item.choiceId" :value="item.choiceId" v-model="item.selected"
                 @change="checkKeywords">
          <label :for="idkey+item.choiceId">{{ item.choice }}</label>
        </li>
      </ul>
      <p class="button-area">
        <span class="button-area-left-side">
          <button type="button" class="switch-check" @click="switchCheck">{{_L.ALL_CHECK}}</button>
        </span>
        <span class="button-area-right-side">
          <button type="reset" class="btn" @click="closeBalloon">{{_L.MERGE_MODAL_CANCEL}}</button>
          <button type="submit" :disabled="!isEnabled"
                  @click="closeBalloon($event), addTab_categoryDetailGraph($event)">{{_L.OK}}
          </button>
        </span>
      </p>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";

  export default {
    name: "ComponentsGraph",
    props: {
      idkey: {
        type: String,
        required: true
      },
      icon: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
    },
    data: function () {
      return {
        isFocused: false,
        selectionKeywords: [],
        isEnabled: false,
        allCheckSwitchFlg: true,
        balloon: null,
      }
    },
    methods: {
      getSelectionKeywords: function () {
        if (this.$store.state.tabs.length <= 0) return null;
        if (this.$store.state.activeTabIndex < 0) return null;
        var idx;
        if (0 <= this.childTabIndex) {
          idx = this.childTabIndex;
        } else {
          idx = this.$store.state.activeTabIndex;
        }
        // console.log("  idx = " + idx);
        var src = this.$store.state.tabs[idx].choices;
        var dst = [];
        src.forEach(c => {
          dst.push({
            choiceId: c.choiceId,
            choice: c.choice,
            score: [].concat(c.score),
            selected: ((c.selected) ? c.selected : false),
          });
        });
        return dst;
      },
      openBalloon(event) {
        // チェック状態初期化
        this.selectionKeywords = this.getSelectionKeywords();
        this.checkKeywords();
        this.allCheckSwitchFlg = true;
        // showBalloonする前にBalloonの高さの目安を取得し、表示位置を調整
        let height = this.selectionKeywords.length * 20;
        // Balloon表示
        this.isFocused = true;
        if (this.balloon) {
          this.balloon.show();
        } else {
          var classTabId = "tab-" + this.$store.state.tabs[this.$store.state.activeTabIndex].tabId;
          $(event.target).showBalloon({
            html: true,
            contents: $('#' + this.idkey),
            position: "right",
            classname: "graph-balloon " + this.idkey + " " + classTabId,
            css: {
              fontSize: "12px",
              padding: "0",
              border: "1px solid #DDD",
              borderRadius: "2px",
              boxShadow: "none",
              color: "#000",
              backgroundColor: "#DDD",
              opacity: "1",
              textAlign: "left",
              minHeight: height
            }
          });
          this.balloon = $(".graph-balloon." + this.idkey + "." + classTabId);
        }
        // Balloon外押下で閉じる
        this.$emit('pass', true);
      },
      closeBalloon(event) {
        this.isFocused = false;
        // $('#' + this.idkey + 'parents').hideBalloon();
        this.balloon.hide();
        // Balloon外押下で閉じるイベントの削除
        if ($('.graph-balloon').length <= 0) {
          this.$emit('pass', false);
        }
      },
      checkKeywords: function () {
        if (this.selectionKeywords) {
          for (let i = 0; i < this.selectionKeywords.length; i++) {
            if (this.selectionKeywords[i].selected) {
              this.isEnabled = true;
              return;
            }
          }
        }
        this.isEnabled = false;
        return;
      },
      switchCheck: function() {
        if (this.selectionKeywords) {
          for (let i = 0; i < this.selectionKeywords.length; i++) {
            this.selectionKeywords[i].selected = this.allCheckSwitchFlg;
          }
        }
        this.allCheckSwitchFlg = !this.allCheckSwitchFlg;
        this.checkKeywords();
      },
      // 可視化画面表示
      addTab_categoryDetailGraph: function (event) {
        if (!this.$parent.isShowGraphArea) return;
        let tabInfo = this.$parent.currentTabInfo;

        let graphType = this.idkey;
        if (0 <= this.childTabIndex) {
          if (this.childTabIndex == this.$store.state.activeTabIndex) {
            tabInfo.choices = this.selectionKeywords;
            if (!this.$router.currentRoute.path.endsWith("/DataResult")) {
              this.$router.push("/DataResult");
            }
          } else {
            this.$store.commit("setActiveTabIndex", this.childTabIndex);
          }
          return;
        }

        if (this.$store.getters.tabMaxHasReached) {
          this.$emit("message", this._L.TABS_REACHED_MAX);
          return;
        }

        var tabId = Date.now().toString().split("").reverse().join("");
        var options = Object.assign({}, tabInfo);
        options = Object.assign(options, {
          tabId: tabId,
          tabType: "CategoryDetailGraph",
          parentTabId: tabInfo.tabId,
          choices: this.selectionKeywords,
          graphType: graphType,
          isLoaded: false,
        });
        this.$store.commit("addTab", options);
        if (!this.$router.currentRoute.path.endsWith("/DataResult")) {
          this.$router.push("/DataResult");
        }
      },
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
      childTabIndex: function () {
        let tabInfo = this.$store.state.tabs[this.$store.state.activeTabIndex];
        var parentTabId;
        if (tabInfo.tabType == "CategoryDetail") {
          parentTabId = tabInfo.tabId;
        } else if (tabInfo.tabType == "CategoryDetailGraph") {
          parentTabId = tabInfo.parentTabId;
        }
        let found = this.$store.state.tabs.findIndex(info => (
          (info.tabType == "CategoryDetailGraph")
          && (info.categoryId == tabInfo.categoryId)
          && (info.graphType == this.idkey)
          && (info.parentTabId == parentTabId)
        ));
        return found;
      },
    },
  }
</script>

<style scoped>
  .graph-area {
    display: inline-block;
    position: relative;
  }

  .graph-btn {
    display: inline-block;
    width: 100px;
    margin: 5px 0px 5px 20px;
    text-align: center;
  }

  .graph-btn .graph-btn-img {
    /*display: inline-block;*/
    cursor: pointer;
  }

  .graph-btn .graph-btn-txt {
    display: block;
    font-size: 9px;
  }

  .balloon {
    padding: 10px;
    background-color: #DDD;
    border-radius: 2px;
  }

  .balloon li {
    margin-bottom: 2px;
  }

  .button-area {
    position: relative;
    margin-top: 10px;
    text-align: right;
  }

  .button-area .button-area-left-side {
    display: inline-block;
    position: absolute;
    left: 0;
    bottom: 0;
  }
  .button-area .button-area-left-side .switch-check {
    font-size: 10px;
    height: 22px;
  }
  .button-area .button-area-right-side {
    display: inline-block;
    margin-left: 80px;
  }
</style>
