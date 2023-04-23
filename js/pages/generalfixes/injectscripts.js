function InjectScript(Path){
    const Script = document.createElement("script")
    Script.src = chrome.runtime.getURL("js/pages/generalfixes/scriptinjections/"+Path+".js")
    document.head.appendChild(Script)
}

IsFeatureEnabled("NewMessagePing2").then(async function(Enabled){
    if (!Enabled) return

    InjectScript("newmessageping")
})