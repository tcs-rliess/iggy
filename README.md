iggy
============

[![Build Status](https://secure.travis-ci.org/mpneuried/iggy.png?branch=master)](http://travis-ci.org/mpneuried/iggy)
[![Build Status](https://david-dm.org/mpneuried/iggy.png)](https://david-dm.org/mpneuried/iggy)
[![NPM version](https://badge.fury.io/js/iggy.png)](http://badge.fury.io/js/iggy)

Browser search module to use with Backbone.js

[![NPM](https://nodei.co/npm/iggy.png?downloads=true&stars=true)](https://nodei.co/npm/iggy/)

*Docs are under constrcution* 

## Options

There are several options to customize the behavior of iggy.

- **sortby** : *( `String` optional; default = `name` )* Sorting is always first done by `sort` (desc). But it's possible to change second sorting element with this option.
- **dir** : *( `String` optional; default = `asc` )* The sort direction of the sort key configured with option `sortby`. allowed are "asc" and "desc".

## Release History
|Version|Date|Description|
|:--:|:--:|:--|
|0.1.13|2016-08-11|handle select2 jQuery text option texts #57|
|0.1.12|2016-05-06|fixed array results editable #53; fixed remove of option for non custom options #56|
|0.1.11|2016-04-01|fixed date range picker by setting `startDate` and `enDate` #55|
|0.1.10|2016-03-22|FF bugfix for Select2 facet #54; Added a sorting option `sortby` #52; Made array results editable #53|
|0.1.9|2016-02-11|fixed predefined select2 with adapter #51 |
|0.1.8|2016-02-09|fixed deleting facet on empty select2 selection #49; sort predefined results by facet definition #50 |
|0.1.7|2016-01-28|another fix for #45 |
|0.1.6|2016-01-27|fixed select2 options on edit #48 |
|0.1.5|2016-01-25|added edit for type array #46,fixed select2 display bug #45 |
|0.1.4|2016-01-14|fixed outerclick within daterange widget #44|
|0.1.3|2016-01-13|fixed daterange facet #41, #42; Added two step exit on `ESC` #42|
|0.1.2|2015-10-29|added facet sorting #38; facet type 'select' is now editable #40|
|0.1.1|2015-10-07|Bugfix select2 and datepicker position #36; Optimized select2 to handle async DataAdapters #35; Added `labeltemplate` setting to design the labels #34;Type `array` can now used with async options #33|
|0.1.0|2015-08-07|Abbiblity to change simple elements or add values to array types (cuurently not availible for select2 types); Added close on outerclick; added array features `count:12` and `custom:false|true`;bugfix facet remove render;|
|0.0.18|2015-07-22|added `modelId` to handle the id attributes for Backbone `1.2.x`|
|0.0.17|2015-07-22|fix css bug #27; removed unused tests, updated dependencies|
|0.0.16|2015-06-17|fixed select of last search element in facet search #26; changed handling of TAB and ENTER #25|
|0.0.15|2015-06-10|removed console.log + added a bunch of error logs to detect bugs #23 #24|
|0.0.14|2015-05-03|Fixed selection display bug created with select2 4.0.0.|
|0.0.13|2015-05-02|Every facet can be done by hitting "TAB". Added "event" facet to trigger a event on selection.|
|0.0.12|2015-04-16|Fixed bug for predefined select type|
|0.0.11|2015-03-30|Added facet option `modifyKey` to be able to change the target key of the modify method. If not set the regular value will be replaced. It also possible to define the default by setting the IGGI-option `modifyKey`.|
|0.0.10|2015-03-30|Optimized array selection result.|
|0.0.9|2015-03-30|Optimized select2 selection result. Nicer multi result design|
|0.0.8|2015-03-30|Automatic add of new facet after finished a selection. Style changes. Added distribution files|
|0.0.7|2015-03-27|Optimized modify arguments by passing the raw attributes as third argement; Optimized build.|
|0.0.6|2015-03-27|Optimized select2 groups|
|0.0.5|2015-03-26|Added optional value config to predefine the facets|
|0.0.4|2015-03-26|general changes. Added select2, range, switch to font-awsome, ...|
|0.0.3|2015-03-24|added daterange facet and optimized gui and code |
|0.0.2|2015-03-23|added option `modify`|
|0.0.1|2015-03-05|Initial commit|

[![NPM](https://nodei.co/npm-dl/iggy.png?months=6)](https://nodei.co/npm/iggy/)

> Initially Generated with [generator-mpnodemodule](https://github.com/mpneuried/generator-mpnodemodule)

## The MIT License (MIT)

Copyright © 2015 mpneuried, http://www.tcs.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
