KEYCODES = require( "../../utils/keycodes" )

class FacetSubsDateRange extends require( "./base" )
	template: require( "../../tmpls/daterange.jade" )

	forcedDateRangeOpts: =>
		_opts =
			opens: "right"
			
		if @model.get( "dateformat" )
			_opts.locale =
				format: @model.get( "dateformat" )
		
		if @model.get("value")?[0]?
			@model.get("value")?[1]?
			if _.isNumber( @model.get("value")[0] )
				_sd = moment( @model.get("value")[0] )
			else
				_sd = moment( @model.get("value")[0], @model.get( "dateformat" ) )
			if _sd.isValid()
				_opts.startDate = _sd._d

		if @model.get("value")?[1]?
			if _.isNumber( @model.get("value")[1] )
				_ed = moment( @model.get("value")[1] )
			else
				_ed = moment( @model.get("value")[1], @model.get( "dateformat" ) )
			if _ed.isValid()
				_opts.endDate = _ed._d
		return _opts

	events: =>
		return

	focus: ()=>
		if not @daterangepicker?
			_opts = _.extend( {}, @model.get( "opts" ), @forcedDateRangeOpts() )
			@$inp.daterangepicker( _opts, @_dateReturn )
			@daterangepicker = @$inp.data( "daterangepicker" )
			@daterangepicker.container?.addClass( "daterange-iggy" )
			
			# prevent from handlich the outerclick exit from MainView
			@daterangepicker.container.on "click", ( evnt )->
				evnt.stopPropagation()
				return false
		else
			@daterangepicker.element = @$inp
			@daterangepicker.show()
			
		@$inp.on( "cancel.daterangepicker", @close )
		@$inp.on( "hide.daterangepicker", @close )
		return super
		
	close: =>
		super
		@$inp.off( "cancel.daterangepicker", @close )
		@$inp.off( "hide.daterangepicker", @close )
		return

	remove: =>
		@daterangepicker?.remove()
		@daterangepicker = null
		return super

	renderResult: =>
		_res = @getResults()
		
		if _.isNumber( _res.value[ 0 ] )
			_startDate = moment( _res.value[ 0 ] )
		else
			_startDate = moment( _res.value[ 0 ], @model.get( "dateformat" ) )
			
		if _res.value[ 1 ]?
			if _.isNumber( _res.value[ 1 ] )
				_endDate = moment( _res.value[ 1 ] )
			else
				_endDate = moment( _res.value[ 1 ], @model.get( "dateformat" ) )

		_time = @model.get( "opts" ).timePicker

		_s = "<li>"
		if @model.get( "dateformat" )?
			_frmt = @model.get( "dateformat" )
		else if _time
			_frmt = "LLLL"
		else
			_frmt = "LL"
		_s += _startDate.format( _frmt )

		if _endDate?
			_s += " - "
			_s += _endDate.format( _frmt )

		_s += "</li>"

		return _s
	
	_hasTabListener: ->
		return false
	
	_dateReturn: ( @startDate, @endDate )=>
		@model.set( "value", @getValue( false ) )
		@select()
		return

	getTemplateData: =>
		return super

	getValue: ( predef = true )=>
		if predef
			_predefVal = @model.get( "value" )
			if _predefVal?
				if not _.isArray( _predefVal )
					_predefVal =  [ _predefVal ]
				[ @startDate, @endDate ] = _predefVal
				return _predefVal
		_out = [ @startDate.valueOf() ]
		_out.push @endDate.valueOf() if @endDate?
		return _out

	select: =>
		_ModelConst = @getSelectModel()
		_model = new _ModelConst( value: @getValue() )
		@result.add( _model )
		@trigger( "selected", _model )
		@close()
		return

module.exports = FacetSubsDateRange
