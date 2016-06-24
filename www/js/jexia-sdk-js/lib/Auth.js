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