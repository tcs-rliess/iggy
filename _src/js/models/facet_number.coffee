class FctNumber extends require( "./facet_base" )
	SubView: require( "../views/facets/subnumber" )
	defaults: =>
		return $.extend super, 
			min: 0
			max: 100
			step: 1
			value: 50

module.exports = FctNumber