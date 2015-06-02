class FctDateRange extends require( "./facet_base" )
	SubView: require( "../views/facets/daterange" )
	defaults: =>
		return $.extend super,
			opts: {}
			value: null

module.exports = FctDateRange
