KEYCODES = require( "../../utils/keycodes" )

class FacetSubsDateRange extends require( "./base" )
	template: require( "../../tmpls/daterange.jade" )

	render: =>
		super
		return

	forcedDateRangeOpts:
		opens: "right"

	events: => 
		return

	focus: ()=>
		if not @daterangepicker?
			_opts = _.extend( {}, @model.get( "opts" ), @forcedDateRangeOpts )
			@$inp.daterangepicker( _opts, @_dateReturn )
			@daterangepicker = @$inp.data( "daterangepicker" )
			@$inp.on( "cancel.daterangepicker", @close )
			@$inp.on( "hide.daterangepicker", @close )

			@daterangepicker.container?.addClass( "daterange-iggy" )

		else
			@daterangepicker.show()
		return super

	remove: =>
		@daterangepicker?.remove()
		return super

	renderResult: =>
		_res = @getResults()

		_time = @model.get( "opts" ).timePicker

		_s = "<li>"
		_s += @startDate.format( ( if _time then "LLLL" else "LL" ) )

		if @endDate?
			_s += " - "
			_s += @endDate.format( ( if _time then "LLLL" else "LL" ) )

		_s += "</li>"

		return _s

	_dateReturn: ( @startDate, @endDate )=>
		@select()
		return

	getTemplateData: =>
		return super

	getValue: =>
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