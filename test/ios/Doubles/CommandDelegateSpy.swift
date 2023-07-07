// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import Foundation
import Cordova

class CommandDelegateSpy: NSObject, CDVCommandDelegate {

    private(set) var settings: [AnyHashable : Any]!

    var urlTransformer: UrlTransformerBlock!

    private(set) lazy var sendInvocations = [(callbackId: String, result: CDVPluginResult)]()

    func path(forResource resourcepath: String!) -> String! {
        ""
    }

    func getCommandInstance(_ pluginName: String!) -> Any! {
        ""
    }

    func send(_ result: CDVPluginResult!, callbackId: String!) {
        sendInvocations.append((callbackId, result))
    }

    func evalJs(_ js: String!) {}

    func evalJs(_ js: String!, scheduledOnRunLoop: Bool) {}

    func run(inBackground block: (() -> Void)!) {}

}
