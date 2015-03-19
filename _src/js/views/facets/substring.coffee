SubResults = require( "../../models/subresults" )

class StringOption extends SubResults.prototype.model
	match: ( crit )=>
		_s =  @get( "value" ) + " " + @get( "label" )
		found = _s.toLowerCase().indexOf( crit.toLowerCase() )
		return found >= 0

class StringOptions extends SubResults
	model: StringOption

class FacetSubString extends require( "../selector" )
	optDefault: 
		name: "-"
		value: "-"
		group: null

	optColl: StringOptions


	constructor: ( options )->
		options.custom = true
		@collection = @_createOptionCollection( options.model.get( "options" ) )
		super( options )
		return

	getResults: =>
		value: @result.first()?.id

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

module.exports = FacetSubString