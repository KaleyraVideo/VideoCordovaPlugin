// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

package com.kaleyra.video_cordova_plugin

import com.kaleyra.video_hybrid_native_bridge.AccessTokenResponse
import com.kaleyra.video_hybrid_native_bridge.KaleyraVideoConfiguration
import com.kaleyra.video_hybrid_native_bridge.VideoHybridBridge
import com.kaleyra.video_hybrid_native_bridge.VideoSDKHybridBridge
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaInterface

class CordovaHybridPlugin private constructor(
    override val contextContainer: CordovaContextContainer,
    override val tokenProvider: CordovaAccessTokenProvider = CordovaAccessTokenProvider(),
    override val eventsEmitter: CordovaEventsEmitter = CordovaEventsEmitter(),
) : VideoHybridBridge by VideoSDKHybridBridge(
    contextContainer = contextContainer,
    tokenProvider = tokenProvider,
    eventsEmitter = eventsEmitter
) {

    constructor(cordova: CordovaInterface) : this(CordovaContextContainer(cordova))

    fun configureBridge(configuration: KaleyraVideoConfiguration, callbackContext: CallbackContext) {
        eventsEmitter.bandyerCallbackContext = callbackContext
        configureBridge(configuration)
    }

    fun connect(userID: String, callbackContext: CallbackContext) {
        tokenProvider.callbackContext = callbackContext
        connect(userID)
    }

    fun setAccessTokenResponse(accessTokenResponse: AccessTokenResponse) {
        tokenProvider.setAccessTokenResponse(accessTokenResponse)
    }
}
