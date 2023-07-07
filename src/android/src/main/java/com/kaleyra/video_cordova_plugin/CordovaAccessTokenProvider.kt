// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

package com.kaleyra.video_cordova_plugin

import com.kaleyra.video_cordova_plugin.VideoNativePlugin.Companion.gson
import com.kaleyra.video_hybrid_native_bridge.AccessTokenRequest
import com.kaleyra.video_hybrid_native_bridge.AccessTokenResponse
import com.kaleyra.video_hybrid_native_bridge.CrossPlatformAccessTokenProvider
import org.apache.cordova.CallbackContext
import org.apache.cordova.PluginResult
import java.util.*

class CordovaAccessTokenProvider(var callbackContext: CallbackContext? = null) : CrossPlatformAccessTokenProvider {

    private var tokenCompletion: ((Result<String>) -> Unit)? = null

    override fun provideAccessToken(userId: String, completion: (Result<String>) -> Unit) {
        val callbackContext = callbackContext ?: return
        val result = PluginResult(
            PluginResult.Status.OK, gson.toJson(
                AccessTokenRequest(
                    UUID.randomUUID().toString(), userId
                )
            )
        )
        result.keepCallback = true
        if (callbackContext.isFinished) return
        callbackContext.sendPluginResult(result)
        tokenCompletion = completion
    }

    fun setAccessTokenResponse(accessTokenResponse: AccessTokenResponse) {
        val tokenCompletion = tokenCompletion ?: return
        if (accessTokenResponse.success) tokenCompletion(Result.success(accessTokenResponse.data))
        else tokenCompletion(Result.failure(Throwable(accessTokenResponse.error ?: "error")))
    }
}