// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import Foundation

@objc(_KaleyraVideoHybridVersionInfo)
class _KaleyraVideoHybridVersionInfo: NSObject {

    @objc
    static let krvVersion: String = "2.1.0"

    @objc
    static let krvPlatform: String = "cordova"

    override var debugDescription: String {
        """

---------------------------------------

    Kaleya Video \(_KaleyraVideoHybridVersionInfo.krvPlatform.capitalized) Plugin info:
        - Version: \(_KaleyraVideoHybridVersionInfo.krvVersion)

---------------------------------------

"""
    }

    func printDebugDescription() {
        debugPrint(NSString(string: debugDescription))
    }
}
