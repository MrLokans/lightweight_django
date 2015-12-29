// this will read configuration from element with ID config
var app = (function($){
    var config = $('#config');
    var app = JSON.parse(config.text());
    return app;
})(jQuery);