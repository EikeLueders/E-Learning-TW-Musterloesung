
/*
# Copyright (c) 2012 -
# Tobias Thelen <tthelen@uos.de>,
# Marcus Lunzenauer <mlunzena@uos.de>,
# Eike Lüders <elueders@uos.de>,
# Ron Lucke <rlucke@uos.de>,
# Tilo Wiedera <twiedera@uos.de>,
# Fabian Otte  <>
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
*/


(function() {
  var compileTemplate,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  compileTemplate = function(name) {
    return Mustache.compile($("#tw-template-" + name).html());
  };

  tw.ui.HomeView = (function(_super) {

    __extends(HomeView, _super);

    function HomeView() {
      return HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.template = compileTemplate("home");

    HomeView.prototype.render = function(eventName) {
      this.$el.html(this.template());
      return this;
    };

    return HomeView;

  })(Backbone.View);

  tw.ui.LoginView = (function(_super) {

    __extends(LoginView, _super);

    function LoginView() {
      return LoginView.__super__.constructor.apply(this, arguments);
    }

    LoginView.prototype.template = compileTemplate("login");

    LoginView.prototype.render = function(eventName) {
      this.$el.html(this.template());
      return this;
    };

    LoginView.prototype.events = {
      "submit #loginForm": "attemptLogin"
    };

    LoginView.prototype.attemptLogin = function(event) {
      var done, fail, password, username;
      event.preventDefault();
      username = this.$el.find("input[name=username]").val();
      password = this.$el.find("input[name=password]").val();
      done = function(result) {
        tw.$Session = result;
        return tw.$App.navigate("#home", {
          trigger: true
        });
      };
      fail = function(jqXHR, textStatus) {
        $.mobile.hidePageLoadingMsg();
        return alert('Ung&uuml;ltiger Benutzername oder falsches Passwort!');
      };
      $.mobile.showPageLoadingMsg();
      return tw.model.Session.authenticate(username, password, done, fail);
    };

    return LoginView;

  })(Backbone.View);

  tw.ui.MyCoursesView = (function(_super) {

    __extends(MyCoursesView, _super);

    function MyCoursesView() {
      return MyCoursesView.__super__.constructor.apply(this, arguments);
    }

    MyCoursesView.prototype.template = compileTemplate("my-courses");

    MyCoursesView.prototype.initialize = function() {
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
    };

    MyCoursesView.prototype.addOne = function(course, collection) {
      var item, ul;
      item = new tw.ui.MyCoursesItemView({
        model: course
      });
      ul = this.$("ul");
      ul.append(item.render().el);
      if (this.el.parentNode) {
        ul.listview('refresh');
      }
    };

    MyCoursesView.prototype.addAll = function(collection) {
      _.each(collection.models, (function(course) {
        return this.addOne(course);
      }), this);
    };

    MyCoursesView.prototype.render = function() {
      this.$el.html(this.template());
      this.addAll(this.collection);
      return this;
    };

    return MyCoursesView;

  })(Backbone.View);

  tw.ui.MyCoursesItemView = (function(_super) {

    __extends(MyCoursesItemView, _super);

    function MyCoursesItemView() {
      return MyCoursesItemView.__super__.constructor.apply(this, arguments);
    }

    MyCoursesItemView.prototype.tagName = "li";

    MyCoursesItemView.prototype.template = compileTemplate("my-courses-item");

    MyCoursesItemView.prototype.render = function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    };

    return MyCoursesItemView;

  })(Backbone.View);

  tw.ui.CourseView = (function(_super) {

    __extends(CourseView, _super);

    function CourseView() {
      return CourseView.__super__.constructor.apply(this, arguments);
    }

    CourseView.prototype.template = compileTemplate("course");

    CourseView.prototype.initialize = function() {
      return this.model.on("all", this.render, this);
    };

    CourseView.prototype.render = function() {
      var jsonModel;
      jsonModel = this.model.toJSON();
      jsonModel['showWikiLink'] = this.model.get("modules")["wiki"];
      this.$el.html(this.template(jsonModel));
      if (this.el.parentNode) {
        this.$el.page("destroy").page();
      }
      return this;
    };

    return CourseView;

  })(Backbone.View);

  tw.ui.WikiView = (function(_super) {

    __extends(WikiView, _super);

    function WikiView() {
      return WikiView.__super__.constructor.apply(this, arguments);
    }

    WikiView.prototype.template = compileTemplate("wiki");

    WikiView.prototype.initialize = function() {
      this.collection.on('add', this.addOne, this);
      this.collection.on('reset', this.addAll, this);
    };

    WikiView.prototype.addOne = function(page, collection) {
      var item, ul;
      item = new tw.ui.WikiItemView({
        model: page
      });
      ul = this.$("ul");
      ul.append(item.render().el);
      if (this.el.parentNode) {
        ul.listview('refresh');
      }
    };

    WikiView.prototype.addAll = function(collection) {
      _.each(collection.models, (function(page) {
        return this.addOne(page);
      }), this);
    };

    WikiView.prototype.render = function() {
      this.$el.html(this.template({
        course_id: this.collection.courseId
      }));
      this.addAll(this.collection);
      return this;
    };

    return WikiView;

  })(Backbone.View);

  tw.ui.WikiItemView = (function(_super) {

    __extends(WikiItemView, _super);

    function WikiItemView() {
      return WikiItemView.__super__.constructor.apply(this, arguments);
    }

    WikiItemView.prototype.tagName = "li";

    WikiItemView.prototype.template = compileTemplate("wiki-item");

    WikiItemView.prototype.render = function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    };

    return WikiItemView;

  })(Backbone.View);

  tw.ui.WikiPageView = (function(_super) {

    __extends(WikiPageView, _super);

    function WikiPageView() {
      return WikiPageView.__super__.constructor.apply(this, arguments);
    }

    WikiPageView.prototype.template = compileTemplate("wiki-page");

    WikiPageView.prototype.paginatorInitialized = false;

    WikiPageView.prototype.paginatorStorageID = function() {
      return 'paginator-page-index-' + this.model.get('course_id') + '-' + this.model.get('keyword');
    };

    WikiPageView.prototype.initialize = function() {
      return this.model.on("all", this.render, this);
    };

    WikiPageView.prototype.render = function() {
      var defaultFontSize, jsonModel,
        _this = this;
      defaultFontSize = 100;
      jsonModel = this.model.toJSON();
      jsonModel['body'] = this.compileWikiSource(jsonModel['body']);
      jsonModel.fontSize = localStorage.getItem('format-font-size');
      if (!jsonModel.fontSize) {
        jsonModel.fontSize = defaultFontSize;
      }
      this.$el.html(this.template(jsonModel));
      if (this.el.parentNode) {
        this.$el.page("destroy").page();
      }
      this.bindFormatChangeHandler('format-font-size', 'font-size', defaultFontSize, '%');
      this.bindFormatChangeHandler('format-font-family', 'font-family', 'sans-serif');
      this.bindFormatChangeHandler('format-font-color', 'color', '#000');
      this.bindFormatChangeHandler('format-background-color', 'background-color', '#FFF');
      this.$el.on('pageshow', function() {
        return _this.paginate();
      });
      return this;
    };

    WikiPageView.prototype.paginate = function() {
      var children, content, contentHeight, height, pageCounter, pageIndex,
        _this = this;
      pageIndex = parseInt(localStorage.getItem(this.paginatorStorageID()));
      if (!pageIndex) {
        pageIndex = 0;
      }
      contentHeight = $(window).innerHeight() - $('[data-role="header"]').outerHeight() - $('[data-role="footer"]').outerHeight();
      content = this.$el.find('.content');
      children = content.children();
      height = contentHeight;
      pageCounter = 0;
      children.hide();
      _.each(children, function(child) {
        var c;
        c = $(child);
        height -= c.outerHeight();
        if (pageCounter === pageIndex) {
          c.show();
        }
        if (height < 0) {
          height = contentHeight;
          return pageCounter++;
        }
      });
      if (pageIndex >= pageCounter) {
        return this.$el.find('.paginator').jqPagination('option', 'current_page', pageCounter);
      } else {
        if (!this.paginatorInitialized) {
          this.paginatorInitialized = true;
          this.$el.find('.paginator').jqPagination({
            current_page: pageIndex + 1,
            max_page: pageCounter,
            page_string: 'Seite {current_page} von {max_page}',
            paged: function(newPageIndex) {
              var oldPageIndex;
              oldPageIndex = parseInt(localStorage.getItem(_this.paginatorStorageID()));
              newPageIndex--;
              if (oldPageIndex !== newPageIndex) {
                localStorage.setItem(_this.paginatorStorageID(), newPageIndex);
                return _this.paginate();
              }
            }
          });
        } else {
          this.$el.find('.paginator').jqPagination('option', 'current_page', pageIndex + 1);
          this.$el.find('.paginator').jqPagination('option', 'max_page', pageCounter);
        }
        return $('html, body').scrollTop($(document).height());
      }
    };

    WikiPageView.prototype.bindFormatChangeHandler = function(domId, property, defaultValue, unit) {
      var input,
        _this = this;
      if (unit == null) {
        unit = "";
      }
      input = this.$el.find('#' + domId);
      input.live('change', function(e) {
        var newValue;
        newValue = $(e.target).val();
        _this.$el.find('.content').css(property, newValue + unit);
        return localStorage.setItem(domId, newValue);
      });
      if (!localStorage.getItem(domId)) {
        localStorage.setItem(domId, defaultValue);
      }
      input.val(localStorage.getItem(domId));
      return input.change();
    };

    WikiPageView.prototype.compileWikiSource = function(code) {
      var list, lists, result, _i, _len;
      result = "\n" + code;
      result = this.doReplace(result, /\n(!!(.+))/, '<h1>', '</h1>');
      result = this.doReplace(result, /\n(!(.+))/, '<h2>', '</h2>');
      result = this.doReplace(result, /(%%(.+)%%)/, '<span class="highlight italic">', '</span>');
      result = this.doReplace(result, /(\[\[(.+)\]\])/, '<span class="highlight link">', '</span>');
      result = this.doReplace(result, /(\*\*(.+)\*\*)/, '<span class="highlight bold">', '</span>');
      result = this.doReplace(result, /(\[img\](\S+))/, '<img src="', '" />');
      result = this.doReplace(result, /(\n-(.+))/, '<li>', '</li>');
      result = result.replace(/\n\s*\n/g, '</p><p>');
      result = result.replace(/\n/g, '<br />');
      lists = result.match(/(\s*<li>.+<\/li>)+/g);
      if (lists !== null) {
        for (_i = 0, _len = lists.length; _i < _len; _i++) {
          list = lists[_i];
          result = result.replace(list, '<ul>' + list + '</ul>');
        }
      }
      return '<p>' + result.slice(6) + '</p>';
    };

    WikiPageView.prototype.doReplace = function(code, regex, before, after) {
      var replaceMe, result;
      result = code;
      while ((replaceMe = result.match(regex)) !== null) {
        result = result.replace(replaceMe[1], before + replaceMe[2] + after);
      }
      return result;
    };

    return WikiPageView;

  })(Backbone.View);

}).call(this);
