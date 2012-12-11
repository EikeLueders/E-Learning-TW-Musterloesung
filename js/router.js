
/*
# Copyright (c) 2012 -
# Tobias Thelen <tthelen@uos.de>,
# Marcus Lunzenauer <mlunzena@uos.de>,
# Eike Lüders <elueders@uos.de>,
# Ron Lucke <rlucke@uos.de>,
# Tilo Wiedera <twiedera@uos.de>,
# Fabian Otte  <>
# 
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
  var requireSession,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  requireSession = function() {
    return function(callback) {
      return function() {
        if (tw.$Session.authenticated()) {
          return callback.apply(this, arguments);
        } else {
          return this.navigate("login", {
            trigger: true
          });
        }
      };
    };
  };

  tw.router.AppRouter = (function(_super) {

    __extends(AppRouter, _super);

    function AppRouter() {
      return AppRouter.__super__.constructor.apply(this, arguments);
    }

    AppRouter.prototype.initialize = function() {
      return this.firstPage = true;
    };

    AppRouter.prototype.routes = {
      "": "home",
      "home": "home",
      "login": "login",
      "my-courses": "myCourses",
      "course/:id": "course",
      "course/:id/wiki": "wiki",
      "course/:course_id/wiki/:id": "wikiPage"
    };

    AppRouter.prototype.login = function() {
      this.changePage(new tw.ui.LoginView());
    };

    AppRouter.prototype.home = requireSession()(function() {
      this.changePage(new tw.ui.HomeView());
    });

    AppRouter.prototype.myCourses = requireSession()(function() {
      var courses,
        _this = this;
      courses = new tw.model.Courses();
      $.mobile.showPageLoadingMsg();
      return courses.fetch().done(function() {
        return _this.changePage(new tw.ui.MyCoursesView({
          collection: courses
        }));
      });
    });

    AppRouter.prototype.course = requireSession()(function(id) {
      var course,
        _this = this;
      course = new tw.model.Course({
        course_id: id
      });
      $.mobile.showPageLoadingMsg();
      return course.fetch().done(function() {
        return _this.changePage(new tw.ui.CourseView({
          model: course
        }));
      });
    });

    AppRouter.prototype.wiki = requireSession()(function(courseId) {
      var pages,
        _this = this;
      pages = new tw.model.Wiki;
      pages.courseId = courseId;
      $.mobile.showPageLoadingMsg();
      return pages.fetch().done(function() {
        return _this.changePage(new tw.ui.WikiView({
          collection: pages
        }));
      });
    });

    AppRouter.prototype.wikiPage = requireSession()(function(courseId, id) {
      var page,
        _this = this;
      page = new tw.model.WikiPage({
        course_id: courseId,
        page_id: id
      });
      $.mobile.showPageLoadingMsg();
      return page.fetch().done(function() {
        return _this.changePage(new tw.ui.WikiPageView({
          model: page
        }));
      });
    });

    AppRouter.prototype.changePage = function(page) {
      var transition;
      $(page.el).attr('data-role', 'page');
      page.render();
      $('body').append($(page.el));
      transition = $.mobile.defaultPageTransition;
      if (this.firstPage) {
        transition = 'none';
        this.firstPage = false;
      }
      return $.mobile.changePage($(page.el), {
        changeHash: false,
        transition: transition
      });
    };

    return AppRouter;

  })(Backbone.Router);

}).call(this);
