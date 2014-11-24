# [jQuery Plugin For JHSS](https://github.com/gexiaowei/jquery.jhss)
This jQuery plugin is used for JHSS wap project.

* **JHSS TOOL:** 一些常用的工具类方法，包括网络请求的封装，数据的格式化等方法
* **JHSS UI:** 公用的数据解析为DOM的方法

## 常用API
###1.网络请求
```js
var httprequest = $.galhttprequset(url,params,callbacks);
```
创建一个网络请求，可以使用四种方式进行不同的ajax网络请求
```js
httprequest.requst();        //普通网络请求
httprequest.requestPacket(); //Packet请求
httprequest.submitData();    //POST提交数据
httprequest.submitForm();    //提交表单数据
```
注意事项:<br/>
所有网络请求中的参数将会以base64加密后的数据进行传输<br/>
所有请求中都会增加ak、userid、sessionid三个请求头

###2.Base64加密解密
```js
var base = $.base64();  //创建base64
base.encode(string);    //加密一个字符串
base.decode(string);    //解密一个字符串
```
这里base64用了10个随机策略对字符串进行base64的加密和解密

###3.本地数据的存储
```js
var localData = $.localData(key); //从本地存储中获取对象
localData.get();                  //获取对应key的值 如果可以用json解析，则自动解析
localData.set(value);             //设置对应key的值
localData.remove();               //移除对应key的值
```
如果可以用localStorage存储就是用localStorage，不能则使用cookie存储

###4.从地址栏中获取参数
```js
var params = $.getParams() //获取地址栏中的参数值
```
如果地址栏中没有参数返回一个空的Object值

###5.格式化排名
```js
var rankstr = $.formatRank(rank) //格式化牛人排名
```
排名小于99999返回该值，大于99999且小于999999 返回万+ 大于999999 返回100万+

###6.格式化排名
```js
var numstr = $.bigNumberFormat(num) //股票中大数值的格式化
```
单位分别存在 万、亿、千亿。