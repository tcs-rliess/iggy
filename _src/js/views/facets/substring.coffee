class FacetSubString extends require( "./base" )
	template: require( "../../tmpls/string.jade" )
	
	events: =>
		"keyup #{@_getInpSelector()}": "input"
		"keydown #{@_getInpSelector()}": "input"
		"blur #{@_getInpSelector()}": "select"

	close: ( evnt )=>
		super
		try 
			@$inp?.remove()
		return
module.exports = FacetSubString