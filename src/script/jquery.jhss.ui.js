/**
 * JHSS UI库
 * Created by Vivian on 14/11/21.
 * Copyright gandxiaowei@gmail.com 2014;
 */
;
(function ($) {
    $.fn.extend({
        /**
         * 增加Loading动画
         * @returns {HTML DOM}
         */
        addLoading: function () {
            if ($('#loading').length > 0) {
                $('#loading').show();
                return;
            }
            var container = $('<div/>', {class: 'loading', id: 'loading'}).appendTo(this),
                root = $('<div/>', {
                    class: 'sk-spinner sk-spinner-double-bounce'
                }).appendTo(container);
            $('<div/>', {class: 'sk-double-bounce1'}).appendTo(root);
            $('<div/>', {class: 'sk-double-bounce2'}).appendTo(root);
            return this;
        },
        /**
         * 移除Loading动画
         */
        removeLoading: function () {
            this.find('#loading').remove();
        }
    });

})(jQuery);