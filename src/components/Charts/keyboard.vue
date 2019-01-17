<template>
  <div :class="className" :id="id" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from "echarts";
import resize from "./mixins/resize";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart"
    },
    id: {
      type: String,
      default: "chart"
    },
    width: {
      type: String,
      default: "200px"
    },
    height: {
      type: String,
      default: "200px"
    },
    params: {}
  },
  data() {
    return {
      chart: null,
      wss:
        "wss" +
        this.$store.getters.serverUrl["https://cj-device"].split("https")[1],
      websock: "",
      // optionChart: {
      //   backgroundColor: "#08263a",
      //   grid: {
      //     left: "5%",
      //     right: "5%"
      //   },
      //   xAxis: [
      //     {
      //       show: false,
      //       data: []
      //     },
      //     {
      //       show: false,
      //       data: []
      //     }
      //   ],
      //   visualMap: {
      //     show: false,
      //     min: 0,
      //     max: 50,
      //     dimension: 0,
      //     inRange: {
      //       color: [
      //         "#4a657a",
      //         "#308e92",
      //         "#b1cfa5",
      //         "#f5d69f",
      //         "#f5898b",
      //         "#ef5055"
      //       ]
      //     }
      //   },
      //   yAxis: {
      //     axisLine: {
      //       show: false
      //     },
      //     axisLabel: {
      //       textStyle: {
      //         color: "#4a657a"
      //       }
      //     },
      //     splitLine: {
      //       show: true,
      //       lineStyle: {
      //         color: "#08263f"
      //       }
      //     },
      //     axisTick: {
      //       show: false
      //     }
      //   },
      //   series: [
      //     {
      //       name: "back",
      //       type: "bar",
      //       data: [],
      //       z: 1,
      //       itemStyle: {
      //         normal: {
      //           opacity: 0.4,
      //           barBorderRadius: 5,
      //           shadowBlur: 3,
      //           shadowColor: "#111"
      //         }
      //       }
      //     },
      //     {
      //       name: "Simulate Shadow",
      //       type: "line",
      //       data:[],
      //       z: 2,
      //       showSymbol: false,
      //       animationDelay: 0,
      //       animationEasing: "linear",
      //       animationDuration: 1200,
      //       lineStyle: {
      //         normal: {
      //           color: "transparent"
      //         }
      //       },
      //       areaStyle: {
      //         normal: {
      //           color: "#08263a",
      //           shadowBlur: 50,
      //           shadowColor: "#000"
      //         }
      //       }
      //     },
      //     {
      //       name: "front",
      //       type: "bar",
      //       data:[],
      //       xAxisIndex: 1,
      //       z: 3,
      //       itemStyle: {
      //         normal: {
      //           barBorderRadius: 5
      //         }
      //       }
      //     }
      //   ],
      //   animationEasing: "elasticOut",
      //   animationEasingUpdate: "elasticOut",
      //   animationDelay(idx) {
      //     return idx * 20;
      //   },
      //   animationDelayUpdate(idx) {
      //     return idx * 20;
      //   }
      // }, 
      optionChart: {
        title: {
          text: ""
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          grid: {
            left: "5%",
            right: "5%"
          },
          axisLine: {
            lineStyle: {
              color: "#999999"
            }
          },
          data: []
        },
        yAxis: {
          name: "",
          type: "value",
          max: this.$props.upperLimit,
          min: this.$props.lowerLimit,
          axisLine: {
            lineStyle: {
              color: "#999999"
            }
          }
        },
        series: [
          {
            data: [],
            type: "line",
            label: {
              show: true
            },
            smooth: true,
            lineStyle: {
              color: "#d6ccea"
            },
            itemStyle: {
              color: "#999999"
            },
            areaStyle: {
              color: "#d6ccea"
            }
          }
        ]
      }
    };
  },
  mounted() {
    var vm = this;
    vm.send();
  },
  beforeDestroy() {
    var vm = this;
    if (!vm.chart) {
      return;
    }
    vm.chart.dispose();
    vm.chart = null;
  },
  destroyed() {
    var vm = this;
    vm.websock.close();
  },
  methods: {
    //webSocket
    send() {
      this.readyChat();
    },
    readyChat() {
      let This = this;
      if (this.websock.readyState === 1) {
        this.websocketSend();
      } else if (this.websock.readyState === 0) {
        // 表示正在连接，设置3000ms后发送信息
        setTimeout(function() {
          This.websocketSend();
        }, 3000);
      } else {
        // 连接未创建或者创建失败，则重新创建连接，并设置500ms后发送信息
        this.websochetInit();
        setTimeout(function() {
          This.websocketSend();
        }, 500);
        this.websock.onerror = function(e) {
          This.$Message({
            message: "连接WebSocket出错",
            type: "error"
          });
        };
      }
    },
    /* 初始化websochet */
    websochetInit() {
      if (this.websock == "") {
        this.websock = new WebSocket(this.wss + "kafka-websocket3");
        this.websock.onmessage = this.websocketMessage;
      }
    },
    /* websochet发送信息 */
    websocketSend() {
      this.websock.send(JSON.stringify(this.$props.params));
    },
    /* websochet接收服务器返回的信息 */
    websocketMessage(e) {
      let deviceData;
      this.chart = echarts.init(document.getElementById(this.id));

      if (e.data != "连接服务器成功！") {
        deviceData = JSON.parse(e.data)[this.$props.params.queueName][0];
        this.optionChart.title.text = deviceData[1];
        this.optionChart.xAxis.data.push(deviceData[4]);
        this.optionChart.series[0].data.push(deviceData[3]);
        this.chart.setOption(this.optionChart);
      }
      // if (e.data != "连接成功") {
      //   let deviceData = JSON.parse(e.data);
      //   this.deviceData.push(deviceData);
      //   // this.deviceData = arrayForGroup(this.deviceData, 4);
      // }
    },

    // initChart() {
    //   this.chart = echarts.init(document.getElementById(this.id));
    //   const xAxisData = [];
    //   const data = [];
    //   const data2 = [];
    //   for (let i = 0; i < 50; i++) {
    //     xAxisData.push(i);
    //     data.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
    //     data2.push((Math.sin(i / 5) * (i / 5 + 10) + i / 6) * 3);
    //   }
    //   this.chart.setOption(this.optionChart);
    // }
  }
};
</script>
