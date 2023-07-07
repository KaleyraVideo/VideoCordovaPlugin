// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

package com.kaleyra.video_cordova_plugin

import com.kaleyra.video_hybrid_native_bridge.events.Events
import com.kaleyra.video_hybrid_native_bridge.events.EventsEmitter
import org.apache.cordova.CallbackContext
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONObject

class CordovaEventsEmitter(var bandyerCallbackContext: CallbackContext? = null) : EventsEmitter {

    override fun sendEvent(event: Events, args: Any?) {
        val bandyerCallbackContext = bandyerCallbackContext ?: return
        val message = JSONObject().apply { put("event", event.value) }
        val data = JSONArray().apply { put(args) }
        message.put("args", data)
        val pluginResult = PluginResult(PluginResult.Status.OK, message)
        pluginResult.keepCallback = true
        if (bandyerCallbackContext.isFinished) return
        bandyerCallbackContext.sendPluginResult(pluginResult)
    }
}