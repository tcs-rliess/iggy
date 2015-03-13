# SUI 
*search ui*

## concept

The requirement is a similar seach tool like [VisualSearch.js](http://documentcloud.github.io/visualsearch/), but with additional features.

Features:

- autocomplete
- HTML5 input types
- multiselect
- operators on numbers/dates
- sorting of autocomplete data
- Backbone integration
- Bootstrap compatible

Requirements:

- jQuery
- Backbone

### Init

`sui = new SUI( target, facets, options )`

**Configuration options**

```coffee
sui = new SUI(

# ------------
# TARGET el
# ------------
	# as selector
	"#my-sui", 

	# or as jQuery el	
	$( "#my-sui" ), 
	
	# or as raw Dom element
	document.getElementById("my-sui"), 

# ------------
# FACETS config
# ------------
	[
		{	
		# ------------
		# STRING facet
		# ------------
			type: "string"
			name: "simple"
			label: "Simple select or text"
			
			options: [ "a", "b", "c" ]
			# or as collection
			options: new Backbone.Collection( [ "a", "b", "c" ] )
			# or as function
			options: ( cb )->
				cb( [ "a", "b", "c" ] )
				return
			# advanced options
			options: [
				# 
				{ value: "usa", label: "United States", group: "America" }
				{ value: "can", label: "Canada", group: "America" }
				{ value: "jp", label: "Japan", group: "Asia" }
				{ value: "cn", label: "China", group: "Asia" }
				{ value: "ger", label: "Germany", group: "Europe" }
			]
			
			# sort options by value
			optionSort: "value"
			# custom sort method like backbone comparator 
			optionSort: ( option )->
				return option.get( "label" )
			
			# search function instead of pre-defined `options`
			search: ( query, cb )->
				cb( [ "a", "b", "c" ] )
				return
			
			# a predefined value
			value: "a"
			# or a function call on init
			value: ( cb )->
				cb( "a" )
				return
		},{
		# ------------
		# ARRAY facet
		# ------------
			type: "array"
			name: "multi"
			label: "Multiple selections"
			options: [ "a", "b", "c" ] # similar to STRING facet
			optionSort: "value"
			value: [ "b", "c" ] # multiple results possible
			
			# modify the value
			modify: ( value )->
				return { "$and": value }
						
		},{
		# ------------
		# NUMBER facet
		# ------------
			type: "number"
			name: "count"
			label: "Select a numeric value"
			min: 0
			max: 100
			step: 1
			value: 50
		},{
		# ------------
		# NUMBER-OP facet
		# ------------
			type: "number"
			name: "colors"
			label: "Select a numeric value with operator"
			# optional operators
			operators: [ "!=", "==", "<=", "<", ">", ">=" ]
			min: 0
			max: 100
			step: 1
			value: 50
		},{
		# ------------
		# RANGE facet
		# ------------
			type: "range"
			name: "sizes"
			label: "Select a numeric range"
			min: 1
			max: 10
			step: 1
			value: [ 5, 7 ]
		},{
		# ------------
		# DATERANGE facet
		# ------------
			type: "daterange"
			name: "shipment"
			label: "Select a date(range)"
			value: [ startDate, endDate ]
			opts: 
				# see the options of [daterangepicker](https://github.com/dangrossman/bootstrap-daterangepicker)
				timePicker: true
				timePickerIncrement: 30
				format: 'MM/DD/YYYY h:mm A'
				ranges: { ... } 
		}
	],
	
# ------------
# OPTIONS general
# ------------
	{
		onChange: ( queryCollection )->
			# on every change/add/remove of a filter this method will be called.
			# the only argument is a collection with the query
			return
		
		# it's recommended us a existing collection
		# as query object and listen to the changes
		queryCollection: new Backbone.Collection()

		
	}
)

# ------------
# RESULT by `queryCollection.toJSON()` - idAttribute=`name`
# ------------
[{
	name: "string",
	type: "string",
	value: "a"
},{
	name: "multi",
	type: "array",
	value: [ "a", "b" ]
},{
	name: "count",
	type: "number",
	value: 42
},{
	name: "colors",
	type: "number",
	operator: "<="
	value: 7
},{
	name: "sizes",
	type: "range",
	value: [ 3,6 ]
},{
	name: "date",
	type: "daterange",
	value: [ startDate, endDate ] # the values will be JS dates
}]
```

### Instance methods

#### `sui.getFacet( name )`

get a facet configuration by name

#### `sui.getQuery( queryCollection )`

get the result collection

### Instance events

#### `change`

fired on a change of the filter

**Example:**

```coffee
sui = new SUI( ... )

sui.on "change", ( qColl )->
	_queryArray = qColl.toJSON()
	# process DB/Data search based on query `_queryArray`
	return
```

### DOM-target events

#### `change`

fired on 

```coffee
$el = $( "#my-sui" )
new SUI( $el, ... )

$el.on "change.sui", ( event, queryArray )->
	# process DB/Data search based on query `queryArray`
	return
```
### Zusammenfassung Issue Status

**TCS:**

@mpneuried `2` *( davon 1 für Migration )*
@exinferis `4`
@Nachbarshund `12`
@smrchy  `4` *( davon 2 für Migration )*
.......................................
TCS Gesamt: `22` *( davon 3 für Migration )*


**Milon:**

@nicomuc `19`
@hbraeunlein `16`
@FlorianArzberger `9`
@mdrogosch `1`
.......................................
Milon Gesamt: `45`

:::::::::::::::::::::::::::::::::::::::
**Gesamt: 67**