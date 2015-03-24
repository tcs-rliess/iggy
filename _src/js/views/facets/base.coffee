KEYCODES = require( "../../utils/keycodes" )
SubResults = require( "../../models/subresults" )

class FacetSubsBase extends Backbone.View
	initialize: =>
		@result = new SubResults()
		return

	events: =>
		"keyup input##{@cid}": "input"
		"keydown input##{@cid}": "input"

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

	render: =>
		@$el.html( @template( @getTemplateData() ) )
		@$inp = @$el.find( "input##{@cid}" )
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

	getSelectModel: =>
		return SubResults.prototype.model

	select: =>
		_ModelConst = @getSelectModel()
		_model = new _ModelConst( value: @getValue(), custom: true )
		@result.add( _model )
		@trigger( "selected", _model )
		@close()
		return

module.exports = FacetSubsBase