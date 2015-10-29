class IggyFacets extends require( "./backbone_sub" )
	initialize: ( models, options={} )->
		@forward = switch options.dir
			when "asc" then true
			when "desc" then false
			else true
		return super
	
	_subCollecctionOptions: =>
		opt = super
		opt.dir = if @forward then "asc" else "desc"
		return opt
	
	modelId: (attrs)->
		return attrs.name
		
	comparator: ( facetA, facetB )=>
		_sA = facetA.get( "sort" ) or 0
		_sB = facetB.get( "sort" ) or 0
		if _sA > _sB
			return if @forward then -1 else 1
		else if _sA < _sB
			return if @forward then 1 else -1
		else
			_nA = facetA.get( "name" )
			_nB = facetB.get( "name" )
			if _nA? and _nB?
				if _nA > _nB
					return if @forward then 1 else -1
				else if _nA < _nB
					return if @forward then -1 else 1
		return 0

module.exports = IggyFacets
