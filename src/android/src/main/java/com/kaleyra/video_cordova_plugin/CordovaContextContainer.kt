// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

package com.kaleyra.video_cordova_plugin

import android.content.Context
import com.kaleyra.video_hybrid_native_bridge.ContextContainer
import org.apache.cordova.CordovaInterface

class CordovaContextContainer(var cordova: CordovaInterface) : ContextContainer {
    override val context: Context get() = cordova.activity
}