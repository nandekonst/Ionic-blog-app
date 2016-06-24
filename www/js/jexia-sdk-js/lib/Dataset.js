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