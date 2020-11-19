<script>
  import {Radar, mixins,} from 'vue-chartjs';

  const {reactiveProp} = mixins;
  export default {
    name: "RadarExt",
    extends: Radar,
    mixins: [reactiveProp,],
    props: {
      id: null,
      chartData: null,
      options: null,
    },
    mounted: function () {
      this.renderChart(this.chartData, this.options);
    },
  }
</script>

<style scoped>

</style>
