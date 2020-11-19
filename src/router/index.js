import Vue from 'vue'
import Router from 'vue-router'
import App from '@/App'
import Top from '@/pages/top/Top'
import SelectDatasource from '@/pages/select_datasource/SelectDatasource'
import TopMenu from '@/pages/select_datasource/TopMenu'
import SelectWebscore from '@/pages/select_datasource/SelectWebscore'
import SelectTimeSeriesAnalysis from '@/pages/select_datasource/SelectTimeSeriesAnalysis'
import SelectTemplate from '@/pages/select_template/SelectTemplate'
import DataResult from '@/pages/view_categories/DataResult'
import NotFoundComponent from '@/components/NotFoundComponent'

Vue.use(Router)

const PATH = "/sq";

export default new Router({
  mode: 'history',
  routes: [
    { path: PATH + '/top.html', redirect: PATH + '/Top' },
    { path: '/', redirect: PATH + '/Top' },
    { path: '/SelectDatasource', redirect: PATH + '/SelectDatasource' },
    { path: '/TopMenu', redirect: PATH + '/TopMenu' },
    { path: '/SelectWebscore', redirect: PATH + '/SelectWebscore' },
    { path: '/SelectTimeSeriesAnalysis', redirect: PATH + '/SelectTimeSeriesAnalysis' },
    { path: '/SelectTemplate', redirect: PATH + '/SelectTemplate' },
    { path: '/DataResult', redirect: PATH + '/DataResult' },
    {
      path: PATH + '/Top',
      component: Top
    },
    {
      path: PATH + '/SelectDatasource',
      component: SelectDatasource
    },
    {
      path: PATH + '/TopMenu',
      component: TopMenu
    },
    {
      path: PATH + '/SelectWebscore',
      component: SelectWebscore
    },
    {
      path: PATH + '/SelectTimeSeriesAnalysis',
      component: SelectTimeSeriesAnalysis
    },
    {
      path: PATH + '/SelectTemplate',
      component: SelectTemplate
    },
    {
      path: PATH + '/DataResult',
      component: DataResult,
    },
    {
      path: '*',
      component: NotFoundComponent,
    }
  ]
})
