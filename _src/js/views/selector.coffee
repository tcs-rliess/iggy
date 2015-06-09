KEYCODES = require( "../utils/keycodes" )

class SelectorView extends require( "./facets/base" )
	template: require( "../tmpls/selector.jade" )
	templateEl: require( "../tmpls/selectorli.jade" )
	multiSelect: false

	className: =>
		cls = [ "add-facet" ]
		if @custom
			cls.push "custom"
		return cls.join( " " )

	events: =>
		"mousedown a": "_onClick"
		"focus input##{@cid}": "open"
		#"blur input##{@cid}": "close"
		"keydown input##{@cid}": "search"
		"keyup input##{@cid}": "search"

	constructor: ( options )->
		@custom =  options.custom or false
		@activeIdx = 0
		@currQuery = ""
		super
		return
		
	initialize: ( options )=>
		@searchcoll = @collection.sub( ->true )
		@result = new @collection.constructor()
		
		#@listenTo( @searchcoll, "add", @renderRes )
		@listenTo( @searchcoll, "remove", @renderRes )
		@listenTo( @searchcoll, "remove", @checkOptionsEmpty )
		
		return

	getTemplateData: =>
		return _.extend( super, custom: @custom )

	render: =>
		super
		@$list = @$el.find( "##{@cid}typelist" )
		@renderRes()
		return @el

	renderRes: =>
		@$list.empty()

		_list = []
		for model, idx in @searchcoll.models
			_lbl = model.getLabel()
			_id = model.id
			_cssclass = model.get( "cssclass" )
			console.log "model",_cssclass
			if @currQuery?.length > 1
				_lbl = _lbl.replace( new RegExp( @currQuery, "gi" ), (( str )->return "<b>#{str}</b>" ) )
			_list.push label: _lbl, id: _id, cssclass: _cssclass
		@$list.append( @templateEl( list: _list, query: @currQuery, activeIdx: @activeIdx, custom: @custom ) )

		@_checkScroll()
		
		return @$list

	_scrollTill: 198
	_checkScroll: =>
		_height = @$list.height()
		if _height > 0
			@scrollHelper( _height )
			return

		# exit the the call stack to check height after the module has been added to the dom
		setTimeout( =>
			@scrollHelper( @$list.height() )
		, 0 )
		return

	scrollHelper: ( height )=>
		if height >= @_scrollTill
			@scrolling = true
		else
			@scrolling = false
		return

	checkOptionsEmpty: =>
		#if @searchcoll.length <= 0
		#	@close()
		return

	_onClick: ( evnt )=>
		evnt.stopPropagation()
		evnt.preventDefault()

		_id = @$( evnt.currentTarget ).data( "id" )
		@selected( @collection.get( _id ) )
		if not @multiSelect
			@close()
		return false

	selected: ( mdl )=>
		if mdl?.onlyExec?
			mdl?.exec?()
			return
		
		if mdl?
			@searchcoll.remove( mdl )
			@result.add( mdl )
			@trigger "selected", mdl
		return

	focus: =>
		@$inp.focus()
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
					@selectActive()
					return
			return

		_q = evnt.currentTarget.value.toLowerCase()
		if _q is @currQuery
			return

		@currQuery = _q

		@searchcoll.updateSubFilter( ( mdl )=>
			if @result.get( mdl.id )?
				return false
			if not _q?.length
				return true
			_match = mdl.match( _q )
			return _match
		, false )


		@activeIdx = 0
		@renderRes()
		return

	move: ( up = false )=>
		_list = @$el.find( ".typelist a" )

		_top = 0
		if up
			if ( @activeIdx - 1 ) < _top
				return
			_newidx = @activeIdx - 1
		else
			if @searchcoll.length - 1 <= @activeIdx
				return
			_newidx = @activeIdx + 1


		@$( _list[ @activeIdx ] ).removeClass( "active" )
		_$elnew = @$( _list[ _newidx ] ).addClass( "active" )

		if @scrolling
			_elH = _$elnew.outerHeight()
			_pos = _elH * ( _newidx + 1 )
			_$list = @$el.find( ".typelist" )
			_scrollT = _$list.scrollTop()
			if _pos > _scrollT + @_scrollTill
				_$list.scrollTop( _pos - @_scrollTill )
			else if _pos < _scrollT + _elH
				_$list.scrollTop( _pos - _elH )

		@activeIdx = _newidx
		return

	select:=>
		return

	selectActive: =>
		_sel = @$el.find( ".typelist a.active" ).removeClass( "active" ).data()
		@activeIdx = 0
		if _sel?.idx >= 0 and @searchcoll.length
			@selected( @collection.get( _sel.id ) )
		else if @currQuery?.length
			@selected( new @collection.model( value: @currQuery, custom: true ) )
			@$inp.val( "" )
		else
			return

		if not @multiSelect
			@close()
		return

module.exports = SelectorView
