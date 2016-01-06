// Each Backbone view will consist of the different “pages” we will need for the user
// to easily navigate around the application. These views will also include form data
// we’ll need for updating sprints and tasks for our Scrum board.

(function($, Backbone, _, app){

    var TemplateView = Backbone.View.extend({
        templateName: '',
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


    var LoginView = TemplateView.extend({
        id: 'login',
        templateName: '#login-template',
        errorTemplate: _.template('<span class="error"><%- msg %></span>'),        
        // listen to all submit events
        events: {
            'submit form': 'submit'
        },
        submit: function(event){
            var data = {};
            event.preventDefault();
            this.form = $(event.currentTarget);
            this.clearErrors();
            data = {
                username: $(':input[name="username"]', this.form).val(),
                password: $(':input[name="password"]', this.form).val()
            };
            $.post(app.apiLogin, data)
                .success($.proxy(this.logiSuccess, this))
                .fail($.proxy(this.loginFailure, this));

        },
        loginSuccess: function(data){
            app.session.save(data.token);
            this.trigger('login', data.token);
        },
        loginFailure: function(xhr, status, error){
            var errors = xhr.responseJSON;
            this.showErrors(errors);
        },
        showErrors: function(errors){
            _.map(errors, function(fieldErrors, name){
                var field = $(':input[name=' + name + ']', this.form);
                var label = $('label[for=' + field.attr('id') + ']', this.form);

                if (label.length === 0){
                    label = $('label', this.form).first();
                }
                function appendError(msg){
                    label.before(this.errorTemplate({msg: msg}));
                }

                _.map(fieldErrors, appendError, this);

            }, this);
        },

        clearErrors: function(){
            $('.error', this.form).remove();
        }
    });

    var HomepageView = TemplateView.extend({
        templateName: '#home-template',
    });

    app.views.HomepageView = HomepageView;
    app.views.LoginView = LoginView;
})(jQuery, Backbone, _, app);