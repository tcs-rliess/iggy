SubResults = require( "../../models/subresults" )

class FacetSubsBase extends Backbone.View
	initialize: =>
		@result = new SubResults()
		return

	focus: =>
		@$inp.focus()
		return

	open: =>
		@$el.addClass( "open" )
		@isOpen = true
		@trigger( "opened" )
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