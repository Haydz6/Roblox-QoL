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

IsFeatureEnabled("NewMessagePing3").then(async function(Enabled){
    if (!Enabled) return

    window.addEventListener("message", async function(event){
        if (event.source === window && event.type === "message" && event.data === "canpingformessage"){
            if (await chrome.runtime.sendMessage({type: "canpingformessage"})) window.postMessage("canpingformessage-confirm")
        }
    })

    InjectScript("newmessageping")
})

InjectScript("checkforinvite", "*://*.roblox.com/games/*")
InjectScript("AvatarPage", "*://*.roblox.com/my/avatar")

IsFeatureEnabled("AddRowToHomeFriends").then(function(Enabled){
    if (Enabled) InjectScript("addrowtohomefriends", "*://*.roblox.com/home*")
})
IsFeatureEnabled("FriendsHomeLastOnline").then(function(Enabled){
    if (Enabled) InjectScript("friendshomelastonline", "*://*.roblox.com/home*")
})
IsFeatureEnabled("CancelFriendRequest").then(function(Enabled){
    if (Enabled) InjectScript("CancelFriendRequest", "*://*.roblox.com/users/*/profile")
})
IsFeatureEnabled("RemoveAccessoryLimit").then(function(Enabled){
    if (Enabled) InjectScript("RemoveAccessoryLimit", "*://*.roblox.com/my/avatar*")
})