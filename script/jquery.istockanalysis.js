/**
 * Created by Vivian on 14/11/17.
 * Copyright gandxiaowei@gmail.com 2014
 */

(function ($) {
    var parents = [],
        analysis = function (el) {
            var dom;
            switch (el.prop("tagName")) {
                case 'ITEM':
                    dom = defaults.item(el);
                    break;
                case 'STOCK':
                    dom = defaults.stock(el);
                    break;
                case 'FONT':
                    dom = defaults.font(el);
                    break;
                default :
                    dom = defaults.unknow(el);
                    break;
            }
            return dom;
        },
        /**
         * 处理根节点
         * @param el
         * @returns {*|HTMLElement}
         * @private
         */
        _analysis_item = function (el) {
            var dom = $('<li/>', {class: 'item'});
            dom.text(el.text().trim());
            return dom;
        },
        /**
         * 处理股票标签
         * @param el
         * @returns {XMLList|*}
         * @private
         */
        _analysis_stock = function (el) {
            var name = el.attr('name'),
                code = el.attr('code'),
                dom = $('<a/>', {
                    class: 'stock',
                    href: 'stockinfo.html?codeid=' + code + '&codename=' + name
                }).text(name);
            return dom;
        },
        /**
         * 处理额外的标签
         * @param el
         * @returns {XMLList|*}
         * @private
         */
        _analysis_font = function (el) {
            var text = el.attr('text'),
                color = el.attr('color'),
                dom = $('<li/>', {
                    class: 'font'
                });
            dom.css({color: color});
            dom.text(text.replace(' ', '：'));
            return dom;
        },
        /**
         * 处理未知标签
         * @param el
         * @returns {XMLList|*}
         * @private
         */
        _analysis_unknow = function (el) {
            var dom = $('<li/>', {
                class: 'unknow'
            });
            dom.text(el.text());
            return dom;
        },
        /**
         * 默认设置
         * @type {{item: Function, stock: Function, font: Function, unknow: Function}}
         */
        defaults = {
            item: _analysis_item,
            stock: _analysis_stock,
            font: _analysis_font,
            unknow: _analysis_unknow
        };

    /**
     * jQuery插件方法——分析iStock
     * @param data
     * @param options
     * @returns {$.fn}
     */
    $.fn.analysisStock = function (data, options) {
        if (!data) {
            return;
        }
        var istock = data.content,
            time = data.ctime,
            type = data.stype;

        if (options) {
            var analysisfn;
            for (analysisfn in options) {
                defaults[analysisfn] = options[analysisfn];
            }
        }

        var items = istock.split('\n'),
            root = $('<root/>');
        $(items).each(function (i, item) {
            if (item) {
                root.append($('<item>' + item + '</item>'));
            }
        });
        this.addClass('istock');
        $('<div/>', {class: 'istocktype'}).appendTo(this);
        var istockContainer = $('<ul/>');
        $('<li/>', {class: 'date'}).appendTo(istockContainer).text(time)
        istockContainer.appendTo(this);
        parents.push(istockContainer);
        loopElement(root);
        return this;
    };

    /**
     * 是否包含子节点
     * @returns {boolean}
     */
    $.fn.hasChildren = function () {
        return this.children().length > 0;
    }

    /**
     * 循环调用
     * @param root
     */
    var loopElement = function (root) {
        if (!root || !$(root).hasChildren()) {
            return;
        }
        $(root).children().each(function (i, child) {
            var dom = analysis($(child));
            dom.appendTo(parents[parents.length - 1]);
            if ($(child).hasChildren()) {
                parents.push(dom);
            }
            loopElement(child);
        });
        parents.pop();
    };

})(jQuery);