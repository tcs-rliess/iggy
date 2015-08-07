class BaseResult extends Backbone.Model
	idAttribute: "value"
	getLabel: =>
		return @get( "label" ) or @get( @idAttribute ) or "-"


class BaseResults extends require( "./backbone_sub" )
	model: BaseResult

module.exports = BaseResults
