// Backbone models are where the data of the application is defined and state manip‐
// ulation occurs. In this file we’ll be handling the CSRF (cross-site request forgery)
// token and the user session management

(function($, Backbone, _, app){

    // CSRF helper functions taken directly from Django docs
    function csrfSafeMethod(method){
        return(/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method));
    }

    function getCookie(name){
        var cookieValue = null;

        if (document.cookie && document.cookie !== ''){
            var cookies = document.cookie.split(';');
            for (var i=0; i<cookies.length; i++) {
                var cookie = $.trim(cookies[i]);

                // starts with the given name?
                if (cookie.substring(0, name.length+1) === (name + '=')) {
                    cookieValue = decodeURIComponent(
                        cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // handling CSRF in AJAX calls
    // will be called in self-invoked function
    $.ajaxPrefilter(function(settings, originalOptions, xhr){
        var csrftoken;
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            // Send the token to same-origin, relative URLs only.
            // Send the token only if the method warrants CSRF protection
            // Using the CSRFToken value acquired earlier
            csrftoken = getCookie('csrftoken');
            xhr.setRequestHeader('X-CSRFToken', csrftoken);  
        }
    });

    var Session = Backbone.Model.extend({
        defaults: {
            token: null
        },
        initialize: function(options){
            this.options = options;
            $.ajaxPrefilter($.proxy(this._setupAuth, this));
            this.load();
        },
        load: function(){
            var token = localStorage.apiToken;
            if (token){
                this.set('token', token);
            }
        },
        save: function(token){
            this.set('token', token);
            if(token === null){
                localStorage.removeItem('apiToken');
            } else {
                localStorage.apiToken = token;
            }
        },
        delete: function(){
            this.save(null);
        },
        authenticated: function(){
            return this.get('token') !== null;
        },
        _setupAuth: function(settings, originalOptions, xhr){
            // django-rest framework expects Authorization header with token
            if (this.authenticated()){
                xhr.setRequestHeader(
                    'Authorization',
                    'Token ' + this.get('token')
                );
            }
        }
    });

    app.session = new Session();

    var baseModel = Backbone.Model.extend({
        url: function(){
            var links = this.get('links');
            var url = links && links.self;

            if(!url){
                url = Backbone.Model.prototype.url.call(this);
            }
            return url;
        }
    });

    app.models.Sprint = Backbone.Model.extend({});
    app.models.Task = Backbone.Model.extend({});
    app.models.User = Backbone.Model.extend({
        idAttributemodel: 'username'
    });

    var BaseCollection = Backbone.Collection.extend({
        parse: function(response){
            this._next = response.next;
            this._previous = response.previous;
            this._count = response.count;
            return response.results || [];
        }
    });

    app.collections.ready = $.getJSON(app.apiRoot);
    app.collections.ready.done(function(data){
        app.collections.Sprints = BaseCollection.extend({
            model: app.models.Sprint,
            url: data.sprints
        });
        app.sprints = new app.collections.Sprints();

        app.collections.Tasks = BaseCollection.extend({
            model: app.models.Task,
            url: data.tasks
        });
        app.tasks = new app.collections.Tasks();

        app.collections.Users = BaseCollection.extend({
            model: app.models.User,
            url: data.users
        });
        app.users = new app.collections.Users();
    });
})(jQuery, Backbone, _, app);