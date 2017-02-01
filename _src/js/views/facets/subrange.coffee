class FacetSubsRange extends require( "./number_base" )
	template: require( "../../tmpls/range.jade" )

	_getInpSelector: ( ext = "_from" )=>
		return "input##{@cid}#{ext}"

	events: =>
		"keyup #{@_getInpSelector()}": "input"
		"keydown #{@_getInpSelector()}": "input"
		"keyup #{@_getInpSelector( "_to" )}": "input"
		"keydown #{@_getInpSelector( "_to" )}": "input"
		"blur #{@_getInpSelector()}": "select"
		"blur #{@_getInpSelector( "_to" )}": "select"
		"mousedown #{@_getInpSelector()}": "clickSel"
		"mousedown #{@_getInpSelector( "_to" )}": "clickSel"

	renderResult: ( renderEmpty = false )=>
		if renderEmpty
			return ""
		_res = @getResults()
		return "<li>" +_res.value.join( " - " ) + "</li>"

	render: =>
		super
		@$inpTo = @$el.find( @_getInpSelector( "_to" ) )
		return

	focus: ( inp = false )=>
		super
		@$inp.select()
		return
	
	clickSel: ( evnt )=>
		evnt.currentTarget.focus()
		return
		
	reopen: ( pView )=>
		_oldVal = @result.first().get( "value" )
		@model.set( value: _oldVal )
		pView.$results.empty().html( @renderResult( true ) )
		super
		return
		
	select: ( evnt )=>
		if evnt? and ( evnt?.relatedTarget is @$inp.get(0) or evnt?.relatedTarget is @$inpTo.get(0) )
			evnt.stopPropagation()
			return
			
		
		#if @$inp.is( evnt.target ) and not evnt.shiftKey
			
		super
		return
	
	close: =>
		try
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
	
	_onTabAction: ( evnt )=>
		
		if @$inp.is( evnt.target ) and not evnt.shiftKey
			evnt.stopPropagation()
			evnt.preventDefault()
			@$inpTo.focus().select()
			console.log "focus next"
			return false
		
		if @$inpTo.is( evnt.target ) and evnt.shiftKey
			evnt.stopPropagation()
			evnt.preventDefault()
			@$inp.focus().select()
			return false
			
		_val = @getValue()
		if _val?.length >= 2
			evnt.preventDefault()
			evnt.stopPropagation()
			@select()
			return true
			
		# return false to prevent jump to next facet
		return true



module.exports = FacetSubsRange
