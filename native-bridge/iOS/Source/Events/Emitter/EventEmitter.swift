// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import Foundation

protocol EventEmitter {
    func sendEvent(_ event: Events, args: Any?)
}
