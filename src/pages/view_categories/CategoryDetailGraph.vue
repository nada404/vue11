<template>
  <div>
    <div class="content-div">
        <BarExt v-if="graphData && params.graphType == 'Bar'" :id="id" :chart-data="graphData" :options="options"/>
        <PieExt v-if="graphData && params.graphType == 'Circle'" :id="id" :chart-data="graphData" :options="options"/>
        <LineExt v-if="graphData && params.graphType == 'Line'" :id="id" :chart-data="graphData" :options="options"/>
        <RadarExt v-if="graphData && params.graphType == 'Radar'" :id="id" :chart-data="graphData" :options="options"/>
        <div v-if="graphData && params.graphType == 'Circle'" class="note-div">
          <span>{{_L.CIRCLE_OUTSIDE}}</span>
          <table class="note-table">
            <tr>
              <th class="arrow">&gt;</th>
              <td/>
            </tr>
            <tr v-for="(w, i) in params.dataSourceKeyword" :key="i">
              <th>|</th>
              <td>{{w}}</td>
            </tr>
            <tr>
              <th class="arrow">&lt;</th>
              <td/>
            </tr>
          </table>
          <span>{{_L.CIRCLE_CENTER}}</span>
        </div>
    </div>
  </div>
</template>

<script>
  import BarExt from "@/pages/view_categories/graph/BarExt";
  import PieExt from "@/pages/view_categories/graph/PieExt";
  import LineExt from "@/pages/view_categories/graph/LineExt";
  import RadarExt from "@/pages/view_categories/graph/RadarExt";
  import CategoryCommon from "@/pages/view_categories/CategoryCommon";

  export default {
    name: "CategoryDetailGraph",
    components: {BarExt, PieExt, LineExt, RadarExt,},
    mixins: [CategoryCommon,],
    props: {
      id: null,
      params: null,
    },
    data: function () {
      return {
        graphData: null,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            position: "top",
          },
          tooltips: {
            callbacks: {
              title: function (tooltipItems, data) {
                var tooltipItem = tooltipItems[0];
                var label = data.labels[tooltipItem.index];
                return label;
              },
              label: function (tooltipItem, data) {
                var dataset = data.datasets[tooltipItem.datasetIndex];
                var label = dataset.label;
                var data = dataset.data[tooltipItem.index];
                return label + ": " + data;
              },
            },
          },
        },
      };
    },
    methods: {
      /**
       * グラフ用データを充填
       */
      fillGraphData: function () {
        this.graphData = this.createChartData(
          this.tabInfo.dataSourceKeyword,
          this.tabInfo.choices.filter(c => (c.selected)),
          this.tabInfo.choices.filter(c => (c.selected)).map(c => c.choice),
        );
      },
      rendering : function() {
        console.log("CategoryDetailGraph::mounted Start");
        this.$nextTick(function () {
          console.log("CategoryDetailGraph::mounted nextTick Start");
          if( this.tabInfo.isLoaded ) {
            this.fillGraphData();
            console.log("CategoryDetailGraph::mounted nextTick is Loaded");
            return;
          }
          if (!this.tabInfo.isLoaded) {
            console.log("CategoryDetailGraph::mounted nextTick 1");
            this.$store.commit("setTabLoaded", this.tabInfo.tabId);
          }
          console.log("CategoryDetailGraph::mounted nextTick 2");
          this.fillGraphData();
          console.log("CategoryDetailGraph::mounted nextTick End");
        });
      }
    },
    /**
     * mount時の処理
     */
    mounted() {
      if (this.hasApiError) return;
      console.log("CategoryDetailGraph::mounted Start");
      this.rendering()
      console.log("CategoryDetailGraph::mounted End");
    },
    watch: {
      tabInfo: {
        handler: function() {
          console.log("CategoryDetailGraph::watch tabInfo Start");
          this.rendering();
          console.log("CategoryDetailGraph::watch tabInfo End");
        },
        deep: true
      },
    },
  }
</script>

<style scoped>
  .content-div {
    position: relative;
  }

  .note-div {
    position: absolute;
    right: 10px;
    bottom: 10px;
    padding: 16px;
    background-color: #F0F0F0;
    font-size: 9pt;
  }

  .note-table tr, th, td {
    font-weight: normal;
    border: none;
  }

  .note-table th {
    text-align: center;
  }

  .note-table .arrow {
    font-size: 12pt;
    transform: rotate(270deg);
  }
</style>
