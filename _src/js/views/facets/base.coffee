KEYCODES = require( "../../utils/keycodes" )
SubResults = require( "../../models/subresults" )

class FacetSubsBase extends Backbone.View
	resultTemplate: require( "../../tmpls/result_base.jade" )

	initialize: ( options )=>
		@sub = options.sub
		@result = new SubResults()
		return

	events: =>
		"keyup #{@_getInpSelector()}": "input"
		"keydown #{@_getInpSelector()}": "input"

	focus: =>
		@$inp.focus()
		return

	renderResult: ( renderEmpty = false )=>
		if renderEmpty
			return "<li></li>"
		_list = []
		for model, idx in @result.models
			_list.push model.getLabel()

		return "<li>" + _list.join( "</li><li>" ) + "</li>"
		
	open: =>
		@$el.addClass( "open" )
		@isOpen = true
		@trigger( "opened" )
		return

	input: ( evnt )=>
		if evnt.type is "keydown"
			switch evnt.keyCode
				when KEYCODES.ENTER
					@select()
		return
	
	_onKey: ( evnt )=>
		if evnt.keyCode is KEYCODES.TAB or evnt.keyCode in KEYCODES.TAB
			@_onTabAction( evnt )
			return
		return
		
	getTemplateData: =>
		cid: @cid
		value: @model?.get( "value" )

	_getInpSelector: =>
		return "input##{@cid}"
	
	reopen: ( pView )=>
		@$el.removeClass( "closed" )
		@$el.addClass( "open" )
		@render()
		pView.open()
		return
	
	render: =>
		_tmpl = @template(  @getTemplateData() )
		@$el.html( _tmpl )
		@$inp = @$el.find( @_getInpSelector() )
		$( document ).on @_hasTabEvent(), @_onKey if @_hasTabListener( true )
		return
	
	_hasTabEvent: ->
		return "keydown"
		
	_hasTabListener: ->
		return true
	
	_onTabAction: ( evnt )=>
		evnt.preventDefault()
		evnt.stopPropagation()
		@select()
		return

	close: ( evnt )=>
		$( document ).off @_hasTabEvent(), @_onKey if @_hasTabListener( false )
		@$el.removeClass( "open" )
		@$el.addClass( "closed" )
		@isOpen = false
		@trigger( "closed", @result )
		return

	getResults: =>
		value: @getValue()

	getValue: =>
		return @$inp.val()

	getSelectModel: ->
		return SubResults.prototype.model

	_checkSelectEmpty: ( _val )=>
		if _.isEmpty( _val ) and not _.isNumber( _val ) and not _.isBoolean( _val )
			@close()
			return true
		return false

	select: =>
		_val = @getValue()
		return if @_checkSelectEmpty( _val )
		@set( _val )
		return

	set: ( val )=>
		_model = @result.first()
		if not _model?
			_ModelConst = @getSelectModel()
			_model = new _ModelConst( value: val )
			@result.add( _model )
		else
			_model.set( value: val )
		@trigger( "selected", _model )
		@close()
		return


module.exports = FacetSubsBase
