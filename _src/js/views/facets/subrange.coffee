class FacetSubsRange extends require( "./number_base" )
	template: require( "../../tmpls/range.jade" )

	_getInpSelector: ( ext = "_from" )=>
		return "input##{@cid}#{ext}"

	events: =>
		"keyup #{@_getInpSelector()}": "input"
		"keydown #{@_getInpSelector()}": "input"
		"keyup #{@_getInpSelector( "_to" )}": "input"
		"keydown #{@_getInpSelector( "_to" )}": "input"

	renderResult: =>
		_res = @getResults()
		return "<li>" +_res.value.join( " - " ) + "</li>"

	render: =>
		super
		@$inpTo = @$el.find( @_getInpSelector( "_to" ) )
		return

	focus: ( inp = false )=>
		super
		return

	close: =>
		@$( ".rangeinp" ).remove()
		super
		return

	getResults: =>
		_ret =
			value: @getValue()
		return _ret

	getValue: =>
		_vFrom = super
		_v = @$inpTo.val()
		if not _v?.length
			return null
		_vTo = parseInt( @valueByDefinition( _v), 10 )

		return [ _vFrom, _vTo ]



module.exports = FacetSubsRange
