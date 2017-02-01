class FacetSubsNumber extends require( "./number_base" )
	template: require( "../../tmpls/number.jade" )

	events: =>
		_evnts = super
		#if not @model.get( "operators" )?.length
		_evnts[ "blur #{@_getInpSelector()}" ] = "select"
		return _evnts

	render: =>
		super
		if @model.get( "operators" )?.length
			@$elOp = @$el.find( ".operator" )
			@elOp = @$elOp.get(0)
			@$inpOp = @$el.find( "select##{@cid}op" )
			@select2Op = @$inpOp.select2( { width: "auto" } ).data( "select2" )
			@$inpOp.on( "select2:close", @_opSelected )
		return

	renderResult: ( renderEmpty = false )=>
		if renderEmpty
			return ""
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
		
	select: ( evnt )=>
		_posOpWrp = -1
		if evnt?.relatedTarget
			_posOpWrp = @elOp?.compareDocumentPosition( evnt?.relatedTarget )
			if _posOpWrp is 20
				return
		if evnt?.type is "focusout" and _posOpWrp isnt 20
			_val = @getValue()
			if _val?
				@set( _val, evnt )
				return
			@close()
			return
		if evnt?.relatedTarget?
			_posWrp = @el.compareDocumentPosition( evnt?.relatedTarget )
			if not ( _posWrp is 0 or _posWrp - 16 >= 0 )
				evnt.stopPropagation()
				return
		if evnt? and ( evnt?.relatedTarget is @$inp.get(0) or evnt?.relatedTarget is @$inpOp?.get(0) )
			evnt.stopPropagation()
			return
		if @$inpOp?
			@model.set( { operator: @$inpOp.val() } )
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
		@$inp.select()
		return
	
	reopen: ( pView )=>
		_oldVal = @result.first()?.get( "value" )
		_oldOp = @result.first()
		@model.set( value: _oldVal )
		pView.$results.empty().html( @renderResult( true ) )
		super
		return

	getTemplateData: =>
		return _.extend( super, { operators: @model.get( "operators" ), operator: @model.get( "operator" )} )

	_onTabAction: ( evnt )=>

		if @model.get( "operators" )?.length
			if @$inp.is( evnt.target ) and evnt.shiftKey
				evnt.stopPropagation()
				evnt.preventDefault()
				@$inpOp.focus()
				return false
			
			if ( @select2Op.$selection.is( evnt.target ) or evnt.target.classList.contains( "select2-search__field" ) ) and not evnt.shiftKey
				evnt.stopPropagation()
				evnt.preventDefault()
				@$inp.focus().select()
				return false
					
		_val = @getValue()
		evnt.preventDefault()
		evnt.stopPropagation()
		if not isNaN( _val )
			@select( evnt )
		return true
	
	getResults: =>
		if @$inpOp? or @model.get( "operator" )?
			_ret =
				value: @getValue()
				operator: @$inpOp?.val() or @model.get( "operator" )
		else
			_ret =
				value: @getValue()
		return _ret



module.exports = FacetSubsNumber
