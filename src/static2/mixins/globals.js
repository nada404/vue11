/*
 * 機能名：グローバル変数/関数
 * 作成日：2018/XX/XX
 * 作成者：XX
*/
import store from '../../store/store'
import {mapGetters} from "vuex";
//import {X_MESSAGE} from '@/static2/vuex/mutation-types'

export default {
  data() {
    return {
      host_name: 'https://demo.tmc-datasquare.com', //結合環境(domain)
      // host_name: 'https://external-web-elb-702822307.ap-northeast-1.elb.amazonaws.com', //結合環境
      // host_name: 'https://dev-datalake.jp', //開発環境(つかわない)
      // host_name: 'http://localhost',
      // host_name: '', //ダミーデータ
      /**
       *【多言語化】プルダウンのリスト Menu.vue, User
       * ※valueの値はlanguage.vueの言語名と一致すること
       */
      lang_list: [
        {value: 'ja', text: '日本語'},
        {value: 'en', text: 'English'}
      ]
    }
  },
  methods: {
    format: function(template, values) {
      if (typeof values != 'object') {
        values = Array.prototype.slice.call(arguments, 1);
      }
      return template.replace(
        /\{(.+?)\}/g,
        function(matched, idx) {
          return (values[idx] != null) ? values[idx] : matched;
        }
      );
    },
    newObj: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    findObj: function (response, searchTarget, obj) {
      if (searchTarget !== undefined) {
        for (let i = 0; i < searchTarget.length; i++) {
          if (searchTarget[i][obj] !== undefined) {
            response.push(searchTarget[i][obj]);
          }
          if (searchTarget[i]._child !== undefined) {
            this.findObj(response, searchTarget[i]._child, obj);
          }
          if (searchTarget[i]._hierarchy !== undefined) {
            this.findObj(response, searchTarget[i]._hierarchy, obj);
          }
        }
      }
    },
    getDatasourceKey: function (obj) {
      // 選択中のデータソース情報を組み立ててキーを返却する
      if (obj.getMonth === undefined || obj.getMonth == "") {
        return obj.mergedKeyword;
      } else {
        return obj.getMonth + "_" + obj.mergedKeyword;  // 過去データソース
      }
    },
    getCookie: function (key) {
      let cookies = document.cookie.split('; ');
      for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].split('=');
        if (c[0] == key) {
          return c[1];
        }
      }
      return false;
    },
    getTokenHeaders: function () {
      let csrftoken = this.getCookie('csrftoken');
      return {"X-CSRFToken": csrftoken};
    },
    check_login: function (response) {
      if (response.request.responseURL.indexOf('login.html?next=/') !== -1) {
        location.href = this.host_name + "/login.html";
      }
    },
    check_status: function(response) {
      if (response.status == 504) {
        this.$emit("message", 'status: 504 Gateway Timeout<br />' + this._L.API_ERR_TIMEOUT);
      } else if (response.status == 408) {
        this.$emit("message", 'status: 408 Request Timeout<br />' + this._L.API_ERR_TIMEOUT);
      } else if (response.status !== 200) {
        this.$emit("message", this._L.API_ERR);
      }
    },
    check_error: function(response) {
      let data = response.data;
      if (data.err_flg == 1) {
        let msg = 'API err_flg : 1<br />' + this._L.API_ERR;
        this.$emit("message", msg);
      }
    },
    raiseSystemError: function (error) {
      let msg = this._L.API_ERR + '<br />' + error;
      this.$emit("message", msg);
    },
  },
  computed: {
    ...mapGetters({
      _L: 'x_language',
    }),
  },
}
