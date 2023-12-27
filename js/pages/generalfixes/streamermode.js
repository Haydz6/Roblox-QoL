IsFeatureEnabled("StreamerMode").then(async function(Enabled){
    const Body = await WaitForTag("body")

    const List = ["StreamerMode", "HideAge", "HideSensitiveInfo", "HideRobux", "HideGroupRobux", "HideServerInvites", "HideNames", "HideSocials", "HideGroupPayouts"]
    for (let i = 0; i < List.length; i++){
        const Setting = List[i]
        IsFeatureEnabled(Setting).then(function(Enabled){
            if (Enabled) Body.setAttribute(Setting, "true")
        })
    }
})

let StreamerModeKeybind = null
document.addEventListener("keypress", function(e){
    if (e.code === StreamerModeKeybind){
        SetFeatureEnabled("StreamerMode", document.body.getAttribute("StreamerMode") === "true" ? false : true)
    }
})

chrome.runtime.onMessage.addListener(function(Message){
    if (Message.type === "StreamerMode"){
        if (Message.setting !== "StreamerModeKeybind") document.body.setAttribute(Message.setting, Message.enabled)
        else StreamerModeKeybind = Message.enabled
    }
})

IsFeatureEnabled("StreamerModeKeybind").then(function(Keybind){
    StreamerModeKeybind = Keybind
})