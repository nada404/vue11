/* eslint no-unused-vars: 0 */

import {X_LANGUAGE} from '../mutation-types'
import language from '../../locale/language'

export default {
    namespace: false,
    state: {
        language: language.data().lang
    },
    mutations: {
        chg_language(state, lang) {
            state.language = lang
        }
    },
    actions: {
        [X_LANGUAGE]({commit, state}, lang) {
            commit('chg_language', lang)
        }
    },
    getters: {
        x_language: state => {
            return state.language
        }
    }
}
