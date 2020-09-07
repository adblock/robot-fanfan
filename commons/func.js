const https = require("https");
const dateFormat = require('dateformat');
const config = require('../config');
const { mongoQuery, mysqlCfgSql } = require('../commons/db');
const { URL, URLSearchParams } = require('url');

// ForEach async
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

// 获取url参数
async function getUrlParams(url,key){
    let ourl = new URL(url);
    let params = new URLSearchParams(ourl.search);
    return params.get(key);
}

// 获取当天的超级推荐店铺列表
async function getTuijianShopList(date) {
    let db = await mongoQuery();
    const shop_list = await db.collection('chaojituijian.shop_list').find({}).sort({_id:-1}).limit(1).toArray();
    return shop_list;
}

// param $isAt 是否AT管理员
async function sendDingding (content, isAt=false){
    let queryParams = {
        "msgtype": "text",
         "text": {
             "content": content,
         }
    };
    if(isAt === true){
        queryParams.at = {
                 "atMobiles": [18561738659], 
                 "isAtAll": false
             }
    }
    const requestData = JSON.stringify(queryParams);
    const req = https.request({
        hostname: 'oapi.dingtalk.com',
        port: 443,
        path: '/robot/send?access_token=5adb0ed002a46761df517eacee2a99ba285c613891adf110255bce2ea326a047',
        method: "POST",
        json: true,
        headers: {
            'Content-Type' : "application/json; charset=utf-8"
        }
    },(res) => {
        process.exit()
    });
    req.write(requestData);
    req.on('error',function(err){
        console.error(err);
    });
    req.end();
}

// 获取当天的钻展店铺列表
async function getZuanzhanShopList() {
    let db = await mongoQuery();
    const shop_list = await db.collection('zuanzhan.shop_list').find({}).sort({_id:-1}).limit(1).toArray();
    return shop_list;
}

// 设置浏览器js值
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
}

// 从boss 获取订单店铺 默認（超级推荐）
async function getCZZShopBoss(type='超级推荐',page = null) {
    let sqls = 'select\n' +
        '       distinct t_order.f_copy_wangwangid\n' +
        'from t_order\n' +
        '         left join t_product on t_order.f_foreign_product_id = t_product.id\n' +
        'where t_product.f_foreign_sku_kind in (\'淘宝/天猫代运营\',\''+ type +'\''+')'+
        // 'where t_product.f_foreign_sku_kind in (\'淘宝/天猫代运营\')'+
        // 'and t_order.f_copy_wangwangid = "hazzys童装旗舰店"' +
        '  and t_order.f_foreign_order_state_id = 2 order by t_order.id asc';

    let shop_lists = await mysqlCfgSql(config.mysql_boss, sqls);
    if(page!==null){
        shop_lists = shop_lists.slice(page[0],page[1]);
    }
    shop_lists = Object.values(shop_lists);
    if (shop_lists.length>0){
        return shop_lists
    } else{
        process.exit()
    }
}

// 从boss 获取所有服务中店铺
async function getAllShopBoss() {
    const sqls_yunying = 'select\n' +
        '       distinct t_order.f_copy_wangwangid\n' +
        'from t_order\n' +
        '         left join t_product on t_order.f_foreign_product_id = t_product.id\n' +
        'where t_product.f_foreign_sku_kind in (\'淘宝/天猫代运营\')' + //,
        'and t_order.f_foreign_order_state_id = 2';
    let yunying_lists = await mysqlCfgSql(config.mysql_boss, sqls_yunying);
    const sqls_chaozhizuan = 'select\n' +
        '       distinct t_order.f_copy_wangwangid\n' +
        'from t_order\n' +
        '         left join t_product on t_order.f_foreign_product_id = t_product.id\n' +
        'where t_product.f_foreign_sku_kind in (\'钻展\',\'超级推荐\',\'直通车\')' + //,
        'and t_order.f_foreign_order_state_id = 2';
    let chaozhizuan_lists = await mysqlCfgSql(config.mysql_boss, sqls_chaozhizuan);
    let shop_lists = Object.values(yunying_lists.concat(chaozhizuan_lists));
    console.log(shop_lists);
    if (shop_lists.length>0){
        return shop_lists;
    } else{
        process.exit()
    }
}

module.exports = { asyncForEach, sendDingding, getTuijianShopList, getZuanzhanShopList, setJs, getUrlParams, getCZZShopBoss, getAllShopBoss};
