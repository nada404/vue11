<script>
  import {HorizontalBar, mixins,} from 'vue-chartjs';

  const {reactiveProp} = mixins;
  export default {
    name: "HorizontalBarExt",
    extends: HorizontalBar,
    mixins: [reactiveProp,],
    props: {
      id: null,
      chartData: null,
      options: null,
    },
    mounted: function () {
      if (this.chartData) {
        this.$refs.canvas.height = (16 * (this.chartData.datasets.length + 2)) * this.chartData.labels.length;
      }
      this.renderChart(this.chartData, this.options);
    },
  }
</script>

<style scoped>

</style>
