SubResults = require( "../../models/subresults" )

class StringOption extends SubResults.prototype.model
	match: ( crit )=>
		_s =  @get( "value" ) + " " + @get( "label" )
		found = _s.toLowerCase().indexOf( crit.toLowerCase() )
		return found >= 0

class StringOptions extends SubResults
	model: StringOption


class ArrayOption extends Backbone.Model
	idAttribute: "value"
	getLabel: =>
		return @get( "label" ) or @get( "name" ) or "-"

	match: ( crit )=>
		_s =  @get( "value" ) + " " + @get( "label" )
		found = _s.toLowerCase().indexOf( crit.toLowerCase() )
		return found >= 0

class ArrayOptions extends require( "../../models/backbone_sub" )
	model: ArrayOption

class FacetSubArray extends require( "../selector" )
	optDefault: 
		name: "-"
		value: "-"
		group: null

	multiSelect: true

	optColl: StringOptions

	constructor: ( options )->
		options.custom = true
		@collection = @_createOptionCollection( options.model.get( "options" ) )
		super( options )
		return

	select: =>
		_vals = @model.get( "value" )
		if _vals? and not _.isArray( _vals )
			_vals = [ _vals ]

		for _val in _vals
			_mdl = @collection.get( _val )
			if not _mdl?
				_mdl = new @collection.model( value: _val, custom: true )
			@selected( _mdl )
		@close()
		return 

	getResults: =>
		value: @result.pluck( "value" )

	_createOptionCollection: ( options )=>
		if _.isFunction( options )
			return options( @_createOptionCollection )

		_opts = []
		for opt in options
			if _.isString( opt ) or _.isNumber( opt )
				_opts.push { value: opt, label: opt, group: null }
			else if _.isObject(  )
				_opts.push _.extend( {}, @optDefault, opt );

		return new @optColl( _opts )


module.exports = FacetSubArray