class FacetBase extends Backbone.Model
	idAttribute: "name"
	SubView: require( "../views/facets/base" )
	
	constructor: ( attrs, options )->
		@main = options.main
		super
		return
	
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
