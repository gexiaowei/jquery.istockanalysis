/**
 * Created by Vivian on 14/11/17.
 * Copyright gandxiaowei@gmail.com 2014
 */

(function ($) {
    var parents = [],
        defaults = {};

    $.fn.analysisStock = function (istock, options) {
        if (!istock) {
            return;
        }
        if (options) {
            defaults.root = options.root || _analysis_root;
            defaults.item = options.item || _analysis_item;
            defaults.stock = options.stock || _analysis_stock;
            defaults.unknow = options.unknow || _analysis_unknow;
        }
        var items = istock.split('\n'),
            root = $('<root/>');
        $(items).each(function (i, item) {
            if (item) {
                root.append($('<item>' + item + '</item>'));
            }
        });
        loopElement(root);
    };

    $.fn.hasChildren = function () {
        return this.children().length > 0;
    }

    var loopElement = function (root) {
        if (!root || !$(root).hasChildren()) {
            return;
        }
        $(root).children().each(function (i, child) {
            analysis($(child));
            loopElement(child);
        });
    };

    var analysis = function (el) {
        switch (el.prop("tagName")) {
            case 'ITEM':
                defaults.item(el);
                break;
            case 'STOCK':
                defaults.stock(el);
                break;
            default :
                defaults.unknow(el);
                break;
        }
    };

    var _analysis_root = function (el) {
        var dom = $('<div/>');
        return dom;
    };

    var _analysis_item = function (el) {
        var dom = $('<div/>');
        return dom;
    };

    var _analysis_stock = function (el) {
        var dom = $('<div/>'),
            name = el.attr('name'),
            code = el.attr('code');
        dom.bind('click', function () {

        });
        return dom;
    };

    var _analysis_unknow = function (el) {
        var dom = $('<div/>');
        return dom;
    };

})(jQuery);