iggy
============

[![Build Status](https://secure.travis-ci.org/mpneuried/iggy.png?branch=master)](http://travis-ci.org/mpneuried/iggy)
[![Build Status](https://david-dm.org/mpneuried/iggy.png)](https://david-dm.org/mpneuried/iggy)
[![NPM version](https://badge.fury.io/js/iggy.png)](http://badge.fury.io/js/iggy)

Browser search module to use with Backbone.js

[![NPM](https://nodei.co/npm/iggy.png?downloads=true&stars=true)](https://nodei.co/npm/iggy/)

*Docs are under constrcution* 

## Release History
|Version|Date|Description|
|:--:|:--:|:--|
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
