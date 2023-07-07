// Copyright © 2018-2023 Kaleyra S.p.a. All Rights Reserved.
// See LICENSE for licensing information

import Foundation
import UIKit
#if canImport(Cordova)
import Cordova
#endif

@available(iOS 12.0, *)
@objc(KCPVideoNativePlugin)
class VideoNativePlugin: CDVPlugin {

    // MARK: - Nested Types

    private struct ArgumentTypeMismatchError: Error {}

    private struct CommandPerformer {

        private let callbackId: String
        private weak var commandDelegate: CDVCommandDelegate?

        init(callbackId: String, commandDelegate: CDVCommandDelegate) {
            self.callbackId = callbackId
            self.commandDelegate = commandDelegate
        }

        func perform(_ work: () throws -> Void) {
            performAny(work)
        }

        func performAndReportResult(_ work: () throws -> String) {
            performAny(work)
        }

        private func performAny(_ work: () throws -> Any) {
            do {
                let result = try work()

                if let message = result as? String {
                    reportCommandSucceeded(message: message)
                } else {
                    reportCommandSucceeded()
                }

            } catch {
                debugPrint(error)
                reportCommandFailed()
            }
        }

        private func reportCommandFailed() {
            commandDelegate?.send(.init(status: .error), callbackId: callbackId)
        }

        private func reportCommandSucceeded() {
            commandDelegate?.send(.init(status: .ok), callbackId: callbackId)
        }

        private func reportCommandSucceeded(message: String) {
            commandDelegate?.send(.init(status: .ok, messageAs: message), callbackId: callbackId)
        }
    }

    // MARK: - Properties

    private lazy var eventEmitter = CordovaEventEmitter(commandDelegate: commandDelegate)
    private lazy var tokenRequester = CordovaAccessTokenRequester(commandDelegate: commandDelegate)
    private lazy var tokenProvider = TokenProvider(requester: tokenRequester)

    private lazy var plugin = VideoHybridNativeBridge(emitter: eventEmitter, rootViewController: viewController) {
        self.tokenProvider
    }

    // MARK: - Init

    /**
        - Warning: Declaring an initializer could lead to problems with Capacitor integration.
                   Capacitor loads plugins calling `init!(webViewEngine: _)`, which is private in Cordova platform and cannot be overridden.
                   If not implemented, will produce an exception on Capacitor runtime.
     */

    // MARK: - Configure

    @objc
    func configureBridge(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let json = try unwrap(command.arguments.first as? String)
            let config = try KaleyraVideoConfiguration.decodeJSON(json)
            printPluginDebugDescriptionIfNeeded(config)
            configureEventEmitter(callbackId: command.callbackId)
            try plugin.configureSDK(config)
        }
    }

    private func configureEventEmitter(callbackId: String) {
        eventEmitter.callbackId = callbackId
    }

    // MARK: - Connect / disconnect

    @objc
    func connect(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let userID = try unwrap(command.arguments.first as? String)
            tokenRequester.callbackId = command.callbackId
            try plugin.connect(userID: userID)
        }
    }

    @objc
    func setAccessTokenResponse(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let json = try unwrap(command.arguments.first as? String)
            let response = try AccessTokenResponse.decodeJSON(json)
            tokenProvider.onResponse(response)
        }
    }

    @objc
    func disconnect(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            try plugin.disconnect()
        }
    }

    // MARK: - State

    @objc
    func state(_ command: CDVInvokedUrlCommand) {
        performer(for: command).performAndReportResult {
            try plugin.callClientStateDescription()
        }
    }

    // MARK: - Start call

    @objc
    func startCall(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let string = try unwrap(command.arguments.first as? String)

            if let url = URL(string: string) {
                try plugin.startCallUrl(url)

            } else {
                let options = try CreateCallOptions.decodeJSON(string)
                try plugin.startCall(options)
            }
        }
    }

    // MARK: - Start chat

    @objc
    func startChat(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let userID = try unwrap(command.arguments.first as? String)
            try plugin.startChat(userID)
        }
    }

    // MARK: - User details

    @objc
    func addUsersDetails(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let json = try unwrap(command.arguments.first as? String)
            let items = try Array<UserDetails>.decodeJSON(json)
            plugin.addUsersDetails(items)
        }
    }

    @objc
    func removeUsersDetails(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            plugin.removeUsersDetails()
        }
    }

    @objc
    func setUserDetailsFormat(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let json = try unwrap(command.arguments.first as? String)
            let format = try UserDetailsFormat.decodeJSON(json)
            plugin.setUserDetailsFormat(format)
        }
    }

    // MARK: - Push notifications

    @objc
    func handlePushNotificationPayload(_ command: CDVInvokedUrlCommand) {
        performer(for: command).perform {
            let json = try unwrap(command.arguments.first as? String)
            plugin.handlePushNotificationPayload(json)
        }
    }

    // MARK: - Helpers

    private func unwrap<T>(_ value: T?) throws -> T {
        guard let value = value else {
            throw ArgumentTypeMismatchError()
        }
        return value
    }

    private func performer(for command: CDVInvokedUrlCommand) -> CommandPerformer {
        .init(callbackId: command.callbackId, commandDelegate: commandDelegate)
    }

    private func printPluginDebugDescriptionIfNeeded(_ config: KaleyraVideoConfiguration) {
        guard config.logEnabled ?? false else { return }

        _KaleyraVideoHybridVersionInfo().printDebugDescription()
    }
}

private class CordovaAccessTokenRequester: AccessTokenRequester {

    // MARK: - Nested Types

    private struct MissingCallbackIdError: Error {}

    // MARK: - Properties

    var callbackId: String?
    private weak var commandDelegate: CDVCommandDelegate?

    // MARK: - Init

    init(commandDelegate: CDVCommandDelegate) {
        self.commandDelegate = commandDelegate
    }

    // MARK: - AccessTokenRequester

    func requestAccessToken(request: AccessTokenRequest) throws {
        guard let callbackId = callbackId else {
            throw MissingCallbackIdError()
        }

        let encoded = try request.JSONEncoded()
        let pluginResult = CDVPluginResult(status: .ok, messageAs: encoded)
        pluginResult?.keepCallback = true
        commandDelegate?.send(pluginResult, callbackId: callbackId)
    }
}
