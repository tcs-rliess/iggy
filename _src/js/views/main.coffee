SubView = require( "./sub" )
SelectorView = require( "./selector" )

KEYCODES = require( "../utils/keycodes" )

class MainView extends Backbone.View
	template: require( "../tmpls/wrapper.jade" )

	events:
		"mousedown .search-btn": "_onSearch"
		"click .search-btn": "_onSearch"
		"focus .search-btn": "_onFocusSearch"
		"mousedown .add-facet-btn": "_addFacet"
		"click": "_addFacet"
	
	constructor: ( options={} )->
		@searchButton = options?.searchButton
		
		@_onSearch = _.debounce( @__onSearch, ( @searchButton?.debounce or 300 ), { trailing: false, leading: true } )
		super
		return
	
	initialize: ( options )=>
		
		@main = options.main
		@jQuery = @main.jQuery
		@idx = options.idx
		@results = options.results
		
		@facets = {}
		
		@collection.on "iggy:rem", @remFacet
		
		_cl = "iggy clearfix"
		if @el.className?.length
			_cl = " " + _cl
		@el.className += _cl
		@render()
		@_outerClickListen()
		@_keyListen()
		
		_valueFacets = @collection.filter( ( fct )->return fct?.get( "value" )? or fct?.get( "pinned" ) )
		
		_fnSort = ( key )->
			return ( v1, v2 )->
				if v1[ key ] > v2[ key ]
					return 1
				if v1[ key ] < v2[ key ]
					return -1
				return 0
		
		for fct in _valueFacets.sort( _fnSort( "_idx" ) )
			@genSub( fct, false, true )
		
		@collection.on "add", =>
			@$addBtn.show()
			return
		
		setTimeout( =>
			_active = @collection.filter( ( fct )->return fct?.get( "active" ) and fct?.get( "pinned" ) )
			if _active.length
				view = @facets[ _active[ 0 ].id ]
				#@subview = view
				view?.reopen()
				view?.focus()
			return
		, 0 )
		
		return
	
	templateData: =>
		_ret =
			tab_index: ( ( ( @idx or 1 ) + 1 ) * 1000 ) - 10
		if  @searchButton?
			_ret.searchButton =
				template: @searchButton.template or "<i class=\"fa fa-search\"></i>"
				event: @searchButton.event or "search"
				pullright: @searchButton.pullright or false
				cssclass: @searchButton.cssclass or "btn btn-primary"
		
		return _ret
	
	render: =>
		_tplData = @templateData()
		@$el.html( @template( _tplData ) )
		@$addBtn = @$( ".add-facet-btn" )
		if _tplData.searchButton?
			@$searchBtn = @$( ".search-btn" )
		return

	_addFacet: ( evnt )=>
		@TMopenAddFacet = setTimeout( =>
			@addFacet()
			return
		, 0 )
		return

	exit: ( nextAdd = true )=>
		if @subview
			@subview.close()
			@subview = null
			@addFacet() if nextAdd
			return
		
		if @selectview
			#console.log "MAIN REMOVE SELECT"
			@selectview.close()
			@selectview = null

		
		return

	remFacet: ( facetM )=>
		@results.remove( facetM.get( "name" ) )
		return

	setFacet: ( facetM, data )=>
		@collection.remove( facetM )

		@results.add( _.extend( data, { name: facetM.get( "name" ), type: facetM.get( "type" ) } ), { merge: true, parse: true, _facet: facetM } )
		if not @collection.length
			@$addBtn.hide()
		return

	genSub: ( facetM, addAfter = true, initialAdd=false )=>
		subview = new SubView( model: facetM, collection: @collection, parent: @ )
		
		subview.on "closed", ( results, evnt )=>
			if subview?.model?.get( "pinned" )
				@subview = null
				return
			#console.log "SUB VIEW CLOSED", results?.length
			#subview.off()
			subview.remove() if not results?.length
			@subview = null
			@addFacet() if addAfter and evnt?.type isnt "focusout"
			return
		
		subview.on "reopen", =>
			@selectview?.close()
			return
			
		_self = @
		subview.on "selected", ( facetM, data, evnt )->
			#console.log "subview - selected", data, @isResultEmpty( data )
			_self.setFacet( facetM, data )
			if ( not @selectview._isFull? or @selectview._isFull() ) and evnt?.type isnt "focusout"
				_self._nextFacet( evnt, @ )
			return
		
		subview.eventsAttached = true
		
		@appendFacetEl( subview.render( initialAdd ) )
		@facets[ facetM.id ] = subview
		return subview

	addFacet: =>
		#console.error "addFacet", @selectview?, @subview?
		if @selectview?
			#console.log "STOP @ SELECT EXIST"
			@selectview.focus()
			return

		if @subview?
			#console.log "STOP @ SUB EXIST"
			@subview.close()
			#return

		if not @collection.length
			#console.log "STOP @ EMPTY COLL"
			return

		@selectview = new SelectorView( collection: @collection, custom: false, main: @ )

		@selectview.on "opened", =>
			@_onOpened()
			return

		@selectview.on "closed", ( results )=>
			@_onClosed()
			#console.log "SELECT VIEW CLOSED", results?.length
			#@selectview.off()
			@selectview.remove()
			@selectview = null
			if not results?.length and @subview?
				#@subview.off()
				@subview.remove()
				@subview = null
			return

		@selectview.on "selected", ( facetM, data, evnt )=>
			facetM.set( "value", null )
			@subview = @genSub( facetM )
			@subview.open()
			return
	
		#@$addBtn.before( @selectview.render() )
		@appendFacetEl( @selectview.render() )
		@selectview.focus()
		return
	
	appendFacetEl: ( el )=>
		( @$searchBtn or @$addBtn ).before( el )
		return
	
	_onOpened: =>
		@$addBtn?.hide()
		return
	
	_onClosed: =>
		@$addBtn?.show()
		return
	
	_outerClickListen: =>
		jQuery( document ).on "click", @_outerClick
		return
	
		
	_keyListen: =>
		jQuery( document ).on "keydown", ( evnt )=>
			$tgrt = $( evnt.target )
			
			if evnt.keyCode is KEYCODES.ENTER and $tgrt.is( ".add-facet-btn" )
				evnt?.preventDefault()
				evnt?.stopPropagation()
				setTimeout( =>
					@addFacet()
				, 0 )
				
			if evnt.keyCode is KEYCODES.TAB or evnt.keyCode in KEYCODES.TAB
				#evnt?.preventDefault()
				
				if @$searchBtn? and $tgrt.is( ".add-facet-btn" ) and evnt?.shiftKey
					evnt?.preventDefault()
					evnt?.stopPropagation()
					@TMopenAddFacet = setTimeout( =>
						@focusSearch()
					, 0 )
					return
				
				# case only the facet selector is open
				if not @$searchBtn? and @selectview?.isOpen
					if evnt?.shiftKey
						evnt?.preventDefault()
						evnt?.stopPropagation()
						@openLastFacet()
					else
						@selectview.close()
					return

				if @$searchBtn? and $tgrt.is( ".search-btn" ) and evnt?.shiftKey
					evnt?.preventDefault()
					evnt?.stopPropagation()
					@openLastFacet()
					return
					
				if not @$searchBtn? and $tgrt.is( ".add-facet-btn" ) and evnt?.shiftKey
					evnt?.preventDefault()
					evnt?.stopPropagation()
					@openLastFacet()
					return
				
				if @$searchBtn? and @selectview?.isOpen
					if evnt?.shiftKey
						evnt?.preventDefault()
						evnt?.stopPropagation()
						@focusSearch()
					else
						setTimeout( =>
							@selectview?.close()
						, 0 )
						#return
				
				# otherwise trigger escape event and listen for the response of the open facet
				@trigger "escape", evnt, @_nextFacet
				return
			if evnt.keyCode is KEYCODES.ESC or evnt.keyCode in KEYCODES.ESC
				@exit()
				@trigger( "escape", evnt )
				return
			
			# if evnt.keyCode is KEYCODES.ENTER
			# 	return
			return
		return
	
	openLastFacet: =>
		_prevId = @$addBtn?.prevAll( ".sub" )?.first()?.data( "fctid" )
		if _prevId?
			setTimeout( =>
				@facets[ _prevId ]?.reopen()
			, 0 )
		return
	
	_nextFacet: ( evnt, subView )=>
		_nextFn = if evnt?.shiftKey then "prev" else "next"
		_next = subView.$el?[ _nextFn ]?()

		if _next.hasClass( "search-btn" )
			if _nextFn is "prev"
				@openLastFacet()
			else if @$searchBtn?
				@focusSearch()
			return

		_nextId = _next?.data( "fctid" )
		if _nextId?
			evnt?.preventDefault()
			evnt?.stopPropagation()
			setTimeout( =>
				@facets[ _nextId ]?.reopen()
			, 0 )
			return
		
		if @$searchBtn? and _nextFn is "next"
			@focusSearch()
		if not @$searchBtn? and _nextFn is "next"
			@$addBtn.focus()
			@addFacet()
		return
		
	focusSearch: =>
		if @$searchBtn?
			@$searchBtn.focus()
		return
		
	__onSearch: ( evnt )=>
		if ( evnt.type is "click" and evnt.clientX is 0 and evnt.clientY is 0 ) or evnt.type is "mousedown"
			@trigger( "escape", evnt )
			setTimeout( =>
				evnt?.preventDefault()
				evnt.stopPropagation()
				@exit()
				@trigger( "searchbutton", @searchButton.event )
				return
			, 0 )
			return
		return
	
	_onFocusSearch: ( evnt )=>
		evnt.stopPropagation()
		@selectview?.close?()
		return
		
	_outerClick: ( evnt )=>
		clearTimeout( @TMopenAddFacet ) if @TMopenAddFacet?
		_posWrp = @el.compareDocumentPosition( evnt.target )
		if not ( _posWrp is 0 or _posWrp - 16 >= 0 )
			@exit( false )
		return
	

module.exports = MainView
