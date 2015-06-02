class FacetSubsNumber extends require( "./number_base" )
	template: require( "../../tmpls/number.jade" )

	events: =>
		_evnts = super
		if not @model.get( "operators" )?.length
			_evnts[ "blur #{@_getInpSelector()}" ] = "select"
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
		return _.extend( super, { operators: @model.get( "operators" ), operator: @model.get( "operator" )} )


	getResults: =>
		if @$inpOp?
			_ret =
				value: @getValue()
				operator: @$inpOp.val()
		else
			_ret =
				value: @getValue()
		return _ret



module.exports = FacetSubsNumber
