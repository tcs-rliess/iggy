class IggyResult extends Backbone.Model
	idAttribute: "name"
	defaults:
		type: "string"
		name: null
		value: null

class IggyResults extends require( "./backbone_sub" )
	model: IggyResult
	initialize: ( mdls, opts )=>
		if opts.modifyKey?.length
			@modifyKey = opts.modifyKey
		return
	parse: ( attr, options )=>
		_key = options._facet.get( "modifyKey" ) or @modifyKey or "value"
		_modify = options._facet?.get( "modify" )
		if _modify? and _.isFunction( _modify )
			attr[ _key ] = _modify( attr.value, options._facet, attr )
		return attr

module.exports = IggyResults
