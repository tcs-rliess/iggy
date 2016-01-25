class ViewSub extends Backbone.View
	template: require( "../tmpls/sub.jade" )
	className: =>
		_std = "sub"
		_type = @model.get( "type" )
		if _type?
			_std += " sub-type-" + _type
		
		_name = @model.get( "name" )
		if _name?
			_std += " sub-name-" + _name
		return _std

	initialize: ( options )=>
		@_isOpen = false
		@result = new Backbone.Collection()
		@$el.on "click", @reopen
		@parent = options.parent
		return

	events:
		"click .rm-facet-btn": "del"

	render: ( optMdl )=>
		_list = []
		for model, idx in @result.models
			try
				_list.push model.getLabel()
			catch _err
				try
					console.error "Issue #24: CATCH - Class:#{ @constructor.name } - model:#{JSON.stringify(@model.toJSON())} - result:#{JSON.stringify( @result.toJSON())}"
				catch _errerr
					console.error "Issue #24: CATCH"
		
		@$el.html @template( label: @model.getLabel(), selected: _list, type: @model.get( "type" ), name: @model.get( "name" ) )
		@$sub = @$( ".subselect" )
		@$results = @$( ".subresults" )

		@generateSub()
		return @el
	
	reopen: ( evnt )=>
		if $( evnt.target ).is( ".rm-result-btn" ) and @selectview?.rmRes?
			@selectview.rmRes( evnt )
			evnt.preventDefault()
			evnt.stopPropagation()
			return
		if not @_isOpen and @selectview?
			@selectview.reopen( @ )
		evnt.preventDefault()
		evnt.stopPropagation()
		@trigger( "reopen" )
		return
		
	del: ( evnt )=>
		evnt?.stopPropagation()
		evnt?.preventDefault()
		@collection.trigger( "iggy:rem", @model )
		@collection.add( @model )
		@remove()
		@trigger( "closed" )
		return false

	remove: =>
		@_isOpen = false
		@selectview?.remove()
		@parent = null
		return super

	selected: ( optMdl )=>
		@result.add( optMdl, { merge: true } )
		@renderResult()
		@trigger( "selected", @model, @selectview.getResults() )
		return
	
	removed: ( optMdl )=>
		@result.remove( optMdl )
		@renderResult()
		@trigger( "selected", @model, @selectview.getResults() )
		if @result.length <= 0
			@del()
		return

	renderResult: =>
		@$results.html( @selectview.renderResult() )
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
		@_isOpen = false
		if @selectview?
			@selectview?.off()
			@selectview?.close()
			return
		return

	generateSub: =>
		if @selectview?
			@attachSubEvents()
			return @selectview
			
		@selectview = new @model.SubView( sub: @, model: @model, el: @$sub )
		@attachSubEvents()
			
		@$el.append( @selectview.render() )
		if @model?.get( "value" )?
			@selectview.select()
		return
		
	attachSubEvents: =>
		@selectview.on "closed", ( result )=>
			@_isOpen = false
			#@selectview.off()
			@selectview.remove() if not result.length
			#@selectview = null
			@trigger( "closed", result )
			@remove() if not result.length
			return

		@selectview.on "selected", ( mdl )=>
			if mdl
				@selected( mdl )
			return
		
		@selectview.on "removed", ( mdl )=>
			if mdl
				@removed( mdl )
			return
		return
		
	open: =>
		@generateSub()

		@selectview?.focus()
		@_isOpen = true
		return

module.exports = ViewSub
