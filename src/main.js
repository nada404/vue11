import Vue from 'vue'
import App from './App.vue'
import '@/static2/js/jquery-3.3.1.min.js'
import '@/static2/js/jquery.balloon.min.js'
import VModal from 'vue-js-modal'

import router from './router'
import store from './store/store'

import './locale/vee-validate'

/* --- font awesome を使用するための記述 ここから --- */
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHandPointer } from '@fortawesome/free-solid-svg-icons' // 使うアイコンに応じて増やす
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons' // 使うアイコンに応じて増やす
import { faMinusSquare } from '@fortawesome/free-regular-svg-icons' // 使うアイコンに応じて増やす
import { faSpinner } from '@fortawesome/free-solid-svg-icons' // 使うアイコンに応じて増やす
import { faTimes } from '@fortawesome/free-solid-svg-icons' // 使うアイコンに応じて増やす
import { faAddressBook } from '@fortawesome/free-solid-svg-icons' // 使うアイコンに応じて増やす
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faHandPointer) // 使うアイコンに応じて増やす
library.add(faPlusSquare) // 使うアイコンに応じて増やす
library.add(faMinusSquare) // 使うアイコンに応じて増やす
library.add(faSpinner) // 使うアイコンに応じて増やす
library.add(faTimes) // 使うアイコンに応じて増やす
library.add(faAddressBook) // 使うアイコンに応じて増やす

Vue.component('font-awesome-icon', FontAwesomeIcon)
/* --- font awesome を使用するための記述 ここまで --- */

/* --- modal を使用するための記述 ここから --- */
Vue.use(VModal)
/* --- modal を使用するための記述 ここまで --- */

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
  store,
}).$mount('#app')
