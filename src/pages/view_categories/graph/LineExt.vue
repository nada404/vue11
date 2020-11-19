<script>
  import {Line, mixins,} from 'vue-chartjs';

  const {reactiveProp} = mixins;
  export default {
    name: "LineExt",
    extends: Line,
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
