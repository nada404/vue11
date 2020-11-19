import Vue from "vue";
import { extend, localize } from "vee-validate";
import { required } from 'vee-validate/dist/rules';
import { max } from 'vee-validate/dist/rules';
import { min } from 'vee-validate/dist/rules';
import { excluded } from 'vee-validate/dist/rules';
// import en from "vee-validate/dist/locale/en.json";
// import ja from "vee-validate/dist/locale/ja.json";

import language from '../store/modules/x_language.js'

// Install required rule.
extend("required", required);

// Install max rule.
extend('max', max);

// Install min rule.
extend("min", min);

// Install excluded rule.
extend('excluded', excluded);

// Install localizations.
localize({
  en: {
    messages: {
      required: '{_field_} is required',
      max: '{_field_} must have no more than {length} characters',
      min: '{_field_} must have no less than {length} characters',
    },
    names: {
      mergeName: "merge name",
    },
    // fields: {
    //   mergeName: {
    //     required: '{_field_} is required',
    //     max: '{_field_} must have no more than {length} characters',
    //     min: '{_field_} must have no less than {length} characters',
    //   }
    // }
  },
  // max: (_, { length }) => `{_field_} must have no more than ${length} characters`
  ja: {
    messages: {
      required: '{_field_} は必須項目です',
      max: '{_field_} は {length} 文字以下で入力する必要があります',
      min: '{_field_} は {length} 文字以上で入力する必要があります',
    },
    names: {
      mergeName: "マージ名",
    },
  }
});

// A simple get/set interface to manage our locale in components.
// This is not reactive, so don't create any computed properties/watchers off it.
Object.defineProperty(Vue.prototype, "locale", {
  get() {
    return language;
  },
  set(val) {
    localize(val);
  }
});
