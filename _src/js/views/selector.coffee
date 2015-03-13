KEYCODES = require( "../utils/keycodes" )

class SelectorView extends Backbone.View
	template: require( "../tmpls/selector.jade" )
	templateEl: require( "../tmpls/selectorli.jade" )
	className: =>
		cls = [ "add-facet" ]
		if @custom
			cls.push "custom"
		return cls.join( " " )

	events: =>
		"mousedown a": "_onClick"
		"focus input##{@cid}": "open"
		"blur input##{@cid}": "close"
		"keydown input##{@cid}": "search"
		"keyup input##{@cid}": "search"

	constructor: ( options )->
		@custom =  options.custom or false
		@activeIdx = if @custom then -1 else 0
		@currQuery = ""
		super
		return
		
	initialize: ( options )=>
		@searchcoll = @collection.sub( ->true )
		#@listenTo( @searchcoll, "add", @renderRes )
		#@listenTo( @searchcoll, "remove", @renderRes )
		return

	render: =>
		@$el.html( @template( custom: @custom, cid: @cid ) )
		@$inp = @$el.find( "input##{@cid}" )
		@$list = @$el.find( "##{@cid}typelist" )
		@renderRes()
		return @el

	renderRes: =>
		@$list.empty()

		_list = []
		for model, idx in @searchcoll.models
			_lbl = model.getLabel()
			_id = model.id

			if @currQuery?.length > 1
				_lbl = _lbl.replace( new RegExp( @currQuery, "gi" ), (( str )->return "<b>#{str}</b>" ) )
			_list.push label: _lbl, id: _id
		@$list.append( @templateEl( list: _list, query: @currQuery, activeIdx: @activeIdx, custom: @custom ) )
		return @$list

	_onClick: ( evnt )=>
		evnt.stopPropagation()
		evnt.preventDefault()

		_id = @$( evnt.currentTarget ).data( "id" )
		@trigger "selected", @collection.get( _id )
		return false


	selected: =>
		console.log "selected", arguments
		return

	focus: =>
		@$inp.focus()
		return

	open: =>
		@$el.addClass( "open" )
		@isOpen = true
		@trigger( "opened" )
		return

	close: =>
		@$el.removeClass( "open" )
		@isOpen = false
		@trigger( "closed" )
		return

	search: ( evnt )=>
		if evnt.type is "keydown"
			switch evnt.keyCode
				when KEYCODES.UP
					@move( true )
					return
				when KEYCODES.DOWN
					@move( false )
					return
				when KEYCODES.ENTER
					@select()
					return
			return

		#@search.
		_q = evnt.currentTarget.value.toLowerCase()
		if _q is @currQuery
			return

		@currQuery = _q

		@searchcoll.updateSubFilter( ( mdl )->
			if not _q?.length
				return true
			_match = mdl.match( _q )
			return _match
		, false )

		@renderRes()
		return

	move: ( up = false )=>
		_top = ( if @custom then -1 else 0 )
		if up 
			if ( @activeIdx - 1 ) < _top
				return
			_newidx = @activeIdx - 1 
		else 
			if @searchcoll.length <= @activeIdx + 1
				return
			_newidx = @activeIdx + 1 

		_list = @$el.find( ".typelist a" )

		@$( _list[ @activeIdx ] ).removeClass( "active" )
		@$( _list[ _newidx ] ).addClass( "active" )

		@activeIdx = _newidx
		
		return

	select: =>
		if @activeIdx >= 0
			@trigger "selected", @collection.at( @activeIdx )
		else
			@trigger "selected", @currQuery

		@close()
		return

module.exports = SelectorView