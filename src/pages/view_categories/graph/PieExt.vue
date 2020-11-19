<script>
  import {Pie, mixins,} from 'vue-chartjs';

  const {reactiveProp} = mixins;
  export default {
    name: "PieExt",
    extends: Pie,
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
