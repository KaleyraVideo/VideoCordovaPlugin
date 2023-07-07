// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

export class DeviceStub {
    platform: string = "ios";
    isVirtual: boolean = false;

    simulateVirtual() {
        this.isVirtual = true;
    }

    simulateAndroid() {
        this.platform = "android";
    }

    simulateiOS() {
        this.platform = "ios";
    }
}
