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

class FacetNumberBase extends require( "./base" )

	constructor: ->
		@setNumber = _.throttle( @_setNumber, 300, {leading: false, trailing: false} )
		super
		return

	events: =>
		"keyup #{@_getInpSelector()}": "input"
		"keydown #{@_getInpSelector()}": "input"



	input: ( evnt )=>
		_$el = $( evnt.currentTarget )
		if evnt.type is "keydown"
			switch evnt.keyCode
				when KEYCODES.UP
					@crement( @model.get( "step" ), _$el )
					return
				when KEYCODES.DOWN
					@crement( @model.get( "step" ) * -1, _$el )
					return
				when KEYCODES.ENTER
					@select()
					return
		
		if evnt.type is "keyup"
			_v = evnt.currentTarget.value.replace( /[^\d]?[^-\d]+/g, "" )
			_v = parseInt( _v, 10 )
			 
			@setNumber( _v, _$el )
		return

	crement: ( change, el = @$inp )=>
		_v = el.val()
		if not _v?.length
			_v = @model.get( "value" )
		else
			_v = parseInt( _v, 10 )

		@_setNumber( _v + change, el )
		return

	getValue: =>
		_v = @$inp.val()
		if not _v?.length
			return null
			
		_iv = parseInt( _v, 10 )
		if isNaN( _iv )
			return null
			
		return @valueByDefinition( _v )

	_setNumber: ( _v, el = @$inp )=>
		if isNaN( _v )
			#@$inp.val("")
			return

		_curr = el.val()

		_v = @valueByDefinition( _v)
		if _curr != _v.toString()
			el.val( _v )
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


module.exports = FacetNumberBase
