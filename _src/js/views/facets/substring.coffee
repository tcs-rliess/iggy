class FacetSubString extends require( "./base" )
	template: require( "../../tmpls/string.jade" )
	
	events: =>
		"keyup #{@_getInpSelector()}": "input"
		"keydown #{@_getInpSelector()}": "input"
		"blur #{@_getInpSelector()}": "select"

	close: ( evnt )=>
		super
		try
			@$inp?.remove?()
		return
	
	reopen: ( pView )=>
		_oldVal = @result?.first()?.get( "value" )
		@model.set( value: _oldVal )
		pView.$results.empty().html( @renderResult( true ) )
		super
		return
	
	select: ( evnt )=>
		_val = @getValue()
		#return if @_checkSelectEmpty( _val, evnt )
		@set( _val, evnt )
		return
	
	focus: =>
		super
		@$inp.select()
		return
				
module.exports = FacetSubString
