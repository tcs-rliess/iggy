SubResults = require( "../../models/subresults" )
KEYCODES = require( "../../utils/keycodes" )

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
		label: "-"
		value: "-"

	selectCount: 0

	optColl: StringOptions
	
	events: =>
		_evnts = super
		#if not @model.get( "operators" )?.length
		_evnts[ "blur input##{@cid}" ] = "close"
		return _evnts
	
	constructor: ( options )->
		if options.model.get( "count" )?
			@selectCount = options.model.get( "count" )
		options.custom = true
		if options.model.get( "custom" )?
			options.custom = Boolean( options.model.get( "custom" ) )
			
		@collection = @_createOptionCollection( options.model.get( "options" ) )
		
		if not options.custom and @selectCount <= 0
			@selectCount = @collection.length
			
		super( options )
		return
	
	_isFull: =>
		if @selectCount <= 0
			return false
		return ( @result or []).length >= @selectCount
		
	select: =>
		_vals = @model.get( "value" )
		if _vals? and not _.isArray( _vals )
			_vals = [ _vals ]
		for _val in ( if @selectCount <= 0 then _vals else _vals[...@selectCount] )
			_mdl = @collection.get( _val )
			if not _mdl?
				_mdl = new @collection.model( value: _val, custom: true )
			@selected( _mdl )
		@close()
		return
	
	reopen: ( pView )=>
		if @_isFull()
			return
		super
		return
	
	getResults: =>
		value: @result.pluck( "value" )
	
	_onTabAction: ( evnt )=>
		evnt.preventDefault()
		evnt.stopPropagation()
		searchContent = @$inp.val()
		if searchContent?.length
			@selectActive()
			return
		@close()
		return
		
	_createOptionCollection: ( options )=>
		if _.isFunction( options )
			return options( @_createOptionCollection )

		_opts = []
		for opt in options
			if _.isString( opt ) or _.isNumber( opt )
				_opts.push { value: opt, label: opt }
			else if _.isObject(opt)
				_opts.push _.extend( {}, @optDefault, opt )
		return new @optColl( _opts )


module.exports = FacetSubArray
