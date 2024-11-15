// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

var kaleyraVideo;

var app = {
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function () {
        var loginButton = $('#loginButton');
        var logoutButton = $('#logoutButton');
        var userToLoginInputText = $('#userToLoginInputText');
        var callButton = $('#callButton');
        var chatButton = $('#chatButton');
        var userToContactInputText = $('#userToContactInputText');
        var storage = window.localStorage;

        var voipPushToken = null;
        var alertPushToken = null;

        var userID = storage.getItem("userID");

        var disableLogin = function () {
            userToLoginInputText.prop('disabled', true);
            loginButton.prop('disabled', true);
            logoutButton.prop('disabled', false);
        };

        var enableLogin = function () {
            userToLoginInputText.prop('disabled', false);
            loginButton.prop('disabled', false);
            logoutButton.prop('disabled', true);
            callButton.prop('disabled', true);
            chatButton.prop('disabled', true);
            storage.removeItem("userID");
        };

        var endPoint = function (region, environment) {
            let env = environment !== "production" ? "." + environment : "";
            let reg = region !== "" ? region.slice(0, 2) : "";
            return 'https://cs' + `${env}` + `.${reg}` + '.bandyer.com';
        };

        var accessTokenProvider = function (user_id) {
            return new Promise((success, error) => {
                cordova.plugin.http.post(endPoint(sdkConfig.region, sdkConfig.environment) + "/rest/sdk/credentials", {user_id}, {apikey: sdkConfig.apiKey}, (response) => {
                    success(JSON.parse(response.data).access_token)
                }, error);
            })
        };

        var registerNotificationDeviceToken = function (push_token, push_type) {
            if (!push_token) return;
            cordova.plugin.http.post("https://sandbox.bandyer.com/mobile_push_notifications/rest/device", {
                    user_alias: userID,
                    app_id: sdkConfig.appIdentifier,
                    push_token: push_token,
                    platform: device.platform.toLowerCase(),
                    platform_type: "cordova",
                    push_type: push_type
                }, {}
                , function (response) {
                    console.debug("subscribed for notifications");
                }
                , function (response) {
                    console.error("Failed to subscribe for notifications");
                });
        };

        var deregisterNotificationDeviceToken = function (push_token) {
            if (!push_token) return;
            cordova.plugin.http.delete("https://sandbox.bandyer.com/mobile_push_notifications/rest/device/" + userID + "/" + sdkConfig.appIdentifier + "/" + push_token, {}, {}
                , function (response) {
                    console.debug("notification unregister success ")
                }
                , function (response) {
                    console.error("notification unregister error")
                })
        };

        callButton.prop('disabled', true);
        chatButton.prop('disabled', true);
        logoutButton.prop('disabled', true);

        kaleyraVideo = KaleyraVideo.configure({
            environment: KaleyraVideo.environments.new(sdkConfig.environment),
            appID: sdkConfig.appIdentifier,
            region: KaleyraVideo.regions.new(sdkConfig.region),
            tools: {
                chat: {
                    audioCallOption: {
                        type: KaleyraVideo.audioCallTypes.AUDIO,
                        recordingType: KaleyraVideo.recordingTypes.NONE,
                    },
                    videoCallOption: {
                        recordingType: KaleyraVideo.recordingTypes.NONE,
                    }
                },
                fileShare: true,
                whiteboard: true,
                screenShare: {
                    inApp: true,
                    wholeDevice: true
                }
            },
            logEnabled: true,
            // optional you can disable one or more of the following capabilities, by default callkit is enabled
            iosConfig: {
                callkit: {
                    enabled: true,
                    appIconName: "logo_transparent", // optional but recommended
                    ringtoneSoundName: "custom_ringtone.mp3" // optional
                },
                voipHandlingStrategy: KaleyraVideo.voipHandlingStrategies.AUTOMATIC
            }
        });

        kaleyraVideo.on(KaleyraVideo.events.callModuleStatusChanged, function (status) {
            console.debug("callModuleStatusChanged", status);
            var callButton = $('#callButton');
            callButton.prop('disabled', status !== 'ready');
        });

        kaleyraVideo.on(KaleyraVideo.events.chatModuleStatusChanged, function (status) {
            console.debug("chatModuleStatusChanged", status);
            var chatButton = $('#chatButton');
            chatButton.prop('disabled', status !== 'ready');
        });

        kaleyraVideo.on(KaleyraVideo.events.callError, function (reason) {
            console.error("callError", reason);
            enableLogin();
        });

        kaleyraVideo.on(KaleyraVideo.events.chatError, function (reason) {
            console.error("chatError", reason);
            enableLogin();
        });

        kaleyraVideo.on(KaleyraVideo.events.setupError, function (reason) {
            console.error("setupError", reason);
        });

        kaleyraVideo.on(KaleyraVideo.events.iOSVoipPushTokenUpdated, function (token) {
            console.debug("Voip push Token", token);
            voipPushToken = token;
            registerNotificationDeviceToken(token, "voip");
        });


        var connectPlugin = function (userID) {
            kaleyraVideo.addUsersDetails([
                {userID: "kri1", name: "Name"},
                {userID: "kri2", name: "Name2"},
                {userID: "ale1", name: "Ale 1"},
                {userID: "ale2", name: "Ale 2"},
            ]);
            kaleyraVideo.connect({
                userID: userID,
                accessTokenProvider: (userID) => accessTokenProvider(userID)
            });

            disableLogin();
            storage.setItem("userID", userID);
            registerNotificationDeviceToken(voipPushToken, "voip");
            registerNotificationDeviceToken(alertPushToken, "alert");
            console.debug("Logging in as:", userID);
        }

        if (userID) {
            userToLoginInputText.val(userID);
            connectPlugin(userID);
        }

        loginButton.click(function () {
            userID = userToLoginInputText.val();
            connectPlugin(userID);
        });

        logoutButton.click(function () {
            console.debug("Logging out");
            kaleyraVideo.disconnect();
            kaleyraVideo.clearUserCache();
            enableLogin();
            if (userID && sdkConfig.appIdentifier) {
                deregisterNotificationDeviceToken(voipPushToken);
                deregisterNotificationDeviceToken(alertPushToken);
            }
        });

        callButton.click(function () {
            let callees = userToContactInputText.val();
            console.debug("Create call with:", callees);
            kaleyraVideo.startCall({
                callees: [callees],
                callType: KaleyraVideo.callTypes.AUDIO_VIDEO,
                recordingType: KaleyraVideo.recordingTypes.NONE
            });
        });

        chatButton.click(function () {
            let otherUser = userToContactInputText.val();
            console.debug("Chat with:", otherUser);
            kaleyraVideo.startChat(otherUser);
        });

        // configure push notifications
        var push = PushNotification.init({
            android: {senderID: sdkConfig.firebaseProjectNumber},
            ios: {alert: true}
        });

        push.on('registration', function (data) {
            alertPushToken = data.registrationId;
            registerNotificationDeviceToken(alertPushToken, "alert");
        });

        push.on('error', function (e) {
            console.error(e.message);
        });

        // NOTIFICATIONS
        //
        // --- ANDROID ---
        // Chat&Calls
        // The sample app handles the both kind of notifications by setting the KaleyraVideoNotificationReceiver in the config.xml
        // If this type of handling does not fit your requirements check the documentation for alternative ways.
        //
        // --- IOS ---
        // Calls:
        // - Define the target="UIBackgroundModes" in your config.xml as shown in this sample app
        // - Set voipNotificationKeyPath during the plugin setup and the plugin will handle the notifications by itself.
        //
        // Chat:
        // - Listen for normal alert push notification containing the userID as title and the message as body and start a chat with that userID
    }
};

app.initialize();
