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
	
	templateResLi: require( "../../tmpls/array_resultli.jade" )
	
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
	
	close: ( evnt )=>
		if @loading
			evnt?.preventDefault()
			evnt?.stopPropagation()
			@focus()
			return
		return super
	
	rmRes: ( evnt )=>
		_id = $( evnt.target )?.data( "id" )
		@result.remove( _id )
		return
	
	renderResult: ( renderEmpty = false )=>
		if renderEmpty
			return "<li></li>"
		_list = []
		for model, idx in @result.models
			_list.push @templateResLi( txt: model.getLabel(), id: model.id )

		return "<li>" + _list.join( "</li><li>" ) + "</li>"
	
	constructor: ( options )->
		@loading = false
		if options.model.get( "count" )?
			@selectCount = options.model.get( "count" )
		options.custom = true
		if options.model.get( "custom" )?
			options.custom = Boolean( options.model.get( "custom" ) )
			
		@collection = @_createOptionCollection( options.model.get( "options" ) )
		
		if not options.custom and @selectCount <= 0
			@selectCount = @collection.length
			
		super( options )
		
		@result.on "remove", ( mdl, coll )=>
			if coll.length
				options.sub.renderResult()
			@searchcoll.add( mdl )
			@trigger( "removed", mdl )
			return
		return
	
	_isFull: =>
		if @selectCount <= 0
			return false
		return ( @result or []).length >= @selectCount
		
	select: =>
		if @loading
			return
			
		_vals = @model.get( "value" )
		if _vals? and not _.isArray( _vals )
			_vals = [ _vals ]
		if not _vals?.length
			return
			
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
			@loading = true
			_coll = new @optColl( [] )
			
			setTimeout( =>
				@$el.parent().addClass( "loading" )
				options @result, @model, ( aOpts )=>
					for _opt, idx in aOpts
						aOpts[idx] = _.extend( {}, @optDefault, _opt, { custom: false } )
					_coll.add( aOpts )
					@loading = false
					@$el.parent().removeClass( "loading" )
					@select()
					return
					
			, 0 )
			return _coll

		_opts = []
		for opt in options
			if _.isString( opt ) or _.isNumber( opt )
				_opts.push { value: opt, label: opt }
			else if _.isObject(opt)
				_opts.push _.extend( {}, @optDefault, opt )
		return new @optColl( _opts )


module.exports = FacetSubArray
