// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import KaleyraVideo from "../../../www/src/KaleyraVideo";
import {CordovaSpy} from "./CordovaSpy";
import {DeviceStub} from "./DeviceStub";
import {Environments} from "../../../native-bridge/TypeScript/Environments";
import {Regions} from "../../../native-bridge/TypeScript/Regions";
import {CreateCallOptions} from "../../../native-bridge/TypeScript/types/CreateCallOptions";
import {CallType} from "../../../native-bridge/TypeScript/types/CallType";
import {RecordingType} from "../../../native-bridge/TypeScript/types/RecordingType";
import {CallDisplayMode} from "../../../native-bridge/TypeScript/types/CallDisplayMode";
import {KaleyraVideoConfiguration} from "../../../native-bridge/TypeScript/types/KaleyraVideoConfiguration";
import {AudioCallType} from "../../../native-bridge/TypeScript/types/AudioCallType";

let device: DeviceStub;
let cordovaSpy: CordovaSpy;

beforeEach(() => {
    device = new DeviceStub();
    cordovaSpy = new CordovaSpy();
    globalThis.device = device;
    globalThis.cordova = cordovaSpy;
});

afterEach(() => {
    globalThis.device = undefined;
    globalThis.cordova = undefined;
    KaleyraVideo.instance = undefined;
});

describe("Plugin setup", () => {

    test("Throws an invalid argument exception when appId parameter is missing", () => {
        const setup = () => {
            // @ts-ignore
            KaleyraVideo.configure({
                environment: Environments.sandbox(),
                region: Regions.europe(),
            });
        };

        expect(setup).toThrowError(Error);
    });

    test("Throws an invalid argument exception when appId is empty", () => {
        const setup = () => {
            const config = makePluginConfig();
            config.appID = "";
            KaleyraVideo.configure(config);
        };

        expect(setup).toThrowError(Error);
    });

    test('Calls "configureBridge" action with the argument provided in config parameter', () => {
        const config = {
            appID: "mAppId_a21393y2a4ada1231",
            environment: Environments.sandbox(),
            region: Regions.europe(),
            logEnabled: true,
            tools: {
                chat: {
                    audioCallOption: {
                        type: KaleyraVideo.audioCallTypes.AUDIO,
                        recordingType: KaleyraVideo.recordingTypes.NONE,
                    },
                    videoCallOption: {
                        recordingType: KaleyraVideo.recordingTypes.NONE,
                    },
                },
                fileShare: true,
                screenShare: {
                    inApp: true,
                    wholeDevice: true,
                },
                whiteboard: true,
            },
            iosConfig: {
                callkit: {
                    enabled: true,
                    appIconName: "AppIcon",
                    ringtoneSoundName: "ringtone.mp3",
                },
            },
        };

        KaleyraVideo.configure(config);

        expect(cordovaSpy.execInvocations.length).toEqual(1);

        const invocation = cordovaSpy.execInvocations[0];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("configureBridge");
        expect(invocation.args).toBeDefined();

        const firstArg = JSON.parse(invocation.args[0]);
        expect(firstArg).toBeDefined();
        expect(firstArg.environment.name).toMatch("sandbox");
        expect(firstArg.region.name).toMatch("europe");
        expect(firstArg.appID).toMatch("mAppId_a21393y2a4ada1231");
        expect(firstArg.logEnabled).toEqual(true);

        expect(firstArg.iosConfig.callkit.enabled).toEqual(true);
        expect(firstArg.iosConfig.callkit.appIconName).toMatch("AppIcon");
        expect(firstArg.iosConfig.callkit.ringtoneSoundName).toMatch("ringtone.mp3");

        expect(firstArg.tools.chat).toBeDefined();
        expect(firstArg.tools.chat.audioCallOption).toBeDefined();
        expect(firstArg.tools.chat.audioCallOption.type).toEqual(AudioCallType.AUDIO);
        expect(firstArg.tools.chat.audioCallOption.recordingType).toEqual(RecordingType.NONE);

        expect(firstArg.tools.chat.videoCallOption).toBeDefined();
        expect(firstArg.tools.chat.videoCallOption.recordingType).toEqual(RecordingType.NONE);
        expect(firstArg.tools.whiteboard).toEqual(true);
        expect(firstArg.tools.fileShare).toEqual(true);
        expect(firstArg.tools.screenShare.inApp).toEqual(true);
        expect(firstArg.tools.screenShare.wholeDevice).toEqual(true);
    });

    test('When running on generic device, calls "configureBridge" action with the mandatory only arguments provided in config parameter', () => {
        const config = {
            appID: "mAppId_a21393y2a4ada1231",
            environment: Environments.sandbox(),
            region: Regions.europe(),
        };

        KaleyraVideo.configure(config);

        expect(cordovaSpy.execInvocations.length).toEqual(1);

        const invocation = cordovaSpy.execInvocations[0];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("configureBridge");
        expect(invocation.args).toBeDefined();

        const firstArg = JSON.parse(invocation.args[0]);
        expect(firstArg).toBeDefined();
        expect(firstArg.environment.name).toMatch("sandbox");
        expect(firstArg.appID).toMatch("mAppId_a21393y2a4ada1231");
        expect(firstArg.region.name).toMatch("europe");
        expect(firstArg.logEnabled).toBeUndefined();

        expect(firstArg.iosConfig).toBeUndefined();
        expect(firstArg.tools).toBeUndefined();
    });
});

describe("Plugin connect", () => {

    test("Throws an illegal argument error when user id is empty", () => {
        const sut = makeSUT();

        const start = () => {
            sut.connect({
                userID: "",
                accessTokenProvider(userId: string): Promise<string> {
                    return Promise.resolve("");
                },
            });
        };

        expect(start).toThrowError(Error);
    });

    test("Calls connect action with the user id provided", () => {
        const sut = makeSUT();

        sut.connect({
                userID: "usr_12345",
                accessTokenProvider(userId): Promise<string> {
                    return Promise.resolve("");
                },
            },
        );

        expect(cordovaSpy.execInvocations.length).toEqual(2);

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("connect");
        expect(invocation.args).toBeDefined();
        expect(invocation.args).toContainEqual("usr_12345");
    });
});

describe("Plugin disconnect", () => {

    test("Calls disconnect action with an empty argument list", () => {
        const sut = makeSUT();

        sut.disconnect();

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("disconnect");
        expect(invocation.args).toEqual([]);
    });
});

describe("Plugin state", () => {

    test("Calls state action with an empty argument list", () => {
        const sut = makeSUT();

        sut.state();

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("state");
        expect(invocation.args).toEqual([]);
    });
});

describe("Starting a call", () => {

    test("Throws invalid argument error when empty user alias array is provided", () => {
        const sut = makeSUT();

        const options: CreateCallOptions = {
            callees: [],
            callType: CallType.AUDIO_VIDEO,
        };

        const start = () => {
            sut.startCall(options);
        };

        expect(start).toThrowError(Error);
    });

    test("Throws invalid argument error when any user alias is an empty string", () => {
        const sut = makeSUT();

        const options = {
            callees: ["bob", "alice", ""],
            callType: CallType.AUDIO_VIDEO,
        };

        const start = () => {
            sut.startCall(options);
        };

        expect(start).toThrowError(Error);
    });

    test("Throws an assertion error when the argument provided is missing required field", () => {
        const sut = makeSUT();

        const options = {
            callType: CallType.AUDIO_VIDEO,
        };

        const start = () => {
            // @ts-ignore
            sut.startCall(options);
        };

        expect(start).toThrowError(Error);
    });

    test("Calls startCall action providing the call options as arguments", () => {
        const sut = makeSUT();

        const options = {
            recordingType: RecordingType.AUTOMATIC,
            callees: ["bob", "alice"],
            callType: CallType.AUDIO_VIDEO,
        };

        sut.startCall(options);

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("startCall");
        expect(invocation.args).toHaveLength(1);
        const firstArg = JSON.parse(invocation.args[0]);
        expect(firstArg).toEqual({
            recordingType: "automatic",
            callees: ["bob", "alice"],
            callType: "audioVideo",
        });
    });

    test("Throws an invalid argument error when the provided URL is an empty string", () => {
        const sut = makeSUT();

        const start = () => {
            sut.startCallFrom("");
        };

        expect(start).toThrowError(Error);
    });

    test("Call startCall action with the provided URL as argument", () => {
        const sut = makeSUT();

        sut.startCallFrom("https://acme.kaleyra.com/call/12345");

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("startCall");
        expect(invocation.args).toContainEqual(JSON.stringify("https://acme.kaleyra.com/call/12345"));
    });
});

describe("Call display mode", () => {

    test('When running on Android device, calls "setDisplayModeForCurrentCall" providing the mode received as first argument', () => {
        device.simulateAndroid();
        const sut = makeSUT();

        sut.setDisplayModeForCurrentCall(CallDisplayMode.FOREGROUND_PICTURE_IN_PICTURE);

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("setDisplayModeForCurrentCall");
        const firstArg = JSON.parse(invocation.args[0]);
        expect(firstArg).toEqual("FOREGROUND_PICTURE_IN_PICTURE");
    });
});

describe("User details", () => {

    test("Throws invalid argument error when adding an empty array", () => {
        const sut = makeSUT();

        const addDetails = () => {
            sut.addUsersDetails([]);
        };

        expect(addDetails).toThrowError(Error);
    });

    test('Calls "addUsersDetails" action providing the user details received as arguments', () => {
        const sut = makeSUT();

        const userDetails = [
            {userID: "usr_12345", name: "Alice Appleseed"},
            {userID: "usr_54321", name: "Bob Appleseed"},
        ];
        sut.addUsersDetails(userDetails);

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("addUsersDetails");
        const firstArg = JSON.parse(invocation.args[0]);
        expect(firstArg).toEqual(
            [
                {userID: "usr_12345", name: "Alice Appleseed"},
                {userID: "usr_54321", name: "Bob Appleseed"},
            ],
        );
    });

    test("Throws assertion error when any user detail entry is missing required field", () => {
        const sut = makeSUT();

        const addDetails = () => {
            // @ts-ignore
            sut.addUsersDetails([{firstName: "Foo", lastName: "Bar"}]);
        };

        expect(addDetails).toThrowError(Error);
    });

    test('Calls "removeUsersDetails" action with an empty argument list', () => {
        const sut = makeSUT();

        sut.removeUsersDetails();

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("removeUsersDetails");
        expect(invocation.args).toHaveLength(0);
    });

    test('When running an Android device, calls "clearUserCache" action when asked to clear the user cache', () => {
        device.simulateAndroid();
        const sut = makeSUT();

        sut.clearUserCache();

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("clearUserCache");
        expect(invocation.args).toHaveLength(0);
    });
});

describe("Push notifications handling", () => {

    test("Throws an invalid argument error when an empty payload is provided as argument", () => {
        const sut = makeSUT();

        const handleNotification = () => {
            sut.handlePushNotificationPayload("");
        };

        expect(handleNotification).toThrowError(Error);
    });

    test('Calls "handlePushNotificationPayload" with the payload received as argument', () => {
        const sut = makeSUT();

        sut.handlePushNotificationPayload("Some push payload");

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("handlePushNotificationPayload");
        expect(invocation.args[0]).toEqual("Some push payload");
    });
});

describe("Starting a chat", () => {

    test("Throws an invalid argument error when an empty user alias is provided as argument", () => {
        const sut = makeSUT();

        const startChat = () => {
            sut.startChat("");
        };

        expect(startChat).toThrowError(Error);
    });

    test('Calls "startChat" action with the call options provided as its arguments', () => {
        const sut = makeSUT();

        sut.startChat("bob");

        const invocation = cordovaSpy.execInvocations[1];
        expect(invocation.service).toMatch("VideoNativePlugin");
        expect(invocation.action).toMatch("startChat");
        expect(invocation.args[0]).toEqual("bob");
    });
});

function makeSUT() {
    return KaleyraVideo.configure(makePluginConfig());
}

function makePluginConfig(): KaleyraVideoConfiguration {
    return {
        appID: "Some APP ID",
        environment: Environments.sandbox(),
        region: Regions.europe(),
        iosConfig: {
            callkit: {
                enabled: true,
                appIconName: "AppIcon",
                ringtoneSoundName: "MyRingtone",
            },
        },
        logEnabled: false,
    };
}
