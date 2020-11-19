<template>
  <div id="app" class="app-container">
    <div class="header-container">
      <MenuHeader @message="showModal"/>
    </div>
    <div class="side-container">
      <MenuSide @message="showModal" @updateGraphStatus="updateDocumentClickHandler"/>
    </div>
    <div class="main-container">
      <div class="main">
        <!-- MenuHeader内のリンクタグで設定したコンポーネントが表示される場所です。 -->
        <router-view @message="showModal"></router-view>
      </div>
    </div>
    <CommonModal @close="hideModal" :message="modalMessage"/>
  </div>
</template>

<script>
  import MenuSide from "./components/MenuSide";
  import MenuHeader from "./components/MenuHeader";
  import CommonModal from "./components/CommonModal";

  export default {
    name: 'App',
    components: {MenuHeader, MenuSide, CommonModal,},
    data: function () {
      return {
        modalMessage: "",
        isShowGraphBalloon: false,
      };
    },
    methods: {
      showModal(param) {
        this.modalMessage = param;
        this.$modal.show('common_modal');
      },
      hideModal() {
        this.$modal.hide('common_modal');
      },
      updateDocumentClickHandler: function (flg) {
        this.isShowGraphArea = flg;
        setTimeout(function () {
          if (flg) {
            $(document).on('click', func);
          } else {
            $(document).off('click');
          }
        }, 0);
      },
    },
  }
  const func = function(event) {
    if ($(event.target).closest('.graph-balloon').length) {
      // clicked in balloon (check-all, cancel, or ok button)
      return;
    }
    var id = $(event.target).attr("id");
    var selector = null;
    if (id) {
      var prefix = id.replace("parents", "");
      if (prefix) {
        selector = ".graph-balloon:not(." + prefix + ") .btn";
      }
    }
    if (!selector) selector = ".graph-balloon .btn";
    $(selector).each(function () {
      $(this).click();
    });
  };
</script>

<style>
  @import './static2/css/reset.css';
  @import './static2/css/normalize.css';
  @import './static2/css/style.css';
  /*#app {*/
  /*    font-family: Avenir, Helvetica, Arial, sans-serif;*/
  /*    -webkit-font-smoothing: antialiased;*/
  /*    -moz-osx-font-smoothing: grayscale;*/
  /*    text-align: center;*/
  /*    color: #2c3e50;*/
  /*}*/
</style>
