<script>
  import {Bar, mixins,} from 'vue-chartjs';

  const {reactiveProp} = mixins;
  export default {
    name: "BarExt",
    extends: Bar,
    mixins: [reactiveProp,],
    props: {
      id: null,
      chartData: null,
      options: null,
    },
    mounted: function () {
      if (this.chartData.detail) {
        this.$refs.canvas.height = (16 * (this.chartData.datasets.length + 2)) * this.chartData.detail.labels.length;
      }
      this.renderChart(this.chartData, this.options);
    },
  }
</script>

<style scoped>

</style>
