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
		@$el.removeClass( "closed" )
		@focused = true
		@$inp.focus()
		return

	renderResult: ( renderEmpty = false )=>
		if renderEmpty
			return ""
		_list = []
		for model, idx in @result.models
			_lbl = model.getLabel()
			if _lbl? and _lbl isnt ""
				_list.push model.getLabel()
		if _list.length
			return "<li>" + _list.join( "</li><li>" ) + "</li>"
		return ""
		
		
	open: =>
		@$el.removeClass( "closed" )
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
		ret =
			cid: @cid
			#tab_index: ( ( @model?._idx * 10 ) or 1 ) + ( ( @sub?.parent?.idx or 1 ) * 1000 )
			value: @model?.get( "value" )
		return ret

	_getInpSelector: =>
		return "input##{@cid}"
	
	reopen: ( pView )=>
		@$el.removeClass( "closed" )
		@$el.addClass( "open" )
		@render()
		pView?.open()
		return
	
	render: ( initialAdd )=>
		_tmpl = @template(  @getTemplateData() )
		@$el.html( _tmpl )
		if not initialAdd
			@$el.removeClass( "closed" )
		@$inp = @$el.find( @_getInpSelector() )
		#$( document ).on @_hasTabEvent(), @_onKey if @_hasTabListener( true )
		return
	
	_hasTabEvent: ->
		return "keydown"
		
	_hasTabListener: ->
		return true
	
	_onTabAction: ( evnt )=>
		evnt.preventDefault()
		evnt.stopPropagation()
		@select()
		return true

	close: ( evnt )=>
		@focused = false
		#$( document ).off @_hasTabEvent(), @_onKey if @_hasTabListener( false )
		@$el.removeClass( "open" )
		@$el.addClass( "closed" )
		@isOpen = false
		@trigger( "closed", @result, evnt )
		return

	getResults: =>
		value: @getValue()
	
	isResultEmpty: ( res )=>
		if res?.value?
			return @isResultEmpty( res.value )
		
		if not res?
			return true
		if res is ""
			return true
		if _.isArray( res ) and res.length <= 0
			return true
		
		return false
	
	getResValue: =>
		res = @result?.first()?.toJSON()
		
		return res?.value or ""
		
	isEqualCurrent: ( val = @getValue() )=>
		rv = @getResValue()
		if rv is val
			return true
		return false
		
	getValue: =>
		return @$inp.val()

	getSelectModel: ->
		return SubResults.prototype.model

	_checkSelectEmpty: ( _val, evnt )=>
		#debugger
		# if @isEqualCurrent( _val )
		# 	@close()
		# 	return true
			
		if _.isEmpty( _val ) and not _.isNumber( _val ) and not _.isBoolean( _val )# and not @model.get( "pinned" )
			@close( evnt )
			return true
		return false

	select: ( evnt )=>
		_val = @getValue()
		#return if @_checkSelectEmpty( _val, evnt )
		@set( _val, evnt )
		return

	set: ( val, evnt )=>
		_model = @result.first()
		if not _model?
			_ModelConst = @getSelectModel()
			_model = new _ModelConst( value: val )
			@result.add( _model )
		else
			_model.set( value: val )
		@trigger( "selected", _model, evnt )
		@close( evnt )
		return


module.exports = FacetSubsBase
