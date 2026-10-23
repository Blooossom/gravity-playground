// swift-tools-version: 6.0
import PackageDescription
let package = Package(name: "GravityPlayground", platforms: [.macOS(.v13)], products: [.executable(name: "GravityPlayground", targets: ["GravityPlayground"])], targets: [.executableTarget(name: "GravityPlayground")], swiftLanguageModes: [.v5])
