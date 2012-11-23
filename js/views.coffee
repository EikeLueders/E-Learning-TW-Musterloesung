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

compileTemplate = (name) ->
  Mustache.compile $("#tw-template-#{name}").html()


class tw.ui.HomeView extends Backbone.View
  template: compileTemplate("home")

  render: (eventName) ->
    @$el.html @template()
    @


class tw.ui.LoginView extends Backbone.View
  template: compileTemplate("login")

  render: (eventName) ->
    @$el.html @template()
    @

  events:
    "submit #loginForm": "attemptLogin"

  attemptLogin: (event) ->

    event.preventDefault()

    username = @$el.find("input[name=username]").val()
    password = @$el.find("input[name=password]").val()

    done = (result) ->
      tw.$Session = result
      tw.$App.navigate "#home", trigger: true

    fail = (jqXHR, textStatus) ->
      $.mobile.hidePageLoadingMsg()
      alert 'Ung&uuml;ltiger Benutzername oder falsches Passwort!'

    $.mobile.showPageLoadingMsg()

    tw.model.Session.authenticate username, password, done, fail


class tw.ui.MyCoursesView extends Backbone.View
  template: compileTemplate("my-courses")

  initialize: () ->
    @collection.on 'add',   @addOne, @
    @collection.on 'reset', @addAll, @
    return

  addOne: (course, collection) ->
    item = new tw.ui.MyCoursesItemView model: course
    ul = @$("ul")
    ul.append(item.render().el)
    ul.listview('refresh') if @el.parentNode
    return

  addAll: (collection) ->
    _.each collection.models, ((course) -> @addOne course), @
    return

  render: () ->
    @$el.html @template()
    @addAll @collection
    @


class tw.ui.MyCoursesItemView extends Backbone.View
  tagName: "li"

  template: compileTemplate("my-courses-item")

  render: ->
    @$el.html @template @model.toJSON()
    @


class tw.ui.CourseView extends Backbone.View
  template: compileTemplate("course")

  initialize: ->
    @model.on "all", @render, @

  render: ->
    jsonModel = @model.toJSON()
    jsonModel['showWikiLink'] = @model.get("modules")["wiki"]
    @$el.html @template jsonModel

    if @el.parentNode
      @$el.page("destroy").page()

    @


class tw.ui.WikiView extends Backbone.View
  template: compileTemplate("wiki")

  initialize: () ->
    @collection.on 'add',   @addOne, @
    @collection.on 'reset', @addAll, @
    return

  addOne: (page, collection) ->
    item = new tw.ui.WikiItemView model: page
    ul = @$("ul")
    ul.append(item.render().el)
    ul.listview('refresh') if @el.parentNode
    return

  addAll: (collection) ->
    _.each collection.models, ((page) -> @addOne page), @
    return

  render: () ->
    @$el.html @template
      course_id : @collection.courseId
    @addAll @collection
    @
    
 
class tw.ui.WikiItemView extends Backbone.View
  tagName: "li"

  template: compileTemplate("wiki-item")
  render: ->
    @$el.html @template @model.toJSON()
    @


class tw.ui.WikiPageView extends Backbone.View
  template: compileTemplate("wiki-page")
  paginatorInitialized: false
  
  paginatorStorageID: ->
    'paginator-page-index-' + @model.get('course_id') + '-' + @model.get('keyword')

  initialize: ->
    @model.on "all", @render, @

  render: ->
    defaultFontSize = 100
    jsonModel = @model.toJSON()
    jsonModel['body'] = @compileWikiSource jsonModel['body']
    
    # set fontSize before slider is initialized by JQueryMobile
    jsonModel.fontSize = localStorage.getItem('format-font-size') 
    jsonModel.fontSize = defaultFontSize unless jsonModel.fontSize
    @$el.html @template jsonModel

    if @el.parentNode
      @$el.page("destroy").page()
      
    # add text format options
    @bindFormatChangeHandler 'format-font-size', 'font-size', defaultFontSize, '%'
    @bindFormatChangeHandler 'format-font-family', 'font-family', 'sans-serif'
    @bindFormatChangeHandler 'format-font-color', 'color', '#000'
    @bindFormatChangeHandler 'format-background-color', 'background-color', '#FFF'
    
    @$el.on 'pageshow', =>
      @paginate()
    @
    
  paginate: ->
    pageIndex = parseInt(localStorage.getItem(@paginatorStorageID()))
    unless pageIndex
      pageIndex = 0
    
    contentHeight = $(window).innerHeight() - $('[data-role="header"]').outerHeight() - $('[data-role="footer"]').outerHeight()
    content = @$el.find('.content')
    children = content.children()
    height = contentHeight
    pageCounter = 0
    children.hide()
    _.each children, (child) =>
      c = $(child)
      height -= c.outerHeight()
      
      if pageCounter is pageIndex
        c.show()

      if height < 0
        height = contentHeight
        pageCounter++
        
    if pageIndex >= pageCounter
      @$el.find('.paginator').jqPagination('option', 'current_page', pageCounter)
    else
      unless @paginatorInitialized
        @paginatorInitialized = true
        @$el.find('.paginator').jqPagination
          current_page: pageIndex+1
          max_page: pageCounter
          page_string: 'Seite {current_page} von {max_page}'
          paged: (newPageIndex) => 
            oldPageIndex = parseInt(localStorage.getItem(@paginatorStorageID()))
            newPageIndex--
            unless oldPageIndex is newPageIndex
              localStorage.setItem(@paginatorStorageID(), newPageIndex)
              @paginate()
      else
        @$el.find('.paginator').jqPagination('option', 'current_page', pageIndex+1)
        @$el.find('.paginator').jqPagination('option', 'max_page', pageCounter)
      
      $('html, body').scrollTop $(document).height()
    
  bindFormatChangeHandler: (domId, property, defaultValue, unit="") ->
    input = @$el.find '#' + domId
    input.live 'change', (e) =>
      newValue = $(e.target).val()
      @$el.find('.content').css(property, newValue + unit)
      localStorage.setItem(domId, newValue)

    localStorage.setItem(domId, defaultValue) unless localStorage.getItem domId
    input.val localStorage.getItem(domId)
    input.change()
    
  compileWikiSource: (code) ->
    result = "\n" + code
    
    result = @doReplace(result, /\n(!!(.+))/, '<h1>', '</h1>')
    result = @doReplace(result, /\n(!(.+))/, '<h2>', '</h2>')
    result = @doReplace(result, /(%%(.+)%%)/, '<span class="highlight italic">', '</span>')
    result = @doReplace(result, /(\[\[(.+)\]\])/, '<span class="highlight link">', '</span>' )
    result = @doReplace(result, /(\*\*(.+)\*\*)/, '<span class="highlight bold">', '</span>')
    result = @doReplace(result, /(\[img\](\S+))/, '<img src="', '" />')
    result = @doReplace(result, /(\n-(.+))/, '<li>', '</li>')
    
    result = result.replace(/\n\s*\n/g, '</p><p>')
    result = result.replace(/\n/g, '<br />')
    
    lists = result.match /(\s*<li>.+<\/li>)+/g
    unless lists is null
      result = result.replace(list, '<ul>' + list + '</ul>') for list in lists
    
    '<p>' + result[6..-1] + '</p>'
    
  doReplace: (code, regex, before, after) ->
    result = code
    while (replaceMe = result.match(regex)) != null
      result = result.replace(replaceMe[1], before + replaceMe[2] + after)
    result
  
