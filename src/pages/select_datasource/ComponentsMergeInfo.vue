<template>
    <span class="hover-description"
        @mouseover="show(keyword, $event)"
        @mouseout="hide($event)"><img class="icon" src="@/static2/images/icon_info.png" /></span>
</template>

<script>
  import {mapGetters} from "vuex";

  export default {
    name: "ComponentsMergeInfo",
    props: {
      keyword: {
        type: Array,
        required: true
      },
    },
    methods: {
      show: function (data, event) {
        let tooltipText = data.join('<br />');
        $(event.target).showBalloon({
          contents: tooltipText,
          html: true,
          position: "right",
          css: {fontSize: "12px"}
        });
      },
      hide: function (event) {
        $(event.target).hideBalloon();
      },
    },
    computed: {
      ...mapGetters({
        _L: 'x_language',
      }),
    },
  }
</script>

<style scoped>
  .hover-description {
    display: inline-block;
    margin-left: .5em;
    /*padding: 0 4px;*/
    /*border: 1px solid #0c5460;*/
    /*border-radius: 4px;*/
    /*font-size: 14px;*/
    /*!*font-weight: bold;*!*/
    /*background-color: #d3d9df;*/
  }
  .hover-description .icon {
    width: 15px;
    height: 15px;
    vertical-align: bottom;
  }
</style>
