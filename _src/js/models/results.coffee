class IggyResult extends Backbone.Model
	idAttribute: "name"
	defaults: 
		type: "string"
		name: null
		value: null

class IggyResults extends Backbone.Collection
	model: IggyResult
	parse: ( attr, options )=>
		_modify = options._facet?.get( "modify" )
		_name = options._facet?.get( "name" )
		_type = options._facet?.get( "type" )
		if _modify? and _.isFunction( _modify )
			attr.value = _modify( attr.value, options._facet, attr )
		return attr

module.exports = IggyResults