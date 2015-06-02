class ViewSub extends Backbone.View
	template: require( "../tmpls/sub.jade" )
	className: "sub"

	initialize: =>
		@result = new Backbone.Collection()
		return

	events:
		"click .rm-facet-btn": "del"

	render: ( optMdl )=>
		_list = []
		for model, idx in @result.models
			_list.push model.getLabel()

		@$el.html @template( label: @model.getLabel(), selected: _list )
		@$sub = @$( ".subselect" )
		@$results = @$( ".subresults" )

		@generateSub()
		return @el

	del: ( evnt )=>
		evnt.stopPropagation()
		evnt.preventDefault()
		@collection.trigger( "iggy:rem", @model )
		@collection.add( @model )
		@remove()
		@trigger( "closed" )
		return false

	remove: =>
		@selectview?.remove()
		return super

	selected: ( optMdl )=>
		@result.add( optMdl )
		@$results.html( @selectview.renderResult() )
		@trigger( "selected", @model, @selectview.getResults() )
		return

	isOpen: =>
		return @selectview?

	focus: =>
		if @selectview?
			@selectview?.focus()
			return
		@open()
		return

	close: =>
		if @selectview?
			@selectview?.close()
			return
		return

	generateSub: =>
		if @selectview?
			return @selectview
			
		@selectview = new @model.SubView( model: @model, el: @$sub )
		@selectview.on "closed", ( result )=>
			@selectview.off()
			@selectview.remove() if not result.length
			#@selectview = null
			@trigger( "closed", result )
			@remove() if not result.length
			return

		@selectview.on "selected", ( mdl )=>
			if mdl
				@selected( mdl )
			return
			
		@$el.append( @selectview.render() )
		if @model?.get( "value" )?
			@selectview.select()
		return

	open: =>
		@generateSub()

		@selectview?.focus()
		return

module.exports = ViewSub
