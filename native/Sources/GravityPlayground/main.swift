import AppKit
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKScriptMessageHandlerWithReply {
    private var window: NSWindow!
    private var web: WKWebView!
    private let smoke = CommandLine.arguments.contains("--smoke-test")
    private let persistence = CommandLine.arguments.contains("--persistence-test")
    private var isTesting: Bool { smoke || persistence }
    private var contentURL: URL!
    private var sceneURL: URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        return base.appendingPathComponent(isTesting ? "com.blooossom.gravity-playground/Tests" : "com.blooossom.gravity-playground", isDirectory: true).appendingPathComponent("scene.json")
    }
    func applicationDidFinishLaunching(_ notification: Notification) {
        installMenu()
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.userContentController.addScriptMessageHandler(self, contentWorld: .page, name: "sceneStorage")
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.allowsBackForwardNavigationGestures = false
        window = NSWindow(contentRect: NSRect(x: 0,y: 0,width: 1280,height: 890), styleMask: [.titled,.closable,.miniaturizable,.resizable], backing: .buffered, defer: false)
        window.title = "맘대로 — 중력 놀이터"
        window.minSize = NSSize(width: 900,height: 680)
        window.backgroundColor = NSColor(calibratedRed: 0.973,green: 0.969,blue: 0.953,alpha: 1)
        window.contentView = web
        window.isReleasedWhenClosed = false
        window.collectionBehavior = [.fullScreenPrimary]
        window.center()
        if !isTesting { window.setFrameAutosaveName("GravityPlaygroundMainWindow") }
        window.makeKeyAndOrderFront(nil)
        if !isTesting { NSApp.activate(ignoringOtherApps: true) }
        guard let url = Bundle.main.url(forResource: "playground", withExtension: "html") else { fail("앱의 놀이터 파일을 찾을 수 없어요."); return }
        contentURL = url.standardizedFileURL
        web.loadFileURL(contentURL, allowingReadAccessTo: contentURL.deletingLastPathComponent())
        if isTesting { DispatchQueue.main.asyncAfter(deadline: .now()+25) { self.fail("App smoke test timed out") } }
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool { window.makeKeyAndOrderFront(nil); return true }
    private func installMenu() {
        let main = NSMenu()
        let app = NSMenu(); let appItem = NSMenuItem(); appItem.submenu = app; main.addItem(appItem)
        app.addItem(withTitle: "맘대로에 관하여", action: #selector(about), keyEquivalent: "").target = self
        app.addItem(.separator())
        app.addItem(withTitle: "맘대로 가리기", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        app.addItem(withTitle: "맘대로 종료", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        let play = NSMenu(title: "놀이터"); let playItem = NSMenuItem(); playItem.title = "놀이터"; playItem.submenu = play; main.addItem(playItem)
        for (title, action, key) in [("배치 저장",#selector(saveScene),"s"),("배치 불러오기",#selector(loadScene),"o"),("감상 모드",#selector(watch),"f"),("노는 방법",#selector(help),"?")] {
            let item = play.addItem(withTitle: title, action: action, keyEquivalent: key); item.target = self
        }
        let view = NSMenu(title: "윈도우"); let viewItem = NSMenuItem(); viewItem.title = "윈도우"; viewItem.submenu = view; main.addItem(viewItem)
        let full = view.addItem(withTitle: "전체 화면 전환", action: #selector(fullscreen), keyEquivalent: "f"); full.target = self; full.keyEquivalentModifierMask = [.command,.control]
        view.addItem(withTitle: "최소화", action: #selector(NSWindow.miniaturize(_:)), keyEquivalent: "m")
        NSApp.mainMenu = main
    }
    @objc private func about() { NSApp.orderFrontStandardAboutPanel(options: [.applicationName:"맘대로 — 중력 놀이터",.applicationVersion:"1.0",.credits:NSAttributedString(string:"공을 던지고, 중력을 돌리고, 우주를 구경해요.\n오프라인으로 실행되는 나만의 놀이터.")]) }
    @objc private func saveScene() { web.evaluateJavaScript("document.querySelector('#save-layout').click()") }
    @objc private func loadScene() { web.evaluateJavaScript("document.querySelector('#load-layout').click()") }
    @objc private func watch() { web.evaluateJavaScript("setWatching(!watching)") }
    @objc private func help() { web.evaluateJavaScript("document.querySelector('#help').click()") }
    @objc private func fullscreen() { window.toggleFullScreen(nil) }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage, replyHandler: @escaping (Any?, String?) -> Void) {
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url?.isFileURL == true, message.frameInfo.request.url?.standardizedFileURL.path == contentURL.path,
              let body = message.body as? [String:Any], let action = body["action"] as? String else { replyHandler(nil,"Invalid storage request"); return }
        do {
            switch action {
            case "load":
                if FileManager.default.fileExists(atPath: sceneURL.path) {
                    let data = try Data(contentsOf: sceneURL)
                    guard data.count <= 524288, let value = String(data: data, encoding: .utf8) else { throw CocoaError(.fileReadCorruptFile) }
                    replyHandler(value,nil)
                } else { replyHandler(NSNull(),nil) }
            case "save":
                guard let value = body["value"] as? String, let data = value.data(using: .utf8), data.count <= 524288,
                      let json = try JSONSerialization.jsonObject(with: data) as? [String:Any], json["version"] as? Int == 1 else { replyHandler(nil,"Invalid scene"); return }
                try FileManager.default.createDirectory(at: sceneURL.deletingLastPathComponent(), withIntermediateDirectories: true)
                try data.write(to: sceneURL, options: .atomic)
                replyHandler(true,nil)
            default: replyHandler(nil,"Unknown storage action")
            }
        } catch { replyHandler(nil,"배치를 저장하거나 불러올 수 없어요.") }
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = navigationAction.request.url
        decisionHandler(url?.isFileURL == true && url?.standardizedFileURL.path == contentURL?.path ? .allow : .cancel)
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { fail(error.localizedDescription) }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { fail(error.localizedDescription) }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard isTesting else { return }
        let checks = """
        const check=(value,label)=>{if(!value)throw new Error(label)};
        check(world.balls.length===44,'initial scene');
        check(document.querySelector('#gravity').max==='30','30g limit');
        check(document.querySelector('#attraction').max==='10','10x limit');
        for(const name of Object.keys(ENVIRONMENTS)) { preset(name);check(environment===name,'preset '+name); }
        preset('water');check(world.medium==='water','water drag');
        preset('storm');check(world.medium==='storm','storm force');
        setWatching(true);check(document.body.classList.contains('watch-mode'),'watch enter');
        setWatching(false);check(!document.body.classList.contains('watch-mode'),'watch exit');
        preset('sun');setPaused(true);
        world.holes=[{x:100,y:100,r:17,kind:'black',phase:0},{x:400,y:150,r:17,kind:'white',phase:0}];
        world.balls=[];world.add(100,100,12);world.step(1/240);check(world.recycled===1,'white hole recycle');
        check(world.balls.length===1,'ball retained');
        const snapshot=captureScene(world,{size,direction,gravity:28,raining:true,showTrails:true,chaos:false,environment:'sun'});
        await saveSceneData(JSON.stringify(snapshot));
        const saved=JSON.parse(await loadSceneData());check(saved.settings.gravity===28&&saved.holes.length===2,'native persistence');
        world.balls=[];restoreScene(world,saved);check(world.balls.length===1,'restore');
        return 'PASS: bundled offline page, 8 presets, 30g/10x controls, watch mode, white hole, native save/load';
        """
        let persistenceCheck = """
        const saved=JSON.parse(await loadSceneData());
        if(saved.settings.environment!=='sun'||saved.holes.length!==2||saved.balls.length!==1)throw new Error('Relaunch persistence failed');
        restoreScene(world,saved);
        return 'PASS: saved scene survives a separate app process';
        """
        web.callAsyncJavaScript(persistence ? persistenceCheck : checks, arguments: [:], in: nil, in: .page) { result in
            switch result {
            case .success(let message): print(message); NSApp.terminate(nil)
            case .failure(let error): self.fail("SMOKE FAIL: \(error)")
            }
        }
    }
    private func fail(_ message: String) {
        if isTesting { fputs(message+"\n",stderr); exit(1) }
        let alert=NSAlert();alert.messageText="놀이터를 열지 못했어요";alert.informativeText=message;alert.runModal();NSApp.terminate(nil)
    }
}
let application = NSApplication.shared
application.setActivationPolicy(.regular)
let delegate = AppDelegate()
application.delegate = delegate
application.run()
