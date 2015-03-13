class StringOption extends Backbone.Model
	idAttribute: "value"
	getLabel: =>
		return @get( "label" ) or @get( "name" ) or "-"

	match: ( crit )=>
		_s =  @get( "value" ) + " " + @get( "label" )
		found = _s.toLowerCase().indexOf( crit.toLowerCase() )
		return found >= 0

class StringOptions extends require( "../../models/backbone_sub" )
	model: StringOption

class FacetSubString extends require( "../selector" )
	optDefault: 
		name: "-"
		value: "-"
		group: null

	constructor: ( options )->
		options.custom = true
		@collection = @_createOptionCollection( options.model.get( "options" ) )
		super( options )
		return

	_createOptionCollection: ( options )=>
		if _.isFunction( options )
			return options( @_createOptionCollection )

		_opts = []
		for opt in options
			if _.isString( opt ) or _.isNumber( opt )
				_opts.push { value: opt, label: opt, group: null }
			else if _.isObject(  )
				_opts.push _.extend( {}, @optDefault, opt );

		return new StringOptions( _opts )

module.exports = FacetSubString