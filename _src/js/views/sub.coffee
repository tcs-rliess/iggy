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
		return @el

	del: ( evnt )=>
		evnt.stopPropagation()
		evnt.preventDefault()
		@collection.trigger( "iggy:rem", @model )
		@collection.add( @model )
		@remove()
		return false

	selected: ( optMdl )=>
		@result.add( optMdl )
		
		_list = []
		for model, idx in @selectview.result.models
			_list.push model.getLabel()
		@$results.html( "<li>" + _list.join( "</li><li>" ) + "</li>" )
		#@render()
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

	open: =>
		@selectview = new @model.SubView( model: @model, el: @$sub )

		@$el.append( @selectview.render() )
		@selectview.focus()

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
		return

module.exports = ViewSub