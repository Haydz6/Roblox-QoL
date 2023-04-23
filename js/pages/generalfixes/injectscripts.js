async function InjectScript(Path, URLMatch){
    if (URLMatch){
        const Regexp = new RegExp(URLMatch.replace(/\*/g, "[^ ]*"))
        if (!Regexp.test(window.location.href)) return
    }

    const Script = document.createElement("script")
    Script.src = chrome.runtime.getURL("js/pages/generalfixes/scriptinjections/"+Path+".js")

    while (!document.head) await new Promise(r => setTimeout(r, 20))

    document.head.appendChild(Script)
}

IsFeatureEnabled("NewMessagePing2").then(async function(Enabled){
    if (!Enabled) return

    InjectScript("newmessageping")
})

InjectScript("checkforinvite", "*://*.roblox.com/games/*")