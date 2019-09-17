/**
 * created by jermken on 2019-09-06
 */
import renderPanel from './panel.js'

let noop = () => {}
export const getPerformanceTiming = () => {
    let t = performance.timing
    let times = {}
    // 页面加载完成的时间，用户等待页面可用的时间
    times.loadPage = t.loadEventEnd - t.navigationStart
    // 解析 DOM 树结构的时间
    times.domReady = t.domComplete - t.responseEnd
    // 重定向的时间
    times.redirect = t.redirectEnd - t.redirectStart
    // DNS 查询时间
    times.lookupDomain = t.domainLookupEnd - t.domainLookupStart
    // 读取页面第一个字节的时间
    times.ttfb = t.responseStart - t.navigationStart
    // 资源请求加载完成的时间
    times.request = t.responseEnd - t.requestStart
    // 执行 onload 回调函数的时间
    times.loadEvent = t.loadEventEnd - t.loadEventStart
    // DNS 缓存时间
    times.appcache = t.domainLookupStart - t.fetchStart
    // 卸载页面的时间
    times.unloadEvent = t.unloadEventEnd - t.unloadEventStart
    // TCP 建立连接完成握手的时间
    times.connect = t.connectEnd - t.connectStart
    return times
}

export const getPerformanceEntry = (cb = getEntryTiming) => {
    let entryList = performance.getEntries()
    return entryList.map(cb)
}
export const getEntryTiming = (t) => {
    let times = {}
    // 重定向的时间
    times.redirect = t.redirectEnd - t.redirectStart || 0;
 
    // DNS 查询时间
    times.lookupDomain = t.domainLookupEnd - t.domainLookupStart || 0;
 
    // 内容加载完成的时间
    times.request = t.responseEnd - t.requestStart || 0;
 
    // TCP 建立连接完成握手的时间
    times.connect = t.connectEnd - t.connectStart || 0;
 
    // 挂载 entry 返回
    times.name = t.name;
    times.entryType = t.entryType;
    times.initiatorType = t.initiatorType;
    times.duration = t.duration;
 
    return times;
}
export const renderPerformancePanel = () => {
    let template = `
        <div id="performancePanel">
            <div id="echartContainer">
                
            </div>
            <div id="showPerformanceBtn" style="cursor:pointer;line-height:30px;z-index:10001;position:fixed;bottom:20px;right:20px;background:limegreen;color:#fff;padding:0 12px;border-radius:20px;box-shadow:-2px 2px 5px #ccc;font-size:14px;font-weight:bold;">性能面板</div>
        </div>
    `
    let panelDom = new DOMParser().parseFromString(template, 'text/html').querySelector('#performancePanel')
    document.body.appendChild(panelDom)
    document.getElementById('showPerformanceBtn').onclick = function() {
        let $performanceBody = document.getElementById('performanceBody')
        if(!$performanceBody) {
            renderPanel('#echartContainer')
        } else {
            document.getElementById('performanceBody').className = $performanceBody.className === 'performance-body'? 'performance-transition' : 'performance-body'
        }
    }
}

export default function fedPerformance(cb = noop) {
    if(!window.performance) {
        return console.warn('当前浏览器不支持 performance 接口')
    }
    let times = getPerformanceTiming()
    let entries = getPerformanceEntry()
    let data = { times,entries }
    cb(data)
}

if (window && window.performance) {
    window.addEventListener('load', () => {
        // 判断是否是打开开发模式
        if (location && location.href.includes('feperformance=true')) {
            renderPerformancePanel()
        }
    })
}