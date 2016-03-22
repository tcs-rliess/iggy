sortColl = require( "sortcoll" )

fnGet = ( el, key )->
	return el.get( key )

class IggyFacets extends require( "./backbone_sub" )
	
	constructor: ( models, options={} )->
		if not options.comparator?
			_forward = switch options.dir
				when "asc" then true
				when "desc" then false
				else true
			
			options.comparator = sortColl( [ "sort" ].concat( options.sortby or "name" ), { sort: false, "?": _forward }, fnGet )
		return super( models, options )
	
	_subCollecctionOptions: =>
		opt = super
		opt.dir = if @forward then "asc" else "desc"
		return opt
	
	modelId: (attrs)->
		return attrs.name
		
module.exports = IggyFacets
