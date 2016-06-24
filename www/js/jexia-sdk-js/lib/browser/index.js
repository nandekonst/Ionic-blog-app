(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jexiaClientBrowser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Managing the session between jexia-sdk-js and Jexia.
 */

var Auth = function () {

    /**
     * Create a new Auth object with some initial values.
     * @param {Object} options - Initial options object
     * @param {string} options.url - Authentication app url
     * @param {string} options.key - Authentication app key
     * @param {string} options.secret - Authentication app secret
     * @param {Object} options.client - {@link JexiaClient}
     */

    function Auth(options) {
        _classCallCheck(this, Auth);

        if (!options) {
            throw new Error('Auth needs some params');
        }

        /** @type {string} */
        this.url = options.url;

        /** @type {string} */
        this.key = options.key;

        /** @type {string} */
        this.secret = options.secret;

        /** @type {Object} */
        this.client = options.client;

        /** @type {Object} */
        this.bus = options.client.bus;

        /** @type {string} */
        this.token = '';

        /** @type {string} */
        this.refreshToken = '';

        // 1 hour and 50 minutes; JEXIA token expires in 2 hours
        this.autoRefresh(1000 * 60 * 110);
    }

    /**
     * Initialize a new session between jexia-sdk-js and Jexia
     * @return {Promise<Auth, Error>}
     */

    _createClass(Auth, [{
        key: 'init',
        value: function init() {
            var _this = this;

            return new _bluebird2.default(function (resolve, reject) {
                (0, _request2.default)({
                    url: _this.url,
                    qs: {},
                    rejectUnauthorized: false,
                    method: 'POST',
                    json: {
                        key: _this.key,
                        secret: _this.secret
                    }
                }, function (error, response, body) {
                    if (error) {
                        reject(error);
                    } else {
                        if (body && body.message) {
                            reject(body.message);
                        }
                        _this.setToken(body.token);
                        _this.setRefreshToken(body.refresh_token);

                        resolve(_this);
                    }
                });
            });
        }

        /**
         * Get current token
         * @return {string} Current token
         */

    }, {
        key: 'getToken',
        value: function getToken() {
            return this.token;
        }

        /**
         * Get current refresh token
         * @return {string} Current refresh token
         */

    }, {
        key: 'getRefreshToken',
        value: function getRefreshToken() {
            return this.refreshToken;
        }

        /**
         * Set current token
         * @param {string} token - the new token
         */

    }, {
        key: 'setToken',
        value: function setToken(token) {
            this.token = token;
        }

        /**
         * Set current refresh token
         * @param {string} refreshToken - the new token
         */

    }, {
        key: 'setRefreshToken',
        value: function setRefreshToken(refreshToken) {
            this.refreshToken = refreshToken;
        }

        /**
         * Refresh the session after a given time delay
         * @param {number} delay - delay in milliseconds
         * @emits {jexia.auth.token} emit an authentication event when we successfully refreshed the session with Jexia
         */

    }, {
        key: 'autoRefresh',
        value: function autoRefresh(delay) {
            var _this2 = this;

            setInterval(function () {
                (0, _request2.default)({
                    url: _this2.url,
                    qs: {},
                    rejectUnauthorized: false,
                    method: 'PATCH',
                    json: {
                        refresh_token: _this2.refreshToken
                    },
                    headers: {
                        'Authorization': 'Bearer ' + _this2.token
                    }
                }, function (error, response, body) {
                    if (error) {
                        throw new Error(error);
                    }
                    // Set new tokens
                    _this2.setToken(body.token);
                    _this2.setRefreshToken(body.refresh_token);

                    // Inform the bus that we have a new token
                    _this2.bus.emit('jexia.auth.token', {
                        token: _this2.getToken(),
                        refreshToken: _this2.getRefreshToken()
                    });
                });
            }, delay);
        }
    }]);

    return Auth;
}();

exports.default = Auth;
},{"bluebird":7,"request":8}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Global singleton event bus for dataset subscriptions.
 * @extends {EventEmitter}
 */

var Bus = function (_EventEmitter) {
  _inherits(Bus, _EventEmitter);

  /**
   * Create a new Bus object
   */

  function Bus() {
    _classCallCheck(this, Bus);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Bus).call(this));
  }

  return Bus;
}(_events2.default);

var bus = new Bus();
exports.default = bus;
},{"events":9}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var _faye = require('faye');

var _faye2 = _interopRequireDefault(_faye);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Dataset CRUD operations and realtime subscriptions
 */

var Dataset = function () {

    /**
     * Create a dataset object with some initial values.
     * @param {string} name - Name of the dataset
     * @param {Object} client - {@link JexiaClient}
     */

    function Dataset(name, client) {
        _classCallCheck(this, Dataset);

        if (!name || !client) throw new Error('Dataset needs some params');

        /** @type {string} */
        this.name = name;

        /** @type {Object} */
        this.auth = client.auth;

        /** @type {Object} */
        this.app = client.app;

        /** @type {Object} */
        this.rtc = client.rtc;

        /** @type {Object} */
        this.bus = client.bus;
    }

    /**
     * List all records
     * @return {Promise<Array, Error>}
     * @example
     * dataset.list().then(function(res) {
     *    console.log(res);
     * });
     */

    _createClass(Dataset, [{
        key: 'list',
        value: function list() {
            return this.request({
                method: 'GET',
                data: '',
                id: ''
            });
        }

        /**
         * Query a dataset with query parameters
         * @param {Object} params - query params
         * @return {Promise<Array, Error>}
         * @example
         * dataset.query({limit: 1}).then(function(res) {
         *    console.log(res);
         * });
         */

    }, {
        key: 'query',
        value: function query(params) {
            return this.request({
                method: 'GET',
                data: '',
                id: '',
                qs: params
            });
        }

        /**
         * Get information about the dataset, such as total records
         * @return {Promise<Object, Error>}
         * @example
         * dataset.info().then(function(res) {
         *    console.log(res);
         * });
         */

    }, {
        key: 'info',
        value: function info() {
            var _this = this;

            return new _bluebird2.default(function (resolve, reject) {
                _this.request({
                    method: 'GET',
                    data: '',
                    id: '',
                    qs: {
                        jexia_info: true
                    }
                }).then(function (body) {
                    resolve(body.info);
                }, function (error) {
                    reject(error);
                });
            });
        }

        /**
         * Create a new record on the dataset
         * @param {Object} data - Row data
         * @return {Promise<Object, Error>}
         * @example
         * dataset.create({value: test}).then(function(res) {
         *    console.log(res);
         * });
         */

    }, {
        key: 'create',
        value: function create(data) {
            return this.request({
                method: 'POST',
                data: data,
                id: ''
            });
        }

        /**
         * Update a record on the dataset
         * @param {string} id - record id
         * @param {Object} data - Data to update
         * @return {Promise<Object, Error>}
         * @example
         * dataset.update('s6svsrw452rwfs', {value: test}).then(function(res) {
         *    console.log(res);
         * });
         */

    }, {
        key: 'update',
        value: function update(id, data) {
            return this.request({
                method: 'PUT',
                data: data,
                id: id
            });
        }

        /**
         * Delete a record from the dataset
         * @param {string} id - record id
         * @return {Promise<Object, Error>}
         * @example
         * dataset.delete('s6svsrw452rwfs').then(function(res) {
         *    console.log(res);
         * });
         */

    }, {
        key: 'delete',
        value: function _delete(id) {
            return this.request({
                method: 'DELETE',
                data: '',
                id: id
            });
        }

        /**
         * Get a record from a dataset
         * @param {string} id - record id
         * @return {Promise<Object, Error>}
         * @example
         * dataset.get('s6svsrw452rwfs').then(function(res) {
         *    console.log(res);
         * });
         */

    }, {
        key: 'get',
        value: function get(id) {
            return this.request({
                method: 'GET',
                data: '',
                id: id
            });
        }

        /**
         * Get dataset url
         * @private
         * @return {string} url
         */

    }, {
        key: 'getUrl',
        value: function getUrl() {
            return this.auth.url + this.name + '/';
        }

        /**
         * Get dataset namespace
         * @private
         * @return {string} url
         */

    }, {
        key: 'getEventNamespace',
        value: function getEventNamespace(event) {
            return this.name + '.' + event;
        }

        /**
         * Http request
         * @private
         * @return {Promise<Request, Error>}
         */

    }, {
        key: 'request',
        value: function request(params) {
            var _this2 = this;

            if (!params) throw new Error('Not enought params for request');

            var method = params.method,
                data = params.data,
                id = params.id,
                qs = {};

            // Query params
            if (typeof params.qs !== 'undefined') {
                qs = params.qs;
            }

            return new _bluebird2.default(function (resolve, reject) {
                (0, _request3.default)({
                    url: _this2.getUrl() + id,
                    qs: qs,
                    rejectUnauthorized: false,
                    method: method,
                    json: data || true,
                    headers: {
                        'Authorization': 'Bearer ' + _this2.auth.getToken()
                    }
                }, function (error, response, body) {
                    if (error) {
                        reject(error);
                    }

                    if (body && body.message) {
                        reject(body.message);
                    }

                    resolve(body);
                });
            });
        }

        /**
         * Subscribe to realtime notfications
         * The event name can be:
         * 1. None => Any kind of activity
         * 2. '*' => Any kind of activity
         * 3. 'created' => Only created rows
         * 4. 'updated' => Only updated rows
         * 5. 'deleted' => Only deleted rows
         * @param {...args} args - Event name and callback function
         * @emits {jexia.dataset.subscription} emit a new subscription event
         * @returns {Object} Dataset
         * @example
         * Subscribe to all events:
         * dataset.subscribe(function(data) {
         *     console.log(data);
         * });
         *
         * Subscribe to created events:
         * dataset.subscribe('created', function(data) {
         *     console.log(data);
         * });
         *
         * Subscribe to updated events:
         * dataset.subscribe('updated', function(data) {
         *     console.log(data);
         * });
         *
         * Subscribe to deleted events:
         * dataset.subscribe('deleted', function(data) {
         *     console.log(data);
         * });
         */

    }, {
        key: 'subscribe',
        value: function subscribe() {
            var event = '',
                cb = function callback() {};

            // Listen all events
            if (arguments.length === 1) {
                event = '*';
                cb = arguments.length <= 0 ? undefined : arguments[0];
            } else if (arguments.length === 2) {
                event = arguments.length <= 0 ? undefined : arguments[0];
                cb = arguments.length <= 1 ? undefined : arguments[1];
            } else {
                throw new Error('Not enough parameters for subscription');
            }

            // Attach the callback
            this.bus.on(this.getEventNamespace(event), cb);

            // Emit new subscription
            this.bus.emit('jexia.dataset.subscription', {
                app: this.app,
                dataset: this.name,
                event: this.getEventNamespace(event)
            });

            // Chainning
            return this;
        }
        /**
         * Unsubscribe from realtime notfications
         * @param {...args} args - Event name and callback function
         * @example
         * dataset.unsubscribe(function(data) {
         *     console.log(data);
         * });
         */

    }, {
        key: 'unsubscribe',
        value: function unsubscribe() {
            var event = '',
                cb = function callback() {};

            if (arguments.length === 1) {
                event = '*';
                cb = arguments.length <= 0 ? undefined : arguments[0];
            } else if (arguments.length === 2) {
                event = arguments.length <= 0 ? undefined : arguments[0];
                cb = arguments.length <= 1 ? undefined : arguments[1];
            } else {
                throw new Error('Not enough parameters to unsubscribe');
            }

            this.bus.removeListener(this.getEventNamespace(event), cb);
        }
    }]);

    return Dataset;
}();

exports.default = Dataset;
},{"bluebird":7,"faye":11,"request":8}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _Auth = require('./Auth.js');

var _Auth2 = _interopRequireDefault(_Auth);

var _Dataset = require('./Dataset.js');

var _Dataset2 = _interopRequireDefault(_Dataset);

var _RealtimeClient = require('./RealtimeClient.js');

var _RealtimeClient2 = _interopRequireDefault(_RealtimeClient);

var _Bus = require('./Bus.js');

var _Bus2 = _interopRequireDefault(_Bus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Bootstraping jexia-sdk-js with a new session
 */

var JexiaClient =

/**
 * Create a new JexiaClient object with some initial values.
 * @param {Object} options - Initial options object
 * @param {string} options.appId - App id
 * @param {string} options.appKey - App key
 * @param {string} options.appSecret - App secret
 * @return {Promise<JexiaClient, Error>}
 */
function JexiaClient(options) {
    var _this = this;

    _classCallCheck(this, JexiaClient);

    if (!options) throw new Error('Error constructing JexiaClient: Not enought params');

    /** @type {string} */
    this.appId = options.appId;

    /** @type {string} */
    this.appKey = options.appKey;

    /** @type {string} */
    this.appSecret = options.appSecret;

    if (!this.appId || !this.appKey || !this.appSecret) {
        throw new Error('Please provide your jexia app id, app key and app secret');
    }

    // We ask JEXIA for a token and then we initialize evetything
    return new _bluebird2.default(function (resolve, reject) {
        // Assign event bus
        /** @type {Object} */
        _this.bus = _Bus2.default;

        // Assign auth
        /** @type {Object} */
        _this.auth = new _Auth2.default({
            url: 'http://' + _this.appId + '.app.jexia.com/',
            key: _this.appKey,
            secret: _this.appSecret,
            client: _this
        });

        // Get the token and proceed
        _this.auth.init().then(function (auth) {

            // Assign app info
            /** @type {Object} */
            _this.app = {
                id: _this.appId,
                key: _this.appKey,
                secret: _this.appSecret
            };

            // Assign realtime client
            /** @type {Object} */
            _this.rtc = new _RealtimeClient2.default({
                url: 'http://rtc.jexia.com/rtc',
                token: auth.token,
                bus: _this.bus
            });

            // Assign dataset
            /** @type {Object} */
            _this.dataset = function (name) {
                return new _Dataset2.default(name, _this);
            };

            // Everything ok
            resolve(_this);
        }, function (error) {
            throw new Error(error);
        });
    });
};

exports.default = JexiaClient;
},{"./Auth.js":1,"./Bus.js":2,"./Dataset.js":3,"./RealtimeClient.js":5,"bluebird":7}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _faye = require('faye');

var _faye2 = _interopRequireDefault(_faye);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Managing real time events
 */

var RealtimeClient = function () {

    /**
     * Create a new RealTimeClient object with some initial values.
     * @param {Object} options - Initial options object
     * @param {string} options.url - url
     * @param {string} options.token - token
     * @param {string} options.bus - {@link Bus}
     * @return {Promise<JexiaClient, Error>}
     */

    function RealtimeClient(options) {
        var _this = this;

        _classCallCheck(this, RealtimeClient);

        if (!options) {
            throw new Error('RealtimeClient needs some params');
        }

        /** @type {string} */
        this.url = options.url;

        /** @type {string} */
        this.token = options.token;

        /** @type {Object} */
        this.bus = options.bus;

        // Active subscriptions
        /** @type {Array} */
        this.subscriptions = [];

        // Current subsription
        /** @type {string} */
        this.curSubscription = '';

        // Initialize real time client
        /** @type {Object} */
        this.faye = new _faye2.default.Client(this.url);

        // Set auth token
        this.faye.addExtension({
            outgoing: function outgoing(message, cb) {
                if (message.channel !== '/meta/subscribe') return cb(message);

                message.ext = message.ext || {};
                message.ext.token = _this.token;
                cb(message);
            }
        });
        // Attach the handlers
        this.attachEventHandlers();
    }

    /**
     * Attach responsible event handlers
     * @listens {jexia.auth.token} - New token
     * @listens {jexia.dataset.subscription} - New dataset subsciption
     */

    _createClass(RealtimeClient, [{
        key: 'attachEventHandlers',
        value: function attachEventHandlers() {
            var _this2 = this;

            // Attach handler for new token
            this.bus.on('jexia.auth.token', function (data) {
                _this2.onToken(data);
            });

            // New subscription
            this.bus.on('jexia.dataset.subscription', function (data) {
                _this2.onSubscription(data);
            });
        }

        /**
         * Responsible for handling a new subscription
         * @param {Object} data - Subscription response
         */

    }, {
        key: 'onSubscription',
        value: function onSubscription(data) {
            var _this3 = this;

            var name = data.dataset,
                event = data.event,
                channel = '/' + data.app.id + '/' + name + '/' + data.app.key;

            var subscription = this.faye.subscribe(channel, function (data) {
                var curEvent = _this3.getEventWithoutNamespace(event);
                if (data.type === curEvent || curEvent === '*') {
                    _this3.curSubscription = event;
                    _this3.bus.emit(event, data);
                }
            });

            this.subscriptions.push({
                data: {
                    app: data.app,
                    dataset: name,
                    event: event,
                    channel: channel
                },
                subscription: subscription
            });
        }

        /**
         * Responsible for handling a new token
         * @param {Object} data - Subscription response
         */

    }, {
        key: 'onToken',
        value: function onToken(data) {
            var _this4 = this;

            this.setToken(data.token);

            this.curSubscription = '';
            this.subscriptions.forEach(function (item) {

                // Unsubscribe first
                _this4.faye.unsubscribe(item.data.channel);

                // Subscribe again
                item.subscription = _this4.faye.subscribe(item.data.channel, function (data) {
                    var curEvent = _this4.getEventWithoutNamespace(item.data.event);

                    if (data.type === curEvent || curEvent === '*') {
                        if (_this4.curSubscription !== item.data.event) {
                            _this4.curSubscription = item.data.event;
                            _this4.bus.emit(item.data.event, data);
                        }
                    }
                });
            });
        }

        /**
         * get event name without namespace
         * @param {string} event - Event with namespace attached
         * @return {string} event - Event without namespace
         */

    }, {
        key: 'getEventWithoutNamespace',
        value: function getEventWithoutNamespace(event) {
            var res = event.split('.');
            return res[1];
        }

        /**
         * Set the current token
         * @param {string} token - token
         */

    }, {
        key: 'setToken',
        value: function setToken(token) {
            this.token = token;
        }
    }]);

    return RealtimeClient;
}();

exports.default = RealtimeClient;
},{"faye":11}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JexiaClient = undefined;

var _JexiaClient2 = require('./JexiaClient.js');

var _JexiaClient3 = _interopRequireDefault(_JexiaClient2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.JexiaClient = _JexiaClient3.default;
},{"./JexiaClient.js":4}],7:[function(require,module,exports){
(function (process,global){
/* @preserve
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013-2015 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
/**
 * bluebird build version 3.1.1
 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, using, timers, filter, any, each
*/
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;"undefined"!=typeof window?e=window:"undefined"!=typeof global?e=global:"undefined"!=typeof self&&(e=self),e.Promise=t()}}(function(){var t,e,n;return function r(t,e,n){function i(s,a){if(!e[s]){if(!t[s]){var c="function"==typeof _dereq_&&_dereq_;if(!a&&c)return c(s,!0);if(o)return o(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var l=e[s]={exports:{}};t[s][0].call(l.exports,function(e){var n=t[s][1][e];return i(n?n:e)},l,l.exports,r,t,e,n)}return e[s].exports}for(var o="function"==typeof _dereq_&&_dereq_,s=0;s<n.length;s++)i(n[s]);return i}({1:[function(t,e,n){"use strict";e.exports=function(t){function e(t){var e=new n(t),r=e.promise();return e.setHowMany(1),e.setUnwrap(),e.init(),r}var n=t._SomePromiseArray;t.any=function(t){return e(t)},t.prototype.any=function(){return e(this)}}},{}],2:[function(t,e,n){"use strict";function r(){this._isTickUsed=!1,this._lateQueue=new l(16),this._normalQueue=new l(16),this._haveDrainedQueues=!1,this._trampolineEnabled=!0;var t=this;this.drainQueues=function(){t._drainQueues()},this._schedule=u}function i(t,e,n){this._lateQueue.push(t,e,n),this._queueTick()}function o(t,e,n){this._normalQueue.push(t,e,n),this._queueTick()}function s(t){this._normalQueue._pushOne(t),this._queueTick()}var a;try{throw new Error}catch(c){a=c}var u=t("./schedule"),l=t("./queue"),p=t("./util");r.prototype.enableTrampoline=function(){this._trampolineEnabled=!0},r.prototype.disableTrampolineIfNecessary=function(){p.hasDevTools&&(this._trampolineEnabled=!1)},r.prototype.haveItemsQueued=function(){return this._isTickUsed||this._haveDrainedQueues},r.prototype.fatalError=function(t,e){e?(process.stderr.write("Fatal "+(t instanceof Error?t.stack:t)),process.exit(2)):this.throwLater(t)},r.prototype.throwLater=function(t,e){if(1===arguments.length&&(e=t,t=function(){throw e}),"undefined"!=typeof setTimeout)setTimeout(function(){t(e)},0);else try{this._schedule(function(){t(e)})}catch(n){throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")}},p.hasDevTools?(r.prototype.invokeLater=function(t,e,n){this._trampolineEnabled?i.call(this,t,e,n):this._schedule(function(){setTimeout(function(){t.call(e,n)},100)})},r.prototype.invoke=function(t,e,n){this._trampolineEnabled?o.call(this,t,e,n):this._schedule(function(){t.call(e,n)})},r.prototype.settlePromises=function(t){this._trampolineEnabled?s.call(this,t):this._schedule(function(){t._settlePromises()})}):(r.prototype.invokeLater=i,r.prototype.invoke=o,r.prototype.settlePromises=s),r.prototype.invokeFirst=function(t,e,n){this._normalQueue.unshift(t,e,n),this._queueTick()},r.prototype._drainQueue=function(t){for(;t.length()>0;){var e=t.shift();if("function"==typeof e){var n=t.shift(),r=t.shift();e.call(n,r)}else e._settlePromises()}},r.prototype._drainQueues=function(){this._drainQueue(this._normalQueue),this._reset(),this._haveDrainedQueues=!0,this._drainQueue(this._lateQueue)},r.prototype._queueTick=function(){this._isTickUsed||(this._isTickUsed=!0,this._schedule(this.drainQueues))},r.prototype._reset=function(){this._isTickUsed=!1},e.exports=r,e.exports.firstLineError=a},{"./queue":26,"./schedule":29,"./util":36}],3:[function(t,e,n){"use strict";e.exports=function(t,e,n,r){var i=!1,o=function(t,e){this._reject(e)},s=function(t,e){e.promiseRejectionQueued=!0,e.bindingPromise._then(o,o,null,this,t)},a=function(t,e){0===(50397184&this._bitField)&&this._resolveCallback(e.target)},c=function(t,e){e.promiseRejectionQueued||this._reject(t)};t.prototype.bind=function(o){i||(i=!0,t.prototype._propagateFrom=r.propagateFromFunction(),t.prototype._boundValue=r.boundValueFunction());var u=n(o),l=new t(e);l._propagateFrom(this,1);var p=this._target();if(l._setBoundTo(u),u instanceof t){var h={promiseRejectionQueued:!1,promise:l,target:p,bindingPromise:u};p._then(e,s,void 0,l,h),u._then(a,c,void 0,l,h),l._setOnCancel(u)}else l._resolveCallback(p);return l},t.prototype._setBoundTo=function(t){void 0!==t?(this._bitField=2097152|this._bitField,this._boundTo=t):this._bitField=-2097153&this._bitField},t.prototype._isBound=function(){return 2097152===(2097152&this._bitField)},t.bind=function(e,n){return t.resolve(n).bind(e)}}},{}],4:[function(t,e,n){"use strict";function r(){try{Promise===o&&(Promise=i)}catch(t){}return o}var i;"undefined"!=typeof Promise&&(i=Promise);var o=t("./promise")();o.noConflict=r,e.exports=o},{"./promise":22}],5:[function(t,e,n){"use strict";var r=Object.create;if(r){var i=r(null),o=r(null);i[" size"]=o[" size"]=0}e.exports=function(e){function n(t,n){var r;if(null!=t&&(r=t[n]),"function"!=typeof r){var i="Object "+a.classString(t)+" has no method '"+a.toString(n)+"'";throw new e.TypeError(i)}return r}function r(t){var e=this.pop(),r=n(t,e);return r.apply(t,this)}function i(t){return t[this]}function o(t){var e=+this;return 0>e&&(e=Math.max(0,e+t.length)),t[e]}var s,a=t("./util"),c=a.canEvaluate;a.isIdentifier;e.prototype.call=function(t){var e=[].slice.call(arguments,1);return e.push(t),this._then(r,void 0,void 0,e,void 0)},e.prototype.get=function(t){var e,n="number"==typeof t;if(n)e=o;else if(c){var r=s(t);e=null!==r?r:i}else e=i;return this._then(e,void 0,void 0,t,void 0)}}},{"./util":36}],6:[function(t,e,n){"use strict";e.exports=function(e,n,r,i){var o=t("./util"),s=o.tryCatch,a=o.errorObj,c=e._async;e.prototype["break"]=e.prototype.cancel=function(){if(!i.cancellation())return this._warn("cancellation is disabled");for(var t=this,e=t;t.isCancellable();){if(!t._cancelBy(e)){e._isFollowing()?e._followee().cancel():e._cancelBranched();break}var n=t._cancellationParent;if(null==n||!n.isCancellable()){t._isFollowing()?t._followee().cancel():t._cancelBranched();break}t._isFollowing()&&t._followee().cancel(),e=t,t=n}},e.prototype._branchHasCancelled=function(){this._branchesRemainingToCancel--},e.prototype._enoughBranchesHaveCancelled=function(){return void 0===this._branchesRemainingToCancel||this._branchesRemainingToCancel<=0},e.prototype._cancelBy=function(t){return t===this?(this._branchesRemainingToCancel=0,this._invokeOnCancel(),!0):(this._branchHasCancelled(),this._enoughBranchesHaveCancelled()?(this._invokeOnCancel(),!0):!1)},e.prototype._cancelBranched=function(){this._enoughBranchesHaveCancelled()&&this._cancel()},e.prototype._cancel=function(){this.isCancellable()&&(this._setCancelled(),c.invoke(this._cancelPromises,this,void 0))},e.prototype._cancelPromises=function(){this._length()>0&&this._settlePromises()},e.prototype._unsetOnCancel=function(){this._onCancelField=void 0},e.prototype.isCancellable=function(){return this.isPending()&&!this.isCancelled()},e.prototype._doInvokeOnCancel=function(t,e){if(o.isArray(t))for(var n=0;n<t.length;++n)this._doInvokeOnCancel(t[n],e);else if(void 0!==t)if("function"==typeof t){if(!e){var r=s(t).call(this._boundValue());r===a&&(this._attachExtraTrace(r.e),c.throwLater(r.e))}}else t._resultCancelled(this)},e.prototype._invokeOnCancel=function(){var t=this._onCancel();this._unsetOnCancel(),c.invoke(this._doInvokeOnCancel,this,t)},e.prototype._invokeInternalOnCancel=function(){this.isCancellable()&&(this._doInvokeOnCancel(this._onCancel(),!0),this._unsetOnCancel())},e.prototype._resultCancelled=function(){this.cancel()}}},{"./util":36}],7:[function(t,e,n){"use strict";e.exports=function(e){function n(t,n,a){return function(c){var u=a._boundValue();t:for(var l=0;l<t.length;++l){var p=t[l];if(p===Error||null!=p&&p.prototype instanceof Error){if(c instanceof p)return o(n).call(u,c)}else if("function"==typeof p){var h=o(p).call(u,c);if(h===s)return h;if(h)return o(n).call(u,c)}else if(r.isObject(c)){for(var f=i(p),_=0;_<f.length;++_){var d=f[_];if(p[d]!=c[d])continue t}return o(n).call(u,c)}}return e}}var r=t("./util"),i=t("./es5").keys,o=r.tryCatch,s=r.errorObj;return n}},{"./es5":13,"./util":36}],8:[function(t,e,n){"use strict";e.exports=function(t){function e(){this._trace=new e.CapturedTrace(r())}function n(){return i?new e:void 0}function r(){var t=o.length-1;return t>=0?o[t]:void 0}var i=!1,o=[];return t.prototype._promiseCreated=function(){},t.prototype._pushContext=function(){},t.prototype._popContext=function(){return null},t._peekContext=t.prototype._peekContext=function(){},e.prototype._pushContext=function(){void 0!==this._trace&&(this._trace._promiseCreated=null,o.push(this._trace))},e.prototype._popContext=function(){if(void 0!==this._trace){var t=o.pop(),e=t._promiseCreated;return t._promiseCreated=null,e}return null},e.CapturedTrace=null,e.create=n,e.deactivateLongStackTraces=function(){},e.activateLongStackTraces=function(){var n=t.prototype._pushContext,o=t.prototype._popContext,s=t._peekContext,a=t.prototype._peekContext,c=t.prototype._promiseCreated;e.deactivateLongStackTraces=function(){t.prototype._pushContext=n,t.prototype._popContext=o,t._peekContext=s,t.prototype._peekContext=a,t.prototype._promiseCreated=c,i=!1},i=!0,t.prototype._pushContext=e.prototype._pushContext,t.prototype._popContext=e.prototype._popContext,t._peekContext=t.prototype._peekContext=r,t.prototype._promiseCreated=function(){var t=this._peekContext();t&&null==t._promiseCreated&&(t._promiseCreated=this)}},e}},{}],9:[function(t,e,n){"use strict";e.exports=function(e,n){function r(t,e,n){var r=this;try{t(e,n,function(t){if("function"!=typeof t)throw new TypeError("onCancel must be a function, got: "+I.toString(t));r._attachCancellationCallback(t)})}catch(i){return i}}function i(t){if(!this.isCancellable())return this;var e=this._onCancel();void 0!==e?I.isArray(e)?e.push(t):this._setOnCancel([e,t]):this._setOnCancel(t)}function o(){return this._onCancelField}function s(t){this._onCancelField=t}function a(){this._cancellationParent=void 0,this._onCancelField=void 0}function c(t,e){if(0!==(1&e)){this._cancellationParent=t;var n=t._branchesRemainingToCancel;void 0===n&&(n=0),t._branchesRemainingToCancel=n+1}0!==(2&e)&&t._isBound()&&this._setBoundTo(t._boundTo)}function u(t,e){0!==(2&e)&&t._isBound()&&this._setBoundTo(t._boundTo)}function l(){var t=this._boundTo;return void 0!==t&&t instanceof e?t.isFulfilled()?t.value():void 0:t}function p(){this._trace=new R(this._peekContext())}function h(t,e){if(L(t)){var n=this._trace;if(void 0!==n&&e&&(n=n._parent),void 0!==n)n.attachExtraTrace(t);else if(!t.__stackCleaned__){var r=w(t);I.notEnumerableProp(t,"stack",r.message+"\n"+r.stack.join("\n")),I.notEnumerableProp(t,"__stackCleaned__",!0)}}}function f(t,e,n,r,i){if(void 0===t&&null!==e&&$){if(void 0!==i&&i._returnedNonUndefined())return;n&&(n+=" ");var o="a promise was created in a "+n+"handler but was not returned from it";r._warn(o,!0,e)}}function _(t,e){var n=t+" is deprecated and will be removed in a future version.";return e&&(n+=" Use "+e+" instead."),d(n)}function d(t,n,r){if(Z.warnings){var i,o=new V(t);if(n)r._attachExtraTrace(o);else if(Z.longStackTraces&&(i=e._peekContext()))i.attachExtraTrace(o);else{var s=w(o);o.stack=s.message+"\n"+s.stack.join("\n")}C(o,"",!0)}}function v(t,e){for(var n=0;n<e.length-1;++n)e[n].push("From previous event:"),e[n]=e[n].join("\n");return n<e.length&&(e[n]=e[n].join("\n")),t+"\n"+e.join("\n")}function y(t){for(var e=0;e<t.length;++e)(0===t[e].length||e+1<t.length&&t[e][0]===t[e+1][0])&&(t.splice(e,1),e--)}function g(t){for(var e=t[0],n=1;n<t.length;++n){for(var r=t[n],i=e.length-1,o=e[i],s=-1,a=r.length-1;a>=0;--a)if(r[a]===o){s=a;break}for(var a=s;a>=0;--a){var c=r[a];if(e[i]!==c)break;e.pop(),i--}e=r}}function m(t){for(var e=[],n=0;n<t.length;++n){var r=t[n],i="    (No stack trace)"===r||N.test(r),o=i&&X(r);i&&!o&&(B&&" "!==r.charAt(0)&&(r="    "+r),e.push(r))}return e}function b(t){for(var e=t.stack.replace(/\s+$/g,"").split("\n"),n=0;n<e.length;++n){var r=e[n];if("    (No stack trace)"===r||N.test(r))break}return n>0&&(e=e.slice(n)),e}function w(t){var e=t.stack,n=t.toString();return e="string"==typeof e&&e.length>0?b(t):["    (No stack trace)"],{message:n,stack:m(e)}}function C(t,e,n){if("undefined"!=typeof console){var r;if(I.isObject(t)){var i=t.stack;r=e+U(i,t)}else r=e+String(t);"function"==typeof S?S(r,n):("function"==typeof console.log||"object"==typeof console.log)&&console.log(r)}}function j(t,e,n,r){var i=!1;try{"function"==typeof e&&(i=!0,"rejectionHandled"===t?e(r):e(n,r))}catch(o){D.throwLater(o)}var s=!1;try{s=Y(t,n,r)}catch(o){s=!0,D.throwLater(o)}var a=!1;if(K)try{a=K(t.toLowerCase(),{reason:n,promise:r})}catch(o){a=!0,D.throwLater(o)}s||i||a||"unhandledRejection"!==t||C(n,"Unhandled rejection ")}function k(t){var e;if("function"==typeof t)e="[function "+(t.name||"anonymous")+"]";else{e=t&&"function"==typeof t.toString?t.toString():I.toString(t);var n=/\[object [a-zA-Z0-9$_]+\]/;if(n.test(e))try{var r=JSON.stringify(t);e=r}catch(i){}0===e.length&&(e="(empty array)")}return"(<"+F(e)+">, no stack trace)"}function F(t){var e=41;return t.length<e?t:t.substr(0,e-3)+"..."}function E(){return"function"==typeof J}function x(t){var e=t.match(W);return e?{fileName:e[1],line:parseInt(e[2],10)}:void 0}function T(t,e){if(E()){for(var n,r,i=t.stack.split("\n"),o=e.stack.split("\n"),s=-1,a=-1,c=0;c<i.length;++c){var u=x(i[c]);if(u){n=u.fileName,s=u.line;break}}for(var c=0;c<o.length;++c){var u=x(o[c]);if(u){r=u.fileName,a=u.line;break}}0>s||0>a||!n||!r||n!==r||s>=a||(X=function(t){if(H.test(t))return!0;var e=x(t);return e&&e.fileName===n&&s<=e.line&&e.line<=a?!0:!1})}}function R(t){this._parent=t,this._promisesCreated=0;var e=this._length=1+(void 0===t?0:t._length);J(this,R),e>32&&this.uncycle()}var P,O,S,A=e._getDomain,D=e._async,V=t("./errors").Warning,I=t("./util"),L=I.canAttachTrace,H=/[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/,N=null,U=null,B=!1,M=!(0==I.env("BLUEBIRD_DEBUG")||!I.env("BLUEBIRD_DEBUG")&&"development"!==I.env("NODE_ENV")),q=!(0==I.env("BLUEBIRD_WARNINGS")||!M&&!I.env("BLUEBIRD_WARNINGS")),Q=!(0==I.env("BLUEBIRD_LONG_STACK_TRACES")||!M&&!I.env("BLUEBIRD_LONG_STACK_TRACES")),$=0!=I.env("BLUEBIRD_W_FORGOTTEN_RETURN")&&(q||!!I.env("BLUEBIRD_W_FORGOTTEN_RETURN"));e.prototype.suppressUnhandledRejections=function(){var t=this._target();t._bitField=-1048577&t._bitField|524288},e.prototype._ensurePossibleRejectionHandled=function(){0===(524288&this._bitField)&&(this._setRejectionIsUnhandled(),D.invokeLater(this._notifyUnhandledRejection,this,void 0))},e.prototype._notifyUnhandledRejectionIsHandled=function(){j("rejectionHandled",P,void 0,this)},e.prototype._setReturnedNonUndefined=function(){this._bitField=268435456|this._bitField},e.prototype._returnedNonUndefined=function(){return 0!==(268435456&this._bitField)},e.prototype._notifyUnhandledRejection=function(){if(this._isRejectionUnhandled()){var t=this._settledValue();this._setUnhandledRejectionIsNotified(),j("unhandledRejection",O,t,this)}},e.prototype._setUnhandledRejectionIsNotified=function(){this._bitField=262144|this._bitField},e.prototype._unsetUnhandledRejectionIsNotified=function(){this._bitField=-262145&this._bitField},e.prototype._isUnhandledRejectionNotified=function(){return(262144&this._bitField)>0},e.prototype._setRejectionIsUnhandled=function(){this._bitField=1048576|this._bitField},e.prototype._unsetRejectionIsUnhandled=function(){this._bitField=-1048577&this._bitField,this._isUnhandledRejectionNotified()&&(this._unsetUnhandledRejectionIsNotified(),this._notifyUnhandledRejectionIsHandled())},e.prototype._isRejectionUnhandled=function(){return(1048576&this._bitField)>0},e.prototype._warn=function(t,e,n){return d(t,e,n||this)},e.onPossiblyUnhandledRejection=function(t){var e=A();O="function"==typeof t?null===e?t:e.bind(t):void 0},e.onUnhandledRejectionHandled=function(t){var e=A();P="function"==typeof t?null===e?t:e.bind(t):void 0};var z=function(){};e.longStackTraces=function(){if(D.haveItemsQueued()&&!Z.longStackTraces)throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");if(!Z.longStackTraces&&E()){var t=e.prototype._captureStackTrace,r=e.prototype._attachExtraTrace;Z.longStackTraces=!0,z=function(){if(D.haveItemsQueued()&&!Z.longStackTraces)throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n");e.prototype._captureStackTrace=t,e.prototype._attachExtraTrace=r,n.deactivateLongStackTraces(),D.enableTrampoline(),Z.longStackTraces=!1},e.prototype._captureStackTrace=p,e.prototype._attachExtraTrace=h,n.activateLongStackTraces(),D.disableTrampolineIfNecessary()}},e.hasLongStackTraces=function(){return Z.longStackTraces&&E()},e.config=function(t){if(t=Object(t),"longStackTraces"in t&&(t.longStackTraces?e.longStackTraces():!t.longStackTraces&&e.hasLongStackTraces()&&z()),"warnings"in t){var n=t.warnings;Z.warnings=!!n,$=Z.warnings,I.isObject(n)&&"wForgottenReturn"in n&&($=!!n.wForgottenReturn)}if("cancellation"in t&&t.cancellation&&!Z.cancellation){if(D.haveItemsQueued())throw new Error("cannot enable cancellation after promises are in use");e.prototype._clearCancellationData=a,e.prototype._propagateFrom=c,e.prototype._onCancel=o,e.prototype._setOnCancel=s,e.prototype._attachCancellationCallback=i,e.prototype._execute=r,G=c,Z.cancellation=!0}},e.prototype._execute=function(t,e,n){try{t(e,n)}catch(r){return r}},e.prototype._onCancel=function(){},e.prototype._setOnCancel=function(t){},e.prototype._attachCancellationCallback=function(t){},e.prototype._captureStackTrace=function(){},e.prototype._attachExtraTrace=function(){},e.prototype._clearCancellationData=function(){},e.prototype._propagateFrom=function(t,e){};var G=u,X=function(){return!1},W=/[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;I.inherits(R,Error),n.CapturedTrace=R,R.prototype.uncycle=function(){var t=this._length;if(!(2>t)){for(var e=[],n={},r=0,i=this;void 0!==i;++r)e.push(i),i=i._parent;t=this._length=r;for(var r=t-1;r>=0;--r){var o=e[r].stack;void 0===n[o]&&(n[o]=r)}for(var r=0;t>r;++r){var s=e[r].stack,a=n[s];if(void 0!==a&&a!==r){a>0&&(e[a-1]._parent=void 0,e[a-1]._length=1),e[r]._parent=void 0,e[r]._length=1;var c=r>0?e[r-1]:this;t-1>a?(c._parent=e[a+1],c._parent.uncycle(),c._length=c._parent._length+1):(c._parent=void 0,c._length=1);for(var u=c._length+1,l=r-2;l>=0;--l)e[l]._length=u,u++;return}}}},R.prototype.attachExtraTrace=function(t){if(!t.__stackCleaned__){this.uncycle();for(var e=w(t),n=e.message,r=[e.stack],i=this;void 0!==i;)r.push(m(i.stack.split("\n"))),i=i._parent;g(r),y(r),I.notEnumerableProp(t,"stack",v(n,r)),I.notEnumerableProp(t,"__stackCleaned__",!0)}};var K,J=function(){var t=/^\s*at\s*/,e=function(t,e){return"string"==typeof t?t:void 0!==e.name&&void 0!==e.message?e.toString():k(e)};if("number"==typeof Error.stackTraceLimit&&"function"==typeof Error.captureStackTrace){Error.stackTraceLimit+=6,N=t,U=e;var n=Error.captureStackTrace;return X=function(t){return H.test(t)},function(t,e){Error.stackTraceLimit+=6,n(t,e),Error.stackTraceLimit-=6}}var r=new Error;if("string"==typeof r.stack&&r.stack.split("\n")[0].indexOf("stackDetection@")>=0)return N=/@/,U=e,B=!0,function(t){t.stack=(new Error).stack};var i;try{throw new Error}catch(o){i="stack"in o}return"stack"in r||!i||"number"!=typeof Error.stackTraceLimit?(U=function(t,e){return"string"==typeof t?t:"object"!=typeof e&&"function"!=typeof e||void 0===e.name||void 0===e.message?k(e):e.toString()},null):(N=t,U=e,function(t){Error.stackTraceLimit+=6;try{throw new Error}catch(e){t.stack=e.stack}Error.stackTraceLimit-=6})}([]),Y=function(){if(I.isNode)return function(t,e,n){return"rejectionHandled"===t?process.emit(t,n):process.emit(t,e,n)};var t="undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:void 0!==this?this:null;if(!t)return function(){return!1};try{var e=document.createEvent("CustomEvent");e.initCustomEvent("testingtheevent",!1,!0,{}),t.dispatchEvent(e),K=function(e,n){var r=document.createEvent("CustomEvent");return r.initCustomEvent(e,!1,!0,n),!t.dispatchEvent(r)}}catch(n){}var r={};return r.unhandledRejection="onunhandledRejection".toLowerCase(),r.rejectionHandled="onrejectionHandled".toLowerCase(),function(e,n,i){var o=r[e],s=t[o];return s?("rejectionHandled"===e?s.call(t,i):s.call(t,n,i),!0):!1}}();"undefined"!=typeof console&&"undefined"!=typeof console.warn&&(S=function(t){console.warn(t)},I.isNode&&process.stderr.isTTY?S=function(t,e){var n=e?"[33m":"[31m";console.warn(n+t+"[0m\n")}:I.isNode||"string"!=typeof(new Error).stack||(S=function(t,e){console.warn("%c"+t,e?"color: darkorange":"color: red")}));var Z={warnings:q,longStackTraces:!1,cancellation:!1};return Q&&e.longStackTraces(),{longStackTraces:function(){return Z.longStackTraces},warnings:function(){return Z.warnings},cancellation:function(){return Z.cancellation},propagateFromFunction:function(){return G},boundValueFunction:function(){return l},checkForgottenReturns:f,setBounds:T,warn:d,deprecated:_,CapturedTrace:R}}},{"./errors":12,"./util":36}],10:[function(t,e,n){"use strict";e.exports=function(t){function e(){return this.value}function n(){throw this.reason}t.prototype["return"]=t.prototype.thenReturn=function(n){return n instanceof t&&n.suppressUnhandledRejections(),this._then(e,void 0,void 0,{value:n},void 0)},t.prototype["throw"]=t.prototype.thenThrow=function(t){return this._then(n,void 0,void 0,{reason:t},void 0)},t.prototype.catchThrow=function(t){if(arguments.length<=1)return this._then(void 0,n,void 0,{reason:t},void 0);var e=arguments[1],r=function(){throw e};return this.caught(t,r)},t.prototype.catchReturn=function(n){if(arguments.length<=1)return n instanceof t&&n.suppressUnhandledRejections(),this._then(void 0,e,void 0,{value:n},void 0);var r=arguments[1];r instanceof t&&r.suppressUnhandledRejections();var i=function(){return r};return this.caught(n,i)}}},{}],11:[function(t,e,n){"use strict";e.exports=function(t,e){function n(){return o(this)}function r(t,n){return i(t,n,e,e)}var i=t.reduce,o=t.all;t.prototype.each=function(t){return this.mapSeries(t)._then(n,void 0,void 0,this,void 0)},t.prototype.mapSeries=function(t){return i(this,t,e,e)},t.each=function(t,e){return r(t,e)._then(n,void 0,void 0,t,void 0)},t.mapSeries=r}},{}],12:[function(t,e,n){"use strict";function r(t,e){function n(r){return this instanceof n?(p(this,"message","string"==typeof r?r:e),p(this,"name",t),void(Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):Error.call(this))):new n(r)}return l(n,Error),n}function i(t){return this instanceof i?(p(this,"name","OperationalError"),p(this,"message",t),this.cause=t,this.isOperational=!0,void(t instanceof Error?(p(this,"message",t.message),p(this,"stack",t.stack)):Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor))):new i(t)}var o,s,a=t("./es5"),c=a.freeze,u=t("./util"),l=u.inherits,p=u.notEnumerableProp,h=r("Warning","warning"),f=r("CancellationError","cancellation error"),_=r("TimeoutError","timeout error"),d=r("AggregateError","aggregate error");try{o=TypeError,s=RangeError}catch(v){o=r("TypeError","type error"),s=r("RangeError","range error")}for(var y="join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "),g=0;g<y.length;++g)"function"==typeof Array.prototype[y[g]]&&(d.prototype[y[g]]=Array.prototype[y[g]]);a.defineProperty(d.prototype,"length",{value:0,configurable:!1,writable:!0,enumerable:!0}),d.prototype.isOperational=!0;var m=0;d.prototype.toString=function(){var t=Array(4*m+1).join(" "),e="\n"+t+"AggregateError of:\n";m++,t=Array(4*m+1).join(" ");for(var n=0;n<this.length;++n){for(var r=this[n]===this?"[Circular AggregateError]":this[n]+"",i=r.split("\n"),o=0;o<i.length;++o)i[o]=t+i[o];r=i.join("\n"),e+=r+"\n"}return m--,e},l(i,Error);var b=Error.__BluebirdErrorTypes__;b||(b=c({CancellationError:f,TimeoutError:_,OperationalError:i,RejectionError:i,AggregateError:d}),p(Error,"__BluebirdErrorTypes__",b)),e.exports={Error:Error,TypeError:o,RangeError:s,CancellationError:b.CancellationError,OperationalError:b.OperationalError,TimeoutError:b.TimeoutError,AggregateError:b.AggregateError,Warning:h}},{"./es5":13,"./util":36}],13:[function(t,e,n){var r=function(){"use strict";return void 0===this}();if(r)e.exports={freeze:Object.freeze,defineProperty:Object.defineProperty,getDescriptor:Object.getOwnPropertyDescriptor,keys:Object.keys,names:Object.getOwnPropertyNames,getPrototypeOf:Object.getPrototypeOf,isArray:Array.isArray,isES5:r,propertyIsWritable:function(t,e){var n=Object.getOwnPropertyDescriptor(t,e);return!(n&&!n.writable&&!n.set)}};else{var i={}.hasOwnProperty,o={}.toString,s={}.constructor.prototype,a=function(t){var e=[];for(var n in t)i.call(t,n)&&e.push(n);return e},c=function(t,e){return{value:t[e]}},u=function(t,e,n){return t[e]=n.value,t},l=function(t){return t},p=function(t){try{return Object(t).constructor.prototype}catch(e){return s}},h=function(t){try{return"[object Array]"===o.call(t)}catch(e){return!1}};e.exports={isArray:h,keys:a,names:a,defineProperty:u,getDescriptor:c,freeze:l,getPrototypeOf:p,isES5:r,propertyIsWritable:function(){return!0}}}},{}],14:[function(t,e,n){"use strict";e.exports=function(t,e){var n=t.map;t.prototype.filter=function(t,r){return n(this,t,r,e)},t.filter=function(t,r,i){return n(t,r,i,e)}}},{}],15:[function(t,e,n){"use strict";e.exports=function(e,n){function r(t){this.finallyHandler=t}function i(t,e){return null!=t.cancelPromise?(arguments.length>1?t.cancelPromise._reject(e):t.cancelPromise._cancel(),t.cancelPromise=null,!0):!1}function o(){return a.call(this,this.promise._target()._settledValue())}function s(t){return i(this,t)?void 0:(l.e=t,l)}function a(t){var a=this.promise,c=this.handler;if(!this.called){this.called=!0;var p=0===this.type?c.call(a._boundValue()):c.call(a._boundValue(),t);if(void 0!==p){a._setReturnedNonUndefined();var h=n(p,a);if(h instanceof e){if(null!=this.cancelPromise){if(h.isCancelled()){var f=new u("late cancellation observer");return a._attachExtraTrace(f),l.e=f,l}h.isPending()&&h._attachCancellationCallback(new r(this))}return h._then(o,s,void 0,this,void 0)}}}return a.isRejected()?(i(this),l.e=t,l):(i(this),t)}var c=t("./util"),u=e.CancellationError,l=c.errorObj;return r.prototype._resultCancelled=function(){i(this.finallyHandler)},e.prototype._passThrough=function(t,e,n,r){return"function"!=typeof t?this.then():this._then(n,r,void 0,{promise:this,handler:t,called:!1,cancelPromise:null,type:e},void 0)},e.prototype.lastly=e.prototype["finally"]=function(t){return this._passThrough(t,0,a,a)},e.prototype.tap=function(t){return this._passThrough(t,1,a)},a}},{"./util":36}],16:[function(t,e,n){"use strict";e.exports=function(e,n,r,i,o,s){function a(t,n,r){for(var o=0;o<n.length;++o){r._pushContext();var s=f(n[o])(t);if(r._popContext(),s===h){r._pushContext();var a=e.reject(h.e);return r._popContext(),a}var c=i(s,r);if(c instanceof e)return c}return null}function c(t,n,i,o){var s=this._promise=new e(r);s._captureStackTrace(),s._setOnCancel(this),this._stack=o,this._generatorFunction=t,this._receiver=n,this._generator=void 0,this._yieldHandlers="function"==typeof i?[i].concat(_):_,this._yieldedPromise=null}var u=t("./errors"),l=u.TypeError,p=t("./util"),h=p.errorObj,f=p.tryCatch,_=[];p.inherits(c,o),c.prototype._isResolved=function(){return null===this._promise},c.prototype._cleanup=function(){this._promise=this._generator=null},c.prototype._promiseCancelled=function(){if(!this._isResolved()){var t,n="undefined"!=typeof this._generator["return"];if(n)this._promise._pushContext(),t=f(this._generator["return"]).call(this._generator,void 0),this._promise._popContext();else{var r=new e.CancellationError("generator .return() sentinel");e.coroutine.returnSentinel=r,this._promise._attachExtraTrace(r),this._promise._pushContext(),t=f(this._generator["throw"]).call(this._generator,r),this._promise._popContext(),t===h&&t.e===r&&(t=null)}var i=this._promise;this._cleanup(),t===h?i._rejectCallback(t.e,!1):i.cancel()}},c.prototype._promiseFulfilled=function(t){this._yieldedPromise=null,this._promise._pushContext();var e=f(this._generator.next).call(this._generator,t);this._promise._popContext(),this._continue(e)},c.prototype._promiseRejected=function(t){this._yieldedPromise=null,this._promise._attachExtraTrace(t),this._promise._pushContext();var e=f(this._generator["throw"]).call(this._generator,t);this._promise._popContext(),this._continue(e)},c.prototype._resultCancelled=function(){if(this._yieldedPromise instanceof e){var t=this._yieldedPromise;this._yieldedPromise=null,t.cancel()}},c.prototype.promise=function(){return this._promise},c.prototype._run=function(){this._generator=this._generatorFunction.call(this._receiver),this._receiver=this._generatorFunction=void 0,this._promiseFulfilled(void 0)},c.prototype._continue=function(t){var n=this._promise;if(t===h)return this._cleanup(),n._rejectCallback(t.e,!1);var r=t.value;if(t.done===!0)return this._cleanup(),n._resolveCallback(r);var o=i(r,this._promise);if(!(o instanceof e)&&(o=a(o,this._yieldHandlers,this._promise),null===o))return void this._promiseRejected(new l("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s",r)+"From coroutine:\n"+this._stack.split("\n").slice(1,-7).join("\n")));o=o._target();var s=o._bitField;0===(50397184&s)?(this._yieldedPromise=o,o._proxy(this,null)):0!==(33554432&s)?this._promiseFulfilled(o._value()):0!==(16777216&s)?this._promiseRejected(o._reason()):this._promiseCancelled()},e.coroutine=function(t,e){if("function"!=typeof t)throw new l("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");var n=Object(e).yieldHandler,r=c,i=(new Error).stack;return function(){var e=t.apply(this,arguments),o=new r(void 0,void 0,n,i),s=o.promise();return o._generator=e,o._promiseFulfilled(void 0),s}},e.coroutine.addYieldHandler=function(t){if("function"!=typeof t)throw new l("expecting a function but got "+p.classString(t));_.push(t)},e.spawn=function(t){if(s.deprecated("Promise.spawn()","Promise.coroutine()"),"function"!=typeof t)return n("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n");var r=new c(t,this),i=r.promise();return r._run(e.spawn),i}}},{"./errors":12,"./util":36}],17:[function(t,e,n){"use strict";e.exports=function(e,n,r,i){var o=t("./util");o.canEvaluate,o.tryCatch,o.errorObj;e.join=function(){var t,e=arguments.length-1;if(e>0&&"function"==typeof arguments[e]){t=arguments[e];var r}var i=[].slice.call(arguments);t&&i.pop();var r=new n(i).promise();return void 0!==t?r.spread(t):r}}},{"./util":36}],18:[function(t,e,n){"use strict";e.exports=function(e,n,r,i,o,s){function a(t,e,n,r){this.constructor$(t),this._promise._captureStackTrace();var i=u();this._callback=null===i?e:i.bind(e),this._preservedValues=r===o?new Array(this.length()):null,this._limit=n,this._inFlight=0,this._queue=n>=1?[]:f,this._init$(void 0,-2)}function c(t,e,n,i){if("function"!=typeof e)return r("expecting a function but got "+l.classString(e));var o="object"==typeof n&&null!==n?n.concurrency:0;return o="number"==typeof o&&isFinite(o)&&o>=1?o:0,new a(t,e,o,i).promise()}var u=e._getDomain,l=t("./util"),p=l.tryCatch,h=l.errorObj,f=[];l.inherits(a,n),a.prototype._init=function(){},a.prototype._promiseFulfilled=function(t,n){var r=this._values,o=this.length(),a=this._preservedValues,c=this._limit;if(0>n){if(n=-1*n-1,r[n]=t,c>=1&&(this._inFlight--,this._drainQueue(),this._isResolved()))return!0}else{if(c>=1&&this._inFlight>=c)return r[n]=t,this._queue.push(n),!1;null!==a&&(a[n]=t);var u=this._promise,l=this._callback,f=u._boundValue();u._pushContext();var _=p(l).call(f,t,n,o),d=u._popContext();if(s.checkForgottenReturns(_,d,null!==a?"Promise.filter":"Promise.map",u),_===h)return this._reject(_.e),!0;var v=i(_,this._promise);if(v instanceof e){v=v._target();var y=v._bitField;if(0===(50397184&y))return c>=1&&this._inFlight++,r[n]=v,v._proxy(this,-1*(n+1)),!1;if(0===(33554432&y))return 0!==(16777216&y)?(this._reject(v._reason()),!0):(this._cancel(),
!0);_=v._value()}r[n]=_}var g=++this._totalResolved;return g>=o?(null!==a?this._filter(r,a):this._resolve(r),!0):!1},a.prototype._drainQueue=function(){for(var t=this._queue,e=this._limit,n=this._values;t.length>0&&this._inFlight<e;){if(this._isResolved())return;var r=t.pop();this._promiseFulfilled(n[r],r)}},a.prototype._filter=function(t,e){for(var n=e.length,r=new Array(n),i=0,o=0;n>o;++o)t[o]&&(r[i++]=e[o]);r.length=i,this._resolve(r)},a.prototype.preservedValues=function(){return this._preservedValues},e.prototype.map=function(t,e){return c(this,t,e,null)},e.map=function(t,e,n,r){return c(t,e,n,r)}}},{"./util":36}],19:[function(t,e,n){"use strict";e.exports=function(e,n,r,i,o){var s=t("./util"),a=s.tryCatch;e.method=function(t){if("function"!=typeof t)throw new e.TypeError("expecting a function but got "+s.classString(t));return function(){var r=new e(n);r._captureStackTrace(),r._pushContext();var i=a(t).apply(this,arguments),s=r._popContext();return o.checkForgottenReturns(i,s,"Promise.method",r),r._resolveFromSyncValue(i),r}},e.attempt=e["try"]=function(t){if("function"!=typeof t)return i("expecting a function but got "+s.classString(t));var r=new e(n);r._captureStackTrace(),r._pushContext();var c;if(arguments.length>1){o.deprecated("calling Promise.try with more than 1 argument");var u=arguments[1],l=arguments[2];c=s.isArray(u)?a(t).apply(l,u):a(t).call(l,u)}else c=a(t)();var p=r._popContext();return o.checkForgottenReturns(c,p,"Promise.try",r),r._resolveFromSyncValue(c),r},e.prototype._resolveFromSyncValue=function(t){t===s.errorObj?this._rejectCallback(t.e,!1):this._resolveCallback(t,!0)}}},{"./util":36}],20:[function(t,e,n){"use strict";function r(t){return t instanceof Error&&l.getPrototypeOf(t)===Error.prototype}function i(t){var e;if(r(t)){e=new u(t),e.name=t.name,e.message=t.message,e.stack=t.stack;for(var n=l.keys(t),i=0;i<n.length;++i){var o=n[i];p.test(o)||(e[o]=t[o])}return e}return s.markAsOriginatingFromRejection(t),t}function o(t,e){return function(n,r){if(null!==t){if(n){var o=i(a(n));t._attachExtraTrace(o),t._reject(o)}else if(e){var s=[].slice.call(arguments,1);t._fulfill(s)}else t._fulfill(r);t=null}}}var s=t("./util"),a=s.maybeWrapAsError,c=t("./errors"),u=c.OperationalError,l=t("./es5"),p=/^(?:name|message|stack|cause)$/;e.exports=o},{"./errors":12,"./es5":13,"./util":36}],21:[function(t,e,n){"use strict";e.exports=function(e){function n(t,e){var n=this;if(!o.isArray(t))return r.call(n,t,e);var i=a(e).apply(n._boundValue(),[null].concat(t));i===c&&s.throwLater(i.e)}function r(t,e){var n=this,r=n._boundValue(),i=void 0===t?a(e).call(r,null):a(e).call(r,null,t);i===c&&s.throwLater(i.e)}function i(t,e){var n=this;if(!t){var r=new Error(t+"");r.cause=t,t=r}var i=a(e).call(n._boundValue(),t);i===c&&s.throwLater(i.e)}var o=t("./util"),s=e._async,a=o.tryCatch,c=o.errorObj;e.prototype.asCallback=e.prototype.nodeify=function(t,e){if("function"==typeof t){var o=r;void 0!==e&&Object(e).spread&&(o=n),this._then(o,i,void 0,this,t)}return this}}},{"./util":36}],22:[function(t,e,n){"use strict";e.exports=function(){function e(){}function n(t,e){if("function"!=typeof e)throw new y("expecting a function but got "+h.classString(e));if(t.constructor!==r)throw new y("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n")}function r(t){this._bitField=0,this._fulfillmentHandler0=void 0,this._rejectionHandler0=void 0,this._promise0=void 0,this._receiver0=void 0,t!==m&&(n(this,t),this._resolveFromExecutor(t)),this._promiseCreated()}function i(t){this.promise._resolveCallback(t)}function o(t){this.promise._rejectCallback(t,!1)}function s(t){var e=new r(m);e._fulfillmentHandler0=t,e._rejectionHandler0=t,e._promise0=t,e._receiver0=t}var a,c=function(){return new y("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n")},u=function(){return new r.PromiseInspection(this._target())},l=function(t){return r.reject(new y(t))},p={},h=t("./util");a=h.isNode?function(){var t=process.domain;return void 0===t&&(t=null),t}:function(){return null},h.notEnumerableProp(r,"_getDomain",a);var f=t("./es5"),_=t("./async"),d=new _;f.defineProperty(r,"_async",{value:d});var v=t("./errors"),y=r.TypeError=v.TypeError;r.RangeError=v.RangeError;var g=r.CancellationError=v.CancellationError;r.TimeoutError=v.TimeoutError,r.OperationalError=v.OperationalError,r.RejectionError=v.OperationalError,r.AggregateError=v.AggregateError;var m=function(){},b={},w={},C=t("./thenables")(r,m),j=t("./promise_array")(r,m,C,l,e),k=t("./context")(r),F=k.create,E=t("./debuggability")(r,k),x=(E.CapturedTrace,t("./finally")(r,C)),T=t("./catch_filter")(w),R=t("./nodeback"),P=h.errorObj,O=h.tryCatch;return r.prototype.toString=function(){return"[object Promise]"},r.prototype.caught=r.prototype["catch"]=function(t){var e=arguments.length;if(e>1){var n,r=new Array(e-1),i=0;for(n=0;e-1>n;++n){var o=arguments[n];if(!h.isObject(o))return l("expecting an object but got "+h.classString(o));r[i++]=o}return r.length=i,t=arguments[n],this.then(void 0,T(r,t,this))}return this.then(void 0,t)},r.prototype.reflect=function(){return this._then(u,u,void 0,this,void 0)},r.prototype.then=function(t,e){if(E.warnings()&&arguments.length>0&&"function"!=typeof t&&"function"!=typeof e){var n=".then() only accepts functions but was passed: "+h.classString(t);arguments.length>1&&(n+=", "+h.classString(e)),this._warn(n)}return this._then(t,e,void 0,void 0,void 0)},r.prototype.done=function(t,e){var n=this._then(t,e,void 0,void 0,void 0);n._setIsFinal()},r.prototype.spread=function(t){return"function"!=typeof t?l("expecting a function but got "+h.classString(t)):this.all()._then(t,void 0,void 0,b,void 0)},r.prototype.toJSON=function(){var t={isFulfilled:!1,isRejected:!1,fulfillmentValue:void 0,rejectionReason:void 0};return this.isFulfilled()?(t.fulfillmentValue=this.value(),t.isFulfilled=!0):this.isRejected()&&(t.rejectionReason=this.reason(),t.isRejected=!0),t},r.prototype.all=function(){return arguments.length>0&&this._warn(".all() was passed arguments but it does not take any"),new j(this).promise()},r.prototype.error=function(t){return this.caught(h.originatesFromRejection,t)},r.is=function(t){return t instanceof r},r.fromNode=r.fromCallback=function(t){var e=new r(m),n=arguments.length>1?!!Object(arguments[1]).multiArgs:!1,i=O(t)(R(e,n));return i===P&&e._rejectCallback(i.e,!0),e._isFateSealed()||e._setAsyncGuaranteed(),e},r.all=function(t){return new j(t).promise()},r.cast=function(t){var e=C(t);return e instanceof r||(e=new r(m),e._captureStackTrace(),e._setFulfilled(),e._rejectionHandler0=t),e},r.resolve=r.fulfilled=r.cast,r.reject=r.rejected=function(t){var e=new r(m);return e._captureStackTrace(),e._rejectCallback(t,!0),e},r.setScheduler=function(t){if("function"!=typeof t)throw new y("expecting a function but got "+h.classString(t));var e=d._schedule;return d._schedule=t,e},r.prototype._then=function(t,e,n,i,o){var s=void 0!==o,c=s?o:new r(m),u=this._target(),l=u._bitField;s||(c._propagateFrom(this,3),c._captureStackTrace(),void 0===i&&0!==(2097152&this._bitField)&&(i=0!==(50397184&l)?this._boundValue():u===this?void 0:this._boundTo));var p=a();if(0!==(50397184&l)){var h,f,_=u._settlePromiseCtx;0!==(33554432&l)?(f=u._rejectionHandler0,h=t):0!==(16777216&l)?(f=u._fulfillmentHandler0,h=e,u._unsetRejectionIsUnhandled()):(_=u._settlePromiseLateCancellationObserver,f=new g("late cancellation observer"),u._attachExtraTrace(f),h=e),d.invoke(_,u,{handler:null===p?h:"function"==typeof h&&p.bind(h),promise:c,receiver:i,value:f})}else u._addCallbacks(t,e,c,i,p);return c},r.prototype._length=function(){return 65535&this._bitField},r.prototype._isFateSealed=function(){return 0!==(117506048&this._bitField)},r.prototype._isFollowing=function(){return 67108864===(67108864&this._bitField)},r.prototype._setLength=function(t){this._bitField=-65536&this._bitField|65535&t},r.prototype._setFulfilled=function(){this._bitField=33554432|this._bitField},r.prototype._setRejected=function(){this._bitField=16777216|this._bitField},r.prototype._setFollowing=function(){this._bitField=67108864|this._bitField},r.prototype._setIsFinal=function(){this._bitField=4194304|this._bitField},r.prototype._isFinal=function(){return(4194304&this._bitField)>0},r.prototype._unsetCancelled=function(){this._bitField=-65537&this._bitField},r.prototype._setCancelled=function(){this._bitField=65536|this._bitField},r.prototype._setAsyncGuaranteed=function(){this._bitField=134217728|this._bitField},r.prototype._receiverAt=function(t){var e=0===t?this._receiver0:this[4*t-4+3];return e===p?void 0:void 0===e&&this._isBound()?this._boundValue():e},r.prototype._promiseAt=function(t){return this[4*t-4+2]},r.prototype._fulfillmentHandlerAt=function(t){return this[4*t-4+0]},r.prototype._rejectionHandlerAt=function(t){return this[4*t-4+1]},r.prototype._boundValue=function(){},r.prototype._migrateCallback0=function(t){var e=(t._bitField,t._fulfillmentHandler0),n=t._rejectionHandler0,r=t._promise0,i=t._receiverAt(0);void 0===i&&(i=p),this._addCallbacks(e,n,r,i,null)},r.prototype._migrateCallbackAt=function(t,e){var n=t._fulfillmentHandlerAt(e),r=t._rejectionHandlerAt(e),i=t._promiseAt(e),o=t._receiverAt(e);void 0===o&&(o=p),this._addCallbacks(n,r,i,o,null)},r.prototype._addCallbacks=function(t,e,n,r,i){var o=this._length();if(o>=65531&&(o=0,this._setLength(0)),0===o)this._promise0=n,this._receiver0=r,"function"==typeof t&&(this._fulfillmentHandler0=null===i?t:i.bind(t)),"function"==typeof e&&(this._rejectionHandler0=null===i?e:i.bind(e));else{var s=4*o-4;this[s+2]=n,this[s+3]=r,"function"==typeof t&&(this[s+0]=null===i?t:i.bind(t)),"function"==typeof e&&(this[s+1]=null===i?e:i.bind(e))}return this._setLength(o+1),o},r.prototype._proxy=function(t,e){this._addCallbacks(void 0,void 0,e,t,null)},r.prototype._resolveCallback=function(t,e){if(0===(117506048&this._bitField)){if(t===this)return this._rejectCallback(c(),!1);var n=C(t,this);if(!(n instanceof r))return this._fulfill(t);e&&this._propagateFrom(n,2);var i=n._target(),o=i._bitField;if(0===(50397184&o)){var s=this._length();s>0&&i._migrateCallback0(this);for(var a=1;s>a;++a)i._migrateCallbackAt(this,a);this._setFollowing(),this._setLength(0),this._setFollowee(i)}else if(0!==(33554432&o))this._fulfill(i._value());else if(0!==(16777216&o))this._reject(i._reason());else{var u=new g("late cancellation observer");i._attachExtraTrace(u),this._reject(u)}}},r.prototype._rejectCallback=function(t,e,n){var r=h.ensureErrorObject(t),i=r===t;if(!i&&!n&&E.warnings()){var o="a promise was rejected with a non-error: "+h.classString(t);this._warn(o,!0)}this._attachExtraTrace(r,e?i:!1),this._reject(t)},r.prototype._resolveFromExecutor=function(t){var e=this;this._captureStackTrace(),this._pushContext();var n=!0,r=this._execute(t,function(t){e._resolveCallback(t)},function(t){e._rejectCallback(t,n)});n=!1,this._popContext(),void 0!==r&&e._rejectCallback(r,!0)},r.prototype._settlePromiseFromHandler=function(t,e,n,r){var i=r._bitField;if(0===(65536&i)){r._pushContext();var o;e===b?n&&"number"==typeof n.length?o=O(t).apply(this._boundValue(),n):(o=P,o.e=new y("cannot .spread() a non-array: "+h.classString(n))):o=O(t).call(e,n);var s=r._popContext();if(i=r._bitField,0===(65536&i))if(o===w)r._reject(n);else if(o===P||o===r){var a=o===r?c():o.e;r._rejectCallback(a,!1)}else E.checkForgottenReturns(o,s,"",r,this),r._resolveCallback(o)}},r.prototype._target=function(){for(var t=this;t._isFollowing();)t=t._followee();return t},r.prototype._followee=function(){return this._rejectionHandler0},r.prototype._setFollowee=function(t){this._rejectionHandler0=t},r.prototype._settlePromise=function(t,n,i,o){var s=t instanceof r,a=this._bitField,c=0!==(134217728&a);0!==(65536&a)?(s&&t._invokeInternalOnCancel(),n===x?(i.cancelPromise=t,O(n).call(i,o)===P&&t._reject(P.e)):n===u?t._fulfill(u.call(i)):i instanceof e?i._promiseCancelled(t):s||t instanceof j?t._cancel():i.cancel()):"function"==typeof n?s?(c&&t._setAsyncGuaranteed(),this._settlePromiseFromHandler(n,i,o,t)):n.call(i,o,t):i instanceof e?i._isResolved()||(0!==(33554432&a)?i._promiseFulfilled(o,t):i._promiseRejected(o,t)):s&&(c&&t._setAsyncGuaranteed(),0!==(33554432&a)?t._fulfill(o):t._reject(o))},r.prototype._settlePromiseLateCancellationObserver=function(t){var e=t.handler,n=t.promise,i=t.receiver,o=t.value;"function"==typeof e?n instanceof r?this._settlePromiseFromHandler(e,i,o,n):e.call(i,o,n):n instanceof r&&n._reject(o)},r.prototype._settlePromiseCtx=function(t){this._settlePromise(t.promise,t.handler,t.receiver,t.value)},r.prototype._settlePromise0=function(t,e,n){var r=this._promise0,i=this._receiverAt(0);this._promise0=void 0,this._receiver0=void 0,this._settlePromise(r,t,i,e)},r.prototype._clearCallbackDataAtIndex=function(t){var e=4*t-4;this[e+2]=this[e+3]=this[e+0]=this[e+1]=void 0},r.prototype._fulfill=function(t){var e=this._bitField;if(!((117506048&e)>>>16)){if(t===this){var n=c();return this._attachExtraTrace(n),this._reject(n)}this._setFulfilled(),this._rejectionHandler0=t,(65535&e)>0&&(0!==(134217728&e)?this._settlePromises():d.settlePromises(this))}},r.prototype._reject=function(t){var e=this._bitField;if(!((117506048&e)>>>16))return this._setRejected(),this._fulfillmentHandler0=t,this._isFinal()?d.fatalError(t,h.isNode):void((65535&e)>0?0!==(134217728&e)?this._settlePromises():d.settlePromises(this):this._ensurePossibleRejectionHandled())},r.prototype._fulfillPromises=function(t,e){for(var n=1;t>n;n++){var r=this._fulfillmentHandlerAt(n),i=this._promiseAt(n),o=this._receiverAt(n);this._clearCallbackDataAtIndex(n),this._settlePromise(i,r,o,e)}},r.prototype._rejectPromises=function(t,e){for(var n=1;t>n;n++){var r=this._rejectionHandlerAt(n),i=this._promiseAt(n),o=this._receiverAt(n);this._clearCallbackDataAtIndex(n),this._settlePromise(i,r,o,e)}},r.prototype._settlePromises=function(){var t=this._bitField,e=65535&t;if(e>0){if(0!==(16842752&t)){var n=this._fulfillmentHandler0;this._settlePromise0(this._rejectionHandler0,n,t),this._rejectPromises(e,n)}else{var r=this._rejectionHandler0;this._settlePromise0(this._fulfillmentHandler0,r,t),this._fulfillPromises(e,r)}this._setLength(0)}this._clearCancellationData()},r.prototype._settledValue=function(){var t=this._bitField;return 0!==(33554432&t)?this._rejectionHandler0:0!==(16777216&t)?this._fulfillmentHandler0:void 0},r.defer=r.pending=function(){E.deprecated("Promise.defer","new Promise");var t=new r(m);return{promise:t,resolve:i,reject:o}},h.notEnumerableProp(r,"_makeSelfResolutionError",c),t("./method")(r,m,C,l,E),t("./bind")(r,m,C,E),t("./cancel")(r,j,l,E),t("./direct_resolve")(r),t("./synchronous_inspection")(r),t("./join")(r,j,C,m,E),r.Promise=r,t("./map.js")(r,j,l,C,m,E),t("./using.js")(r,l,C,F,m,E),t("./timers.js")(r,m),t("./generators.js")(r,l,m,C,e,E),t("./nodeify.js")(r),t("./call_get.js")(r),t("./props.js")(r,j,C,l),t("./race.js")(r,m,C,l),t("./reduce.js")(r,j,l,C,m,E),t("./settle.js")(r,j,E),t("./some.js")(r,j,l),t("./promisify.js")(r,m),t("./any.js")(r),t("./each.js")(r,m),t("./filter.js")(r,m),h.toFastProperties(r),h.toFastProperties(r.prototype),s({a:1}),s({b:2}),s({c:3}),s(1),s(function(){}),s(void 0),s(!1),s(new r(m)),E.setBounds(_.firstLineError,h.lastLineError),r}},{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(t,e,n){"use strict";e.exports=function(e,n,r,i,o){function s(t){switch(t){case-2:return[];case-3:return{}}}function a(t){var r=this._promise=new e(n);t instanceof e&&r._propagateFrom(t,3),r._setOnCancel(this),this._values=t,this._length=0,this._totalResolved=0,this._init(void 0,-2)}var c=t("./util");c.isArray;return c.inherits(a,o),a.prototype.length=function(){return this._length},a.prototype.promise=function(){return this._promise},a.prototype._init=function u(t,n){var o=r(this._values,this._promise);if(o instanceof e){o=o._target();var a=o._bitField;if(this._values=o,0===(50397184&a))return this._promise._setAsyncGuaranteed(),o._then(u,this._reject,void 0,this,n);if(0===(33554432&a))return 0!==(16777216&a)?this._reject(o._reason()):this._cancel();o=o._value()}if(o=c.asArray(o),null===o){var l=i("expecting an array or an iterable object but got "+c.classString(o)).reason();return void this._promise._rejectCallback(l,!1)}return 0===o.length?void(-5===n?this._resolveEmptyArray():this._resolve(s(n))):void this._iterate(o)},a.prototype._iterate=function(t){var n=this.getActualLength(t.length);this._length=n,this._values=this.shouldCopyValues()?new Array(n):this._values;for(var i=this._promise,o=!1,s=null,a=0;n>a;++a){var c=r(t[a],i);c instanceof e?(c=c._target(),s=c._bitField):s=null,o?null!==s&&c.suppressUnhandledRejections():null!==s?0===(50397184&s)?(c._proxy(this,a),this._values[a]=c):o=0!==(33554432&s)?this._promiseFulfilled(c._value(),a):0!==(16777216&s)?this._promiseRejected(c._reason(),a):this._promiseCancelled(a):o=this._promiseFulfilled(c,a)}o||i._setAsyncGuaranteed()},a.prototype._isResolved=function(){return null===this._values},a.prototype._resolve=function(t){this._values=null,this._promise._fulfill(t)},a.prototype._cancel=function(){!this._isResolved()&&this._promise.isCancellable()&&(this._values=null,this._promise._cancel())},a.prototype._reject=function(t){this._values=null,this._promise._rejectCallback(t,!1)},a.prototype._promiseFulfilled=function(t,e){this._values[e]=t;var n=++this._totalResolved;return n>=this._length?(this._resolve(this._values),!0):!1},a.prototype._promiseCancelled=function(){return this._cancel(),!0},a.prototype._promiseRejected=function(t){return this._totalResolved++,this._reject(t),!0},a.prototype._resultCancelled=function(){if(!this._isResolved()){var t=this._values;if(this._cancel(),t instanceof e)t.cancel();else for(var n=0;n<t.length;++n)t[n]instanceof e&&t[n].cancel()}},a.prototype.shouldCopyValues=function(){return!0},a.prototype.getActualLength=function(t){return t},a}},{"./util":36}],24:[function(t,e,n){"use strict";e.exports=function(e,n){function r(t){return!C.test(t)}function i(t){try{return t.__isPromisified__===!0}catch(e){return!1}}function o(t,e,n){var r=f.getDataPropertyOrDefault(t,e+n,b);return r?i(r):!1}function s(t,e,n){for(var r=0;r<t.length;r+=2){var i=t[r];if(n.test(i))for(var o=i.replace(n,""),s=0;s<t.length;s+=2)if(t[s]===o)throw new g("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s",e))}}function a(t,e,n,r){for(var a=f.inheritedDataKeys(t),c=[],u=0;u<a.length;++u){var l=a[u],p=t[l],h=r===j?!0:j(l,p,t);"function"!=typeof p||i(p)||o(t,l,e)||!r(l,p,t,h)||c.push(l,p)}return s(c,e,n),c}function c(t,r,i,o,s,a){function c(){var i=r;r===h&&(i=this);var o=new e(n);o._captureStackTrace();var s="string"==typeof l&&this!==u?this[l]:t,c=_(o,a);try{s.apply(i,d(arguments,c))}catch(p){o._rejectCallback(v(p),!0,!0)}return o._isFateSealed()||o._setAsyncGuaranteed(),o}var u=function(){return this}(),l=t;return"string"==typeof l&&(t=o),f.notEnumerableProp(c,"__isPromisified__",!0),c}function u(t,e,n,r,i){for(var o=new RegExp(k(e)+"$"),s=a(t,e,o,n),c=0,u=s.length;u>c;c+=2){var l=s[c],p=s[c+1],_=l+e;if(r===F)t[_]=F(l,h,l,p,e,i);else{var d=r(p,function(){return F(l,h,l,p,e,i)});f.notEnumerableProp(d,"__isPromisified__",!0),t[_]=d}}return f.toFastProperties(t),t}function l(t,e,n){return F(t,e,void 0,t,null,n)}var p,h={},f=t("./util"),_=t("./nodeback"),d=f.withAppended,v=f.maybeWrapAsError,y=f.canEvaluate,g=t("./errors").TypeError,m="Async",b={__isPromisified__:!0},w=["arity","length","name","arguments","caller","callee","prototype","__isPromisified__"],C=new RegExp("^(?:"+w.join("|")+")$"),j=function(t){return f.isIdentifier(t)&&"_"!==t.charAt(0)&&"constructor"!==t},k=function(t){return t.replace(/([$])/,"\\$")},F=y?p:c;e.promisify=function(t,e){if("function"!=typeof t)throw new g("expecting a function but got "+f.classString(t));if(i(t))return t;e=Object(e);var n=void 0===e.context?h:e.context,o=!!e.multiArgs,s=l(t,n,o);return f.copyDescriptors(t,s,r),s},e.promisifyAll=function(t,e){if("function"!=typeof t&&"object"!=typeof t)throw new g("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n");e=Object(e);var n=!!e.multiArgs,r=e.suffix;"string"!=typeof r&&(r=m);var i=e.filter;"function"!=typeof i&&(i=j);var o=e.promisifier;if("function"!=typeof o&&(o=F),!f.isIdentifier(r))throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n");for(var s=f.inheritedDataKeys(t),a=0;a<s.length;++a){var c=t[s[a]];"constructor"!==s[a]&&f.isClass(c)&&(u(c.prototype,r,i,o,n),u(c,r,i,o,n))}return u(t,r,i,o,n)}}},{"./errors":12,"./nodeback":20,"./util":36}],25:[function(t,e,n){"use strict";e.exports=function(e,n,r,i){function o(t){var e,n=!1;if(void 0!==a&&t instanceof a)e=p(t),n=!0;else{var r=l.keys(t),i=r.length;e=new Array(2*i);for(var o=0;i>o;++o){var s=r[o];e[o]=t[s],e[o+i]=s}}this.constructor$(e),this._isMap=n,this._init$(void 0,-3)}function s(t){var n,s=r(t);return u(s)?(n=s instanceof e?s._then(e.props,void 0,void 0,void 0,void 0):new o(s).promise(),s instanceof e&&n._propagateFrom(s,2),n):i("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n")}var a,c=t("./util"),u=c.isObject,l=t("./es5");"function"==typeof Map&&(a=Map);var p=function(){function t(t,r){this[e]=t,this[e+n]=r,e++}var e=0,n=0;return function(r){n=r.size,e=0;var i=new Array(2*r.size);return r.forEach(t,i),i}}(),h=function(t){for(var e=new a,n=t.length/2|0,r=0;n>r;++r){var i=t[n+r],o=t[r];e.set(i,o)}return e};c.inherits(o,n),o.prototype._init=function(){},o.prototype._promiseFulfilled=function(t,e){this._values[e]=t;var n=++this._totalResolved;if(n>=this._length){var r;if(this._isMap)r=h(this._values);else{r={};for(var i=this.length(),o=0,s=this.length();s>o;++o)r[this._values[o+i]]=this._values[o]}return this._resolve(r),!0}return!1},o.prototype.shouldCopyValues=function(){return!1},o.prototype.getActualLength=function(t){return t>>1},e.prototype.props=function(){return s(this)},e.props=function(t){return s(t)}}},{"./es5":13,"./util":36}],26:[function(t,e,n){"use strict";function r(t,e,n,r,i){for(var o=0;i>o;++o)n[o+r]=t[o+e],t[o+e]=void 0}function i(t){this._capacity=t,this._length=0,this._front=0}i.prototype._willBeOverCapacity=function(t){return this._capacity<t},i.prototype._pushOne=function(t){var e=this.length();this._checkCapacity(e+1);var n=this._front+e&this._capacity-1;this[n]=t,this._length=e+1},i.prototype._unshiftOne=function(t){var e=this._capacity;this._checkCapacity(this.length()+1);var n=this._front,r=(n-1&e-1^e)-e;this[r]=t,this._front=r,this._length=this.length()+1},i.prototype.unshift=function(t,e,n){this._unshiftOne(n),this._unshiftOne(e),this._unshiftOne(t)},i.prototype.push=function(t,e,n){var r=this.length()+3;if(this._willBeOverCapacity(r))return this._pushOne(t),this._pushOne(e),void this._pushOne(n);var i=this._front+r-3;this._checkCapacity(r);var o=this._capacity-1;this[i+0&o]=t,this[i+1&o]=e,this[i+2&o]=n,this._length=r},i.prototype.shift=function(){var t=this._front,e=this[t];return this[t]=void 0,this._front=t+1&this._capacity-1,this._length--,e},i.prototype.length=function(){return this._length},i.prototype._checkCapacity=function(t){this._capacity<t&&this._resizeTo(this._capacity<<1)},i.prototype._resizeTo=function(t){var e=this._capacity;this._capacity=t;var n=this._front,i=this._length,o=n+i&e-1;r(this,0,this,e,o)},e.exports=i},{}],27:[function(t,e,n){"use strict";e.exports=function(e,n,r,i){function o(t,o){var c=r(t);if(c instanceof e)return a(c);if(t=s.asArray(t),null===t)return i("expecting an array or an iterable object but got "+s.classString(t));var u=new e(n);void 0!==o&&u._propagateFrom(o,3);for(var l=u._fulfill,p=u._reject,h=0,f=t.length;f>h;++h){var _=t[h];(void 0!==_||h in t)&&e.cast(_)._then(l,p,void 0,u,null)}return u}var s=t("./util"),a=function(t){return t.then(function(e){return o(e,t)})};e.race=function(t){return o(t,void 0)},e.prototype.race=function(){return o(this,void 0)}}},{"./util":36}],28:[function(t,e,n){"use strict";e.exports=function(e,n,r,i,o,s){function a(t,n,r,i){this.constructor$(t);var s=h();this._fn=null===s?n:s.bind(n),void 0!==r&&(r=e.resolve(r),r._attachCancellationCallback(this)),this._initialValue=r,this._currentCancellable=null,this._eachValues=i===o?[]:void 0,this._promise._captureStackTrace(),this._init$(void 0,-5)}function c(t,e){this.isFulfilled()?e._resolve(t):e._reject(t)}function u(t,e,n,i){if("function"!=typeof e)return r("expecting a function but got "+f.classString(e));var o=new a(t,e,n,i);return o.promise()}function l(t){this.accum=t,this.array._gotAccum(t);var n=i(this.value,this.array._promise);return n instanceof e?(this.array._currentCancellable=n,n._then(p,void 0,void 0,this,void 0)):p.call(this,n)}function p(t){var n=this.array,r=n._promise,i=_(n._fn);r._pushContext();var o;o=void 0!==n._eachValues?i.call(r._boundValue(),t,this.index,this.length):i.call(r._boundValue(),this.accum,t,this.index,this.length),o instanceof e&&(n._currentCancellable=o);var a=r._popContext();return s.checkForgottenReturns(o,a,void 0!==n._eachValues?"Promise.each":"Promise.reduce",r),o}var h=e._getDomain,f=t("./util"),_=f.tryCatch;f.inherits(a,n),a.prototype._gotAccum=function(t){void 0!==this._eachValues&&t!==o&&this._eachValues.push(t)},a.prototype._eachComplete=function(t){return this._eachValues.push(t),this._eachValues},a.prototype._init=function(){},a.prototype._resolveEmptyArray=function(){this._resolve(void 0!==this._eachValues?this._eachValues:this._initialValue)},a.prototype.shouldCopyValues=function(){return!1},a.prototype._resolve=function(t){this._promise._resolveCallback(t),this._values=null},a.prototype._resultCancelled=function(t){return t===this._initialValue?this._cancel():void(this._isResolved()||(this._resultCancelled$(),this._currentCancellable instanceof e&&this._currentCancellable.cancel(),this._initialValue instanceof e&&this._initialValue.cancel()))},a.prototype._iterate=function(t){this._values=t;var n,r,i=t.length;if(void 0!==this._initialValue?(n=this._initialValue,r=0):(n=e.resolve(t[0]),r=1),this._currentCancellable=n,!n.isRejected())for(;i>r;++r){var o={accum:null,value:t[r],index:r,length:i,array:this};n=n._then(l,void 0,void 0,o,void 0)}void 0!==this._eachValues&&(n=n._then(this._eachComplete,void 0,void 0,this,void 0)),n._then(c,c,void 0,n,this)},e.prototype.reduce=function(t,e){return u(this,t,e,null)},e.reduce=function(t,e,n,r){return u(t,e,n,r)}}},{"./util":36}],29:[function(t,e,n){"use strict";var r,i=t("./util"),o=function(){throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")};if(i.isNode&&"undefined"==typeof MutationObserver){var s=global.setImmediate,a=process.nextTick;r=i.isRecentNode?function(t){s.call(global,t)}:function(t){a.call(process,t)}}else r="undefined"==typeof MutationObserver||"undefined"!=typeof window&&window.navigator&&window.navigator.standalone?"undefined"!=typeof setImmediate?function(t){setImmediate(t)}:"undefined"!=typeof setTimeout?function(t){setTimeout(t,0)}:o:function(){var t=document.createElement("div"),e={attributes:!0},n=!1,r=document.createElement("div"),i=new MutationObserver(function(){t.classList.toggle("foo"),n=!1});i.observe(r,e);var o=function(){n||(n=!0,r.classList.toggle("foo"))};return function(n){var r=new MutationObserver(function(){r.disconnect(),n()});r.observe(t,e),o()}}();e.exports=r},{"./util":36}],30:[function(t,e,n){"use strict";e.exports=function(e,n,r){function i(t){this.constructor$(t)}var o=e.PromiseInspection,s=t("./util");s.inherits(i,n),i.prototype._promiseResolved=function(t,e){this._values[t]=e;var n=++this._totalResolved;return n>=this._length?(this._resolve(this._values),!0):!1},i.prototype._promiseFulfilled=function(t,e){var n=new o;return n._bitField=33554432,n._settledValueField=t,this._promiseResolved(e,n)},i.prototype._promiseRejected=function(t,e){var n=new o;return n._bitField=16777216,n._settledValueField=t,this._promiseResolved(e,n)},e.settle=function(t){return r.deprecated(".settle()",".reflect()"),new i(t).promise()},e.prototype.settle=function(){return e.settle(this)}}},{"./util":36}],31:[function(t,e,n){"use strict";e.exports=function(e,n,r){function i(t){this.constructor$(t),this._howMany=0,this._unwrap=!1,this._initialized=!1}function o(t,e){if((0|e)!==e||0>e)return r("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n");var n=new i(t),o=n.promise();return n.setHowMany(e),n.init(),o}var s=t("./util"),a=t("./errors").RangeError,c=t("./errors").AggregateError,u=s.isArray,l={};s.inherits(i,n),i.prototype._init=function(){if(this._initialized){if(0===this._howMany)return void this._resolve([]);this._init$(void 0,-5);var t=u(this._values);!this._isResolved()&&t&&this._howMany>this._canPossiblyFulfill()&&this._reject(this._getRangeError(this.length()))}},i.prototype.init=function(){this._initialized=!0,this._init()},i.prototype.setUnwrap=function(){this._unwrap=!0},i.prototype.howMany=function(){return this._howMany},i.prototype.setHowMany=function(t){this._howMany=t},i.prototype._promiseFulfilled=function(t){return this._addFulfilled(t),this._fulfilled()===this.howMany()?(this._values.length=this.howMany(),1===this.howMany()&&this._unwrap?this._resolve(this._values[0]):this._resolve(this._values),!0):!1},i.prototype._promiseRejected=function(t){return this._addRejected(t),this._checkOutcome()},i.prototype._promiseCancelled=function(){return this._values instanceof e||null==this._values?this._cancel():(this._addRejected(l),this._checkOutcome())},i.prototype._checkOutcome=function(){if(this.howMany()>this._canPossiblyFulfill()){for(var t=new c,e=this.length();e<this._values.length;++e)this._values[e]!==l&&t.push(this._values[e]);return t.length>0?this._reject(t):this._cancel(),!0}return!1},i.prototype._fulfilled=function(){return this._totalResolved},i.prototype._rejected=function(){return this._values.length-this.length()},i.prototype._addRejected=function(t){this._values.push(t)},i.prototype._addFulfilled=function(t){this._values[this._totalResolved++]=t},i.prototype._canPossiblyFulfill=function(){return this.length()-this._rejected()},i.prototype._getRangeError=function(t){var e="Input array must contain at least "+this._howMany+" items but contains only "+t+" items";return new a(e)},i.prototype._resolveEmptyArray=function(){this._reject(this._getRangeError(0))},e.some=function(t,e){return o(t,e)},e.prototype.some=function(t){return o(this,t)},e._SomePromiseArray=i}},{"./errors":12,"./util":36}],32:[function(t,e,n){"use strict";e.exports=function(t){function e(t){void 0!==t?(t=t._target(),this._bitField=t._bitField,this._settledValueField=t._isFateSealed()?t._settledValue():void 0):(this._bitField=0,this._settledValueField=void 0)}e.prototype._settledValue=function(){return this._settledValueField};var n=e.prototype.value=function(){if(!this.isFulfilled())throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n");return this._settledValue()},r=e.prototype.error=e.prototype.reason=function(){if(!this.isRejected())throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n");return this._settledValue()},i=e.prototype.isFulfilled=function(){return 0!==(33554432&this._bitField)},o=e.prototype.isRejected=function(){return 0!==(16777216&this._bitField)},s=e.prototype.isPending=function(){return 0===(50397184&this._bitField)},a=e.prototype.isResolved=function(){return 0!==(50331648&this._bitField)};e.prototype.isCancelled=t.prototype._isCancelled=function(){return 65536===(65536&this._bitField);
},t.prototype.isCancelled=function(){return this._target()._isCancelled()},t.prototype.isPending=function(){return s.call(this._target())},t.prototype.isRejected=function(){return o.call(this._target())},t.prototype.isFulfilled=function(){return i.call(this._target())},t.prototype.isResolved=function(){return a.call(this._target())},t.prototype.value=function(){return n.call(this._target())},t.prototype.reason=function(){var t=this._target();return t._unsetRejectionIsUnhandled(),r.call(t)},t.prototype._value=function(){return this._settledValue()},t.prototype._reason=function(){return this._unsetRejectionIsUnhandled(),this._settledValue()},t.PromiseInspection=e}},{}],33:[function(t,e,n){"use strict";e.exports=function(e,n){function r(t,r){if(l(t)){if(t instanceof e)return t;var i=o(t);if(i===u){r&&r._pushContext();var c=e.reject(i.e);return r&&r._popContext(),c}if("function"==typeof i){if(s(t)){var c=new e(n);return t._then(c._fulfill,c._reject,void 0,c,null),c}return a(t,i,r)}}return t}function i(t){return t.then}function o(t){try{return i(t)}catch(e){return u.e=e,u}}function s(t){return p.call(t,"_promise0")}function a(t,r,i){function o(t){a&&(a._resolveCallback(t),a=null)}function s(t){a&&(a._rejectCallback(t,p,!0),a=null)}var a=new e(n),l=a;i&&i._pushContext(),a._captureStackTrace(),i&&i._popContext();var p=!0,h=c.tryCatch(r).call(t,o,s);return p=!1,a&&h===u&&(a._rejectCallback(h.e,!0,!0),a=null),l}var c=t("./util"),u=c.errorObj,l=c.isObject,p={}.hasOwnProperty;return r}},{"./util":36}],34:[function(t,e,n){"use strict";e.exports=function(e,n){function r(t){var e=this;return e instanceof Number&&(e=+e),clearTimeout(e),t}function i(t){var e=this;throw e instanceof Number&&(e=+e),clearTimeout(e),t}var o=t("./util"),s=e.TimeoutError,a=function(t,e,n){if(t.isPending()){var r;r="string"!=typeof e?e instanceof Error?e:new s("operation timed out"):new s(e),o.markAsOriginatingFromRejection(r),t._attachExtraTrace(r),t._reject(r),n.cancel()}},c=function(t){return u(+this).thenReturn(t)},u=e.delay=function(t,r){var i;return void 0!==r?i=e.resolve(r)._then(c,null,null,t,void 0):(i=new e(n),setTimeout(function(){i._fulfill()},+t)),i._setAsyncGuaranteed(),i};e.prototype.delay=function(t){return u(t,this)},e.prototype.timeout=function(t,e){t=+t;var n=this.then(),o=n.then(),s=setTimeout(function(){a(o,e,n)},t);return o._then(r,i,void 0,s,void 0)}}},{"./util":36}],35:[function(t,e,n){"use strict";e.exports=function(e,n,r,i,o,s){function a(t){setTimeout(function(){throw t},0)}function c(t){var e=r(t);return e!==t&&"function"==typeof t._isDisposable&&"function"==typeof t._getDisposer&&t._isDisposable()&&e._setDisposable(t._getDisposer()),e}function u(t,n){function i(){if(s>=u)return l._fulfill();var o=c(t[s++]);if(o instanceof e&&o._isDisposable()){try{o=r(o._getDisposer().tryDispose(n),t.promise)}catch(p){return a(p)}if(o instanceof e)return o._then(i,a,null,null,null)}i()}var s=0,u=t.length,l=new e(o);return i(),l}function l(t,e,n){this._data=t,this._promise=e,this._context=n}function p(t,e,n){this.constructor$(t,e,n)}function h(t){return l.isDisposer(t)?(this.resources[this.index]._setDisposable(t),t.promise()):t}function f(t){this.length=t,this.promise=null,this[t-1]=null}var _=t("./util"),d=t("./errors").TypeError,v=t("./util").inherits,y=_.errorObj,g=_.tryCatch;l.prototype.data=function(){return this._data},l.prototype.promise=function(){return this._promise},l.prototype.resource=function(){return this.promise().isFulfilled()?this.promise().value():null},l.prototype.tryDispose=function(t){var e=this.resource(),n=this._context;void 0!==n&&n._pushContext();var r=null!==e?this.doDispose(e,t):null;return void 0!==n&&n._popContext(),this._promise._unsetDisposable(),this._data=null,r},l.isDisposer=function(t){return null!=t&&"function"==typeof t.resource&&"function"==typeof t.tryDispose},v(p,l),p.prototype.doDispose=function(t,e){var n=this.data();return n.call(t,t,e)},f.prototype._resultCancelled=function(){for(var t=this.length,n=0;t>n;++n){var r=this[n];r instanceof e&&r.cancel()}},e.using=function(){var t=arguments.length;if(2>t)return n("you must pass at least 2 arguments to Promise.using");var i=arguments[t-1];if("function"!=typeof i)return n("expecting a function but got "+_.classString(i));var o,a=!0;2===t&&Array.isArray(arguments[0])?(o=arguments[0],t=o.length,a=!1):(o=arguments,t--);for(var c=new f(t),p=0;t>p;++p){var d=o[p];if(l.isDisposer(d)){var v=d;d=d.promise(),d._setDisposable(v)}else{var m=r(d);m instanceof e&&(d=m._then(h,null,null,{resources:c,index:p},void 0))}c[p]=d}for(var b=new Array(c.length),p=0;p<b.length;++p)b[p]=e.resolve(c[p]).reflect();var w=e.all(b).then(function(t){for(var e=0;e<t.length;++e){var n=t[e];if(n.isRejected())return y.e=n.error(),y;if(!n.isFulfilled())return void w.cancel();t[e]=n.value()}C._pushContext(),i=g(i);var r=a?i.apply(void 0,t):i(t),o=C._popContext();return s.checkForgottenReturns(r,o,"Promise.using",C),r}),C=w.lastly(function(){var t=new e.PromiseInspection(w);return u(c,t)});return c.promise=C,C._setOnCancel(c),C},e.prototype._setDisposable=function(t){this._bitField=131072|this._bitField,this._disposer=t},e.prototype._isDisposable=function(){return(131072&this._bitField)>0},e.prototype._getDisposer=function(){return this._disposer},e.prototype._unsetDisposable=function(){this._bitField=-131073&this._bitField,this._disposer=void 0},e.prototype.disposer=function(t){if("function"==typeof t)return new p(t,this,i());throw new d}}},{"./errors":12,"./util":36}],36:[function(t,e,n){"use strict";function r(){try{var t=E;return E=null,t.apply(this,arguments)}catch(e){return F.e=e,F}}function i(t){return E=t,r}function o(t){return null==t||t===!0||t===!1||"string"==typeof t||"number"==typeof t}function s(t){return"function"==typeof t||"object"==typeof t&&null!==t}function a(t){return o(t)?new Error(v(t)):t}function c(t,e){var n,r=t.length,i=new Array(r+1);for(n=0;r>n;++n)i[n]=t[n];return i[n]=e,i}function u(t,e,n){if(!j.isES5)return{}.hasOwnProperty.call(t,e)?t[e]:void 0;var r=Object.getOwnPropertyDescriptor(t,e);return null!=r?null==r.get&&null==r.set?r.value:n:void 0}function l(t,e,n){if(o(t))return t;var r={value:n,configurable:!0,enumerable:!1,writable:!0};return j.defineProperty(t,e,r),t}function p(t){throw t}function h(t){try{if("function"==typeof t){var e=j.names(t.prototype),n=j.isES5&&e.length>1,r=e.length>0&&!(1===e.length&&"constructor"===e[0]),i=R.test(t+"")&&j.names(t).length>0;if(n||r||i)return!0}return!1}catch(o){return!1}}function f(t){function e(){}e.prototype=t;for(var n=8;n--;)new e;return t}function _(t){return P.test(t)}function d(t,e,n){for(var r=new Array(t),i=0;t>i;++i)r[i]=e+i+n;return r}function v(t){try{return t+""}catch(e){return"[no string representation]"}}function y(t){try{l(t,"isOperational",!0)}catch(e){}}function g(t){return null==t?!1:t instanceof Error.__BluebirdErrorTypes__.OperationalError||t.isOperational===!0}function m(t){return t instanceof Error&&j.propertyIsWritable(t,"stack")}function b(t){return{}.toString.call(t)}function w(t,e,n){for(var r=j.names(t),i=0;i<r.length;++i){var o=r[i];if(n(o))try{j.defineProperty(e,o,j.getDescriptor(t,o))}catch(s){}}}function C(t,e){return D?process.env[t]:e}var j=t("./es5"),k="undefined"==typeof navigator,F={e:{}},E,x=function(t,e){function n(){this.constructor=t,this.constructor$=e;for(var n in e.prototype)r.call(e.prototype,n)&&"$"!==n.charAt(n.length-1)&&(this[n+"$"]=e.prototype[n])}var r={}.hasOwnProperty;return n.prototype=e.prototype,t.prototype=new n,t.prototype},T=function(){var t=[Array.prototype,Object.prototype,Function.prototype],e=function(e){for(var n=0;n<t.length;++n)if(t[n]===e)return!0;return!1};if(j.isES5){var n=Object.getOwnPropertyNames;return function(t){for(var r=[],i=Object.create(null);null!=t&&!e(t);){var o;try{o=n(t)}catch(s){return r}for(var a=0;a<o.length;++a){var c=o[a];if(!i[c]){i[c]=!0;var u=Object.getOwnPropertyDescriptor(t,c);null!=u&&null==u.get&&null==u.set&&r.push(c)}}t=j.getPrototypeOf(t)}return r}}var r={}.hasOwnProperty;return function(n){if(e(n))return[];var i=[];t:for(var o in n)if(r.call(n,o))i.push(o);else{for(var s=0;s<t.length;++s)if(r.call(t[s],o))continue t;i.push(o)}return i}}(),R=/this\s*\.\s*\S+\s*=/,P=/^[a-z$_][a-z$_0-9]*$/i,O=function(){return"stack"in new Error?function(t){return m(t)?t:new Error(v(t))}:function(t){if(m(t))return t;try{throw new Error(v(t))}catch(e){return e}}}(),S=function(t){return j.isArray(t)?t:null};if("undefined"!=typeof Symbol&&Symbol.iterator){var A="function"==typeof Array.from?function(t){return Array.from(t)}:function(t){for(var e,n=[],r=t[Symbol.iterator]();!(e=r.next()).done;)n.push(e.value);return n};S=function(t){return j.isArray(t)?t:null!=t&&"function"==typeof t[Symbol.iterator]?A(t):null}}var D="undefined"!=typeof process&&"[object process]"===b(process).toLowerCase(),V={isClass:h,isIdentifier:_,inheritedDataKeys:T,getDataPropertyOrDefault:u,thrower:p,isArray:j.isArray,asArray:S,notEnumerableProp:l,isPrimitive:o,isObject:s,canEvaluate:k,errorObj:F,tryCatch:i,inherits:x,withAppended:c,maybeWrapAsError:a,toFastProperties:f,filledRange:d,toString:v,canAttachTrace:m,ensureErrorObject:O,originatesFromRejection:g,markAsOriginatingFromRejection:y,classString:b,copyDescriptors:w,hasDevTools:"undefined"!=typeof chrome&&chrome&&"function"==typeof chrome.loadTimes,isNode:D,env:C};V.isRecentNode=V.isNode&&function(){var t=process.versions.node.split(".").map(Number);return 0===t[0]&&t[1]>10||t[0]>0}(),V.isNode&&V.toFastProperties(process);try{throw new Error}catch(I){V.lastLineError=I}e.exports=V},{"./es5":13}]},{},[4])(4)}),"undefined"!=typeof window&&null!==window?window.P=window.Promise:"undefined"!=typeof self&&null!==self&&(self.P=self.Promise);
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":10}],8:[function(require,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }

  //BEGIN QS Hack
  var serialize = function(obj, prefix) {
    var str = [];
    for(var p in obj) {
      if (obj.hasOwnProperty(p)) {
        var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
        str.push(typeof v == "object" ? serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
      }
    }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack

  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }

  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
module.exports = request;

},{}],9:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],11:[function(require,module,exports){
(function (process,global){
!function(){"use strict";var Faye={VERSION:"1.1.2",BAYEUX_VERSION:"1.0",ID_LENGTH:160,JSONP_CALLBACK:"jsonpcallback",CONNECTION_TYPES:["long-polling","cross-origin-long-polling","callback-polling","websocket","eventsource","in-process"],MANDATORY_CONNECTION_TYPES:["long-polling","callback-polling","in-process"],ENV:"undefined"!=typeof window?window:global,extend:function(e,t,n){if(!t)return e;for(var i in t)t.hasOwnProperty(i)&&(e.hasOwnProperty(i)&&n===!1||e[i]!==t[i]&&(e[i]=t[i]));return e},random:function(e){e=e||this.ID_LENGTH;for(var t=Math.ceil(e*Math.log(2)/Math.log(36)),n=csprng(e,36);n.length<t;)n="0"+n;return n},validateOptions:function(e,t){for(var n in e)if(this.indexOf(t,n)<0)throw Error("Unrecognized option: "+n)},clientIdFromMessages:function(e){var t=this.filter([].concat(e),function(e){return"/meta/connect"===e.channel});return t[0]&&t[0].clientId},copyObject:function(e){var t,n,i;if(e instanceof Array){for(t=[],n=e.length;n--;)t[n]=Faye.copyObject(e[n]);return t}if("object"==typeof e){t=null===e?null:{};for(i in e)t[i]=Faye.copyObject(e[i]);return t}return e},commonElement:function(e,t){for(var n=0,i=e.length;i>n;n++)if(-1!==this.indexOf(t,e[n]))return e[n];return null},indexOf:function(e,t){if(e.indexOf)return e.indexOf(t);for(var n=0,i=e.length;i>n;n++)if(e[n]===t)return n;return-1},map:function(e,t,n){if(e.map)return e.map(t,n);var i=[];if(e instanceof Array)for(var s=0,r=e.length;r>s;s++)i.push(t.call(n||null,e[s],s));else for(var o in e)e.hasOwnProperty(o)&&i.push(t.call(n||null,o,e[o]));return i},filter:function(e,t,n){if(e.filter)return e.filter(t,n);for(var i=[],s=0,r=e.length;r>s;s++)t.call(n||null,e[s],s)&&i.push(e[s]);return i},asyncEach:function(e,t,n,i){var s=e.length,r=-1,o=0,a=!1,c=function(){return o-=1,r+=1,r===s?n&&n.call(i):void t(e[r],u)},h=function(){if(!a){for(a=!0;o>0;)c();a=!1}},u=function(){o+=1,h()};u()},toJSON:function(e){return this.stringify?this.stringify(e,function(e,t){return this[e]instanceof Array?this[e]:t}):JSON.stringify(e)}};"undefined"!=typeof module?module.exports=Faye:"undefined"!=typeof window&&(window.Faye=Faye),Faye.Class=function(e,t){"function"!=typeof e&&(t=e,e=Object);var n=function(){return this.initialize?this.initialize.apply(this,arguments)||this:this},i=function(){};return i.prototype=e.prototype,n.prototype=new i,Faye.extend(n.prototype,t),n},function(){function e(e,t){if(e.indexOf)return e.indexOf(t);for(var n=0;n<e.length;n++)if(t===e[n])return n;return-1}var t=Faye.EventEmitter=function(){},n="function"==typeof Array.isArray?Array.isArray:function(e){return"[object Array]"===Object.prototype.toString.call(e)};t.prototype.emit=function(e){if("error"===e&&(!this._events||!this._events.error||n(this._events.error)&&!this._events.error.length))throw arguments[1]instanceof Error?arguments[1]:Error("Uncaught, unspecified 'error' event.");if(!this._events)return!1;var t=this._events[e];if(!t)return!1;if("function"==typeof t){switch(arguments.length){case 1:t.call(this);break;case 2:t.call(this,arguments[1]);break;case 3:t.call(this,arguments[1],arguments[2]);break;default:var i=Array.prototype.slice.call(arguments,1);t.apply(this,i)}return!0}if(n(t)){for(var i=Array.prototype.slice.call(arguments,1),s=t.slice(),r=0,o=s.length;o>r;r++)s[r].apply(this,i);return!0}return!1},t.prototype.addListener=function(e,t){if("function"!=typeof t)throw Error("addListener only takes instances of Function");return this._events||(this._events={}),this.emit("newListener",e,t),this._events[e]?n(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,this},t.prototype.on=t.prototype.addListener,t.prototype.once=function(e,t){var n=this;return n.on(e,function i(){n.removeListener(e,i),t.apply(this,arguments)}),this},t.prototype.removeListener=function(t,i){if("function"!=typeof i)throw Error("removeListener only takes instances of Function");if(!this._events||!this._events[t])return this;var s=this._events[t];if(n(s)){var r=e(s,i);if(0>r)return this;s.splice(r,1),0==s.length&&delete this._events[t]}else this._events[t]===i&&delete this._events[t];return this},t.prototype.removeAllListeners=function(e){return 0===arguments.length?(this._events={},this):(e&&this._events&&this._events[e]&&(this._events[e]=null),this)},t.prototype.listeners=function(e){return this._events||(this._events={}),this._events[e]||(this._events[e]=[]),n(this._events[e])||(this._events[e]=[this._events[e]]),this._events[e]}}(),Faye.Namespace=Faye.Class({initialize:function(){this._used={}},exists:function(e){return this._used.hasOwnProperty(e)},generate:function(){for(var e=Faye.random();this._used.hasOwnProperty(e);)e=Faye.random();return this._used[e]=e},release:function(e){delete this._used[e]}}),function(){var e,t=setTimeout;e="function"==typeof setImmediate?function(e){setImmediate(e)}:"object"==typeof process&&process.nextTick?function(e){process.nextTick(e)}:function(e){t(e,0)};var n=0,i=1,s=2,r=function(e){return e},o=function(e){throw e},a=function(e){if(this._state=n,this._onFulfilled=[],this._onRejected=[],"function"==typeof e){var t=this;e(function(e){f(t,e)},function(e){d(t,e)})}};a.prototype.then=function(e,t){var n=new a;return c(this,e,n),h(this,t,n),n};var c=function(e,t,s){"function"!=typeof t&&(t=r);var o=function(e){u(t,e,s)};e._state===n?e._onFulfilled.push(o):e._state===i&&o(e._value)},h=function(e,t,i){"function"!=typeof t&&(t=o);var r=function(e){u(t,e,i)};e._state===n?e._onRejected.push(r):e._state===s&&r(e._reason)},u=function(t,n,i){e(function(){l(t,n,i)})},l=function(e,t,n){var i;try{i=e(t)}catch(s){return d(n,s)}i===n?d(n,new TypeError("Recursive promise chain detected")):f(n,i)},f=a.fulfill=a.resolve=function(e,t){var n,i,s=!1;try{if(n=typeof t,i=null!==t&&("function"===n||"object"===n)&&t.then,"function"!=typeof i)return p(e,t);i.call(t,function(t){s^(s=!0)&&f(e,t)},function(t){s^(s=!0)&&d(e,t)})}catch(r){if(!(s^(s=!0)))return;d(e,r)}},p=function(e,t){if(e._state===n){e._state=i,e._value=t,e._onRejected=[];for(var s,r=e._onFulfilled;s=r.shift();)s(t)}},d=a.reject=function(e,t){if(e._state===n){e._state=s,e._reason=t,e._onFulfilled=[];for(var i,r=e._onRejected;i=r.shift();)i(t)}};a.all=function(e){return new a(function(t,n){var i,s=[],r=e.length;if(0===r)return t(s);for(i=0;r>i;i++)(function(e,i){a.fulfilled(e).then(function(e){s[i]=e,0===--r&&t(s)},n)})(e[i],i)})},a.defer=e,a.deferred=a.pending=function(){var e={};return e.promise=new a(function(t,n){e.fulfill=e.resolve=t,e.reject=n}),e},a.fulfilled=a.resolved=function(e){return new a(function(t){t(e)})},a.rejected=function(e){return new a(function(t,n){n(e)})},void 0===Faye?module.exports=a:Faye.Promise=a}(),Faye.Set=Faye.Class({initialize:function(){this._index={}},add:function(e){var t=void 0!==e.id?e.id:e;return this._index.hasOwnProperty(t)?!1:(this._index[t]=e,!0)},forEach:function(e,t){for(var n in this._index)this._index.hasOwnProperty(n)&&e.call(t,this._index[n])},isEmpty:function(){for(var e in this._index)if(this._index.hasOwnProperty(e))return!1;return!0},member:function(e){for(var t in this._index)if(this._index[t]===e)return!0;return!1},remove:function(e){var t=void 0!==e.id?e.id:e,n=this._index[t];return delete this._index[t],n},toArray:function(){var e=[];return this.forEach(function(t){e.push(t)}),e}}),Faye.URI={isURI:function(e){return e&&e.protocol&&e.host&&e.path},isSameOrigin:function(e){var t=Faye.ENV.location;return e.protocol===t.protocol&&e.hostname===t.hostname&&e.port===t.port},parse:function(e){if("string"!=typeof e)return e;var t,n,i,s,r,o,a={},c=function(t,n){e=e.replace(n,function(e){return a[t]=e,""}),a[t]=a[t]||""};for(c("protocol",/^[a-z]+\:/i),c("host",/^\/\/[^\/\?#]+/),/^\//.test(e)||a.host||(e=Faye.ENV.location.pathname.replace(/[^\/]*$/,"")+e),c("pathname",/^[^\?#]*/),c("search",/^\?[^#]*/),c("hash",/^#.*/),a.protocol=a.protocol||Faye.ENV.location.protocol,a.host?(a.host=a.host.substr(2),t=a.host.split(":"),a.hostname=t[0],a.port=t[1]||""):(a.host=Faye.ENV.location.host,a.hostname=Faye.ENV.location.hostname,a.port=Faye.ENV.location.port),a.pathname=a.pathname||"/",a.path=a.pathname+a.search,n=a.search.replace(/^\?/,""),i=n?n.split("&"):[],o={},s=0,r=i.length;r>s;s++)t=i[s].split("="),o[decodeURIComponent(t[0]||"")]=decodeURIComponent(t[1]||"");return a.query=o,a.href=this.stringify(a),a},stringify:function(e){var t=e.protocol+"//"+e.hostname;return e.port&&(t+=":"+e.port),t+=e.pathname+this.queryString(e.query)+(e.hash||"")},queryString:function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return 0===t.length?"":"?"+t.join("&")}},Faye.Error=Faye.Class({initialize:function(e,t,n){this.code=e,this.params=Array.prototype.slice.call(t),this.message=n},toString:function(){return this.code+":"+this.params.join(",")+":"+this.message}}),Faye.Error.parse=function(e){if(e=e||"",!Faye.Grammar.ERROR.test(e))return new this(null,[],e);var t=e.split(":"),n=parseInt(t[0]),i=t[1].split(","),e=t[2];return new this(n,i,e)},Faye.Error.versionMismatch=function(){return""+new this(300,arguments,"Version mismatch")},Faye.Error.conntypeMismatch=function(){return""+new this(301,arguments,"Connection types not supported")},Faye.Error.extMismatch=function(){return""+new this(302,arguments,"Extension mismatch")},Faye.Error.badRequest=function(){return""+new this(400,arguments,"Bad request")},Faye.Error.clientUnknown=function(){return""+new this(401,arguments,"Unknown client")},Faye.Error.parameterMissing=function(){return""+new this(402,arguments,"Missing required parameter")},Faye.Error.channelForbidden=function(){return""+new this(403,arguments,"Forbidden channel")},Faye.Error.channelUnknown=function(){return""+new this(404,arguments,"Unknown channel")},Faye.Error.channelInvalid=function(){return""+new this(405,arguments,"Invalid channel")},Faye.Error.extUnknown=function(){return""+new this(406,arguments,"Unknown extension")},Faye.Error.publishFailed=function(){return""+new this(407,arguments,"Failed to publish")},Faye.Error.serverError=function(){return""+new this(500,arguments,"Internal server error")},Faye.Deferrable={then:function(e,t){var n=this;return this._promise||(this._promise=new Faye.Promise(function(e,t){n._fulfill=e,n._reject=t})),0===arguments.length?this._promise:this._promise.then(e,t)},callback:function(e,t){return this.then(function(n){e.call(t,n)})},errback:function(e,t){return this.then(null,function(n){e.call(t,n)})},timeout:function(e,t){this.then();var n=this;this._timer=Faye.ENV.setTimeout(function(){n._reject(t)},1e3*e)},setDeferredStatus:function(e,t){this._timer&&Faye.ENV.clearTimeout(this._timer),this.then(),"succeeded"===e?this._fulfill(t):"failed"===e?this._reject(t):delete this._promise}},Faye.Publisher={countListeners:function(e){return this.listeners(e).length},bind:function(e,t,n){var i=Array.prototype.slice,s=function(){t.apply(n,i.call(arguments))};return this._listeners=this._listeners||[],this._listeners.push([e,t,n,s]),this.on(e,s)},unbind:function(e,t,n){this._listeners=this._listeners||[];for(var i,s=this._listeners.length;s--;)i=this._listeners[s],i[0]===e&&(!t||i[1]===t&&i[2]===n)&&(this._listeners.splice(s,1),this.removeListener(e,i[3]))}},Faye.extend(Faye.Publisher,Faye.EventEmitter.prototype),Faye.Publisher.trigger=Faye.Publisher.emit,Faye.Timeouts={addTimeout:function(e,t,n,i){if(this._timeouts=this._timeouts||{},!this._timeouts.hasOwnProperty(e)){var s=this;this._timeouts[e]=Faye.ENV.setTimeout(function(){delete s._timeouts[e],n.call(i)},1e3*t)}},removeTimeout:function(e){this._timeouts=this._timeouts||{};var t=this._timeouts[e];t&&(Faye.ENV.clearTimeout(t),delete this._timeouts[e])},removeAllTimeouts:function(){this._timeouts=this._timeouts||{};for(var e in this._timeouts)this.removeTimeout(e)}},Faye.Logging={LOG_LEVELS:{fatal:4,error:3,warn:2,info:1,debug:0},writeLog:function(e,t){if(Faye.logger){var n=Array.prototype.slice.apply(e),i="[Faye",s=this.className,r=n.shift().replace(/\?/g,function(){try{return Faye.toJSON(n.shift())}catch(e){return"[Object]"}});for(var o in Faye)s||"function"==typeof Faye[o]&&this instanceof Faye[o]&&(s=o);s&&(i+="."+s),i+="] ","function"==typeof Faye.logger[t]?Faye.logger[t](i+r):"function"==typeof Faye.logger&&Faye.logger(i+r)}}},function(){for(var e in Faye.Logging.LOG_LEVELS)(function(e){Faye.Logging[e]=function(){this.writeLog(arguments,e)}})(e)}(),Faye.Grammar={CHANNEL_NAME:/^\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*$/,CHANNEL_PATTERN:/^(\/(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)))+)*\/\*{1,2}$/,ERROR:/^([0-9][0-9][0-9]:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*(,(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)*:(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*|[0-9][0-9][0-9]::(((([a-z]|[A-Z])|[0-9])|(\-|\_|\!|\~|\(|\)|\$|\@)| |\/|\*|\.))*)$/,VERSION:/^([0-9])+(\.(([a-z]|[A-Z])|[0-9])(((([a-z]|[A-Z])|[0-9])|\-|\_))*)*$/},Faye.Extensible={addExtension:function(e){this._extensions=this._extensions||[],this._extensions.push(e),e.added&&e.added(this)},removeExtension:function(e){if(this._extensions)for(var t=this._extensions.length;t--;)this._extensions[t]===e&&(this._extensions.splice(t,1),e.removed&&e.removed(this))},pipeThroughExtensions:function(e,t,n,i,s){if(this.debug("Passing through ? extensions: ?",e,t),!this._extensions)return i.call(s,t);var r=this._extensions.slice(),o=function(t){if(!t)return i.call(s,t);var a=r.shift();if(!a)return i.call(s,t);var c=a[e];return c?void(c.length>=3?a[e](t,n,o):a[e](t,o)):o(t)};o(t)}},Faye.extend(Faye.Extensible,Faye.Logging),Faye.Channel=Faye.Class({initialize:function(e){this.id=this.name=e},push:function(e){this.trigger("message",e)},isUnused:function(){return 0===this.countListeners("message")}}),Faye.extend(Faye.Channel.prototype,Faye.Publisher),Faye.extend(Faye.Channel,{HANDSHAKE:"/meta/handshake",CONNECT:"/meta/connect",SUBSCRIBE:"/meta/subscribe",UNSUBSCRIBE:"/meta/unsubscribe",DISCONNECT:"/meta/disconnect",META:"meta",SERVICE:"service",expand:function(e){var t=this.parse(e),n=["/**",e],i=t.slice();i[i.length-1]="*",n.push(this.unparse(i));for(var s=1,r=t.length;r>s;s++)i=t.slice(0,s),i.push("**"),n.push(this.unparse(i));return n},isValid:function(e){return Faye.Grammar.CHANNEL_NAME.test(e)||Faye.Grammar.CHANNEL_PATTERN.test(e)},parse:function(e){return this.isValid(e)?e.split("/").slice(1):null},unparse:function(e){return"/"+e.join("/")},isMeta:function(e){var t=this.parse(e);return t?t[0]===this.META:null},isService:function(e){var t=this.parse(e);return t?t[0]===this.SERVICE:null},isSubscribable:function(e){return this.isValid(e)?!this.isMeta(e)&&!this.isService(e):null},Set:Faye.Class({initialize:function(){this._channels={}},getKeys:function(){var e=[];for(var t in this._channels)e.push(t);return e},remove:function(e){delete this._channels[e]},hasSubscription:function(e){return this._channels.hasOwnProperty(e)},subscribe:function(e,t,n){for(var i,s=0,r=e.length;r>s;s++){i=e[s];var o=this._channels[i]=this._channels[i]||new Faye.Channel(i);t&&o.bind("message",t,n)}},unsubscribe:function(e,t,n){var i=this._channels[e];return i?(i.unbind("message",t,n),i.isUnused()?(this.remove(e),!0):!1):!1},distributeMessage:function(e){for(var t=Faye.Channel.expand(e.channel),n=0,i=t.length;i>n;n++){var s=this._channels[t[n]];s&&s.trigger("message",e.data)}}})}),Faye.Publication=Faye.Class(Faye.Deferrable),Faye.Subscription=Faye.Class({initialize:function(e,t,n,i){this._client=e,this._channels=t,this._callback=n,this._context=i,this._cancelled=!1},cancel:function(){this._cancelled||(this._client.unsubscribe(this._channels,this._callback,this._context),this._cancelled=!0)},unsubscribe:function(){this.cancel()}}),Faye.extend(Faye.Subscription.prototype,Faye.Deferrable),Faye.Client=Faye.Class({UNCONNECTED:1,CONNECTING:2,CONNECTED:3,DISCONNECTED:4,HANDSHAKE:"handshake",RETRY:"retry",NONE:"none",CONNECTION_TIMEOUT:60,DEFAULT_ENDPOINT:"/bayeux",INTERVAL:0,initialize:function(e,t){this.info("New client created for ?",e),t=t||{},Faye.validateOptions(t,["interval","timeout","endpoints","proxy","retry","scheduler","websocketExtensions","tls","ca"]),this._endpoint=e||this.DEFAULT_ENDPOINT,this._channels=new Faye.Channel.Set,this._dispatcher=new Faye.Dispatcher(this,this._endpoint,t),this._messageId=0,this._state=this.UNCONNECTED,this._responseCallbacks={},this._advice={reconnect:this.RETRY,interval:1e3*(t.interval||this.INTERVAL),timeout:1e3*(t.timeout||this.CONNECTION_TIMEOUT)},this._dispatcher.timeout=this._advice.timeout/1e3,this._dispatcher.bind("message",this._receiveMessage,this),Faye.Event&&void 0!==Faye.ENV.onbeforeunload&&Faye.Event.on(Faye.ENV,"beforeunload",function(){Faye.indexOf(this._dispatcher._disabled,"autodisconnect")<0&&this.disconnect()},this)},addWebsocketExtension:function(e){return this._dispatcher.addWebsocketExtension(e)},disable:function(e){return this._dispatcher.disable(e)},setHeader:function(e,t){return this._dispatcher.setHeader(e,t)},handshake:function(e,t){if(this._advice.reconnect!==this.NONE&&this._state===this.UNCONNECTED){this._state=this.CONNECTING;var n=this;this.info("Initiating handshake with ?",Faye.URI.stringify(this._endpoint)),this._dispatcher.selectTransport(Faye.MANDATORY_CONNECTION_TYPES),this._sendMessage({channel:Faye.Channel.HANDSHAKE,version:Faye.BAYEUX_VERSION,supportedConnectionTypes:this._dispatcher.getConnectionTypes()},{},function(i){i.successful?(this._state=this.CONNECTED,this._dispatcher.clientId=i.clientId,this._dispatcher.selectTransport(i.supportedConnectionTypes),this.info("Handshake successful: ?",this._dispatcher.clientId),this.subscribe(this._channels.getKeys(),!0),e&&Faye.Promise.defer(function(){e.call(t)})):(this.info("Handshake unsuccessful"),Faye.ENV.setTimeout(function(){n.handshake(e,t)},1e3*this._dispatcher.retry),this._state=this.UNCONNECTED)},this)}},connect:function(e,t){if(this._advice.reconnect!==this.NONE&&this._state!==this.DISCONNECTED){if(this._state===this.UNCONNECTED)return this.handshake(function(){this.connect(e,t)},this);this.callback(e,t),this._state===this.CONNECTED&&(this.info("Calling deferred actions for ?",this._dispatcher.clientId),this.setDeferredStatus("succeeded"),this.setDeferredStatus("unknown"),this._connectRequest||(this._connectRequest=!0,this.info("Initiating connection for ?",this._dispatcher.clientId),this._sendMessage({channel:Faye.Channel.CONNECT,clientId:this._dispatcher.clientId,connectionType:this._dispatcher.connectionType},{},this._cycleConnection,this)))}},disconnect:function(){if(this._state===this.CONNECTED){this._state=this.DISCONNECTED,this.info("Disconnecting ?",this._dispatcher.clientId);var e=new Faye.Publication;return this._sendMessage({channel:Faye.Channel.DISCONNECT,clientId:this._dispatcher.clientId},{},function(t){t.successful?(this._dispatcher.close(),e.setDeferredStatus("succeeded")):e.setDeferredStatus("failed",Faye.Error.parse(t.error))},this),this.info("Clearing channel listeners for ?",this._dispatcher.clientId),this._channels=new Faye.Channel.Set,e}},subscribe:function(e,t,n){if(e instanceof Array)return Faye.map(e,function(e){return this.subscribe(e,t,n)},this);var i=new Faye.Subscription(this,e,t,n),s=t===!0,r=this._channels.hasSubscription(e);return r&&!s?(this._channels.subscribe([e],t,n),i.setDeferredStatus("succeeded"),i):(this.connect(function(){this.info("Client ? attempting to subscribe to ?",this._dispatcher.clientId,e),s||this._channels.subscribe([e],t,n),this._sendMessage({channel:Faye.Channel.SUBSCRIBE,clientId:this._dispatcher.clientId,subscription:e},{},function(s){if(!s.successful)return i.setDeferredStatus("failed",Faye.Error.parse(s.error)),this._channels.unsubscribe(e,t,n);var r=[].concat(s.subscription);this.info("Subscription acknowledged for ? to ?",this._dispatcher.clientId,r),i.setDeferredStatus("succeeded")},this)},this),i)},unsubscribe:function(e,t,n){if(e instanceof Array)return Faye.map(e,function(e){return this.unsubscribe(e,t,n)},this);var i=this._channels.unsubscribe(e,t,n);i&&this.connect(function(){this.info("Client ? attempting to unsubscribe from ?",this._dispatcher.clientId,e),this._sendMessage({channel:Faye.Channel.UNSUBSCRIBE,clientId:this._dispatcher.clientId,subscription:e},{},function(e){if(e.successful){var t=[].concat(e.subscription);this.info("Unsubscription acknowledged for ? from ?",this._dispatcher.clientId,t)}},this)},this)},publish:function(e,t,n){Faye.validateOptions(n||{},["attempts","deadline"]);var i=new Faye.Publication;return this.connect(function(){this.info("Client ? queueing published message to ?: ?",this._dispatcher.clientId,e,t),this._sendMessage({channel:e,data:t,clientId:this._dispatcher.clientId},n,function(e){e.successful?i.setDeferredStatus("succeeded"):i.setDeferredStatus("failed",Faye.Error.parse(e.error))},this)},this),i},_sendMessage:function(e,t,n,i){e.id=this._generateMessageId();var s=this._advice.timeout?1.2*this._advice.timeout/1e3:1.2*this._dispatcher.retry;this.pipeThroughExtensions("outgoing",e,null,function(e){e&&(n&&(this._responseCallbacks[e.id]=[n,i]),this._dispatcher.sendMessage(e,s,t||{}))},this)},_generateMessageId:function(){return this._messageId+=1,this._messageId>=Math.pow(2,32)&&(this._messageId=0),this._messageId.toString(36)},_receiveMessage:function(e){var t,n=e.id;void 0!==e.successful&&(t=this._responseCallbacks[n],delete this._responseCallbacks[n]),this.pipeThroughExtensions("incoming",e,null,function(e){e&&(e.advice&&this._handleAdvice(e.advice),this._deliverMessage(e),t&&t[0].call(t[1],e))},this)},_handleAdvice:function(e){Faye.extend(this._advice,e),this._dispatcher.timeout=this._advice.timeout/1e3,this._advice.reconnect===this.HANDSHAKE&&this._state!==this.DISCONNECTED&&(this._state=this.UNCONNECTED,this._dispatcher.clientId=null,this._cycleConnection())},_deliverMessage:function(e){e.channel&&void 0!==e.data&&(this.info("Client ? calling listeners for ? with ?",this._dispatcher.clientId,e.channel,e.data),this._channels.distributeMessage(e))},_cycleConnection:function(){this._connectRequest&&(this._connectRequest=null,this.info("Closed connection for ?",this._dispatcher.clientId));var e=this;Faye.ENV.setTimeout(function(){e.connect()},this._advice.interval)}}),Faye.extend(Faye.Client.prototype,Faye.Deferrable),Faye.extend(Faye.Client.prototype,Faye.Publisher),Faye.extend(Faye.Client.prototype,Faye.Logging),Faye.extend(Faye.Client.prototype,Faye.Extensible),Faye.Dispatcher=Faye.Class({MAX_REQUEST_SIZE:2048,DEFAULT_RETRY:5,UP:1,DOWN:2,initialize:function(e,t,n){this._client=e,this.endpoint=Faye.URI.parse(t),this._alternates=n.endpoints||{},this.cookies=Faye.Cookies&&new Faye.Cookies.CookieJar,this._disabled=[],this._envelopes={},this.headers={},this.retry=n.retry||this.DEFAULT_RETRY,this._scheduler=n.scheduler||Faye.Scheduler,this._state=0,this.transports={},this.wsExtensions=[],this.proxy=n.proxy||{},"string"==typeof this._proxy&&(this._proxy={origin:this._proxy});var i=n.websocketExtensions;if(i){i=[].concat(i);for(var s=0,r=i.length;r>s;s++)this.addWebsocketExtension(i[s])}this.tls=n.tls||{},this.tls.ca=this.tls.ca||n.ca;for(var o in this._alternates)this._alternates[o]=Faye.URI.parse(this._alternates[o]);this.maxRequestSize=this.MAX_REQUEST_SIZE},endpointFor:function(e){return this._alternates[e]||this.endpoint},addWebsocketExtension:function(e){this.wsExtensions.push(e)},disable:function(e){this._disabled.push(e)},setHeader:function(e,t){this.headers[e]=t},close:function(){var e=this._transport;delete this._transport,e&&e.close()},getConnectionTypes:function(){return Faye.Transport.getConnectionTypes()},selectTransport:function(e){Faye.Transport.get(this,e,this._disabled,function(e){this.debug("Selected ? transport for ?",e.connectionType,Faye.URI.stringify(e.endpoint)),e!==this._transport&&(this._transport&&this._transport.close(),this._transport=e,this.connectionType=e.connectionType)},this)},sendMessage:function(e,t,n){n=n||{};var i,s=e.id,r=n.attempts,o=n.deadline&&(new Date).getTime()+1e3*n.deadline,a=this._envelopes[s];a||(i=new this._scheduler(e,{timeout:t,interval:this.retry,attempts:r,deadline:o}),a=this._envelopes[s]={message:e,scheduler:i}),this._sendEnvelope(a)},_sendEnvelope:function(e){if(this._transport&&!e.request&&!e.timer){var t=e.message,n=e.scheduler,i=this;if(!n.isDeliverable())return n.abort(),void delete this._envelopes[t.id];e.timer=Faye.ENV.setTimeout(function(){i.handleError(t)},1e3*n.getTimeout()),n.send(),e.request=this._transport.sendMessage(t)}},handleResponse:function(e){var t=this._envelopes[e.id];void 0!==e.successful&&t&&(t.scheduler.succeed(),delete this._envelopes[e.id],Faye.ENV.clearTimeout(t.timer)),this.trigger("message",e),this._state!==this.UP&&(this._state=this.UP,this._client.trigger("transport:up"))},handleError:function(e,t){var n=this._envelopes[e.id],i=n&&n.request,s=this;if(i){i.then(function(e){e&&e.abort&&e.abort()});var r=n.scheduler;r.fail(),Faye.ENV.clearTimeout(n.timer),n.request=n.timer=null,t?this._sendEnvelope(n):n.timer=Faye.ENV.setTimeout(function(){n.timer=null,s._sendEnvelope(n)},1e3*r.getInterval()),this._state!==this.DOWN&&(this._state=this.DOWN,this._client.trigger("transport:down"))}}}),Faye.extend(Faye.Dispatcher.prototype,Faye.Publisher),Faye.extend(Faye.Dispatcher.prototype,Faye.Logging),Faye.Scheduler=function(e,t){this.message=e,this.options=t,this.attempts=0},Faye.extend(Faye.Scheduler.prototype,{getTimeout:function(){return this.options.timeout},getInterval:function(){return this.options.interval},isDeliverable:function(){var e=this.options.attempts,t=this.attempts,n=this.options.deadline,i=(new Date).getTime();return void 0!==e&&t>=e?!1:void 0!==n&&i>n?!1:!0},send:function(){this.attempts+=1},succeed:function(){},fail:function(){},abort:function(){}}),Faye.Transport=Faye.extend(Faye.Class({DEFAULT_PORTS:{"http:":80,"https:":443,"ws:":80,"wss:":443},SECURE_PROTOCOLS:["https:","wss:"],MAX_DELAY:0,batching:!0,initialize:function(e,t){this._dispatcher=e,this.endpoint=t,this._outbox=[],this._proxy=Faye.extend({},this._dispatcher.proxy),!this._proxy.origin&&Faye.NodeAdapter&&(this._proxy.origin=Faye.indexOf(this.SECURE_PROTOCOLS,this.endpoint.protocol)>=0?process.env.HTTPS_PROXY||process.env.https_proxy:process.env.HTTP_PROXY||process.env.http_proxy)},close:function(){},encode:function(){return""},sendMessage:function(e){return this.debug("Client ? sending message to ?: ?",this._dispatcher.clientId,Faye.URI.stringify(this.endpoint),e),this.batching?(this._outbox.push(e),this._promise=this._promise||new Faye.Promise,this._flushLargeBatch(),e.channel===Faye.Channel.HANDSHAKE?(this.addTimeout("publish",.01,this._flush,this),this._promise):(e.channel===Faye.Channel.CONNECT&&(this._connectMessage=e),this.addTimeout("publish",this.MAX_DELAY,this._flush,this),this._promise)):Faye.Promise.fulfilled(this.request([e]))},_flush:function(){this.removeTimeout("publish"),this._outbox.length>1&&this._connectMessage&&(this._connectMessage.advice={timeout:0}),Faye.Promise.fulfill(this._promise,this.request(this._outbox)),delete this._promise,this._connectMessage=null,this._outbox=[]},_flushLargeBatch:function(){var e=this.encode(this._outbox);if(!(e.length<this._dispatcher.maxRequestSize)){var t=this._outbox.pop();this._flush(),t&&this._outbox.push(t)}},_receive:function(e){if(e){e=[].concat(e),this.debug("Client ? received from ? via ?: ?",this._dispatcher.clientId,Faye.URI.stringify(this.endpoint),this.connectionType,e);for(var t=0,n=e.length;n>t;t++)this._dispatcher.handleResponse(e[t])}},_handleError:function(e){e=[].concat(e),this.debug("Client ? failed to send to ? via ?: ?",this._dispatcher.clientId,Faye.URI.stringify(this.endpoint),this.connectionType,e);for(var t=0,n=e.length;n>t;t++)this._dispatcher.handleError(e[t])},_getCookies:function(){var e=this._dispatcher.cookies,t=Faye.URI.stringify(this.endpoint);return e?Faye.map(e.getCookiesSync(t),function(e){return e.cookieString()}).join("; "):""},_storeCookies:function(e){var t,n=this._dispatcher.cookies,i=Faye.URI.stringify(this.endpoint);if(e&&n){e=[].concat(e);for(var s=0,r=e.length;r>s;s++)t=Faye.Cookies.Cookie.parse(e[s]),n.setCookieSync(t,i)}}}),{get:function(e,t,n,i,s){var r=e.endpoint;Faye.asyncEach(this._transports,function(r,o){var a=r[0],c=r[1],h=e.endpointFor(a);return Faye.indexOf(n,a)>=0?o():Faye.indexOf(t,a)<0?(c.isUsable(e,h,function(){}),o()):void c.isUsable(e,h,function(t){if(!t)return o();var n=c.hasOwnProperty("create")?c.create(e,h):new c(e,h);i.call(s,n)})},function(){throw Error("Could not find a usable connection type for "+Faye.URI.stringify(r))})},register:function(e,t){this._transports.push([e,t]),t.prototype.connectionType=e},getConnectionTypes:function(){return Faye.map(this._transports,function(e){return e[0]})},_transports:[]}),Faye.extend(Faye.Transport.prototype,Faye.Logging),Faye.extend(Faye.Transport.prototype,Faye.Timeouts),Faye.Event={_registry:[],on:function(e,t,n,i){var s=function(){n.call(i)};e.addEventListener?e.addEventListener(t,s,!1):e.attachEvent("on"+t,s),this._registry.push({_element:e,_type:t,_callback:n,_context:i,_handler:s})},detach:function(e,t,n,i){for(var s,r=this._registry.length;r--;)s=this._registry[r],e&&e!==s._element||t&&t!==s._type||n&&n!==s._callback||i&&i!==s._context||(s._element.removeEventListener?s._element.removeEventListener(s._type,s._handler,!1):s._element.detachEvent("on"+s._type,s._handler),this._registry.splice(r,1),s=null)}},void 0!==Faye.ENV.onunload&&Faye.Event.on(Faye.ENV,"unload",Faye.Event.detach,Faye.Event),"object"!=typeof JSON&&(JSON={}),function(){function f(e){return 10>e?"0"+e:e}function quote(e){return escapable.lastIndex=0,escapable.test(e)?'"'+e.replace(escapable,function(e){var t=meta[e];return"string"==typeof t?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var n,i,s,r,o,a=gap,c=t[e];switch(c&&"object"==typeof c&&"function"==typeof c.toJSON&&(c=c.toJSON(e)),"function"==typeof rep&&(c=rep.call(t,e,c)),typeof c){case"string":return quote(c);case"number":return isFinite(c)?c+"":"null";case"boolean":case"null":return c+"";case"object":if(!c)return"null";if(gap+=indent,o=[],"[object Array]"===Object.prototype.toString.apply(c)){for(r=c.length,n=0;r>n;n+=1)o[n]=str(n,c)||"null";return s=0===o.length?"[]":gap?"[\n"+gap+o.join(",\n"+gap)+"\n"+a+"]":"["+o.join(",")+"]",gap=a,s}if(rep&&"object"==typeof rep)for(r=rep.length,n=0;r>n;n+=1)"string"==typeof rep[n]&&(i=rep[n],s=str(i,c),s&&o.push(quote(i)+(gap?": ":":")+s));else for(i in c)Object.prototype.hasOwnProperty.call(c,i)&&(s=str(i,c),s&&o.push(quote(i)+(gap?": ":":")+s));return s=0===o.length?"{}":gap?"{\n"+gap+o.join(",\n"+gap)+"\n"+a+"}":"{"+o.join(",")+"}",gap=a,s}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;Faye.stringify=function(e,t,n){var i;if(gap="",indent="","number"==typeof n)for(i=0;n>i;i+=1)indent+=" ";else"string"==typeof n&&(indent=n);if(rep=t,t&&"function"!=typeof t&&("object"!=typeof t||"number"!=typeof t.length))throw Error("JSON.stringify");return str("",{"":e})},"function"!=typeof JSON.stringify&&(JSON.stringify=Faye.stringify),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(e,t){var n,i,s=e[t];if(s&&"object"==typeof s)for(n in s)Object.prototype.hasOwnProperty.call(s,n)&&(i=walk(s,n),void 0!==i?s[n]=i:delete s[n]);
return reviver.call(e,t,s)}var j;if(text+="",cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}(),Faye.Transport.WebSocket=Faye.extend(Faye.Class(Faye.Transport,{UNCONNECTED:1,CONNECTING:2,CONNECTED:3,batching:!1,isUsable:function(e,t){this.callback(function(){e.call(t,!0)}),this.errback(function(){e.call(t,!1)}),this.connect()},request:function(e){this._pending=this._pending||new Faye.Set;for(var t=0,n=e.length;n>t;t++)this._pending.add(e[t]);var i=new Faye.Promise;return this.callback(function(t){t&&1===t.readyState&&(t.send(Faye.toJSON(e)),Faye.Promise.fulfill(i,t))},this),this.connect(),{abort:function(){i.then(function(e){e.close()})}}},connect:function(){if(!Faye.Transport.WebSocket._unloaded&&(this._state=this._state||this.UNCONNECTED,this._state===this.UNCONNECTED)){this._state=this.CONNECTING;var e=this._createSocket();if(!e)return this.setDeferredStatus("failed");var t=this;e.onopen=function(){e.headers&&t._storeCookies(e.headers["set-cookie"]),t._socket=e,t._state=t.CONNECTED,t._everConnected=!0,t._ping(),t.setDeferredStatus("succeeded",e)};var n=!1;e.onclose=e.onerror=function(){if(!n){n=!0;var i=t._state===t.CONNECTED;e.onopen=e.onclose=e.onerror=e.onmessage=null,delete t._socket,t._state=t.UNCONNECTED,t.removeTimeout("ping"),t.setDeferredStatus("unknown");var s=t._pending?t._pending.toArray():[];delete t._pending,i?t._handleError(s,!0):t._everConnected?t._handleError(s):t.setDeferredStatus("failed")}},e.onmessage=function(e){var n=JSON.parse(e.data);if(n){n=[].concat(n);for(var i=0,s=n.length;s>i;i++)void 0!==n[i].successful&&t._pending.remove(n[i]);t._receive(n)}}}},close:function(){this._socket&&this._socket.close()},_createSocket:function(){var e=Faye.Transport.WebSocket.getSocketUrl(this.endpoint),t=this._dispatcher.headers,n=this._dispatcher.wsExtensions,i=this._getCookies(),s=this._dispatcher.tls,r={extensions:n,headers:t,proxy:this._proxy,tls:s};return""!==i&&(r.headers.Cookie=i),Faye.WebSocket?new Faye.WebSocket.Client(e,[],r):Faye.ENV.MozWebSocket?new MozWebSocket(e):Faye.ENV.WebSocket?new WebSocket(e):void 0},_ping:function(){this._socket&&(this._socket.send("[]"),this.addTimeout("ping",this._dispatcher.timeout/2,this._ping,this))}}),{PROTOCOLS:{"http:":"ws:","https:":"wss:"},create:function(e,t){var n=e.transports.websocket=e.transports.websocket||{};return n[t.href]=n[t.href]||new this(e,t),n[t.href]},getSocketUrl:function(e){return e=Faye.copyObject(e),e.protocol=this.PROTOCOLS[e.protocol],Faye.URI.stringify(e)},isUsable:function(e,t,n,i){this.create(e,t).isUsable(n,i)}}),Faye.extend(Faye.Transport.WebSocket.prototype,Faye.Deferrable),Faye.Transport.register("websocket",Faye.Transport.WebSocket),Faye.Event&&void 0!==Faye.ENV.onbeforeunload&&Faye.Event.on(Faye.ENV,"beforeunload",function(){Faye.Transport.WebSocket._unloaded=!0}),Faye.Transport.EventSource=Faye.extend(Faye.Class(Faye.Transport,{initialize:function(e,t){if(Faye.Transport.prototype.initialize.call(this,e,t),!Faye.ENV.EventSource)return this.setDeferredStatus("failed");this._xhr=new Faye.Transport.XHR(e,t),t=Faye.copyObject(t),t.pathname+="/"+e.clientId;var n=new EventSource(Faye.URI.stringify(t)),i=this;n.onopen=function(){i._everConnected=!0,i.setDeferredStatus("succeeded")},n.onerror=function(){i._everConnected?i._handleError([]):(i.setDeferredStatus("failed"),n.close())},n.onmessage=function(e){i._receive(JSON.parse(e.data))},this._socket=n},close:function(){this._socket&&(this._socket.onopen=this._socket.onerror=this._socket.onmessage=null,this._socket.close(),delete this._socket)},isUsable:function(e,t){this.callback(function(){e.call(t,!0)}),this.errback(function(){e.call(t,!1)})},encode:function(e){return this._xhr.encode(e)},request:function(e){return this._xhr.request(e)}}),{isUsable:function(e,t,n,i){var s=e.clientId;return s?void Faye.Transport.XHR.isUsable(e,t,function(s){return s?void this.create(e,t).isUsable(n,i):n.call(i,!1)},this):n.call(i,!1)},create:function(e,t){var n=e.transports.eventsource=e.transports.eventsource||{},i=e.clientId,s=Faye.copyObject(t);return s.pathname+="/"+(i||""),s=Faye.URI.stringify(s),n[s]=n[s]||new this(e,t),n[s]}}),Faye.extend(Faye.Transport.EventSource.prototype,Faye.Deferrable),Faye.Transport.register("eventsource",Faye.Transport.EventSource),Faye.Transport.XHR=Faye.extend(Faye.Class(Faye.Transport,{encode:function(e){return Faye.toJSON(e)},request:function(e){var t=this.endpoint.href,n=Faye.ENV.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest,i=this;n.open("POST",t,!0),n.setRequestHeader("Content-Type","application/json"),n.setRequestHeader("Pragma","no-cache"),n.setRequestHeader("X-Requested-With","XMLHttpRequest");var s=this._dispatcher.headers;for(var r in s)s.hasOwnProperty(r)&&n.setRequestHeader(r,s[r]);var o=function(){n.abort()};return void 0!==Faye.ENV.onbeforeunload&&Faye.Event.on(Faye.ENV,"beforeunload",o),n.onreadystatechange=function(){if(n&&4===n.readyState){var t=null,s=n.status,r=n.responseText,a=s>=200&&300>s||304===s||1223===s;if(void 0!==Faye.ENV.onbeforeunload&&Faye.Event.detach(Faye.ENV,"beforeunload",o),n.onreadystatechange=function(){},n=null,!a)return i._handleError(e);try{t=JSON.parse(r)}catch(c){}t?i._receive(t):i._handleError(e)}},n.send(this.encode(e)),n}}),{isUsable:function(e,t,n,i){n.call(i,Faye.URI.isSameOrigin(t))}}),Faye.Transport.register("long-polling",Faye.Transport.XHR),Faye.Transport.CORS=Faye.extend(Faye.Class(Faye.Transport,{encode:function(e){return"message="+encodeURIComponent(Faye.toJSON(e))},request:function(e){var t,n=Faye.ENV.XDomainRequest?XDomainRequest:XMLHttpRequest,i=new n,s=++Faye.Transport.CORS._id,r=this._dispatcher.headers,o=this;if(i.open("POST",Faye.URI.stringify(this.endpoint),!0),i.setRequestHeader){i.setRequestHeader("Pragma","no-cache");for(t in r)r.hasOwnProperty(t)&&i.setRequestHeader(t,r[t])}var a=function(){return i?(Faye.Transport.CORS._pending.remove(s),i.onload=i.onerror=i.ontimeout=i.onprogress=null,void(i=null)):!1};return i.onload=function(){var t=null;try{t=JSON.parse(i.responseText)}catch(n){}a(),t?o._receive(t):o._handleError(e)},i.onerror=i.ontimeout=function(){a(),o._handleError(e)},i.onprogress=function(){},n===Faye.ENV.XDomainRequest&&Faye.Transport.CORS._pending.add({id:s,xhr:i}),i.send(this.encode(e)),i}}),{_id:0,_pending:new Faye.Set,isUsable:function(e,t,n,i){if(Faye.URI.isSameOrigin(t))return n.call(i,!1);if(Faye.ENV.XDomainRequest)return n.call(i,t.protocol===Faye.ENV.location.protocol);if(Faye.ENV.XMLHttpRequest){var s=new Faye.ENV.XMLHttpRequest;return n.call(i,void 0!==s.withCredentials)}return n.call(i,!1)}}),Faye.Transport.register("cross-origin-long-polling",Faye.Transport.CORS),Faye.Transport.JSONP=Faye.extend(Faye.Class(Faye.Transport,{encode:function(e){var t=Faye.copyObject(this.endpoint);return t.query.message=Faye.toJSON(e),t.query.jsonp="__jsonp"+Faye.Transport.JSONP._cbCount+"__",Faye.URI.stringify(t)},request:function(e){var t=document.getElementsByTagName("head")[0],n=document.createElement("script"),i=Faye.Transport.JSONP.getCallbackName(),s=Faye.copyObject(this.endpoint),r=this;s.query.message=Faye.toJSON(e),s.query.jsonp=i;var o=function(){if(!Faye.ENV[i])return!1;Faye.ENV[i]=void 0;try{delete Faye.ENV[i]}catch(e){}n.parentNode.removeChild(n)};return Faye.ENV[i]=function(e){o(),r._receive(e)},n.type="text/javascript",n.src=Faye.URI.stringify(s),t.appendChild(n),n.onerror=function(){o(),r._handleError(e)},{abort:o}}}),{_cbCount:0,getCallbackName:function(){return this._cbCount+=1,"__jsonp"+this._cbCount+"__"},isUsable:function(e,t,n,i){n.call(i,!0)}}),Faye.Transport.register("callback-polling",Faye.Transport.JSONP)}();

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":10}]},{},[6])(6)
});