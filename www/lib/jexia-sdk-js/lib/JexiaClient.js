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