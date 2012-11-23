
/*
# Copyright (c) 2012 - <mlunzena@uos.de>
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


/*
Session is not the typical Model as one does not want to store the
password on the client side. So this is just a simple class to hold
the user`s name and id and to create a new instance by providing the
credentials.
*/


(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  tw.model.Session = (function() {

    Session.authenticate = function(username, password, done, fail) {
      /*
          Instead of interacting with the RestIP plugin, we have to call our
          mothership to login as the RestIP plugin does not allow
          unauthorized endpoints as of now.
      */

      var xhr;
      xhr = $.ajax({
        url: "" + tw.PLUGIN_URL + "login",
        dataType: 'json',
        data: {
          username: username,
          password: password
        },
        type: 'POST'
      });
      /*
          Call the fail callback, if there is one.
      */

      if (fail) {
        xhr.fail(fail);
      }
      /*
          Create a new Session off the response and call the done
          callback, if there is one.
      */

      xhr.done(function(msg) {
        var session;
        session = new tw.model.Session(msg);
        if (done) {
          return done(session);
        }
      });
    };

    function Session(creds) {
      this.id = creds.id, this.name = creds.name;
    }

    /*
      Just for convenience. In Stud.IP unauthorized users have an empty
      name and "nobody" as their id.
    */


    Session.prototype.authenticated = function() {
      return this.id !== "nobody";
    };

    return Session;

  })();

  tw.model.Course = (function(_super) {

    __extends(Course, _super);

    function Course() {
      return Course.__super__.constructor.apply(this, arguments);
    }

    Course.prototype.idAttribute = "course_id";

    Course.prototype.urlRoot = function() {
      return tw.API_URL + "api/courses/";
    };

    Course.prototype.parse = function(response) {
      return response.course || response;
    };

    return Course;

  })(Backbone.Model);

  tw.model.Courses = (function(_super) {

    __extends(Courses, _super);

    function Courses() {
      return Courses.__super__.constructor.apply(this, arguments);
    }

    Courses.prototype.model = tw.model.Course;

    Courses.prototype.url = function() {
      return tw.API_URL + "api/courses";
    };

    Courses.prototype.parse = function(response) {
      return response != null ? response.courses : void 0;
    };

    return Courses;

  })(Backbone.Collection);

  tw.model.WikiPage = (function(_super) {

    __extends(WikiPage, _super);

    function WikiPage() {
      return WikiPage.__super__.constructor.apply(this, arguments);
    }

    WikiPage.prototype.idAttribute = "page_id";

    WikiPage.prototype.urlRoot = function() {
      return tw.API_URL + "api/courses/" + this.get('course_id') + "/wiki";
    };

    return WikiPage;

  })(Backbone.Model);

  tw.model.Wiki = (function(_super) {

    __extends(Wiki, _super);

    function Wiki() {
      return Wiki.__super__.constructor.apply(this, arguments);
    }

    Wiki.prototype.model = tw.model.WikiPage;

    Wiki.prototype.url = function() {
      return tw.API_URL + "api/courses/" + this.courseId + "/wiki";
    };

    Wiki.prototype.parse = function(response) {
      var result,
        _this = this;
      result = [];
      _.each(response, function(name) {
        return result.push({
          id: name,
          courseId: _this.courseId
        });
      });
      return result;
    };

    return Wiki;

  })(Backbone.Collection);

}).call(this);
