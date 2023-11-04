async function InjectScript(Path, URLMatch, FullPath, Attrs){
    if (URLMatch){
        const Regexp = new RegExp(URLMatch.replace(/\*/g, "[^ ]*"))
        if (!Regexp.test(window.location.href)) return
    }

    const Script = document.createElement("script")
    Script.id = "injectedscript-"+Path
    Script.src = chrome.runtime.getURL(FullPath ? Path : "js/pages/generalfixes/scriptinjections/"+Path+".js")

    while (!document.head) await new Promise(r => setTimeout(r, 20))

    if (Attrs) for ([k, v] of Object.entries(Attrs)){
        Script.setAttribute(k, v)
    }
    document.head.appendChild(Script)
}

IsFeatureEnabled("NewMessagePing3").then(async function(Enabled){
    if (!Enabled) return

    window.addEventListener("message", async function(event){
        if (event.source === window && event.type === "message" && event.data === "canpingformessage"){
            if (await chrome.runtime.sendMessage({type: "canpingformessage"})) window.postMessage("canpingformessage-confirm")
        }
    })

    InjectScript("newmessageping", "*://www.roblox.com/*") //Stop trying to inject into api pages
    InjectScript("newmessageping", "*://web.roblox.com/*") //Stop trying to inject into api pages
})

InjectScript("checkforinvite", "*://*.roblox.com/games/*", undefined, {search: window.location.search})
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
IsFeatureEnabled("TradeAge").then(function(Enabled){
    if (Enabled) InjectScript("TradeAge", "*://*.roblox.com/trades*")
})