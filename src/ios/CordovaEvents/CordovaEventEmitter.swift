// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import Foundation
#if canImport(Cordova)
import Cordova
#endif

class CordovaEventEmitter: EventEmitter {

    var callbackId: String = ""
    private weak var commandDelegate: CDVCommandDelegate?

    init(commandDelegate: CDVCommandDelegate) {
        self.commandDelegate = commandDelegate
    }

    func sendEvent(_ event: Events, args: Any?) {
        sendEvent(event.description, args: argsToArray(args))
    }

    private func sendEvent(_ event: String, args: [Any]) {
        let message = [
            "event" : event,
            "args" : args
        ] as [String : Any]
        let result = CDVPluginResult(status: .ok, messageAs: message)
        result?.setKeepCallbackAs(true)
        commandDelegate?.send(result, callbackId: callbackId)
    }

    private func argsToArray(_ args: Any?) -> [Any] {
        guard let args = args else { return [] }
        return [args]
    }
}
