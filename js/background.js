const sleep = ms => new Promise(r => setTimeout(r, ms))

const Debugging = false
const WebServerURL = !Debugging && "https://qol.haydz6.com/" || "http://localhost:8192/"
const WebServerEndpoints = {Playtime: WebServerURL+"api/presence/", Themes: WebServerURL+"api/themes/", ThemesImg: WebServerURL+"themes/", AuthenticationV2: WebServerURL+"api/auth/v2/", Authentication: WebServerURL+"api/auth/", Outfits: WebServerURL+"api/outfits/", History: WebServerURL+"api/history/", Servers: WebServerURL+"api/servers/", Limiteds: WebServerURL+"api/limiteds/"}

const ManifestVersion = chrome.runtime.getManifest()["manifest_version"]

const EnabledFeatures = {ShowUSDOnAsset: true, AddSales: true, AddCreationDate: true, CountBadges: true, ShowValueOnTrade: true, ShowDemandOnTrade: true, ShowSummaryOnTrade: true, AddDownloadButtonToNewVersionHistory: true, AutodeclineOutboundTradeValue: false, AutodeclineOutboundTradeValueThreshold: 50, AutodeclineTradeValue: false, AutodeclineTradeValueThreshold: 50, Playtime: true, TradeNotifier: true, QuickDecline: true, QuickCancel: true, ProfileThemes: false, HideFooter: false, HideRobloxAds: false, MoveHomeFavouritesToThirdRow: true, HideDesktopAppBanner: true, RapOnProfile: true, ValueOnProfile: true, ValueDemandOnItem: true, ValuesOnOverview: true, RecentServers: true, TradeFilters: true, Mutuals: false, ExploreAsset: false, QuickInvite: true, AwardedBadgeDates: true, ServerFilters: true, ExtraOutfits: true, FixFavouritesPage: true, ActivePrivateServers: true, NewMessagePing: true, PurchasedGamesFix: true, FriendHistory: true, FriendNotifications: true, LiveExperienceStats: true, ServerRegions: true}
let AreEnabledFeaturesFetched = false

let ROBLOSECURITY
let UserId

let CSRFToken = ""

let CachedAuthKey = ""
let FetchingAuthKey = false

const OnMessageBind = {}

function BindToOnMessage(Type, Async, Callback){
    OnMessageBind[Type] = {Callback: Callback, Async: Async}
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (sender.id !== chrome.runtime.id){
        if (request.type === "installed"){
            sendResponse(true)
        }
        return
    }

    if (request.type === "notification"){
        chrome.notifications.create("", request.notification)
    } else if (request.type === "authentication"){
        GetAuthKeyV2().then(function(Key){
            sendResponse(Key)
        })
        return true
    } else if (request.type === "forcereauthenticate"){
        CachedAuthKey = ""
        LocalStorage.remove("AuthKey").then(function(){
            GetAuthKeyV2().then(function(Key){
                sendResponse(Key)
            })
        })
        return true
    } else if (request.type === "reauthenticate"){
        ReauthenticateV2().then(function(Key){
            sendResponse(Key)
        })
        return true
    } else if (request.type === "changesetting"){
        SetFeatureEnabled(request.feature, request.enabled)
    } else if (request.type === "getsettings"){
        FetchAllFeaturesEnabled().then(() => {
            sendResponse(EnabledFeatures)
        })
        //sendResponse(EnabledFeatures)
        return true
    } else if (request.type === "fetch"){
        RequestFunc(request.URL, request.Method, request.Headers, request.Body, request.CredientalsInclude, request.BypassResJSON).then(function(Result){
            sendResponse(Result)
        })
        return true
    }
    
    const MessageBind = OnMessageBind[request.type]
    if (MessageBind){
        if (MessageBind.Async){
            MessageBind.Callback(request).then(function(Result){
                sendResponse(Result)
            })

            return true
        }

        sendResponse(MessageBind.Callback(request))
    }
})

async function GetCurrentUserId(){
    while (UserId === true) await sleep(100)

    if (!UserId){
        UserId = true

        const [Success, Response] = await RequestFunc("https://users.roblox.com/v1/users/authenticated", "GET", undefined, undefined, true)
        
        if (!Success){
            UserId = null
        } else {
            UserId = Response.id
        }
    }

    return UserId
}

async function SetFavouriteGame(UniverseId, Favourited){
    return RequestFunc(`https://games.roblox.com/v1/games/${UniverseId}/favorites`, "POST", undefined, JSON.stringify({isFavorited: Favourited}), true)
}

async function GetAuthKeyV1(){
    while (FetchingAuthKey){
        await sleep(100)
    }
    
    if (CachedAuthKey != ""){
        return CachedAuthKey
    }

    FetchingAuthKey = true
    StoredKey = await LocalStorage.get("AuthKey")
    
    if (StoredKey){
        CachedAuthKey = StoredKey
        FetchingAuthKey = false
        return CachedAuthKey
    }
    
    const [GetFavoriteSuccess, FavoriteResult] = await RequestFunc(WebServerEndpoints.Authentication+"fetch", "POST", undefined, JSON.stringify({UserId: parseInt(await GetCurrentUserId())}))
    
    if (!GetFavoriteSuccess){
        FetchingAuthKey = false
        return CachedAuthKey
    }
    
    UniverseId = FavoriteResult.UniverseId
    
    const [FavouriteSuccess] = await SetFavouriteGame(UniverseId, true)
    
    if (!FavouriteSuccess){
        FetchingAuthKey = false
        return CachedAuthKey
    }
    
    const [ServerSuccess, ServerResult] = await RequestFunc(WebServerEndpoints.Authentication+"verify", "POST", undefined, JSON.stringify({UserId: parseInt(await GetCurrentUserId())}))
    
    if (ServerSuccess){
        CachedAuthKey = ServerResult.Key
        LocalStorage.set("AuthKey", CachedAuthKey)
    }
    
    new Promise(async function(){
        while (true){
            const [FavSuccess] = await SetFavouriteGame(UniverseId, false)
    
            if (FavSuccess) break
            await sleep(1000)
        }
    })
    
    FetchingAuthKey = false
    
    return CachedAuthKey
}

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude, BypassResJSON){
    if (!Headers){
      Headers = {}
    }
  
    if (URL.search("roblox.com") > -1) {
        Headers["x-csrf-token"] = CSRFToken
    } else if (URL.search(WebServerURL) > -1){
        if (URL.search("/auth") == -1 || URL.search("/reverify") > -1){
            Headers.Authentication = await GetAuthKeyV2()
        }
    }

    try {
        let Response = await fetch(URL, {method: Method, headers: Headers, body: Body, credentials: CredientalsInclude && "include" || "omit"})
        let ResBody
  
        if (!BypassResJSON){
            ResBody = await (Response).json()
        }
  
        let NewCSRFToken = Response.headers.get("x-csrf-token")
  
        if (NewCSRFToken){
            CSRFToken = NewCSRFToken
        }
  
        if (!Response.ok && (ResBody?.message == "Token Validation Failed" || ResBody?.errors?.[0]?.message == "Token Validation Failed") || ResBody?.Result == "Invalid authentication!"){
            if (ResBody?.Result == "Invalid authentication!"){
                CachedAuthKey = ""
                await LocalStorage.remove("AuthKey")
            }
  
            return await RequestFunc(URL, Method, Headers, Body, CredientalsInclude)
        }
  
        return [Response.ok, ResBody, Response]
    } catch (err) {
        console.log(err)
        return [false, {Success: false, Result: "???"}]
    }
}

const LocalStorage = {set: function(key, value){
    return chrome.storage.local.set({[key]: value})
}, get: function(key){
    return new Promise((resolve) => {
        chrome.storage.local.get(key, function(Result){
            resolve(Result[key])
        })
    })
}, remove: async function(key){
    return chrome.storage.local.remove(key)
}}

chrome.cookies.onChanged.addListener(function(Change){
    const Cookie = Change.cookie
    if (Cookie.domain.search("roblox.com") > -1 && Cookie.httpOnly && Cookie.name === ".ROBLOSECURITY"){
        UserId = null

        if (!Change.removed){
            console.log("userid update")
            GetCurrentUserId()
        }
    }
})

async function FetchAllFeaturesEnabled(){
    if (!AreEnabledFeaturesFetched){
        const NewSettings = await LocalStorage.get("settings")

        if (NewSettings){
            for (const [key, value] of Object.entries(JSON.parse(NewSettings))){
                EnabledFeatures[key] = value
            }
        }

        AreEnabledFeaturesFetched = true
    }
}

async function IsFeatureEnabled(Feature){
    await FetchAllFeaturesEnabled()
    return EnabledFeatures[Feature]
}

async function SetFeatureEnabled(Feature, Enabled){
    await FetchAllFeaturesEnabled()

    EnabledFeatures[Feature] = Enabled
    LocalStorage.set("settings", JSON.stringify(EnabledFeatures))
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

if (ManifestVersion > 2){
    const Scripts = ["js/backgroundscripts/authenticationv2.js", "js/backgroundscripts/friendhistory.js", "js/backgroundscripts/recentservers.js", "js/pages/trades/rolimons.js", "js/backgroundscripts/trades.js", "js/backgroundscripts/playtimeconversion.js", "js/pages/trades/tradeapi.js"]
    const FullScriptURLs = []

    for (let i = 0; i < Scripts.length; i++){
        FullScriptURLs.push(chrome.runtime.getURL(Scripts[i]))
    }

    try {
        importScripts(...FullScriptURLs)
    } catch (err) {
        console.error(err.message)
    }
}