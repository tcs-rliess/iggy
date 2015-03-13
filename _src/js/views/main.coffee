SubView = require( "./sub" )
SelectorView = require( "./selector" )

KEYCODES = require( "../utils/keycodes" )

class MainView extends Backbone.View
	template: require( "../tmpls/wrapper.jade" )
	className: "iggy clearfix"

	events: 
		"click .add-facet-btn": "_addFacet"
		"click": "_addFacet"

	initialize: =>
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
		console.log "KEY", evnt
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

	addFacet: =>
		if @selectview?
			@selectview.focus()
			return

		if @subview?
			@subview.focus()
			return

		@selectview = new SelectorView( collection: @collection, custom: false )

		@$el.append( @selectview.render() )
		@selectview.focus()

		@selectview.on "selected", ( facetM )=>
			@selectview.off()
			@selectview.remove()
			@selectview = null
			
			@subview = new SubView( model: facetM )
			@$el.append( @subview.render() )
			@subview.open()

			@subview.on "closed", =>
				@subview.off()
				@subview.remove()
				@subview = null
				return 

			@subview.on "selected", ( facetM, optM )=>
				console.log "SELECTION complete",facetM, optM
				@subview.off()
				@subview = null

				return
			return
		return

module.exports = MainView