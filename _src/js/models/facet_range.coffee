class FctRange extends require( "./facet_base" )
	SubView: require( "../views/facets/subrange" )
	defaults: =>
		return $.extend super, 
			min: null
			max: null
			step: 1
			value: 50

module.exports = FctRange