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