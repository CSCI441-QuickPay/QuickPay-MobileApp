## Dependency Graph

"(~> X)" below means that the SDK requires all of the xcframeworks from X. You
should make sure to include all of the xcframeworks from X when including the
SDK.

## FirebaseAnalytics
- FBLPromises.xcframework
- FirebaseAnalytics.xcframework
- FirebaseCore.xcframework
- FirebaseCoreInternal.xcframework
- FirebaseInstallations.xcframework
- GoogleAdsOnDeviceConversion.xcframework
- GoogleAppMeasurement.xcframework
- GoogleAppMeasurementIdentitySupport.xcframework
- GoogleUtilities.xcframework
- nanopb.xcframework

## FirebaseABTesting (~> FirebaseAnalytics)
- FirebaseABTesting.xcframework

## FirebaseAI (~> FirebaseAnalytics)
- FirebaseAI.xcframework
- FirebaseAppCheckInterop.xcframework
- FirebaseAuthInterop.xcframework
- FirebaseCoreExtension.xcframework

## FirebaseAppCheck (~> FirebaseAnalytics)
- AppCheckCore.xcframework
- FirebaseAppCheck.xcframework
- FirebaseAppCheckInterop.xcframework

## FirebaseAppDistribution (~> FirebaseAnalytics)
- FirebaseAppDistribution.xcframework

## FirebaseAuth (~> FirebaseAnalytics)
- FirebaseAppCheckInterop.xcframework
- FirebaseAuth.xcframework
- FirebaseAuthInterop.xcframework
- FirebaseCoreExtension.xcframework
- GTMSessionFetcher.xcframework
- RecaptchaInterop.xcframework

## FirebaseCrashlytics (~> FirebaseAnalytics)
- FirebaseCoreExtension.xcframework
- FirebaseCrashlytics.xcframework
- FirebaseRemoteConfigInterop.xcframework
- FirebaseSessions.xcframework
- GoogleDataTransport.xcframework
- Promises.xcframework

## FirebaseDatabase (~> FirebaseAnalytics)
- FirebaseAppCheckInterop.xcframework
- FirebaseDatabase.xcframework
- FirebaseSharedSwift.xcframework
- leveldb.xcframework

## FirebaseFirestore (~> FirebaseAnalytics)
- FirebaseAppCheckInterop.xcframework
- FirebaseCoreExtension.xcframework
- FirebaseFirestore.xcframework
- FirebaseFirestoreInternal.xcframework
- FirebaseSharedSwift.xcframework
- absl.xcframework
- grpc.xcframework
- grpcpp.xcframework
- leveldb.xcframework
- openssl_grpc.xcframework

## FirebaseFunctions (~> FirebaseAnalytics)
- FirebaseAppCheckInterop.xcframework
- FirebaseAuthInterop.xcframework
- FirebaseCoreExtension.xcframework
- FirebaseFunctions.xcframework
- FirebaseMessagingInterop.xcframework
- FirebaseSharedSwift.xcframework
- GTMSessionFetcher.xcframework

## FirebaseInAppMessaging (~> FirebaseAnalytics)
- FirebaseABTesting.xcframework
- FirebaseInAppMessaging.xcframework

## FirebaseMLModelDownloader (~> FirebaseAnalytics)
- FirebaseCoreExtension.xcframework
- FirebaseMLModelDownloader.xcframework
- GoogleDataTransport.xcframework
- SwiftProtobuf.xcframework

## FirebaseMessaging (~> FirebaseAnalytics)
- FirebaseMessaging.xcframework
- GoogleDataTransport.xcframework

## FirebasePerformance (~> FirebaseAnalytics)
- FirebaseABTesting.xcframework
- FirebaseCoreExtension.xcframework
- FirebasePerformance.xcframework
- FirebaseRemoteConfig.xcframework
- FirebaseRemoteConfigInterop.xcframework
- FirebaseSessions.xcframework
- FirebaseSharedSwift.xcframework
- GoogleDataTransport.xcframework
- Promises.xcframework

## FirebaseRemoteConfig (~> FirebaseAnalytics)
- FirebaseABTesting.xcframework
- FirebaseRemoteConfig.xcframework
- FirebaseRemoteConfigInterop.xcframework
- FirebaseSharedSwift.xcframework

## FirebaseStorage (~> FirebaseAnalytics)
- FirebaseAppCheckInterop.xcframework
- FirebaseAuthInterop.xcframework
- FirebaseCoreExtension.xcframework
- FirebaseStorage.xcframework
- GTMSessionFetcher.xcframework

## GoogleSignIn
- AppAuth.xcframework
- AppCheckCore.xcframework
- GTMAppAuth.xcframework
- GTMSessionFetcher.xcframework
- GoogleSignIn.xcframework



## Versions

The xcframeworks in this directory map to these versions of the Firebase SDKs in
CocoaPods.

          CocoaPod          | Version
----------------------------|---------
AppAuth                     | 2.0.0
AppCheckCore                | 11.2.0
BoringSSL-GRPC              | 0.0.37
Firebase                    | 12.4.0
FirebaseABTesting           | 12.4.0
FirebaseAI                  | 12.4.0
FirebaseAnalytics           | 12.4.0
FirebaseAppCheck            | 12.4.0
FirebaseAppCheckInterop     | 12.4.0
FirebaseAppDistribution     | 12.4.0-beta
FirebaseAuth                | 12.4.0
FirebaseAuthInterop         | 12.4.0
FirebaseCore                | 12.4.0
FirebaseCoreExtension       | 12.4.0
FirebaseCoreInternal        | 12.4.0
FirebaseCrashlytics         | 12.4.0
FirebaseDatabase            | 12.4.0
FirebaseFirestore           | 12.4.0
FirebaseFirestoreInternal   | 12.4.0
FirebaseFunctions           | 12.4.0
FirebaseInAppMessaging      | 12.4.0-beta
FirebaseInstallations       | 12.4.0
FirebaseMLModelDownloader   | 12.4.0-beta
FirebaseMessaging           | 12.4.0
FirebaseMessagingInterop    | 12.4.0
FirebasePerformance         | 12.4.0
FirebaseRemoteConfig        | 12.4.0
FirebaseRemoteConfigInterop | 12.4.0
FirebaseSessions            | 12.4.0
FirebaseSharedSwift         | 12.4.0
FirebaseStorage             | 12.4.0
GTMAppAuth                  | 5.0.0
GTMSessionFetcher           | 3.5.0
GoogleAdsOnDeviceConversion | 3.1.0
GoogleAppMeasurement        | 12.4.0
GoogleDataTransport         | 10.1.0
GoogleSignIn                | 9.0.0
GoogleUtilities             | 8.1.0
PromisesObjC                | 2.4.0
PromisesSwift               | 2.4.0
RecaptchaInterop            | 101.0.0
SwiftProtobuf               | 1.31.1
abseil                      | 1.20240722.0
gRPC-C++                    | 1.69.0
gRPC-Core                   | 1.69.0
leveldb-library             | 1.22.6
nanopb                      | 3.30910.0

