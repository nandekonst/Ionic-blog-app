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