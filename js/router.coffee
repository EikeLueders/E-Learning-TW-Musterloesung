###
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
###

requireSession = () ->
  (callback) ->
    ->
      if tw.$Session.authenticated()
        callback.apply(this, arguments)
      else
        @navigate "login", trigger: true


class tw.router.AppRouter extends Backbone.Router

  initialize: () ->
    @firstPage = true

  routes:
    "":           "home"
    "home":       "home"
    "login":      "login"
    "my-courses": "myCourses"
    "course/:id": "course"
    "course/:id/wiki" : "wiki"
    "course/:course_id/wiki/:id" : "wikiPage"

  login:
    () ->
      @changePage new tw.ui.LoginView()
      return

  home:
    requireSession() \
    ->
      @changePage new tw.ui.HomeView()
      return

  myCourses:
    requireSession() \
    ->
      courses = new tw.model.Courses()

      $.mobile.showPageLoadingMsg()

      courses.fetch().done =>
        @changePage new tw.ui.MyCoursesView(collection: courses)

  course:
    requireSession() \
    (id) ->

      course = new tw.model.Course course_id: id

      $.mobile.showPageLoadingMsg()

      course.fetch()
        .done =>
          @changePage new tw.ui.CourseView(model: course)
      
  wiki:
    requireSession() \
    (courseId) ->

      pages = new tw.model.Wiki
      pages.courseId = courseId

      $.mobile.showPageLoadingMsg()

      pages.fetch()
        .done =>
          @changePage new tw.ui.WikiView(collection: pages)

  wikiPage:
    requireSession() \
    (courseId, id) ->

      page = new tw.model.WikiPage(course_id: courseId, page_id: id)

      $.mobile.showPageLoadingMsg()

      page.fetch()
        .done =>
          @changePage new tw.ui.WikiPageView(model: page)

  changePage: (page) ->
    $(page.el).attr('data-role', 'page')
    page.render()
    $('body').append $ page.el

    transition = $.mobile.defaultPageTransition
    if @firstPage
      transition = 'none'
      @firstPage = false

    $.mobile.changePage $(page.el),
      changeHash: false
      transition: transition
