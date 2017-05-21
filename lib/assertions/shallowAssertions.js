'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.triggerEvent = exports.installInto = undefined;

var _reactRenderHook = require('react-render-hook');

var _reactRenderHook2 = _interopRequireDefault(_reactRenderHook);

var _unexpectedHtmllikeJsxAdapter = require('unexpected-htmllike-jsx-adapter');

var _unexpectedHtmllikeJsxAdapter2 = _interopRequireDefault(_unexpectedHtmllikeJsxAdapter);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _shallow = require('react-test-renderer/shallow');

var _AssertionGenerator = require('./AssertionGenerator');

var _AssertionGenerator2 = _interopRequireDefault(_AssertionGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function triggerEvent(expect, renderer, target, eventName, eventArgs) {

    if (!target) {
        target = renderer.getRenderOutput();
    }

    var handlerPropName = 'on' + eventName[0].toUpperCase() + eventName.substr(1);
    var handler = target.props[handlerPropName];
    if (typeof handler !== 'function') {
        return expect.fail({
            diff: function diff(output) {
                return output.error('No handler function prop ').text("'" + handlerPropName + "'").error(' on the target element');
            }
        });
    }
    handler(eventArgs);
    return renderer;
}

function getMessageOnly(options) {
    if (this.getErrorMode() === 'bubble' && this.parent) {
        return getMessageOnly.call(this.parent, options);
    }
    var output = this.outputFromOptions(options);
    if (this.expect.testDescription) {
        output.append(this.expect.standardErrorMessage(output.clone(), options));
    } else if (typeof this.output === 'function') {
        this.output.call(output, output);
    }
    return output;
}

function installInto(expect) {

    var assertionGenerator = new _AssertionGenerator2.default({
        ActualAdapter: _unexpectedHtmllikeJsxAdapter2.default,
        QueryAdapter: _unexpectedHtmllikeJsxAdapter2.default,
        ExpectedAdapter: _unexpectedHtmllikeJsxAdapter2.default,
        actualTypeName: 'ReactShallowRenderer',
        queryTypeName: 'ReactElement',
        expectedTypeName: 'ReactElement',
        getRenderOutput: function getRenderOutput(renderer) {
            return renderer.getRenderOutput();
        },
        actualRenderOutputType: 'ReactElement',
        getDiffInputFromRenderOutput: function getDiffInputFromRenderOutput(renderOutput) {
            return renderOutput;
        },
        rewrapResult: function rewrapResult(renderer, target) {
            return target;
        },
        triggerEvent: triggerEvent.bind(null, expect)
    });
    assertionGenerator.installInto(expect);

    // We can convert ReactElements to a renderer by rendering them - but we only do it for `with event`
    expect.addAssertion('<ReactElement> with event <string> <assertion?>', function (expect, subject, eventName) {
        var renderer = (0, _shallow.createRenderer)();
        renderer.render(subject);
        return expect.apply(expect, [renderer, 'with event'].concat(Array.prototype.slice.call(arguments, 2)));
    });

    expect.addAssertion('<ReactElement> with event <string> <object> <assertion?>', function (expect, subject, eventName, eventArgs) {
        var renderer = (0, _shallow.createRenderer)();
        renderer.render(subject);
        return expect.apply(expect, [renderer, 'with event'].concat(Array.prototype.slice.call(arguments, 2)));
    });

    // Add 'when rendered' to render with the shallow renderer
    expect.addAssertion('<ReactElement> when rendered <assertion?>', function (expect, subject) {
        var renderer = (0, _shallow.createRenderer)();
        renderer.render(subject);
        return expect.withError(function () {
            expect.errorMode = 'bubble';
            return expect.shift(renderer);
        }, function (e) {
            expect.fail({
                message: function message(output) {
                    return output.error('expected ').appendInspected(subject).error(' when rendered').nl().i().append(getMessageOnly.call(e, output));
                },
                diff: function diff(output) {
                    return e.getDiffMessage(output);
                }
            });
        });
    });

    expect.addAssertion('<ReactElement> to [exactly] render [with all children] [with all wrappers] [with all classes] [with all attributes] as <ReactElement>', function (expect, subject, expected) {

        if (this.flags.exactly) {
            return expect(subject, 'when rendered', 'to have exactly rendered', expected);
        }
        return expect(subject, 'when rendered to have rendered [with all children] [with all wrappers] [with all classes] [with all attributes]', expected);
    });

    return assertionGenerator;
}

exports.installInto = installInto;
exports.triggerEvent = triggerEvent;