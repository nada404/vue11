<template>
  <div class="select-ds">
    <!-- TOP -->
    <p class="top-menu-ttl">{{_L.MENU_TOP_DESCRIPTION}}</p>
    <br/>
    <br/>
    <div align="left">
    <router-link to="/SelectDatasource" style="text-decoration: none;">
    <div class="img-block">
      <img class="img-image" src="@/static2/images/opendata_analysis.png" onclick="">
      <p class="title">{{_L.MENU_SELECT_DATASOURCE}}</p>
    </div>
    </router-link>
    <router-link to="/SelectTimeSeriesAnalysis" style="text-decoration: none;">
    <div class="img-block">
      <img class="img-image" src="@/static2/images/timesseries_analysis.png">
      <p class="title">{{_L.MENU_SELECT_TIMESERIES_ANALYSIS}}</p>
    </div>
    </router-link>
      <br/>
    <router-link to="/SelectWebscore" style="text-decoration: none;">
    <div class="img-block">
      <img class="img-image" src="@/static2/images/category_analysis.png">
      <p class="title">{{_L.MENU_SELECT_WEBSCORE}}</p>
    </div>
    </router-link>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from "vuex";
  import globals from '@/static2/mixins/globals';

  export default {
    name: 'TopMenu',
    mixins: [globals,],
    data: function () {
      return {
      }
    },
    methods: {
      analyze() {
        this.addTab_categoryList();
        if (!this.$router.currentRoute.path.endsWith("/DataResult")) {
          this.$router.push("/DataResult");
        }
      },
      passModalMessage(msg) {
        this.$emit("message", msg);
      },
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style src='./style.css'></style>

<style scoped>
  .img-block {
    display: inline-flex;
    flex-direction: column;
    margin: 20px 30px;
    width: 160px;
    height: 120px;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #777;
    cursor: pointer;
    background-color: #FFFFFF;
    border-radius: 20px;
  }

  .img-block:hover {
    opacity: 0.7;
  }

  .img-block .title {
    padding: 10px 0px;
    margin: 2px 3px;
    font-size: 14px;
    font-weight: normal;
    color: #000000;
    background-color: #FFFFFF;
    word-break: break-word;
    border-radius: 20px;
  }

  .img-block .img-image {
    width: 80px;
    margin: auto;
  }
</style>
