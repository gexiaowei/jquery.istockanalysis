/**
 * JHSS 工具库
 * Created by Vivian on 14/11/21.
 * Copyright gandxiaowei@gmail.com 2014;
 */
;
(function ($) {
    "use strict";
    /**
     *
     * @param {String} url      请求地址
     * @param {Object} params   请求参数
     * @param {Object} callback 回调地址
     * @constructor
     */
    function GalHttpequest(url, params, callback) {
        var key, url_temp = url,
            base64 = $.base64();
        for (key in params) {
            url_temp = url_temp.replace('{' + key + '}', base64.encode(params[key]));
        }
        this.url = url_temp
        this.data = params.data;
        this.callback = callback;
        console.log('请求URL:' + url_temp);
    }

    GalHttpequest.prototype = {
        /**
         * 普通请求网络
         */
        request: function () {
            var callback = this.callback,
                options = {
                    dataType: 'json',
                    type: "GET",
                    crossDomain: true,
                    url: this.url,
                    headers: getCommonHeader(),
                    success: function (text) {
                        console.log(text);
                        if (!text) {
                            callback.error({
                                status: "-0001",
                                message: "回调文本为空"
                            });
                            return;
                        }
                        var data = analyReturnInfo(text);
                        if (data && data.status == "0000") {
                            callback.succeed(data);
                        } else if (data.status == "0101") {
                            callback.error(data);
                        } else {
                            callback.error(data);
                        }
                    },
                    error: function (error) {
                        callback.error({
                            status: error.status,
                            message: error.statusText
                        });
                    }
                };
            $.ajax(options);
        },
        /**
         * 请求Packet的网络地址
         */
        requestPacket: function () {
            var callback = this.callback,
                options = {
                    dataType: 'text',
                    crossDomain: true,
                    url: this.url,
                    headers: getCommonHeader(),
                    beforeSend: function (xhr) {
                        xhr.overrideMimeType("text/plain; charset=x-user-defined");
                    },
                    success: function (data) {
                        var buff = [];
                        for (var i = 0, j = data.length; i < j; i++) {
                            buff.push(data[i].charCodeAt(0));
                        }
                        var len = readInt(buff),
                            seq = readInt(buff),
                            operatecode = readInt(buff),
                            packet = $.packet(operatecode, seq);
                        packet.input(buff);
                        try {
                            packet.decode();
                        } catch (error) {
                            callback.error({
                                status: "-0002",
                                message: '数据异常'
                            });
                        }
                        var info = packet.getValue();
                        console.log(info);
                        if (info.status.status == '0000' || info.status[0].status == '0000') {
                            callback.succeed(info);
                        } else {
                            callback.error(info);
                        }
                    },
                    error: function (error) {
                        callback.error({
                            status: error.status,
                            message: error.statusText
                        });
                    }
                };
            $.ajax(options);
        },
        /**
         * post提交数据
         */
        submitData: function () {
            var callback = this.callback,
                options = {
                    type: "POST",
                    url: this.url,
                    headers: getCommonHeader(),
                    data: this.data,
                    success: function (result) {
                        if (!result) {
                            callback.error({
                                status: "-0001",
                                message: "回调文本为空"
                            });
                        }
                        result = analyReturnInfo(result);
                        if (result.status === '0000') {
                            callback.succeed(result);
                        } else {
                            callback.error(result);
                        }
                    },
                    error: function (error) {
                        callback.error({
                            status: error.status,
                            message: error.statusText
                        });
                    }
                };
            $.ajax(options);
        },
        /**
         * 提交Form数据
         */
        submitForm: function () {
            var key,
                callback = this.callback,
                fd = new FormData(),
                data = this.data,
                base64 = $.base64();
            for (key in data) {
                fd.append(key, base64.encode(data[key]));
            }
            var options = {
                url: this.url,
                data: fd,
                headers: getCommonHeader(),
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (result) {
                    if (!result) {
                        callback.error({
                            status: "-0001",
                            message: "回调文本为空"
                        });
                    }
                    result = analyReturnInfo(result);
                    if (result.status === '0000') {
                        callback.succeed(result);
                    } else {
                        callback.error(result);
                    }
                },
                error: function (error) {
                    callback.error({
                        status: error.status,
                        message: error.statusText
                    });
                }
            };
            $.ajax(options);
        }
    };

    /**
     * 获取基础header
     * @returns {Object}
     */
    function getCommonHeader() {
        return {
            ak: '0170010010000',
            userid: '-1',
            sessionid: '0110001'
        };
    }

    /**
     * 解析网络返回信息
     * @param   {String||Object} 网络返回信息
     * @returns {Object}
     */
    function analyReturnInfo(info) {
        //如果是Oject直接返回
        if (typeof info === 'object') {
            return info;
        }
        //需要Base64解密
        var text = info;
        if (text.index('~') === 0) {
            text = $.base64().decode(text);
        }
        return JSON.parse(text);
    };

    /**
     * 从字符串中获取Byte数组
     * @param   {String} 字符串
     * @returns {Array}  Byte数组
     */
    function getBytesFromString(str) {
        var utf8 = unescape(encodeURIComponent(str));
        var arr = [];
        for (var i = 0; i < utf8.length; i++) {
            arr.push(utf8.charCodeAt(i));
        }
        return arr;
    };

    /**
     * 从Byte数组中获取字符串
     * @param   {Array}  Byte数组
     * @returns {String} 字符串
     */
    function getStringFromByteArrs(arr) {
        var i, str = '';
        for (i = 0; i < arr.length; i++) {
            str += '%' + ('0' + arr[i].toString(16)).slice(-2);
        }
        str = decodeURIComponent(str);
        return str;
    };

    /**
     * 读取packet长度
     * @param buff
     * @returns {number}
     */
    function readInt(buff) {
        return (buff.shift() << 24) | (buff.shift() << 16) | (buff.shift() << 8) | (buff.shift() & 0xff);
    };

    /**
     * 加密base64加密的数据
     * @param {String} 需要加密解密的字符串
     */
    var Base64 = function () {
    };

    Base64.prototype = {
        /**
         * 10个加密解密策略
         */
        keys: ["789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ6abcdefghijklmnopqrstuvwxyz501234", "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-", "3456789_-ABCDEFGHIJKLMNOPQRSTUVWX2YZabcdefghijklmnopqr1stuvwxyz0", "-ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz9012345678", "_-ABCDEFGHIJKLMNOPQRSTUVWXYZ9abcdefghijklmnopqrstuvwxyz801234567", "9_-ABCDEFGHIJKLMNOPQRSTUVWXYZ8abcdefghijklmnopqrstuvwxyz70123456", "6789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ5abcdefghijklmnopqrstuvwxyz40123", "89_-ABCDEFGHIJKLMNOPQRSTUVWXYZ7abcdefghijklmnopqrstuvwxyz6012345", "456789_-ABCDEFGHIJKLMNOPQRSTUVWXY3Zabcdefghijklmnopqrs2tuvwxyz01", "56789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ4abcdefghijklmnopqrstuvwxyz3012"],
        /**
         * 用Base64加密字符串
         * @param {String}   需要加密的字符串
         * @returns {String} 加密完成的字符串
         */
        encode: function (en_str) {
            var random_index = Math.floor(Math.random() * 10);
            var key = this.keys[random_index];
            var de_str = "~" + random_index;

            var chr1, chr2, chr3;
            var en_byte = getBytesFromString(en_str),
                len = en_byte.length;
            var i = 0;
            while (i < len) {
                chr1 = en_byte[i++] & 0xff;
                if (i == len) {
                    de_str += key.charAt(chr1 >> 2);
                    de_str += key.charAt((chr1 & 0x3) << 4);
                    break;
                }

                chr2 = en_byte[i++];
                if (i == len) {
                    de_str += key.charAt(chr1 >> 2);
                    de_str += key.charAt(((chr1 & 0x3) << 4) | ((chr2 & 0xF0) >> 4));
                    de_str += key.charAt((chr2 & 0xF) << 2);
                    break;
                }

                chr3 = en_byte[i++];
                de_str += key.charAt(chr1 >> 2);
                de_str += key.charAt(((chr1 & 0x3) << 4) | ((chr2 & 0xF0) >> 4));
                de_str += key.charAt(((chr2 & 0xF) << 2) | ((chr3 & 0xC0) >> 6));
                de_str += key.charAt(chr3 & 0x3F);
            }

            return de_str;
        },

        /**
         * 解密base64加密的数据
         * @param   {String} 需要解密的字符串
         * @returns {string} 解密完成的字符串
         */
        decode: function (de_str) {
            var key_index = de_str.substr(1, 1);
            var really_str = de_str.substr(2);

            var key = this.keys[key_index];
            var len = really_str.length;
            var en_btyes = [];

            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            while (i < really_str.length) {
                enc1 = key.indexOf(really_str.charAt(i++));
                enc2 = key.indexOf(really_str.charAt(i++));
                enc3 = key.indexOf(really_str.charAt(i++));
                enc4 = key.indexOf(really_str.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                if (chr1 > 0) {
                    en_btyes.push(chr1);
                }

                if (enc3 != 64 && chr2 > 0) {
                    en_btyes.push(chr2);
                }

                if (enc4 != 64 && chr3 > 0) {
                    en_btyes.push(chr3);
                }
            }
            return getStringFromByteArrs(en_btyes);
        }
    }

    /**
     * Packet解析
     * @param operatecode
     * @param seq
     * @constructor
     */
    function Packet(operatecode, seq) {
        this.operatecode = operatecode;
        this.seq = seq;
    };


    Packet.prototype = {
        /**
         * Packet输入解析流
         * */
        input: function (buff) {
            this.buff = buff;
        },
        /**
         * Packet解析方法
         * */
        decode: function () {
            var count = this.getInt();
            this.tables = [];
            for (var i = 0; i < count; i++) {
                this.tables.push(this.decodeTable());
            }
        },

        /**
         * 获取Packet解析完成Object
         * */
        getValue: function () {
            var info = {};
            if (!this.tables) {
                return info;
            }
            for (var i = 0; i < this.tables.length; i++) {
                var table = this.tables[i];
                info[table.name] = table.rows;
            }
            return info;
        },

        /**
         * 解析表
         * */
        decodeTable: function () {
            var table = {};
            var nameLen = this.getInt();
            if (nameLen > this.buff.length) {
                throw new Error('数据异常');
            }
            table.name = getStringFromByteArrs(this.get(nameLen)).toLocaleLowerCase();
            table.field = [];
            var names = [];
            table.rows = [];
            var fieldCount = this.getInt();
            for (var i = 0; i < fieldCount; i++) {
                var field = this.decodeField();
                table.field.push(field);
                names.push(field.name);
            }
            var rowCount = this.getInt();
            for (var i = 0; i < rowCount; i++) {
                table.rows.push(this.decodeRow(table.field));
            }
            return table;
        },

        /**
         * 解析列名
         * */
        decodeField: function () {
            var datafield = {};
            var flag = this.buff.shift();
            datafield.type = String.fromCharCode(this.buff.shift());
            datafield.precise = this.getShort();
            datafield.length = this.getInt();
            var size = this.getInt();
            if (size > this.buff.length) {
                throw new Error('数据异常');
            }
            datafield.name = getStringFromByteArrs(this.get(size)).toLocaleLowerCase();
            if (flag > 0 && this.buff.length > 4) {
                size = Math.min(this.getInt(), this.buff.length);
                datafield.caption = getStringFromByteArrs(this.get(size));
            }
            return datafield;
        },

        /**
         * 解析数据列
         * */
        decodeRow: function (fields) {
            var row = {};
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                var name = field.name;
                switch (field.type) {
                    case 'B':
                        var len = this.getInt();
                        if (len > this.buff.length) {
                            throw new Error('数据异常');
                        }
                        row[name] = this.get(len);
                        break;
                    case 'S':
                        len = this.getInt();
                        if (len > this.buff.length) {
                            throw new Error('数据异常');
                        }
                        row[name] = getStringFromByteArrs(this.get(len))
                        break;
                    case 'C':
                        row[name] = this.getChar();
                        break;
                    case 'T':
                        row[name] = this.getShort();
                        break;
                    case 'N':
                        row[name] = this.getInt();
                        break;
                    case 'L':
                        row[name] = this.getLong();
                        break;
                    case '1':
                        row[name] = this.getCompressLong();
                        break;
                    case '2':
                        row[name] = this.getCompressInt();
                        break;
                    case '3':
                        row[name] = this.getCompressDateTime();
                        break;
                    case 'F':
                        row[name] = this.getFloat();
                        break;
                    case 'D':
                        row[name] = this.getDouble();
                        break;
                    default:
                        console.log('未知类型:' + field.type);
                        break;
                }
            }
            return row;
        },

        get: function (count) {
            var temp = [];
            for (var i = 0; i < count; i++) {
                temp.push(this.buff.shift());
            }
            return temp;
        },

        getChar: function () {
            String.fromCharCode(this.buff.shift());
        },

        getShort: function () {
            var b0 = this.buff.shift();
            var b1 = this.buff.shift();
            return (b0 << 8) | (b1 & 0xff);
        },

        getInt: function () {
            var b0 = this.buff.shift();
            var b1 = this.buff.shift();
            var b2 = this.buff.shift();
            var b3 = this.buff.shift();
            var addr = b3 & 0xFF;
            addr |= ((b2 << 8) & 0xFF00);
            addr |= ((b1 << 16) & 0xFF0000);
            addr |= ((b0 << 24) & 0xFF000000);
            return addr;
        },
        getLong: function () {
            var b0 = ((this.buff.shift() & 0xff) << 56) >>> 0;
            var b1 = ((this.buff.shift() & 0xff) << 48) >>> 0;
            var b2 = ((this.buff.shift() & 0xff) << 40) >>> 0;
            var b3 = ((this.buff.shift() & 0xff) << 32) >>> 0;
            var b4 = ((this.buff.shift() & 0xff) << 24) >>> 0;
            var b5 = ((this.buff.shift() & 0xff) << 16) >>> 0;
            var b6 = ((this.buff.shift() & 0xff) << 8) >>> 0;
            var b7 = (this.buff.shift() & 0xff) >>> 0;

            var value_high = (b0 | b1 | b2 | b3),
                value_low = (b4 | b5 | b6 | b7),
                value = value_high * Math.pow(1 << 16, 2) + (value_low < 0 ? Math.pow(1 << 16, 2) : 0) + value_low;
            return value;
        },
        getCompressDateTime: function () {
            var intDateTime = this.getInt();
            var minute = intDateTime & 0x3F;
            var hour = (intDateTime >>> 6) & 0x1F;
            var day = (intDateTime >>> 11) & 0x1F;
            var month = (intDateTime >>> 16) & 0x0F;
            var year = (intDateTime >>> 20) & 0x0FFF;
            var longDateTime = year * 10000000000 + month * 100000000 + day * 1000000 + hour * 10000 + minute * 100;
            return longDateTime;
        },
        getCompressInt: function () {
            var val = 0;
            var b;
            var ind = 0;
            do {
                b = this.buff.shift();
                if (ind == 0 && (b & 0x40) != 0) {
                    val = 0xffffffff;
                }
                ind++;
                val = (val << 7) | (b & 0x7f);
            } while ((b & 0x80) == 0);
            return val;
        },
        getCompressLong: function () {
            var val_low = 0;
            var val_high = 0;
            var b;
            var ind = 0;
            do {
                b = this.buff.shift();
                if (ind == 0 && (b & 0x40) != 0) {
                    val_low = 0xffffffff;
                    val_high = 0xffffffff;
                }
                ind++;
                val_high = (val_high << 7) | (val_low >>> (32 - 7));
                val_low = (val_low << 7) | (b & 0x7f);
            }
            while ((b & 0x80) == 0);
            return val_high * Math.pow(1 << 16, 2) + (val_low < 0 ? Math.pow(1 << 16, 2) : 0) + val_low;
        },
        getFloat: function () {
            return intBitsToFloat(this.getInt());
        },
        getDouble: function () {
            var b0 = this.buff.shift() & 0xff;
            var b1 = this.buff.shift() & 0xff;
            var b2 = this.buff.shift() & 0xff;
            var b3 = this.buff.shift() & 0xff;
            var b4 = this.buff.shift() & 0xff;
            var b5 = this.buff.shift() & 0xff;
            var b6 = this.buff.shift() & 0xff;
            var b7 = this.buff.shift() & 0xff;

            var signed = b0 & 0x80;
            var e = (b1 & 0xF0) >> 4;
            e += (b0 & 0x7F) << 4;

            var m = b7;
            m += b6 << 8;
            m += b5 << 16;
            m += b4 * Math.pow(2, 24);
            m += b3 * Math.pow(2, 32);
            m += b2 * Math.pow(2, 40);
            m += (b1 & 0x0F) * Math.pow(2, 48);

            switch (e) {
                case 0:
                    e = -1022;
                    break;
                case 2047:
                    return m ? NaN : (signed ? -Infinity : Infinity);
                default:
                    m += Math.pow(2, 52);
                    e -= 1023;
            }
            if (signed) {
                m *= -1;
            }
            return m * Math.pow(2, e - 52);
        }
    };

    $.extend({
        galhttprequset: function (url, params, callback) {
            return new GalHttpequest(url, params, callback);
        },
        packet: function (operatecode, seq) {
            return new Packet(operatecode, seq);
        },
        base64: function () {
            return new Base64();
        }
    })

})
(jQuery);