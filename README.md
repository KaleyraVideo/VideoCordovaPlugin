![Kaleyra Logo](https://static.bandyer.com/corporate/iOS/logo/kaleyra-logo.png)

# Kaleyra Video Cordova Plugin

[![npm version](https://img.shields.io/npm/v/@kaleyra/video-cordova-plugin?color=brightgreen&label=npm%20package)][LinkNpm]

## Requirements

```
npm i xml2js // needed for android 
cordova plugin add cordova-plugin-enable-multidex // plugin needed for android 64k max limit of methods
cordova plugin add cordova-plugin-androidx // needed for android
```

## How to run the example

Execute the following commands from the repository root folder

```shell
npm i
cd example
# nano www/js/config.js use your own keys
npm i
cordova platform add ios/android 
cordova run ios/android 
```

## How to install the plugin:

Open the **terminal** in your Cordova-App folder and run the following commands

```sh
cordova plugin add @kaleyra/video-cordova-plugin
```

### Advanced installation options

In order to enable the broadcast screen sharing tool in your cordova app you must add the plugin providing some settings. For more information please take a look at [Kaleyra Video Broadcast Extension Cordova Plugin][BroadcastExtension] documentation.

## How to link local plugin:

Link the local plugin to the project

```sh
# cd to your application folder
cordova plugin add ${path-to-local-plugin} --link
```

## How to remove the plugin:

```sh
cordova plugin remove @kaleyra/video-cordova-plugin
```

## Update the Cordova platforms
Every time you update the plugin remove the platforms 'android' and/or 'ios' and re add them to ensure that all modified plugins are copied to build folders
remove platforms 'android' and/or 'ios' and re add them to ensure that all modified plugins are copied to build folders

```bash
cd {to your app root folder}
# Add --nosave if you don't want to update your package.json file when executing the commands below
cordova platforms remove android ios
cordova platforms add android ios
```

## How to run the cordova app

### iOS - device

```sh
cordova run ios
```

### Android

```sh
cordova run android
```

## How to use the plugin in your Cordova app

You can refer to the Kaleyra Video plugin in your React Native app via

```javascript
KaleyraVideo
```

## Plugin setup

The first thing you need to do is to configure the plugin specifying your keys and your options.

##### Configure params

```javascript
var kaleyraVideo = KaleyraVideo.configure({
    environment: KaleyraVideo.environments.sandbox(), // production()
    appID: 'mAppId_xxx', // your mobile appId
    region: KaleyraVideo.regions.europe(), // india(), us()
    logEnabled: true, // enable the logger
    tools: { // by default no tools will be set
        chat: {
            audioCallOption: {
                type: KaleyraVideo.audioCallTypes.AUDIO, // AUDIO or AUDIO_UPGRADABLE
                recordingType: KaleyraVideo.recordingTypes.NONE, // NONE, MANUAL or AUTOMATIC
            },
            videoCallOption: {
                recordingType: KaleyraVideo.recordingTypes.NONE, // NONE, MANUAL or AUTOMATIC
            }
        },
        fileShare: true,
        whiteboard: true,
        screenShare: {
            inApp: true, // screenshare only the app 
            wholeDevice: true // screenshare the whole device
        },
        feedback: true
    },
    
    // optional you can set one or more of the following capabilities, by default CallKit is enabled
    iosConfig: {
        voipHandlingStrategy: KaleyraVideo.voipHandlingStrategies.AUTOMATIC, // implement to be able to receive VoIPs
        callkit: {
            enabled: true, // enable CallKit on iOS 10+
            appIconName: "logo_transparent", // optional but recommended
            ringtoneSoundName: "custom_ringtone.mp3" // optional
        }
    }
});
```

If screenShare.wholeDevice is set to true look [here][BroadcastExtension] for the required additional setup.

## Plugin listen for errors/events

To listen for events and/or errors register
Check the documentation [here][EventsDoc] for a complete list.

Example:

```javascript
kaleyraVideo.on(KaleyraVideo.events.callModuleStatusChanged, function (status) {});
```

## iOS - VoIP Notifications

### Setup required for VoIP notifications

If you desire to use VoIP notifications on iOS platform as first thing you should configure kaleyraVideo passing a config object as follow:

```javascript
var kaleyraVideo = KaleyraVideo.configure({
    [...]
    iosConfig: {
        voipHandlingStrategy: KaleyraVideo.voipHandlingStrategies.AUTOMATIC,
        [...]
    }
});
```

The iOS project requires a little setup for use VoIP notifications. [Here][iOSProjectSetup] you can find a description of how the project should be configured.

### Listening for VoIP push token
In order to get your device push token, you must listen for the **KaleyraVideo.events.iOSVoipPushTokenUpdated** event registering a callback as follows:

```javascript
// The token is received in this listener only after calling kaleyraVideo.connect(_)
kaleyraVideo.on(KaleyraVideo.events.iOSVoipPushTokenUpdated, function (token) {
    // register the VoIP push token on your server
});
```
**Warning:** Make sure this listener is attached before calling kaleyraVideo.connect(_), otherwise the event reporting the device token could be missed.

The token provided in the callback is the **string** representation of your device token. 
Here's an example of a device token: **dec105f879924349fd2fa9aa8bb8b70431d5f41d57bfa8e31a5d80a629774fd9**

### VoIP notification payload

[Here][iOSVoIPPayload] you can find an example of how your VoIP notifications payload should be structured.

## Plugin connect

To connect the plugin to the Kaleyra Video system you will need to provide a Session object.
The session needs a userID and a function returning a promise with the access token for that user

> [!IMPORTANT]
> - The *userID* should aready exists in our service. Your backend needs to create it by invoking this api [create_user](https://developers.kaleyra.io/reference/video-v2-user-post)
> - The *accessToken* should be generated from your backend by invoking this api [get_credentials](https://developers.kaleyra.io/reference/video-v2-sdk-post). Be aware that it expires. The callback will be called multiple times every time a new token is needed to refresh the user session.

```javascript
kaleyraVideo.connect({
    userID: "usr_xxx",
    accessTokenProvider: (userId) => new Promise((success, error) => {
        // get token for user_xxx and invoke success or error depending on the result
        success("jwt_xxx");
    }),
});
```

## Start a call

To make a call you need to specify some params.

##### Start call params

```javascript
kaleyraVideo.startCall({
    callees: ['usr_yyy','usr_zzz'], //  an array of user ids of the users you want to call
    callType: KaleyraVideo.callTypes.AUDIO_VIDEO, // AUDIO, AUDIO_UPGRADABLE or AUDIO_VIDEO - the type of the call you want to start
    recordingType: KaleyraVideo.recordingTypes.NONE // NONE, MANUAL or AUTOMATIC
});
```

## Start a chat

To make a chat you need to specify some params.

##### Start chat params

```javascript
kaleyraVideo.startChat('usr_yyy');// the user_id of the user you want to create a chat with
```

## Set user details

This method will allow you to set your user details DB from which the sdk will read when needed to show the information.
> Be sure to have this always up to date, otherwise if an incoming call is received and the user is missing in this set the user ids will be printed on the UI.

```javascript
kaleyraVideo.addUsersDetails([
    {userID: "usr_yyy", firstName: "User1Name", lastName: "User1Surname"},
    {userID: "usr_zzz", firstName: "User2Name", lastName: "User2Surname"},
]);
```

## Remove all user details

This method will allow you to remove all the user info from the local app DB.

```javascript
kaleyraVideo.removeUsersDetails();
```

## Set user details format

This method will allow you to specify how you want your user details to be displayed.
> Be aware that you can specify only keywords which exist in the UserDetails type.

For example: if you wish to show only the firstName while your dataset contains also the lastName you may change it here.

```javascript
kaleyraVideo.setUserDetailsFormat({
    default: "${firstName} ${lastName}",
    androidNotification: "${firstName} ${lastName}" // optional if you wish to personalize the details in the notification.
});
```

## Remove all the cached info in preferences and DBs

```javascript
kaleyraVideo.clearUserCache();
```

## Android change display mode

This method is useful for use-cases where you need to show a prompt and don't want it to be invalidated by the call going into pip.
For example: if you wish to show fingerprint dialog you should first put the current call in background, execute the fingerprint validation and then put back the call in foreground.

```javascript
kaleyraVideo.setDisplayModeForCurrentCall(CallDisplayMode.FOREGROUND); // FOREGROUND, FOREGROUND_PICTURE_IN_PICTURE or CallDisplayMode.BACKGROUND
```

## Verify user

To verify a user for the current call.

```javascript
kaleyraVideo.verifyCurrentCall(true);  
```

## iOS Notifications
The plugin supports **on_call_incoming** notification.
You will need to set the **voipHandlingStrategy** and subscribe to **iOSVoipPushTokenUpdated** event to receive the voip token to use on your backend to notify the plugin.

## Android Notifications
The plugin supports only **on_call_incoming** and **on_message_sent** notification types

You may add the following configuration under platform android in your config.xml.
This will add our default notification handling which requires **payload** and **user_token** keys to be defined.
```xml
<config-file parent="/manifest/application" target="app/src/main/AndroidManifest.xml">
    <service android:name="com.kaleyra.video_hybrid_native_bridge.notifications.KaleyraVideoNotificationService" android:enabled="true" android:exported="false" android:permission="android.permission.BIND_JOB_SERVICE">
        <intent-filter>
            <action android:name="com.kaleyra.VideoNotificationEvent" />
            <!--//////// PATH to the object containing the payload, and user_token /////////-->
            <data android:path="message.kaleyra" />
        </intent-filter>
    </service>
</config-file>
```

Example of acceptable payload
```json
{
  "google.delivered_priority":"high",
  "content-available":"1",
  "google.sent_time":1663347601917,
  "google.ttl":60,
  "google.original_priority":"high",
  "from":"320",
  "title":"",
  "google.message_id":"0:1123%ac212d7bf9fd7ecd",
  "message":"{\"kaleyra\":{\"payload\":{\"event\":\"on_call_incoming\",\"room_id\":\"room_b36f162\",\"data\":{\"initiator\":\"user1\",\"users\":[{\"user\":{\"userAlias\":\"user2\"},\"status\":\"invited\"},{\"user\":{\"userAlias\":\"user1\"},\"status\":\"invited\"}],\"roomAlias\":\"room_b37a64c6f162\",\"options\":{\"duration\":0,\"record\":true,\"recordingType\":\"manual\",\"recording\":\"manual\",\"creationDate\":\"2022-09-16T17:00:01.457Z\",\"callType\":\"audio_upgradable\",\"live\":true}}},\"user_token\":\"eyJhtokenksadfjoiasdjfoaidjfsoasidjfoi\"}}",
  "google.c.sender.id":"320"
}
```

## Proguard 
```groovy
# Bandyer now Kaleyra proprietary SDK
-keep class com.bandyer.** { *; }
-keep interface com.bandyer.** { *; }
-keep enum com.bandyer.** { *; }

-keep class com.kaleyra.** { *; }
-keep interface com.kaleyra.** { *; }
-keep enum com.kaleyra.** { *; }
```


## TSDoc

The API documentation is available on the github pages link:
[https://kaleyravideo.github.io/VideoCordovaPlugin][TSDoc]

[LinkNpm]: https://www.npmjs.com/package/@kaleyra/video-cordova-plugin
[BroadcastExtension]: https://github.com/KaleyraVideo/VideoCordovaBroadcastExtensionPlugin
[iOSProjectSetup]: https://github.com/Bandyer/Bandyer-iOS-SDK/wiki/VOIP-notifications#project-setup
[iOSVoIPPayload]: https://github.com/Bandyer/Bandyer-iOS-SDK/wiki/VOIP-notifications#notification-payload-key-path
[EventsDoc]: https://kaleyravideo.github.io/VideoCordovaPlugin/enums/events.html
[TSDoc]: https://kaleyravideo.github.io/VideoCordovaPlugin
