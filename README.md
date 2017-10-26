iggy
============

<!--DOCSSTART-->
[![Build Status](https://david-dm.org/mpneuried/iggy.png)](https://david-dm.org/mpneuried/iggy)
[![NPM version](https://badge.fury.io/js/iggy.png)](http://badge.fury.io/js/iggy)

Browser search module to use with Backbone.js

[![NPM](https://nodei.co/npm/iggy.png?downloads=true&stars=true)](https://nodei.co/npm/iggy/)

## Init

```js
const myIggyInst = new Iggy( $facets, $options )
```

**Example:**

```js
const options = {
  sortby: "name"
};

const facets = [
  {
    "type": "string",
    "name": "cmp",
    "label": "Company"
  },{
    "type": "array",
    "name": "tgs",
    "label": "Tags",
    "options": [ "IT", "Production", "Management" ]
  }
]
const myIggyInst = new Iggy( facets, options )

// results as event
myIggyInst.on( "change", function( coll ){
  coll.toJSON()
  /*
  [
    {
      "type": "string",
      "name": "cmp",
      "value": "Acme"
    },{
      "type": "array",
      "name": "tgs",
      "value": [ "IT", "Production" ]
    }
  ]
  */
});

// or function call `getQuery`
myIggyInst.getQuery().toJSON()
/*
[
  {
	"type": "string",
	"name": "cmp",
	"value": "Acme"
  },{
	"type": "array",
	"name": "tgs",
	"value": [ "IT", "Production" ]
  }
]
*/
```



## Options

There are several options to customize the behavior of iggy.

- **`buttonsFirst`** *( `Boolean` optional; default = `false` )*: Move the buttons `+` and `search` to the left side.
- **`sortby`** *( `String` optional; default = `name` )*: Sorting is always first done by `sort` (desc). But it's possible to change second sorting element with this option.
- **`dir`** *( `String` optional; default = `asc` )*: The sort direction of the sort key configured with option `sortby`. allowed are "asc" and "desc".
- **`searchButton`** *( `Object` )*: Optional search button configuration. It will only displayed if `searchButton.template` is defined. To change the sytle you can use the css class `.search-btn`.
  - **`searchButton.template`** *( `String` )*: A html string to display the search button
  - **`searchButton.event`** *( `String`; default = `search` )*: A event name to fire when the button was clicked.
  - **`searchButton.pullright`** *( `Boolean`; default = `false` )*: Display the search button on the right istead of adding it after the "+" button.
  - **`searchButton.debounce`** *( `Number`; default = `300` )*: Debounce time on fire of the search event
  - **`searchButton.cssclass`** *( `String` )*: You can define a custom class to add to the search button

## Facets

These options are valid for all facets.

##### *General Options*

- **`type`** *(`String`)*: The facet type. See the List below with the types.
- **`name`** *(`String`)*: The facet name used as`name` for the results.
- **`label`** *(`String`)*: The label to show as name within the GUI.
- **`value`** *(`String|Number|Array` optional )*: A predefined value to populate the facet on load. The type is specific top the facet `type`
- **`sort`** *(`String`)*: The sorting within the facet selector results.
- **`pinned`** *(`Boolean` optional; default: `false`)*: A pinned facet is always open and displayed to the GUI.
- **`active`** *(`Boolean` optional; default: `false`)*: With `active` it's possible to define one facet as focused on load.
- **`labeltemplate`** *(`String` optional)*: It's possible to change the html of the GUI inside the Facet selector result. Probably used to add an icon to the result.
- **`modify`** *(`Function` optional)*: A function to modify the facet result on selection. Teh function arguments are `value`, `facet` and `raw` and it expects the 
- **`cssclass`** *(`String`)*: A optional css class added to the selection li to add a custom style.

##### Facet: `string`

Basic string facet to add a string.

- **`type`** *(`== string` )*: the type has to be `string`


- **`value`** *(`String` optional )*: A predefined string

##### Facet: `number`

Basic number facet to add a numeric value.

- **`type`** *(`== number` )*: the type has to be `number`


- **`value`** *(`Number` optional )*: A predefined number
- **`min`** *(`Number` optional )*: The minimal value allowed
- **`max`** *(`Number` optional )*: The maximum value allowed
- **`step`** *(`Number` optional )*: The numeric steps allowed
- **`operators`** *(`String[]` optional )*: an Array of operators to select. Something like `>=`, `<=`, ...
- **`operator`** *(`String` optional )*: Preselected operator

##### Facet: `range`

Define a numeric range.

- **`type`** *(`== range` )*: The type has to be `range`
- **`value`** *(`[Number,Number]` optional )*: A numeric range defined by an array of two numbers
- **`min`** *(`Number` optional )*: The minimal value allowed
- **`max`** *(`Number` optional )*: The maximum value allowed
- **`step`** *(`Number` optional )*: The numeric steps allowed

##### Facet: `array`

Select a value from a list of options or add custom list elements.

- **`type`** *(`== array` )*: the type has to be `array`
- **`value`**  *(`String[]` optional )*: The predefined values.
- **`options`** *(`String[]|Object(value,label)[]|Function`)*: The options to show as selection.
  Possible options:
  - Array of elements `[ "pizza", "pasta", "carne" ]`
  - Array ob objects `[ { label: "Pizza", value: "p" }, { label: "Coke", value: "c" } ]`
  - A Function to load the data: `function( currSelection, facet, cb ){ cb( [ "a", "b" ] ) }`
- **`count`** *(`Number` optional)*: The max. allowed number of elements 
- **`custom`** *(`Boolean` optional; default: `true`)*: If `true` it's allowed to add Options on the fly. Otherwise only values within the options are allowed.

##### Facet: `event`

Define custom actions by using the event facet, catch the event and handle it.

- **`type`** *(`== event` )*: the type has to be `event`
- **`event`** *(`String` )*: An event name that will be fired on click/select to the IGGY instance.

##### Facet: `daterange`

The daterange facet uses the sub module [Date Range Picker](http://www.daterangepicker.com) to define a date or a date range.

- **`type`** *(`== daterange` )*: the type has to be `daterange`
- **`value`**  *(`[Date|Number|String,Date|Number|String]` optional )*: The predefined values as two values for start and end date.
- **`daterange`** *(`String` optional)*: A date format to parse string `values` and display the date within the picker. Numeric values will be treated as timestamps *(ms)*
- **`opts`** *(`Object` optional)*: An object of options passed directly to the date range picker module. Details see: [Options](http://www.daterangepicker.com/#options)

##### Facet: `select`

A [Select2](https://select2.github.io) interface to use it inside a facet.

- **`type`** *(`== select` )*: the type has to be `select`
- **`value`**  *(`String[]` optional )*: The predefined values.
- **`options`** *(`String[]|Object(value,label)[]|Function`, optional)*: The options to show as selection.
  You could also use the `opts` to pass your options directly to select2 e.g. as [DataAdapter](https://select2.github.io/options.html#data-adapters)
  Possible options:
  - Array of elements `[ "pizza", "pasta", "carne" ]`
  - Array ob objects `[ { label: "Pizza", value: "p" }, { label: "Coke", value: "c" } ]`
  - A Function to load the data: `function( currSelection, facet, cb ){ cb( [ "a", "b" ] ) }`
- **`count`** *(`Number` optional)*: The max. allowed number of elements 
- **`multiple`** *(`Boolean` optional; default `true`)*:Allow multiple selections. This will lead to a tag like view.
- **`opts`** *(`Object` optional)*: An object of options passed directly to the date range picker module. Details see: [Options](https://select2.github.io/options.html)

## Release History

| Version |    Date    | Description                              |
| :-----: | :--------: | :--------------------------------------- |
|  0.4.1  | 2017-10-26 | Fixed long selections by wrapping lines #75 |
|  0.4.0  | 2017-10-19 | Added option `buttonsFirst` to move the buttons to the left side #73; fixed handling of very long array elements #72; fixed compatibility with font-awesome 5 #74  |
|  0.3.0  | 2017-04-03 | The search Button is now before the add "+" button. So the order is now ( facet_1, facet_2, ... , facet_n, search_btn, add_btn )  |
|  0.2.8  | 2017-04-03 | Fixed daterange facet locale option overwrite #71  |
|  0.2.7  | 2017-02-02 | Fixed load if no options are passed #70  |
|  0.2.6  | 2017-02-02 | Fixed doubled search event on mouse click |
|  0.2.5  | 2017-02-01 | #69 tried to reduce jumping ui + optimized ux |
|  0.2.4  | 2017-01-28 | #68 Tab fixes and reactivate search button on ENTER |
|  0.2.3  | 2017-01-27 | #67 fixed date range input if used date format option and input as number |
|  0.2.2  | 2017-01-27 | #65 fixed search button handling; #66 filter empty elements; array facet respect array max count on click |
|  0.2.1  | 2017-01-26 | #58 Changed style of search button; #63 Optimized display of array facet gui; #61 Fixed pinned facets, added `active` and optimized tab navigation. |
|  0.2.0  | 2017-01-25 | #55 fixed date range picker and added option `dateformat`; #58 added search button; #59 The "+" is hidden if the facet select is open; Facets can be `pinned:true` to be always displayed and be undeletable. |
| 0.1.13  | 2016-08-11 | handle select2 jQuery text option texts #57 |
| 0.1.12  | 2016-05-06 | fixed array results editable #53; fixed remove of option for non custom options #56 |
| 0.1.11  | 2016-04-01 | fixed date range picker by setting `startDate` and `enDate` #55 |
| 0.1.10  | 2016-03-22 | FF bugfix for Select2 facet #54; Added a sorting option `sortby` #52; Made array results editable #53 |
|  0.1.9  | 2016-02-11 | fixed predefined select2 with adapter #51 |
|  0.1.8  | 2016-02-09 | fixed deleting facet on empty select2 selection #49; sort predefined results by facet definition #50 |
|  0.1.7  | 2016-01-28 | another fix for #45                      |
|  0.1.6  | 2016-01-27 | fixed select2 options on edit #48        |
|  0.1.5  | 2016-01-25 | added edit for type array #46,fixed select2 display bug #45 |
|  0.1.4  | 2016-01-14 | fixed outerclick within daterange widget #44 |
|  0.1.3  | 2016-01-13 | fixed daterange facet #41, #42; Added two step exit on `ESC` #42 |
|  0.1.2  | 2015-10-29 | added facet sorting #38; facet type 'select' is now editable #40 |
|  0.1.1  | 2015-10-07 | Bugfix select2 and datepicker position #36; Optimized select2 to handle async DataAdapters #35; Added `labeltemplate` setting to design the labels #34;Type `array` can now used with async options #33 |
|  0.1.0  | 2015-08-07 | Abbiblity to change simple elements or add values to array types (cuurently not availible for select2 types); Added close on outerclick; added array features `count:12` and `custom:false|true`;bugfix facet remove render; |
| 0.0.18  | 2015-07-22 | added `modelId` to handle the id attributes for Backbone `1.2.x` |
| 0.0.17  | 2015-07-22 | fix css bug #27; removed unused tests, updated dependencies |
| 0.0.16  | 2015-06-17 | fixed select of last search element in facet search #26; changed handling of TAB and ENTER #25 |
| 0.0.15  | 2015-06-10 | removed console.log + added a bunch of error logs to detect bugs #23 #24 |
| 0.0.14  | 2015-05-03 | Fixed selection display bug created with select2 4.0.0. |
| 0.0.13  | 2015-05-02 | Every facet can be done by hitting "TAB". Added "event" facet to trigger a event on selection. |
| 0.0.12  | 2015-04-16 | Fixed bug for predefined select type     |
| 0.0.11  | 2015-03-30 | Added facet option `modifyKey` to be able to change the target key of the modify method. If not set the regular value will be replaced. It also possible to define the default by setting the IGGI-option `modifyKey`. |
| 0.0.10  | 2015-03-30 | Optimized array selection result.        |
|  0.0.9  | 2015-03-30 | Optimized select2 selection result. Nicer multi result design |
|  0.0.8  | 2015-03-30 | Automatic add of new facet after finished a selection. Style changes. Added distribution files |
|  0.0.7  | 2015-03-27 | Optimized modify arguments by passing the raw attributes as third argement; Optimized build. |
|  0.0.6  | 2015-03-27 | Optimized select2 groups                 |
|  0.0.5  | 2015-03-26 | Added optional value config to predefine the facets |
|  0.0.4  | 2015-03-26 | general changes. Added select2, range, switch to font-awsome, ... |
|  0.0.3  | 2015-03-24 | added daterange facet and optimized gui and code |
|  0.0.2  | 2015-03-23 | added option `modify`                    |
|  0.0.1  | 2015-03-05 | Initial commit                           |

<!--DOCSEND-->

[![NPM](https://nodei.co/npm-dl/iggy.png?months=6)](https://nodei.co/npm/iggy/)

> Initially Generated with [generator-mpnodemodule](https://github.com/mpneuried/generator-mpnodemodule)

## The MIT License (MIT)

Copyright © 2015 mpneuried, http://www.tcs.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
