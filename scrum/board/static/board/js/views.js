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

    var FormView = TemplateView.extend({
        errorTemplate: _.template('<span class="error"><%- msg -></span>'),        
        // listen to all submit events
        events: {
            'submit form': 'submit'
        },

        clearErrors: function(){
            $('.error', this.form).remove();
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

        serializeForm: function(form){
            return _.object(_.map(form.serializeArray(), function(item){
                return [item.name, item.value];
            }));
        },
        submit: function(event){
            event.preventDefault();
            this.form = $(event.currentTarget);
            this.clearErrors();
        },
        failure: function(xhr, status, error){
            var errors = xhr.responseJSON;
            this.showErrors(errors);
        },
        done: function(event){
            if (event){
                event.preventDefault();
            }
            this.trigger('done');
            this.remove();
        },
        modelFailure: function(model, xhr, options){
            var errors=xhr.responseJSON;
            this.showErrors(errors);
        }
    });

    var LoginView = FormView.extend({
        id: 'login',
        templateName: '#login-template',
        errorTemplate: _.template('<span class="error"><%- msg -></span>'),        

        submit: function(event){
            var data = {};
            FormView.prototype.submit.apply(this, arguments);
            data = this.serializeForm(this.form);
            $.post(app.apiLogin, data)
                .success($.proxy(this.logiSuccess, this))
                .fail($.proxy(this.loginFailure, this));

        },
        loginSuccess: function(data){
            app.session.save(data.token);
            this.trigger('login', data.token);
        },
    });

    var HomepageView = TemplateView.extend({
        templateName: '#home-template',
        events: {
            'click button.add': 'renderAddForm'
        },
        initialize: function(options){
            var self = this;
            TemplateView.prototype.initialize.apply(this, arguments);
            app.collections.ready.done(function(){
                var end = new Date();
                end.setDate(end.getDate() - 7);
                end = end.toISOString().replace(/T.*/g, '');
                app.sprints.fetch({
                    data: {end_min: end},
                    success: $.proxy(self.render, self)
                });
            });
        },
        getContext: function(){
            return {sprints: app.sprints || null};
        },
        renderAddForm: function(event){
            var view = new NewSprintView();
            var link = $(event.currentTarget);
            event.preventDefault();
            link.before(view.el);
            link.hide();
            view.render();
            view.on('done', function(){
                link.show();
            });
        }
    });

    var HeaderView = TemplateView.extend({
        tagName: 'header',
        templateName: '#header-template',
        events:{
            'click a.logout': 'logout'
        },
        getContext: function(){
            return {authenticated: app.session.authenticated()};
        },
        logout: function(event){
            event.preventDefault();
            app.session.delete();
            window.location = '/';
        }
    });

    var NewSprintView = FormView.extend({
        templateName: '#new-sprint-template',
        className: 'new-sprint',
        // extend FormView events with out button click
        events: _.extend({
            'click button.cancel': 'done',
        }, FormView.prototype.events),
        submit: function(event){
            var self = this;
            var attributes = {};
            // call Form View's prototype submit method
            FormView.prototype.submit.apply(this, arguments);
            attributes = this.serializeForm(this.form);
            app.collections.ready.done(function(){
                app.sprints.create(attributes, {
                    wait: true,
                    success: $.proxy(self.success, self),
                    error: $.proxy(self.modelFailure, self)
                });
            });
        },
        success: function(model){
            this.done();
            window.location.hash = '#sprint/' + model.get('id');
        }
    });

    app.views.HomepageView = HomepageView;
    app.views.LoginView = LoginView;
    app.views.HeaderView = HeaderView;
})(jQuery, Backbone, _, app);