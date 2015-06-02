class FacetBase extends Backbone.Model
	idAttribute: "name"
	SubView: require( "../views/facets/base" )
	defaults: ->
		type: "string"
		name: "name"
		label: "Description"

	getLabel: =>
		return @get( "label" )

	match: ( crit )=>
		_s =  @get( "name" ) + " " + @get( "label" )
		found = _s.toLowerCase().indexOf( crit.toLowerCase() )
		return found >= 0

	comparator: ( mdl )->
		return mdl.id

module.exports = FacetBase
