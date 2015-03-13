class FctString extends require( "./facet_base" )
	SubView: require( "../views/facets/substring" )
	defaults: =>
		return $.extend super, 
			options: []

module.exports = FctString