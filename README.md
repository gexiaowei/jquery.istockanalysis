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
httprequest.submitData()     //POST提交数据
httprequest.submitForm()     //提交表单数据
```
PS:
1.所有网络请求中的参数将会以base64加密后的数据进行传输
2.所有请求中都会增加ak、userid、sessionid三个请求头