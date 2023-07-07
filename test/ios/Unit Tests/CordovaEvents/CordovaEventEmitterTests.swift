// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import XCTest
import Cordova
import Hamcrest
@testable import KaleyraVideoCordovaPlugin

class CordovaEventEmitterTests: UnitTestCase {

    func testSendEventShouldSendPluginResultToCommandDelegate() throws {
        let commandDelegateSpy = CommandDelegateSpy()
        let sut = CordovaEventEmitter(commandDelegate: commandDelegateSpy)

        sut.callbackId = "callback id"
        sut.sendEvent(Events.callModuleStatusChanged, args: ["foo", "bar"])

        let invocation = try unwrap(commandDelegateSpy.sendInvocations.first)
        assertThat(invocation.callbackId, presentAnd(equalTo("callback id")))
        assertThat(invocation.result.status.uintValue, presentAnd(equalTo(CDVCommandStatus.ok.rawValue)))
        assertThat(invocation.result.keepCallback.boolValue, presentAnd(equalTo(true)))
        let message = try unwrap(invocation.result.message as? [String : Any])
        assertThat(message, hasEntry(equalTo("event"), instanceOfAnd(equalTo(Events.callModuleStatusChanged.description))))
        assertThat(message, hasEntry(equalTo("args"), instanceOfAnd(equalTo([["foo", "bar"]]))))
    }
}
