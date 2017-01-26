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
		
		@$el.data( "fctid", @model.id )
		
		@parent.on "escape", ( evnt, cb )=>
			if @_isOpen
				if @selectview?._onTabAction( evnt )
					cb( evnt, @ ) if cb?
			return
		return

	events:
		"click .rm-facet-btn": "del"

	render: ( initialAdd )=>
		_list = []
		for model, idx in @result.models
			try
				_list.push model.getLabel()
			catch _err
				try
					console.error "Issue #24: CATCH - Class:#{ @constructor.name } - model:#{JSON.stringify(@model.toJSON())} - result:#{JSON.stringify( @result.toJSON())}"
				catch _errerr
					console.error "Issue #24: CATCH"
		
		@$el.html @template
			label: @model.getLabel()
			selected: _list
			type: @model.get( "type" )
			name: @model.get( "name" )
			pinned: @model.get( "pinned" ) or false
				
		@$sub = @$( ".subselect" )
		@$results = @$( ".subresults" )

		@generateSub( initialAdd )
		return @el
	
	reopen: ( evnt )=>
		if evnt? and $( evnt.target ).is( ".rm-result-btn" ) and @selectview?.rmRes?
			@selectview.rmRes( evnt )
			evnt.preventDefault()
			evnt.stopPropagation()
			return
			
		if evnt? and $( evnt.target ).is( ".edit-result-btn" ) and @selectview?.editRes?
			@selectview.editRes( evnt )
			evnt.preventDefault()
			evnt.stopPropagation()
			return
			
		if not @_isOpen and @selectview?
			@selectview.reopen( @ )
		evnt?.preventDefault()
		evnt?.stopPropagation()
		@trigger( "reopen" )
		return
		
	del: ( evnt )=>
		if @model.get( "pinned" )
			return
			
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
		
		# remove facet if content length or the facet is in editMode
		if @result.length <= 0 and not @selectview.editMode
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

	generateSub: ( initialAdd )=>
		if @selectview?
			@attachSubEvents()
			return @selectview
			
		@selectview = new @model.SubView( sub: @, model: @model, el: @$sub )
		@attachSubEvents()
			
		@$el.append( @selectview.render( initialAdd ) )
		if @model?.get( "value" )?
			@selectview.select()
		return
		
	attachSubEvents: =>
		@selectview.on "closed", ( result )=>
			#console.log "Sub closed", @selectview.model.id
			@_isOpen = false
			
			if @model.get( "pinned" )
				return
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
		
		# @parent.subview = @
		# @parent.selectview = @selectview
		return

module.exports = ViewSub
