class ArrayOption extends Backbone.Model
	idAttribute: "value"
	getLabel: =>
		return @get( "label" ) or @get( "name" ) or "-"

	match: ( crit )=>
		_s =  @get( "value" ) + " " + @get( "label" )
		found = _s.toLowerCase().indexOf( crit.toLowerCase() )
		return found >= 0


class ArrayOptions extends require( "../../models/backbone_sub" )
	model: ArrayOption

class FacetSubArray extends require( "./base" )
	multiSelect: true

	getResults: =>
		value: @result.pluck( "value" )


module.exports = FacetSubArray