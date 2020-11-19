/* eslint no-unused-vars: 0 */

import {X_MESSAGE} from '../mutation-types'

export default {
    namespace: false,
    state: {
        message: ''
    },
    mutations: {
        chg_message(state, msg) {
            state.message = msg
        }
    },
    actions: {
        [X_MESSAGE]({commit, state}, msg) {
            commit('chg_message', msg)
        }
    },
    getters: {
        x_message: state => {
            return state.message
        }
    }
}
