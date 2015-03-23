SubView = require( "./sub" )
SelectorView = require( "./selector" )

KEYCODES = require( "../utils/keycodes" )

class MainView extends Backbone.View
	template: require( "../tmpls/wrapper.jade" )
	className: "iggy clearfix"

	events: 
		"click .add-facet-btn": "_addFacet"
		"click": "_addFacet"

	initialize: ( options )=>
		@results = options.results

		@collection.on "iggy:rem", @remFacet

		@el.className += @className
		@render()
		$( document ).on "keyup", @_onKey
		return

	render: =>
		@$el.html( @template() )
		return

	_addFacet: ( evnt )=>
		@addFacet()
		return

	_onKey: ( evnt )=>
		if evnt.keyCode in KEYCODES.ESC
			@exit()
			return
		return
	
	exit: =>
		if @selectview
			@selectview.remove()
			@selectview = null

		if @subview
			@subview.remove()
			@subview = null
		return

	remFacet: ( facetM )=>
		@results.remove( facetM.get( "name" ) )
		return

	addFacet: =>
		if @selectview?
			@selectview.focus()
			return

		if @subview?
			@subview.focus()
			return

		if not @collection.length
			return

		@selectview = new SelectorView( collection: @collection, custom: false )

		@$el.append( @selectview.render() )
		@selectview.focus()

		@selectview.on "closed", ( results )=>
			@selectview.off()
			@selectview.remove()
			@selectview = null
			return

		@selectview.on "selected", ( facetM )=>

			@subview = new SubView( model: facetM, collection: @collection )
			@$el.append( @subview.render() )
			@subview.open()

			@subview.on "closed", ( results )=>
				@subview.off()
				@subview.remove() if not results?.length
				@subview = null
				return 

			@subview.on "selected", ( facetM, results )=>
				@collection.remove( facetM )

				@results.add( _.extend( results, { name: facetM.get( "name" ), type: facetM.get( "type" ) } ), { merge: true, parse: true, _facet:facetM } )
				#@subview.off()
				#@subview = null

				return
			return
		return

module.exports = MainView