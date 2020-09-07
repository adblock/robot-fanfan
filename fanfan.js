/**
 * 直通车 实时数据爬取
 */

const puppeteer = require('puppeteer');
const config = require('./config');
const { getCookiesByMongo } = require("./commons/account");
const {asyncForEach} = require('./commons/func');

/**
 * 设置页面page的某些js值
 * @param {Object} page  浏览器页面
 * */
const setJs = async (page) => {
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
        Object.defineProperty(chrome, 'runtime', {
            get: function () {
                return { "OnInstalledReason": { "CHROME_UPDATE": "chrome_update", "INSTALL": "install", "SHARED_MODULE_UPDATE": "shared_module_update", "UPDATE": "update" }, "OnRestartRequiredReason": { "APP_UPDATE": "app_update", "OS_UPDATE": "os_update", "PERIODIC": "periodic" }, "PlatformArch": { "ARM": "arm", "MIPS": "mips", "MIPS64": "mips64", "X86_32": "x86-32", "X86_64": "x86-64" }, "PlatformNaclArch": { "ARM": "arm", "MIPS": "mips", "MIPS64": "mips64", "X86_32": "x86-32", "X86_64": "x86-64" }, "PlatformOs": { "ANDROID": "android", "CROS": "cros", "LINUX": "linux", "MAC": "mac", "OPENBSD": "openbsd", "WIN": "win" }, "RequestUpdateCheckStatus": { "NO_UPDATE": "no_update", "THROTTLED": "throttled", "UPDATE_AVAILABLE": "update_available" } }
            },
        });
    });
    return page;
};

/**
 * 注入cookie给浏览器
 * @param {Object} browser  浏览器实例
 * @param {Object} wangwang 旺旺id
 * */
const setCookie = async (browser, wangwang)=>{
    let account = await getCookiesByMongo(wangwang);
    // 关闭无用的page
    let pages = await browser.pages();
    await asyncForEach(pages,async function(page,index) {
        if(index>0){
            await page.close();
        }
    });
    await browser.newPage();
    pages = await browser.pages();
    // page配置js
    page = await setJs(pages[1]);
    page.setDefaultTimeout(600000);
    page.setDefaultNavigationTimeout(600000);
    page.setViewport({
        width: 1376,
        height: 1376
    });
    // 拦截静态文件请求
    if(account && account.f_raw_cookies){
        // 赋予浏览器圣洁的cookie
        await asyncForEach(account.f_raw_cookies.sycmCookie, async (value, index) => {
            await page.setCookie(value);
        });
    }
    return page;
};

/**
 * 格式化数据得方法
 * @param {Object} data 数据
 * */
const parseDataToUrl = async (data)=>{
    return Object.entries(data).map(([key, val]) => `${key}=${val}`).join('&');
};

/**
 * 发送请求的方法
 * @param {Object} page page类
 * @param {Object} body 请求发送的数据
 * @param {String} url  请求的url
 * */
const sendReauest = async (page,body,url)=>{
    body = await parseDataToUrl(body);
    let reponse = await page.evaluate(async (body,url) => {
        let headers = {
            'referer':'https://subway.simba.taobao.com/',
            'origin':'https://subway.simba.taobao.com',
            'sec-fetch-mode':'cors',
            'sec-fetch-site':'same-origin',
            'sec-fetch-dest':'empty',
            'content-type':'application/x-www-form-urlencoded; charset=UTF-8'
        };
        const response = await fetch(url,
            {
                body:body,
                credentials: 'include',
                method: 'POST',
                headers:headers,
            }
        );
        return await response.json();
    },body,url);
    return reponse;
};
/**
 * 生成一个浏览器实例
 * */
const setBrowser = async ()=>{
    const browser = await puppeteer.launch({
        headless: config.headless,
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--single-process',
            '--disable-setuid-sandbox',
        ],
        ignoreDefaultArgs: ["--enable-automation"]
    });
    return browser;
};

/**
 * 将关键词列表与关键词数据拼接到一起
 * @param {Object} keywordsList  关键词列表
 * @param {Object} keywordsData  关键词详细数据
 * @param {Object} keywordsScore 关键词质量分数据
 * */
const buildKeywords = async (keywordsList,keywordsData,keywordsScore)=>{
    let keywords = [];
    let _keywordsData  = {};
    let _keywordsScore = {};
    if(keywordsData.hasOwnProperty('result')){
        keywordsData.result.forEach(function (keyword) {
            _keywordsData[keyword.bidwordid] = keyword;
        });
    }
    if(keywordsScore.hasOwnProperty('result')){
        keywordsScore.result.forEach(function (keyword) {
            _keywordsScore[keyword.keywordId] = keyword;
        });
    }

    if(keywordsList.hasOwnProperty('result')){
        keywordsList.result.forEach(function (keyword) {
            let data = {}
            if(_keywordsData[keyword.keywordId]){
                data = {
                    keyword:keyword.word,
                    click:_keywordsData[keyword.keywordId].click,
                    impression:_keywordsData[keyword.keywordId].impression,
                    ctr:_keywordsData[keyword.keywordId].ctr,
                    cost:_keywordsData[keyword.keywordId].cost,
                    createTime:keyword.createTime
                }
            }else{
                data = {
                    keyword:keyword.word,
                    click:'-',
                    impression:'-',
                    ctr:'-',
                    cost:'-',
                    createTime:keyword.createTime
                }
            }
            if(_keywordsScore[keyword.keywordId]){
                data.wirelessQscore = _keywordsScore[keyword.keywordId].wirelessQscore;
            }
            keywords.push(data);
        });
    }
    console.log(keywords);
    return keywords;
};

/**
 * 获取token
 * @param {Object} page 浏览器page对象
 * */
const getToken = async function (page) {
    // 获取token
    const token = await sendReauest(page,{},'https://subway.simba.taobao.com/bpenv/getLoginUserInfo.htm');
    return token;
};
/**
 * 获取关键词列表
 * @param {Object} page 浏览器page对象
 * @param {String} token 就是个token
 * */
const getKeywordsList = async function (page,token) {
    // 获取关键词列表
    const keywordsList = await sendReauest(
        page,
        {
            'campaignId': '69391111',
            'adGroupId': '2011422261',
            'queryWord':'',
            'queryType': '0',
            'sla': 'json',
            'isAjaxRequest': 'true',
            'token': token.result.token,
            '_referer':'/manage/adgroup/detail?productId=101001005&tab=keyword&campaignId=69391111&start=2020-09-03&end=2020-09-03&adpage=1&adGroupId=2011422261'
        },
        'https://subway.simba.taobao.com/bidword/list.htm'
    );
    return keywordsList;
};
/**
 * 获取关键词数据
 * @param {Object} page 浏览器page对象
 * @param {String} token 就是个token
 * */
const getKeywordsData = async function (page,token) {
    // 获取关键词数据
    const keywordsData = await sendReauest(
        page,
        {
            'sla': 'json',
            'isAjaxRequest': 'true',
            'token': token.result.token,
            '_referer': '/manage/adgroup/detail?productId=101001005&tab=keyword&campaignId=69391111&adGroupId=2011422261'
        },
        'https://subway.simba.taobao.com/rtreport/rptBpp4pBidwordRealtimeSubwayList.htm?campaignid=69391111&adgroupid=2011422261&theDate=2020-09-03&traffictype=1%2C2%2C4%2C5'
    );
    return keywordsData;
};
/**
 * 获取关键词数据
 * @param {Object} page 浏览器page对象
 * @param {String} token 就是个token
 * */
const getKeywordsScore = async function (page,token) {
    // 获取关键词数据
    const keywordsScore = await sendReauest(
        page,
        {
            'adGroupId':'2011422261',
            'bidwordIds':'%5B%22605760151990%22%2C%22605760151991%22%2C%22605760151992%22%2C%22605760151994%22%2C%22605760151995%22%2C%22605760151996%22%2C%22605760151998%22%2C%22605760151999%22%2C%22605760152000%22%5D',
            'sla':'json',
            'isAjaxRequest':'true',
            'token': token.result.token,
            '_referer':'/manage/adgroup/detail?productId=101001005&tab=keyword&campaignId=69391111&start=2020-09-05&end=2020-09-05&adpage=1&adGroupId=2011422261'
        },
        'https://subway.simba.taobao.com/bidword/tool/adgroup/newscoreSplit.htm'
    );
    return keywordsScore;
};



/**
 * 启动的匿名函数
 * */
(async () => {
    const wangwang = '小林路亚';
    const browser = await setBrowser();
    const page = await setCookie(browser,wangwang);
    await page.goto(
        'https://subway.simba.taobao.com/#!/manage/adgroup/detail?productId=101001005&tab=keyword&campaignId=69391111&adGroupId=2011422261',
        {waitUntil: 'networkidle0'}
        );
    const token = await getToken(page);
    let i = 1;
    setInterval(async function f() {
        const keywordsList  = await getKeywordsList(page,token);
        const keywordsData  = await getKeywordsData(page,token);
        const keywordsScore = await getKeywordsScore(page,token);
        await buildKeywords(keywordsList,keywordsData,keywordsScore);
        console.log(i++);
    },30000);
    // process.exit();

})();
