import echarts from 'echarts'

const loadVue = () => {
    return new Promise((resolve, reject) => {
        if(window.Vue) return resolve()
        let _script = document.createElement('script')
        _script.src = 'https://cdn.bootcss.com/vue/2.6.10/vue.min.js'
        _script.onload = function() {
            resolve()
        }
        document.body.appendChild(_script)
    })
}

const insertStyle = () => {
    let _style = document.createElement('style')
    _style.innerText = '.performance-body{right:-1020px;} .performance-transition{right:0px}'
    document.getElementsByTagName('head')[0].appendChild(_style)
}
export default function renderPanel(id) {
    insertStyle()
        loadVue().then(() => {
            Vue.component('monitor-panel', {
                props: ['timing'],
                data: function() {
                    return {
                        entries: [],
                        timer: '',
                        timing: '',
                        memoryTimer: '',
                        memoeyStore: []
                    }
                },
                mounted() {
                    clearInterval(this.timer)
                    this.timer = setInterval(()=>{
                    this.init()
                    },10000)
                    setTimeout(()=>{
                    this.init()
                    this.drawEntries()
                    },1000)
                    this.startMemoryWatcher()
                    setTimeout(() => {
                        document.getElementById('performanceBody').className = 'performance-transition'
                    }, 4)
                },
                destroyed() {
                    clearInterval(this.timer)
                },
                methods: {
                    drawEntries() {
                        let data = performance.getEntries()
                        this.entries = []
                        let serData = {}
                        data.forEach((element) => {
                          //legendType.add(element.initiatorType)
                          if(element.initiatorType && serData[element.initiatorType]){
                            serData[element.initiatorType].push(element)
                          }else if(element.initiatorType && !serData[element.initiatorType]){
                            serData[element.initiatorType] = [element]
                          }
                        })
                        Object.keys(serData).forEach((key)=>{
                          this.entries.push({
                            type:key,
                            data:serData[key]
                          })
                        })
                    
                        setTimeout(()=>{
                          for(let i of this.entries){
                            this.doDraw(i.type,i.data)
                          }
                        },1000)
                    },
                    startMemoryWatcher(){
                        clearInterval(this.memoryTimer)
                        this.memoryLog()
                        this.memoryTimer = setInterval(()=>{
                          this.memoryLog()
                        },10000)
                    },
                    doDraw(name, data){
                        let myChart = echarts.init((document.getElementById('resource_'+name)))
                        let option = {
                            title: {
                                text: name
                            },
                            legend: {
                                data:['加载时间','编码前大小','编码后大小'],
                                align: 'left'
                            },
                            toolbox: {
                                // y: 'bottom',
                                feature: {
                                    magicType: {
                                        type: ['stack', 'tiled']
                                    },
                                    dataView: {},
                                    saveAsImage: {
                                        pixelRatio: 2
                                    }
                                }
                            },
                            tooltip: {
                            formatter:  (params, ticket, callback) => {
                                //callback(ticket, toHTML(content));
                                //return 'Loading';
                                //console.log(params,ticket)
                                let index = params.name.indexOf('?')
                                if(params.seriesName == '加载时间'){
                                    return `<p>${index>=0?params.name.substr(0,index):params.name}</p> ${params.seriesName} : ${params.data} 毫秒`
                                }else{
                                    return `<p>${index>=0?params.name.substr(0,index):params.name}</p> ${params.seriesName} : ${(parseInt(params.data)/1024).toFixed(2)} KB`
                                }
                                
                            }
                            },
                            xAxis: {
                                data: data.map((item)=>{
                                    return item.name
                                    }),
                                silent: false,
                                splitLine: {
                                    show: false
                                }
                            },
                            yAxis: {
                            },
                            series: [{
                                name: '加载时间',
                                itemStyle:{
                                color:'#67c23a'
                                },
                                type: 'bar',
                                data: data.map((item)=>{
                                    return item.duration
                                    }),
                                animationDelay: function (idx) {
                                    return idx * 10;
                                }
                            }, {
                                name: '编码前大小',
                                itemStyle:{
                                color:'#f92525'
                                },
                                type: 'bar',
                                data: data.map((item)=>{
                                    return item.encodedBodySize
                                }),
                                animationDelay: function (idx) {
                                    return idx * 10 + 100;
                                }
                            }, {
                                name: '编码后大小',
                                itemStyle:{
                                color:'#f92525'
                                },
                                type: 'bar',
                                data: data.map((item)=>{
                                    return item.decodedBodySize
                                }),
                                animationDelay: function (idx) {
                                    return idx * 10 + 100;
                                }
                            }],
                            animationEasing: 'elasticOut',
                            animationDelayUpdate: function (idx) {
                                return idx * 5;
                            }
                        };
                        myChart.setOption(option)
                    },
                    memoryLog(){
                        let {jsHeapSizeLimit,totalJSHeapSize,usedJSHeapSize} = window.performance.memory
                        this.memoeyStore.push({jsHeapSizeLimit,totalJSHeapSize,usedJSHeapSize,time:new Date().getTime()})
                        if(this.memoeyStore.length > 100){
                            this.memoeyStore.splice(0,this.memoeyStore.length - 100)
                        }
                    },
                    parseDate(date, type) {
                        if (!date) return
                        const isDou = n => n > 9 ? n : `0${n}`
                        date = new Date(Number(date))
                        let Y = date.getFullYear()
                        let M = date.getMonth() + 1
                        let D = date.getDate()
                        let h = date.getHours()
                        let m = date.getMinutes()
                        let s = date.getSeconds()
                        if (type == 'MM-DD') {
                          return `${isDou(M)}/${isDou(D)}`
                        }
                        if (type == 'YY-MM') {
                          return `${Y}/${isDou(M)}`
                        }
                        return `${Y}/${isDou(M)}/${isDou(D)} \n ${isDou(h)}:${isDou(m)}:${isDou(s)}`
                    },
                    getMemoeyStore(){
                        return this.memoeyStore
                    },
                    drawMemory(myChart){
                        let data = this.getMemoeyStore()
                    
                        let option = {
                          title: {
                              text: '内存监控'
                          },
                          legend: {
                              data:['可用内存','已用内存'],
                              align: 'left'
                          },
                          toolbox: {
                              // y: 'bottom',
                              feature: {
                                  magicType: {
                                      type: ['stack', 'tiled']
                                  },
                                  dataView: {},
                                  saveAsImage: {
                                      pixelRatio: 2
                                  }
                              }
                          },
                          tooltip: {
                            formatter:  (params, ticket, callback) => {
                                //callback(ticket, toHTML(content));
                                //return 'Loading';
                                //console.log(params,ticket)
                                return `${params.seriesName} : ${(parseInt(params.data)/1048576).toFixed(2)} MB`
                            }
                          },
                          xAxis: {
                              data: data.map((item)=>{
                                    return this.parseDate(item.time)
                                  }),
                              silent: false,
                              splitLine: {
                                  show: false
                              }
                          },
                          yAxis: {
                          },
                          series: [{
                              name: '可用内存',
                              itemStyle:{
                                color:'#67c23a'
                              },
                              type: 'bar',
                              data: data.map((item)=>{
                                    return item.totalJSHeapSize
                                  }),
                              animationDelay: function (idx) {
                                  return idx * 10;
                              }
                          }, {
                              name: '已用内存',
                              itemStyle:{
                                color:'#f92525'
                              },
                              type: 'bar',
                              data: data.map((item)=>{
                                    return item.usedJSHeapSize
                                  }),
                              animationDelay: function (idx) {
                                  return idx * 10 + 100;
                              }
                          }],
                          animationEasing: 'elasticOut',
                          animationDelayUpdate: function (idx) {
                              return idx * 5;
                          }
                        };
                        myChart.setOption(option)
                    },
                    init() {
                        this.timing = window.performance.timing
                        this.drawMemory(echarts.init(document.getElementById('main'))) 
                    }
                },
                template: `
                    <div id="performanceBody" class="performance-body" style="transition: all 1s;box-shadow: -8px 0 20px #ccc;position:fixed;top:0;background:#f1f1f1;bottom:0; width:1000px;overflow-y:scroll;">
                        <div id="echartMain" style="width:100%;">
                            <div style="background:#fff;margin-bottom:20px;padding:20px;">
                                <h3>内存使用情况</h3>
                                <div id="main" style="width:100%;height:600px;"></div>
                            </div>
                            
                            <div style="background:#fff;margin-bottom:20px;padding:20px;">
                                <h3>页面加载详情（单位：毫秒）</h3>
                                <p style="display:inline-block;width:49%;"><label>准备新页面耗时：</label>  <span style="color:#409eff;">{{timing.fetchStart - timing.navigationStart}} </span></p>
                                <p style="display:inline-block;width:49%;"><label>重定向时间：</label>  <span style="color:#409eff;">{{timing.redirectEnd - timing.redirectStart}} </span></p>
                                <p style="display:inline-block;width:49%;"><label>App Cache时间：</label> <span style="color:#409eff;">{{timing.domainLookupStart - timing.fetchStart}}</span></p>
                                <p style="display:inline-block;width:49%;"><label>DNS解析时间：</label> <span style="color:#409eff;">{{timing.domainLookupEnd - timing.domainLookupStart}}</span></p>
                                <p style="display:inline-block;width:49%;"><label>TCP连接时间：</label> <span style="color:#409eff;">{{timing.connectEnd - timing.connectStart}}</span></p>
                                <p style="display:inline-block;width:49%;"><label>request时间：</label> <span style="color:#409eff;">{{timing.responseEnd - timing.requestStart}} </span></p>
                                <p style="display:inline-block;width:49%;"><label>请求完毕到DOM加载：</label> <span style="color:#409eff;">{{timing.domInteractive - timing.responseEnd}}</span></p>
                                <p style="display:inline-block;width:49%;"><label>构建解析DOM加载资源时间：</label> <span style="color:#409eff;">{{timing.domComplete - timing.domInteractive}}</span></p>
                                <p style="display:inline-block;width:49%;"><label>load时间：</label>  <span style="color:#409eff;">{{timing.loadEventEnd - timing.loadEventStart}}</span></p>
                                <p style="display:inline-block;width:49%;"><label>整个页面加载时间：</label>  <span style="color:#409eff;">{{timing.loadEventEnd - timing.navigationStart}}</span></p>
                                <p style="display:inline-block;width:49%;"><label>白屏时间：</label>  <span style="color:#409eff;">{{timing.responseStart-timing.navigationStart}}</span></p>
                            </div>

                            <div style="background:#fff;margin-bottom:20px;padding:20px;">
                                <h3>资源加载详情(单位:毫秒)</h3>
                                <div :id="'resource_'+resource.type" v-for="resource in entries" :key="resource.type" style="width:100%;height:600px;"></div>
                            </div>
                        </div>
                    </div>
                `
            })
            new Vue({
                el: id,
                data: {
                    timing: window.performance.timing
                },
                template: '<monitor-panel :timing="timing"></monitor-panel>',
                mounted() {
                
                }
            })
        })
    
}