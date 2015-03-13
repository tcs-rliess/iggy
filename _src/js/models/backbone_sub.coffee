###
EXAMPLE USAGE

	parentColl = new Backbone.Collection.Sub()
	
	# by Array
	subCollA = parentColl.sub( [ 1, 2, 3 ] ) 
	
	# or by Object
	subCollO = parentColl.sub( { name: "Foo", age: 42 } ) 
	
	# or by Number
	subCollN = parentColl.sub( 13 )
	
	# or by Function
	subCollF = parentColl.sub( (( model )-> if model.get( "age" ) > 23 ) )
	
	# subcollection of subcollection
	subCollA_O = subCollA.sub( { name: "Foo", age: 42 } )
	
	# update the filter of a subcollection. For this a `reset` will be fired on the subcollection
	subCollA = subCollA.updateSubFilter( { name: "Bar", age: 42 } )
###

class BackboneSub extends Backbone.Collection
	###
	## sub
	
	`collection.sub( filter )`
	
	Generate a sub-collection by a filter.
	The models will be distributed within all involved collections under consideration of the filter.
	
	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters.
	
	@return { Collection } A Sub-Collection based on the filter
	
	@api public
	###
	sub: ( filter )=>
		@subColls or= []
		fnFilter = @_generateSubFilter( filter )

		# filter the collection
		_models = @filter fnFilter
		# create the subcollection
		_sub = new @constructor( _models )

		_sub._parentCol = @
		_sub._fnFilter = fnFilter

		# add event handlers to distribute the models through the sub collections tree

		# recheck the model against the filter on change
		@on "change", _.bind( ( _m )->
			toAdd = @_fnFilter( _m ) 
			added = @get( _m )?
			if added and not toAdd
				@remove( _m )
			else if not added and toAdd
				@add( _m )
			return
		, _sub )

		# add model to base collection on add to sub
		_sub.on "add", _.bind( ( _m )->
			@add( _m )
			return
		, @)

		# add model to sub collection on add to base if it matches the filter
		@on "add", _.bind( ( _m )->
			if @_fnFilter( _m )
				@add( _m )
			return
		, _sub )

		# remove model from base collection on remove of sub
		_sub.on "remove", _.bind( ( _m )->
			#@remove( _m )
			return
		, @)

		# remove model from base collection on remove of sub
		@on "remove", _.bind( ( _m )->
			@remove( _m )
			return
		, _sub )

		# remove model from base collection on remove of sub
		@on "reset", _.bind( ( _m )->
			@updateSubFilter()
			return
		, _sub )

		# store the subcollection under the current collection
		@subColls.push( _sub )

		return _sub

	###
	## updateSubFilter
	
	`collection.updateSubFilter( filter )`
	
	Method to update the filter of a subcollection. Then all models will be resete by the new filter. So you have to listen to teh reset event
	
	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters. 
	
	@return { Self } itself
	
	@api public
	###
	updateSubFilter: ( filter, asReset = true )=>
		if @_parentCol?

			# set the new filter method
			@_fnFilter = @_generateSubFilter( filter ) if filter?

			_models = @_parentCol.filter( @_fnFilter )

			# reset the collection with the new models
			if asReset
				@reset( _models )
				return @

			newids = _.pluck( _models, "cid" )
			currids = _.pluck( @models, "cid" )
			for rid in _.difference( currids, newids )
				@remove( rid )
				
			_addIds = _.difference( newids, currids )
			for mdl in _models when mdl.cid in _addIds
				@add( mdl )

		return @


	###
	## _generateSubFilter
	
	`collection._generateSubFilter( filter )`
	
	Internal method th convert a filter argument to a filter function
	
	@param { Function|Array|String|Number|Object } filter The filter to reduce the current collection. Can be a function like underscore `_.filter` or an array of ids, a single id as string or number or a filter object containings key value filters. 
	
	@return { Function } The generated filter function 
	
	@api private
	###
	_generateSubFilter: ( filter )=>
		# construct the filter function
		if _.isFunction( filter )
			fnFilter = filter
		else if _.isArray( filter )
			fnFilter = ( _m )=>
				_m.id in filter
		else if _.isString( filter ) or _.isNumber( filter )
			fnFilter = ( _m )=>
				_m.id is filter
		else
			fnFilter = ( _m )=>
				for _nm, _vl of filter
					if _m.get( _nm ) isnt _vl
						return false
				return true

		return fnFilter

module.exports = BackboneSub