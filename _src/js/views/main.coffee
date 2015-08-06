SubView = require( "./sub" )
SelectorView = require( "./selector" )

KEYCODES = require( "../utils/keycodes" )

class MainView extends Backbone.View
	template: require( "../tmpls/wrapper.jade" )

	events:
		"click .add-facet-btn": "_addFacet"
		"click": "_addFacet"

	initialize: ( options )=>
		
		@results = options.results

		@collection.on "iggy:rem", @remFacet
		
		_cl = "iggy clearfix"
		if @el.className?.length
			_cl = " " + _cl
		@el.className += _cl
		@render()
		$( document ).on "keyup", @_onKey
		@_outerClickListen()
		
		for fct in @collection.filter( ( fct )->return fct?.get( "value" )? )
			subview = @genSub( fct, false )
		
		return

	render: =>
		@$el.html( @template() )
		@$addBtn = @$( ".add-facet-btn" )
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
		console.log "exit", @el.id, nextAdd, @selectview, @subview
		if @subview
			@subview.close()
			@subview = null
			@addFacet() if nextAdd
		
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
		return

	genSub: ( facetM, addAfter = true )=>
		subview = new SubView( model: facetM, collection: @collection )
		
		subview.on "closed", ( results )=>
			#console.log "SUB VIEW CLOSED", results?.length
			subview.off()
			subview.remove() if not results?.length
			@subview = null
			@addFacet() if addAfter
			return

		subview.on( "selected", @setFacet )
		
		@$addBtn.before( subview.render() )
		return subview

	addFacet: =>
		if @selectview?
			console.log "STOP @ SELECT EXIST"
			@selectview.focus()
			return

		if @subview?
			console.log "STOP @ SUB EXIST"
			@subview.close()
			return

		if not @collection.length
			#console.log "STOP @ EMPTY COLL"
			return

		@selectview = new SelectorView( collection: @collection, custom: false )

		@$addBtn.before( @selectview.render() )
		@selectview.focus()
		

		@selectview.on "closed", ( results )=>
			#console.log "SELECT VIEW CLOSED", results?.length
			@selectview.off()
			@selectview.remove()
			@selectview = null
			if not results?.length and @subview?
				@subview.off()
				@subview.remove()
				@subview = null
			return

		@selectview.on "selected", ( facetM )=>
			facetM.set( "value", null )
			@subview = @genSub( facetM )
			@subview.open()
			return
		return
	
	_outerClickListen: =>
		jQuery( document ).on "click", @_outerClick
		return

	_outerClick: ( evnt )=>
		evnt.stopPropagation()
		_posWrp = @el.compareDocumentPosition( evnt.target )
		if not ( _posWrp is 0 or _posWrp - 16 >= 0 )
			@exit( false )
		return
	

module.exports = MainView
