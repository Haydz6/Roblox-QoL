async function InjectScript(Path, URLMatch, FullPath, Attrs, RunFirst){
    if (URLMatch){
        function Matches(URL){
            const Regexp = new RegExp(URL.replace(/\*/g, "[^ ]*"))
            return Regexp.test(window.location.href)
        }

        const [_, NewURL] = ModifyURLForLocale(URLMatch)

        if (!Matches(URLMatch) && !Matches(NewURL)) return
    }

    const Script = document.createElement("script")
    Script.id = "injectedscript-"+Path
    Script.src = chrome.runtime.getURL(FullPath ? FullPath : "js/pages/generalfixes/scriptinjections/"+Path+".js")

    if (Attrs) for ([k, v] of Object.entries(Attrs)){
        Script.setAttribute(k, v)
    }

    if (RunFirst){
        try {
            ChildRemoved(document.documentElement, function(Item){
                if (Item === Script) document.documentElement.insertBefore(Script, document.documentElement.children[0])
            })
            
            document.documentElement.insertBefore(Script, document.documentElement.children[0])
        } catch (error) {console.log(error)}
    }

    while (!document.head) await new Promise(r => setTimeout(r, 20))

    document.head.appendChild(Script)

    return Script
}

// InjectScript("bestfriendpresence", "*://*.roblox.com/users/*/profile", "js/pages/bestfriend/presence.js", undefined, true)
// InjectScript("bestfriendpresence", "*://*.roblox.com/home*", "js/pages/bestfriend/presence.js", undefined, true)
InjectScript("xhrwrapper", "*://*.roblox.com/*", "js/pages/bestfriend/xhrwrapper.js", undefined, true)
InjectScript("bestfriendpresence", "*://*.roblox.com/*", "js/pages/bestfriend/presence.js", undefined, true)
InjectScript("bestfriendinventory", "*://www.roblox.com/users/*/inventory*", "js/pages/bestfriend/inventory.js", undefined, true)
InjectScript("viewoffsaleitems", "*://create.roblox.com/*", "js/pages/generalfixes/scriptinjections/viewoffsaleitems.js", undefined, true)

IsFeatureEnabled("FixAvatarPageFirefoxMobileMenu").then(function(Enabled){
    if (!Enabled) return
    chrome.runtime.sendMessage({type: "UserAgent"}).then(function(UserAgent){
        if (UserAgent.toLowerCase().includes("android") && UserAgent.toLowerCase().includes("firefox")) InjectScript("firefoxandroidavatartabs", "*://www.roblox.com/my/avatar")
    })
})

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
IsFeatureEnabled("NameOnHomeFriends").then(function(Enabled){
    if (Enabled) InjectScript("FriendsName", "*://*.roblox.com/home*")
})
IsFeatureEnabled("ExtraOutfits").then(function(Enabled){
    if (Enabled) InjectScript("alertavatarchange", "*://*.roblox.com/my/avatar*")
})

// IsFeatureEnabled("BestFriendPresenceV3").then(function(Enabled){
//     if (Enabled){
//         InjectScript("bestfriendpresence", "*://*.roblox.com/users/*/profile", "js/pages/bestfriend/presence.js")
//         InjectScript("bestfriendpresence", "*://*.roblox.com/home*", "js/pages/bestfriend/presence.js")
//     }
// })