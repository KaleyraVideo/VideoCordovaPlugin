// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import "core-js/es/map";
import {EventListener} from "./events/EventListener";
import {KaleyraVideoConfiguration} from "../../native-bridge/TypeScript/types/KaleyraVideoConfiguration";
import {CreateCallOptions} from "../../native-bridge/TypeScript/types/CreateCallOptions";
import {UserDetails} from "../../native-bridge/TypeScript/types/UserDetails";
import {CallType} from "../../native-bridge/TypeScript/types/CallType";
import {IllegalArgumentError} from "../../native-bridge/TypeScript/errors/IllegalArgumentError";
import {assert} from "typia";
import {Environments} from "../../native-bridge/TypeScript/Environments";
import {CallDisplayMode} from "../../native-bridge/TypeScript/types/CallDisplayMode";
import {Regions} from "../../native-bridge/TypeScript/Regions";
import {Session} from "../../native-bridge/TypeScript/types/Session";
import {RecordingType} from "../../native-bridge/TypeScript/types/RecordingType";
import {AccessTokenResponse} from "../../native-bridge/TypeScript/types/AccessTokenResponse";
import {AudioCallType} from "../../native-bridge/TypeScript/types/AudioCallType";
import {VoipHandlingStrategy} from "../../native-bridge/TypeScript/types/VoipHandlingStrategy";

/**
 * @ignore
 */
declare let cordova: Cordova;

/**
 * @ignore
 */
declare let device: any;

/**
 * @ignore
 * @private
 */
const _kaleyraHandlers = new Map();

/**
 * KaleyraVideo
 */
export default class KaleyraVideo extends EventListener {

    /**
     * <b>To create an instance of the Kaleyra Video invoke the [[configure]] method</b>
     */
    static instance: KaleyraVideo;

    /**
     * Available call types
     */
    static callTypes = CallType;

    /**
     * Available audio call types
     */
    static audioCallTypes = AudioCallType;

    /**
     * Available recording types
     */
    static recordingTypes = RecordingType;

    /**
     * Available environments
     */
    static environments = Environments;

    /**
     * Available regions
     */
    static regions = Regions;

    /**
     * Available display modes
     */
    static callDisplayModes = CallDisplayMode;

    /**
     * Available voip Handling Strategies
     */
    static voipHandlingStrategies = VoipHandlingStrategy;

    /**
     * Call this method when device is ready to configure the plugin
     * @param params
     * @throws IllegalArgumentError
     */
    static configure(params: KaleyraVideoConfiguration): KaleyraVideo {
        assert<KaleyraVideoConfiguration>(params);

        if (params.appID === "") {
            throw new IllegalArgumentError("Expected a not empty appId!");
        }

        if (this.instance) {
            console.warn("KaleyraVideo was already setup.");
            return this.instance;
        }

        const success = (result) => {
            const callbacks = _kaleyraHandlers.get(result.event);
            if (!callbacks) {
                return;
            }
            callbacks.forEach((callback) => {
                callback.apply(undefined, result.args);
            });
        };

        const fail = (error) => {
            console.error("KaleyraVideo failed configure", error);
        };
        cordova.exec(success, fail, "VideoNativePlugin", "configureBridge", [JSON.stringify(params)]);
        this.instance = new KaleyraVideo();
        return this.instance;
    }

    /**
     * @ignore
     * @private
     */
    private static _isAndroid() {
        return device.platform.toLowerCase() === "android";
    }

    /**
     * @ignore
     * @private
     */
    private static _isIos() {
        return device.platform.toLowerCase() === "ios";
    }

    private constructor() {
        super();
    }

    /**
     * Connect the plugin
     * @param session session to connect with
     * @param error callback
     * @throws IllegalArgumentError
     */
    connect(session: Session, error?: () => void) {
        assert<Session>(session);

        if (session.userID === "") {
            throw new IllegalArgumentError("Expected a not empty userId!");
        }

        cordova.exec((data: string) => {
            const accessTokenRequest = JSON.parse(data);
            session.accessTokenProvider(accessTokenRequest.userID).then((token) => {
                const response = AccessTokenResponse.success(accessTokenRequest.requestID, token);
                cordova.exec(null, null, "VideoNativePlugin", "setAccessTokenResponse", [JSON.stringify(response)]);
            }, (err: string) => {
                const response = AccessTokenResponse.failed(accessTokenRequest.requestID, err);
                cordova.exec(null, null, "VideoNativePlugin", "setAccessTokenResponse", [JSON.stringify(response)]);
            });
        }, error, "VideoNativePlugin", "connect", [session.userID]);
    }

    /**
     * Stop the plugin
     */
    disconnect() {
        cordova.exec(null, null, "VideoNativePlugin", "disconnect", []);
    }

    /**
     * This method allows you to reset the configuration.
     * @param success callback
     * @param error callback
     */
    reset(success?: () => void, error?: (reason) => void) {
        cordova.exec(success, error, "VideoNativePlugin", "reset", []);
    }

    /**
     * Get the current state of the plugin
     * @return the state as a promise
     */
    state() {
        return new Promise((resolve, reject) => {
            cordova.exec(resolve, reject, "VideoNativePlugin", "state", []);
        });
    }

    /**
     * Start Call with the callee defined
     * @param callOptions
     * @throws IllegalArgumentError
     */
    startCall(callOptions: CreateCallOptions) {
        assert<CreateCallOptions>(callOptions);

        if (callOptions.callees.length === 0) {
            throw new IllegalArgumentError("No userIds were provided!");
        }
        if (callOptions.callees.filter((str) => str.trim().length <= 0).length > 0) {
            throw new IllegalArgumentError("Some empty userIds were provided");
        }

        cordova.exec(null, null, "VideoNativePlugin", "startCall", [JSON.stringify(callOptions)]);
    }

    /**
     * Set the UI display mode for the current call
     * @param mode FOREGROUND, FOREGROUND_PICTURE_IN_PICTURE, BACKGROUND
     * @throws IllegalArgumentError
     */
    setDisplayModeForCurrentCall(mode: CallDisplayMode) {
        assert<CallDisplayMode>(mode);

        if (KaleyraVideo._isAndroid()) {
            cordova.exec(null, null, "VideoNativePlugin", "setDisplayModeForCurrentCall", [JSON.stringify(mode)]);
        } else {
            console.warn("Not supported by ", device.platform, " platform.");
        }
    }

    /**
     * Start Call from url
     * @param url received
     * @throws IllegalArgumentError
     */
    startCallFrom(url: string) {
        assert<string>(url);

        if (url === "" || url === "undefined") {
            throw new IllegalArgumentError("Invalid url!");
        }

        cordova.exec(null, null, "VideoNativePlugin", "startCallUrl", [JSON.stringify(url)]);
    }

    // noinspection JSMethodCanBeStatic
    /**
     * Call this method to provide the details for each user. Kaleyra Video will use this information
     * to set up the UI
     * @param userDetails  array of user details
     * @throws IllegalArgumentError
     */
    addUsersDetails(userDetails: UserDetails[]) {
        assert<UserDetails[]>(userDetails);

        if (userDetails.length === 0) {
            throw new IllegalArgumentError("No userDetails were provided!");
        }
        cordova.exec(null, null, "VideoNativePlugin", "addUsersDetails", [JSON.stringify(userDetails)]);
    }

    /**
     * Call this method to remove all the user details previously provided.
     */
    removeUsersDetails() {
        cordova.exec(null, null, "VideoNativePlugin", "removeUsersDetails", []);
    }

    /**
     * Open chat
     * @param userID user you want to chat with
     * @throws IllegalArgumentError
     */
    startChat(userID: string) {
        assert<string>(userID);

        if (userID === "") {
            throw new IllegalArgumentError("Expected a not empty userId!");
        }

        cordova.exec(null, null, "VideoNativePlugin", "startChat", [userID]);
    }

    /**
     * This method allows you to clear all user cached data, such as chat messages and generic Kaleyra Video information.
     * @param success callback
     * @param error callback
     */
    clearUserCache(success?: () => void, error?: (reason) => void) {
        if (KaleyraVideo._isAndroid()) {
            cordova.exec(success, error, "VideoNativePlugin", "clearUserCache", []);
        } else {
            console.warn("Not yet supported on ", device.platform, " platform.");
        }
    }

    protected _registerForEvent(event, callback) {
        if (_kaleyraHandlers.get(event) === undefined) {
            _kaleyraHandlers.set(event, [callback]);
        } else {
            _kaleyraHandlers.get(event).push(callback);
        }
    }
}
