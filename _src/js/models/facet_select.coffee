class FctSelect extends require( "./facet_base" )
	SubView: require( "../views/facets/subselect" )
	defaults: =>
		return $.extend super,
			options: []

module.exports = FctSelect
