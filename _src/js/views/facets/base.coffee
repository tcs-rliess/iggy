KEYCODES = require( "../../utils/keycodes" )
SubResults = require( "../../models/subresults" )

class FacetSubsBase extends Backbone.View
	resultTemplate: require( "../../tmpls/result_base.jade" )

	initialize: =>
		@result = new SubResults()
		return

	events: =>
		"keyup #{@_getInpSelector()}": "input"
		"keydown #{@_getInpSelector()}": "input"

	focus: =>
		@$inp.focus()
		return

	renderResult: =>
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

	getTemplateData: =>
		cid: @cid
		value: @model?.get( "value" )

	_getInpSelector: =>
		return "input##{@cid}"

	render: =>
		_tmpl = @template( @getTemplateData() )
		@$el.html( _tmpl )
		@$inp = @$el.find( @_getInpSelector() )
		return

	close: ( evnt )=>
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
		_ModelConst = @getSelectModel()
		_model = new _ModelConst( value: val )
		@result.add( _model )
		@trigger( "selected", _model )
		@close()
		return


module.exports = FacetSubsBase
