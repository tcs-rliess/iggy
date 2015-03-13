class ViewSub extends Backbone.View
	template: require( "../tmpls/sub.jade" )
	className: "sub"

	render: ( optMdl )=>
		@$el.html @template( label: @model.getLabel(), selected: @selected?.getLabel?() )
		@$sub = @$( ".subselect" )
		return @el

	selected: ( optMdl )=>
		@selected = optMdl
		@render()
		@trigger( "selected", @model, @selected )
		return

	isOpen: =>
		return @selectview?

	focus: =>
		if @selectview?
			@selectview?.focus()
			return
		@open()
		return

	open: =>
		@selectview = new @model.SubView( model: @model, el: @$sub )

		@$el.append( @selectview.render() )
		@selectview.focus()

		@selectview.on "closed", =>
			@selectview.off()
			@selectview.remove()
			@selectview = null
			@trigger "closed"
			@remove()
			return

		@selectview.on "selected", ( mdl )=>
			@selectview.off()
			@selectview.remove()
			@selectview = null
			if mdl
				@selected( mdl )
			return
		return

module.exports = ViewSub