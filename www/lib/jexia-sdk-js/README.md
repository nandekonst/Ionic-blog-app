# jexia-sdk-js [![Build Status](https://travis-ci.org/jexia-inc/jexia-sdk-js.svg?branch=master)](https://travis-ci.org/jexia-inc/jexia-sdk-js) [![Coverage Status](https://coveralls.io/repos/jexia-inc/jexia-sdk-js/badge.svg?branch=master&service=github)](https://coveralls.io/github/jexia-inc/jexia-sdk-js?branch=master) [![Document Status](https://doc.esdoc.org/github.com/jexia-inc/jexia-sdk-js/badge.svg)](https://doc.esdoc.org/github.com/jexia-inc/jexia-sdk-js/)
Official javascript sdk for Jexia.

>Currently this SDK is under active development and it's not production ready.

## Installation
Through npm:
```bash
$ npm install jexia-sdk-js
```
Through bower:
```bash
$ bower install jexia-sdk-js
```

## Quickstart
You can use jexia-sdk-js on node and on browser with the same API.
The only different thing is how you require the jexia-sdk-js.

## node
```js
var JexiaClient = require('jexia-sdk-js').JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then(function(app) {
    // you can start interacting with your app
});
```
## browser
```html
<script src="bower_components/jexia-sdk-js/lib/browser/index.min.js"></script>
<script>
// IMPORTANT
var JexiaClient = window.jexiaClientBrowser.JexiaClient;

var client = new JexiaClient({
    appId: 'YOUR_APP_ID',
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET'
}).then( function(app) {
    // you can start interacting with your app
});
</script>
```

## Documentation
Want to learn more? [Go to Wiki](https://github.com/jexia-inc/jexia-sdk-js/wiki).

## Contributing
Contributions are more than welcome!
Read the [contribution guidelines](https://github.com/jexia-inc/jexia-sdk-js/wiki/Contributing-Guidelines) page in the wiki.

## License

The MIT License (MIT)

Copyright (c) 2016 Jexia www.jexia.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
