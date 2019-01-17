<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import { debounce } from "@/utils";

const animationDuration = 6000;

export default {
  props: {
    className: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "600px"
    },
    echartData: Object
  },
  data: function() {
    return {
      chart: null,
      deviceData: null
    };
  },
  mounted() {
    var vm = this;
    vm.__resizeHandler = debounce(() => {
      if (vm.chart) {
        vm.chart.resize();
      }
    }, 100);
    window.addEventListener("resize", vm.__resizeHandler);
  },
  watch:{
    echartData (newVal,oldVal) {
      var vm = this;
      vm.initChart(newVal)
    },
  },
  beforeDestroy() {
    var vm = this;
    if (!vm.chart) {
      return;
    }
    window.removeEventListener("resize", vm.__resizeHandler);
    vm.chart.dispose();
    vm.chart = null;
  },
  methods: {
    initChart(data) {
      var vm = this;
      vm.chart = echarts.init(vm.$el, "macarons");
      var echartsOption = {
        title: {
          text: "设备统计",
          left: "20px",
          textStyle: {
            fontSize: 17
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        toolbox: {
          show: true,
          right: "20px",
          feature: {
            dataView: {
              show: false,
              readOnly: true
            },
            magicType: {
              show: false,
              type: ["line", "bar", "stack", "tiled"]
            },
            saveAsImage: {
              show: true
            },
            mark: {
              show: false
            }
          }
        },
        legend: {
          itemWidth: 15,
          itemHeight: 15,
          data: ["在线", "离线"]
        },
        grid: {
          top: "10%",
          left: "2%",
          right: "2%",
          bottom: "5%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            data: data.deviceType,
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            min: 0,
            max: data.originalData[0].subline * 1.2,
            axisTick: {
              show: false
            }
          }
        ],
        series: [
          {
            name: "在线",
            type: "bar",
            stack: "vistors",
            barWidth: "20%",
            data: data.deviceOnline,
            itemStyle: {
              normal: {
                color: "#3FBB49"
              }
            },
            animationDuration
          },
          {
            name: "离线",
            type: "bar",
            stack: "vistors",
            barWidth: "20%",
            data: data.deviceOffline,
            itemStyle: {
              normal: {
                color: "silver"
              }
            },
            animationDuration
          }
        ]
      };

      vm.chart.setOption(echartsOption);
    }
  }
};
</script>


