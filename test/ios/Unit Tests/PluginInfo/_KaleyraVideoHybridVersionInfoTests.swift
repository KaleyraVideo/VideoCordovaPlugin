// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import XCTest
import Hamcrest
@testable import KaleyraVideoCordovaPlugin

final class _KaleyraVideoHybridVersionInfoTests: UnitTestCase {

    func test_KaleyraVideoHybridVersionInfoShouldInheritFromNSObject() {
        let sut = makeSUT()

        assertThat(sut, instanceOf(NSObject.self))
    }

    func test_KaleyraVideoHybridVersionInfoShouldBeInstantiableFromClassNameString() {
        let claz = NSClassFromString("_KaleyraVideoHybridVersionInfo") as? _KaleyraVideoHybridVersionInfo.Type

        assertThat(claz, present())
    }

    func testVersionInfoValues() {
        assertThat(_KaleyraVideoHybridVersionInfo.krvPlatform, equalTo("cordova"))
        assertThat(_KaleyraVideoHybridVersionInfo.krvVersion, equalTo("1.1.3"))
    }

    func testDebugDescription() {
        let sut = makeSUT()
        let expectedDescription = """

---------------------------------------

    Kaleya Video Cordova Plugin info:
        - Version: \(_KaleyraVideoHybridVersionInfo.krvVersion)

---------------------------------------

"""

        assertThat(sut.debugDescription, equalTo(expectedDescription))
    }

    // MARK: - Helpers

    private func makeSUT() -> _KaleyraVideoHybridVersionInfo {
        .init()
    }
}
