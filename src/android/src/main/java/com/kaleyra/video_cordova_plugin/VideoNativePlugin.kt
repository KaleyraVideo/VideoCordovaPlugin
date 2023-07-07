// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

package com.kaleyra.video_cordova_plugin

import com.google.gson.GsonBuilder
import com.kaleyra.video_hybrid_native_bridge.utils.CaseInsensitiveEnumTypeAdapterFactory
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.json.JSONArray
import kotlin.reflect.full.createType
import kotlin.reflect.jvm.javaType
import kotlin.reflect.jvm.kotlinFunction


@Suppress("unused", "UNUSED_PARAMETER")
class VideoNativePlugin : CordovaPlugin() {

    companion object {
        internal val gson = GsonBuilder().registerTypeAdapterFactory(
            CaseInsensitiveEnumTypeAdapterFactory()
        ).create()
    }

    private lateinit var proxyPlugin: CordovaHybridPlugin

    fun CordovaHybridPlugin.invoke(
        functionName: String,
        params: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        this::class.java.methods
            .filter { it.name == functionName }
            .mapNotNull { it.kotlinFunction }
            .maxByOrNull { it.parameters.size }
            ?.let { function ->
                when {
                    params.length() == 1 -> {
                        val arg = gson.fromJson<Any>(params.getString(0), function.parameters[1].type.javaType)
                        if (function.parameters.lastOrNull { it.type == CallbackContext::class.createType() } != null) function.call(this, arg, callbackContext)
                        else function.call(this, arg)
                    }
                    else                 -> function.call(this, callbackContext)
                }
                return true
            }

        return false
    }

    override fun pluginInitialize() {
        super.pluginInitialize()
        proxyPlugin = CordovaHybridPlugin(cordova)
    }

    override fun execute(
        action: String,
        args: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        if (proxyPlugin.invoke(action, args, callbackContext)) return true
        val error = """Android function not implemented!
                { 
                    "function":"$action",
                    "params":"$args"
                }
            """.trimIndent()
        callbackContext.error(error)
        return false
    }

}
