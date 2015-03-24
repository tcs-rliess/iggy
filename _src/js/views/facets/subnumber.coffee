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

	events: =>
		"keyup input##{@cid}": "input"
		"keydown input##{@cid}": "input"
		"change select##{@cid}op": "switchFocus"

	render: =>
		super
		if @model.get( "operators" )?.length
			@$inpOp = @$el.find( "select##{@cid}op" )
		return

	renderResult: =>
		_res = @getResults()

		_s = "<li>"
		_s += _res.operator + " " if _res.operator?
		_s += _res.value
		_s += "</li>"

		return _s

	switchFocus: ( type="in" )=>
		if type is "op"
			@focus()
		else
			@focus( true )
		return

	focus: ( inp = false )=>
		#console.log "focus", inp or not @$inpOp?, inp, not @$inpOp?, @$inpOp
		if inp or not @$inpOp?
			super
			return
		@$inpOp.focus()
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
				when KEYCODES.RIGHT
					@switchFocus( "in" )
					return
				when KEYCODES.LEFT
					@switchFocus( "op" )
					return
				when KEYCODES.ENTER
					@select()
					return
		
		if evnt.type is "keyup"
			_v = evnt.currentTarget.value.replace( /\D/gi, "" )
			_v = parseInt( _v, 10 )
			 
			@setNumber( _v )
		return

	crement: ( change )=>
		_v = @$inp.val()
		if not _v?.length
			_v = @model.get( "value" )
		else
			_v = parseInt( _v, 10 )

		@setNumber( _v + change )

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
		return parseInt( _v, 10 )

	setNumber: ( _v )=>
		if isNaN( _v )
			@$inp.val("")
			return

		_max = @model.get( "max" )
		_min = @model.get( "min" )
		_step = @model.get( "step" )

		@$inp.val( @valueByDefinition( _v, _min, _max, _step ) )
		return

	valueByDefinition: ( _value, min, max, step )->
		# fix reversed min/max setting
		if min > max
			_tmp = min
			min = max
			max = _tmp
		
		# on exxedding the limits use the limit
		if _value < min
			return min
		if _value > max
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