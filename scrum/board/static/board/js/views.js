// Each Backbone view will consist of the different “pages” we will need for the user
// to easily navigate around the application. These views will also include form data
// we’ll need for updating sprints and tasks for our Scrum board.

(function($, Backbone, _, app){

    var LoginView = Backbone.View.extend({
        id: 'login',
        templateName: '#login-template',
        initialize: function(){
            this.template = _.template($(this.templateName).html());
        },
        render: function(){
            var context = this.getContext();
            var html = this.template(context);
            this.$el.html(html);
        },
        getContext: function(){
            return {};
        }
    });
    var HomepageView = Backbone.View.extend({
        templateName: '#home-template',
        initialize: function(){
            this.template = _.template($(this.templateName).html());
        },
        render: function(){
            var context = this.getContext();
            var html = this.template(context);
            this.$el.html(html);
        },
        getContext: function(){
            return {};
        }
    });

    app.views.HomepageView = HomepageView;
})(jQuery, Backbone, _, app);