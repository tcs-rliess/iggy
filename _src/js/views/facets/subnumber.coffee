KEYCODES = require( "../../utils/keycodes" )

nearest = (n, v)->
	n = n / v
	n = Math.round(n) * v
	return n
	
precision = (n, dp)->
	dp = Math.pow(10, dp)
	n = n * dp
	n = Math.round(n)
	n = n / dp
	return n

class FacetSubsNumber extends require( "./base" )
	template: require( "../../tmpls/number.jade" )

	constructor: ->
		@setNumber = _.throttle( @_setNumber, 300, {leading: false} )
		super
		return

	events: =>
		_evnts = 
			"keyup #{@_getInpSelector()}": "input"
			"keydown #{@_getInpSelector()}": "input"
			"blur #{@_getInpSelector()}": "select"
		return _evnts

	render: =>
		super
		if @model.get( "operators" )?.length
			@$inpOp = @$el.find( "select##{@cid}op" )
			@$inpOp.select2( { width: "auto" } )
			@$inpOp.on( "select2:close", @_opSelected )
		return

	renderResult: =>
		_res = @getResults()

		_s = "<li>"
		_s += _res.operator + " " if _res.operator?
		_s += _res.value
		_s += "</li>"

		return _s

	close: ( evnt )=>
		if @$inpOp?
			@$inpOp.select2( "destroy" )
			@$inpOp.remove()
			@$inpOp = null
		super
		return

	_opSelected: =>
		@selectedOP = true
		@focus()
		return

	focus: ( inp = false )=>
		if @$inpOp? and not @selectedOP
			@$inpOp.select2( "open" )
			return
		super
		return

	getTemplateData: =>
		return _.extend( super, { operators: @model.get( "operators" ) } )

	input: ( evnt )=>
		if evnt.type is "keydown"
			switch evnt.keyCode
				when KEYCODES.UP
					@crement( @model.get( "step" ) )
					return
				when KEYCODES.DOWN
					@crement( @model.get( "step" ) * -1 )
					return
				when KEYCODES.ENTER
					@select()
					return
		
		if evnt.type is "keyup"
			_v = evnt.currentTarget.value.replace( /[^\d]?[^-\d]+/g, "" )
			_v = parseInt( _v, 10 )
			 
			@setNumber( _v )
		return

	crement: ( change )=>
		console.log "crement", change
		_v = @$inp.val()
		if not _v?.length
			_v = @model.get( "value" )
		else
			_v = parseInt( _v, 10 )

		@_setNumber( _v + change )

		return

	getResults: =>
		if @$inpOp?
			_ret = 
				value: @getValue()
				operator: @$inpOp.val()
		else
			_ret = 
				value: @getValue()
		return _ret

	getValue: =>
		_v = @$inp.val()
		return parseInt( @valueByDefinition( _v), 10 )

	_setNumber: ( _v )=>
		if isNaN( _v )
			#@$inp.val("")
			return

		_curr = @$inp.val()

		_v = @valueByDefinition( _v)
		if _curr != _v.toString()
			@$inp.val( _v )
		return

	valueByDefinition: ( _value )->
		max = @model.get( "max" )
		min = @model.get( "min" )
		step = @model.get( "step" )
		
		# fix reversed min/max setting
		if min > max
			_tmp = min
			min = max
			max = _tmp
		
		# on exxedding the limits use the limit
		if min? and _value < min
			console.log min
			return min
		if max? and _value > max
			return max

		# search the nearest _value to the step
		if step isnt 1
			_value = nearest( _value, step )
		
		# calc the precision by step
		_precision = Math.max( 0, Math.ceil( Math.log( 1/step ) / Math.log( 10 ) ) )
		if _precision > 0
			_value = precision( _value, _precision )
		else
			_value = Math.round( _value )
			
		return _value


module.exports = FacetSubsNumber