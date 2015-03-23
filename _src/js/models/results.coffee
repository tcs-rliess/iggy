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
		if _modify? and _.isFunction( _modify )
			attr.value = _modify( attr.value )
		return attr

module.exports = IggyResults