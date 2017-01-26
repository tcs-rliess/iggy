SubView = require( "./sub" )
SelectorView = require( "./selector" )

KEYCODES = require( "../utils/keycodes" )

class MainView extends Backbone.View
	template: require( "../tmpls/wrapper.jade" )

	events:
		"click .search-btn": "_onSearch"
		"focus .search-btn": "_onFocusSearch"
		"click .add-facet-btn": "_addFacet"
		"click": "_addFacet"

	initialize: ( options )=>
		
		@main = options.main
		@idx = options.idx
		@results = options.results
		@searchButton = options.searchButton

		@collection.on "iggy:rem", @remFacet
		
		_cl = "iggy clearfix"
		if @el.className?.length
			_cl = " " + _cl
		@el.className += _cl
		@render()
		$( document ).on "keyup", @_onKey
		@_outerClickListen()
		
		_valueFacets = @collection.filter( ( fct )->return fct?.get( "value" )? or fct?.get( "pinned" ) )
		
		_fnSort = ( key )->
			return ( v1, v2 )->
				if v1[ key ] > v2[ key ]
					return 1
				if v1[ key ] < v2[ key ]
					return -1
				return 0
		
		for fct in _valueFacets.sort( _fnSort( "_idx" ) )
			@genSub( fct, false )
		
		@collection.on "add", =>
			@$addBtn.show()
			return
		
		return
	
	templateData: =>
		_ret =
			tab_index: ( ( ( @idx or 1 ) + 1 ) * 1000 ) - 10
		if  @searchButton?
			_ret.searchButton =
				template: @searchButton.template or ""
				event: @searchButton.event or "search"
				pullright: @searchButton.pullright or false
				cssclass: @searchButton.cssclass or "btn btn-primary fa fa-search"
		
		return _ret
	
	render: =>
		_tplData = @templateData()
		@$el.html( @template( _tplData ) )
		@$addBtn = @$( ".add-facet-btn" )
		if _tplData.searchButton?
			@$searchBtn = @$( ".search-btn" )
		return

	_addFacet: ( evnt )=>
		@addFacet()
		return

	_onKey: ( evnt )=>
		if evnt.keyCode is KEYCODES.ESC or evnt.keyCode in KEYCODES.ESC
			@exit()
			return
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

	genSub: ( facetM, addAfter = true )=>
		subview = new SubView( model: facetM, collection: @collection, parent: @ )
		
		subview.on "closed", ( results )=>
			if subview?.model?.get( "pinned" )
				return
			#console.log "SUB VIEW CLOSED", results?.length
			#subview.off()
			subview.remove() if not results?.length
			@subview = null
			@addFacet() if addAfter
			return
		
		subview.on "reopen", =>
			@selectview?.close()
			return
			
		subview.on( "selected", @setFacet )
		
		@$addBtn.before( subview.render() )
		return subview

	addFacet: =>
		if @selectview?
			#console.log "STOP @ SELECT EXIST"
			@selectview.focus()
			return

		if @subview?
			#console.log "STOP @ SUB EXIST"
			@subview.close()
			return

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

		@selectview.on "selected", ( facetM )=>
			facetM.set( "value", null )
			@subview = @genSub( facetM )
			@subview.open()
			return
	
		@$addBtn.before( @selectview.render() )
		@selectview.focus()
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
	
	focusSearch: =>
		if @$searchBtn?
			@$searchBtn.focus()
		return
		
	_onSearch: ( evnt )=>
		evnt.stopPropagation()
		@exit()
		@trigger( "searchbutton", @searchButton.event )
		return
	
	_onFocusSearch: ( evnt )=>
		evnt.stopPropagation()
		@selectview?.close?()
		return
		
	_outerClick: ( evnt )=>
		evnt.stopPropagation()
		_posWrp = @el.compareDocumentPosition( evnt.target )
		if not ( _posWrp is 0 or _posWrp - 16 >= 0 )
			@exit( false )
		return
	

module.exports = MainView
