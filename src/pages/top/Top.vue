<template>

</template>

<script>
  import axios from "axios";
  import globals from '@/static2/mixins/globals';

  export default {
    name: "Top",
    mixins: [globals,],
    methods: {
      /**
       * 初期処理
       * ログインユーザの権限をセッションに保存し取得する
       */
      async setSession() {
        if (this.host_name) {
          await axios({
            method: 'post',
            url: this.host_name + '/app/table_list/set_session/',
            headers: this.getTokenHeaders(),
          }).then(response => {
            this.check_login(response);
            this.check_status(response);
            // 承認権限保持者
            // this.isAuthorizer = response.data.is_authorizer;
            // 管理権限保持者
            // this.isManager = response.data.is_manager;
            // 請求権限保持者
            // this.isClaimant = response.data.is_claimant;
            // 監査権限保持者
            // this.isAuditor = response.data.is_auditor;
            // システム権限保持者
            // this.isSystem = response.data.is_system;
            // DataSquare表示言語
            // this.lang_id = response.data.language;
            // 組織コード
            this.$store.commit("setDepartmentCd", response.data.department_cd);
          }).catch(error => {
            this.raiseSystemError(error);
          });
        } else {
          let response = require('@/test/get_session.json');
          this.$store.commit("setDepartmentCd", response.department_cd);
        }
      },
      /**
       * 右上のユーザー名を取得する
       */
      async getUserName() {
        if (this.host_name) {
          await axios({
            method: 'post',
            url: this.host_name + '/app/table_list/get_username/',
            headers: this.getTokenHeaders(),
          }).then(response => {
            this.check_login(response);
            this.check_status(response);
            this.$store.commit("setUserName", response.data);
          }).catch(error => {
            this.raiseSystemError(error);
          });
        } else {
          let response = require('@/test/get_username.json');
          this.$store.commit("setUserName", response);
        }
      },
      /**
       * 初期処理
       * トップ画面に遷移する
       */
      topPage: function () {
        this.$router.push("/TopMenu");
      },
    },
    mounted() {
      this.setSession();
      this.getUserName();
      this.topPage();
    },
  }
</script>

<style scoped>

</style>
