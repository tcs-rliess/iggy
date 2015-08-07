KEYCODES = require( "../../utils/keycodes" )

class FacetSubsSelect extends require( "./base" )
	template: require( "../../tmpls/select.jade" )

	forcedModuleOpts:{}
	#	multiple: true

	defaultModuleOpts:
		#maximumSelectionLength: 1
		width: "auto"
		multiple: false

	events: =>
		_evnts = {}
		_evnts[ "click .select-check" ] = "select" if @model.get( "multiple" )
		return _evnts

	_getInpSelector: =>
		return "select##{@cid}"
		
	render: =>
		super
		@_initSelect2()
		return

	focus: ()=>
		@_initSelect2()
		@select2.open()
		#else
			#@$inp.select2( "open" )
		return super
	
	reopen: ( pView )=>
		return

	_initSelect2: =>
		if not @select2?
			_opts = _.extend( {}, @defaultModuleOpts, @model.get( "opts" ), { multiple: @model.get( "multiple" ) }, @forcedModuleOpts )
			@$inp.select2( _opts )
			@select2 = @$inp.data( "select2" )
			if not @model.get( "multiple" )
				@$inp.on "select2:select", @select
			@select2.$container.on "click", @_sel2open
			@select2.$element.hide()
			$( document ).on @_hasTabEvent(), @_onKey if @model.get( "multiple" )
		return

	_sel2open: ( evnt )->
		evnt.stopPropagation()
		return false
	
	remove: =>
		#@$inp.select2( "destroy" )
		return super

	getTemplateData: =>
		_data = _.extend( {}, super, { multiple: @model.get( "multiple" ), options: @_createOptionCollection( @model.get( "options" ) ) } )
		if _data.value? and not _.isArray( _data.value )
			_data.value = [ _data.value ]

		if _data.value?
			for _v in _data.value when _v not in _.pluck( _data.options, "value" )
				_data.options.push { value: _v, label: _v, group: null }
		
		_groups = _.groupBy( _data.options, "group" )
		if _.compact( _.keys( _groups or {} ) ).length > 1
			_data.optionGroups = _groups
		return _data
	
	_hasTabListener: ( create )=>
		if create
			return false
		return @model.get("multiple")
	
	_hasTabEvent: ->
		return "keyup"
		
	getValue: =>
		_vals = []
		for data in @select2?.data() or []
			_data = {}
			_data.value = data.id
			_data.label = data.text if data.text?
			_vals.push( _data )
		return _vals

	getResults: =>
		value: @result.pluck( "value" )

	_createOptionCollection: ( options )=>
		if _.isFunction( options )
			return options( @_createOptionCollection )

		_opts = []
		for opt in options
			if _.isString( opt ) or _.isNumber( opt )
				_opts.push { value: opt, label: opt, group: null }
			else if _.isObject( opt )
				_opts.push _.extend( {}, @optDefault, opt )

		return _opts

	unselect: ( evnt )=>
		@result.remove( evnt.params?.data?.id )
		return

	close: =>
		@select2?.destroy()
		@$inp?.remove()
		@$( ".select-check" ).remove()
		super
		return
	
	select: ( evnt )=>
		evnt.stopPropagation() if evnt?.stopPropagation
		_vals = @getValue()
		if not _vals?.length
			@close()
			return
		ModelConst = @getSelectModel()
		for _val in _vals
			@result.add( new ModelConst( _val ) )
		@trigger( "selected", @result )

		@close()
		return

module.exports = FacetSubsSelect
