const sleep = ms => new Promise(r => setTimeout(r, ms))

const Debugging = false
const WebServerURL = !Debugging && "https://qol.haydz6.com/" || "http://localhost:8192/"
const WebServerEndpoints = {Configuration: WebServerURL+"api/config/", Playtime: WebServerURL+"api/presence/", Themes: WebServerURL+"api/themes/", ThemesImg: WebServerURL+"themes/", AuthenticationV2: WebServerURL+"api/auth/v2/", Authentication: WebServerURL+"api/auth/", Outfits: WebServerURL+"api/outfits/", History: WebServerURL+"api/history/", Servers: WebServerURL+"api/servers/", Limiteds: WebServerURL+"api/limiteds/"}

const Manifest = chrome.runtime.getManifest()
const ExtensionVersion = Manifest.version
const ManifestVersion = Manifest["manifest_version"]

const EnabledFeatures = {DiscordPresenceJoin: true, ExternalDiscordPresence: false, DiscordPresence: false, GameFolders: true, OnlyReadNewLoginNotifierTitle: true, NewLoginNotifierTTSVolume: 0.6, ResizableChatBoxes: true, ShowStateAndCountryOnNewSessionOnly: true, ShowIPOnNewSession: false, StrictlyDisallowOtherIPs2: false, IgnoreSessionsFromSameIP: false, DisallowOtherIPs2: false, NewLoginNotifierTTS3: true, NewLoginNotifier3: true, FixContinueCuration: true, OutfitSearchbar: true, DetailedGroupTranscationSummary: true, ValueAndCategoriesOnOffer: true, AutodeclineLowTradeValue: false, AutodeclineLowTradeValueThreshold: 0, ShowSimilarUGCItems: false, Currency: "USD", AddUSDToRobux: true, ShowUSDOnAsset: true, AddSales: true, AddCreationDate: true, CountBadges: true, ShowValueOnTrade: true, ShowDemandOnTrade: true, ShowSummaryOnTrade: true, AddDownloadButtonToNewVersionHistory: true, AutodeclineOutboundTradeValue: false, AutodeclineOutboundTradeValueThreshold: 50, AutodeclineTradeValue: false, AutodeclineTradeValueThreshold: 50, Playtime: true, TradeNotifier: true, QuickDecline: true, QuickCancel: true, ProfileThemes: false, HideFooter: false, HideRobloxAds: false, MoveHomeFavouritesToThirdRow: true, HideDesktopAppBanner: true, RapOnProfile: true, ValueOnProfile: true, ValueDemandOnItem: true, ValuesOnOverview: true, RecentServers: true, TradeFilters: true, Mutuals2: true, ExploreAsset: false, QuickInvite: true, AwardedBadgeDates: true, ServerFilters: true, ExtraOutfits: true, FixFavouritesPage: true, ActivePrivateServers: true, NewMessagePing3: true, PurchasedGamesFix: true, FriendHistory: true, FriendNotifications: true, LiveExperienceStats: true, ServerRegions: true}
let AreEnabledFeaturesFetched = false

let ROBLOSECURITY
let UserId

let CSRFToken = ""

let CachedAuthKey = ""
let FetchingAuthKey = false

let LastMessagePingTime = 0

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
        GetAuthKey().then(function(Key){
            sendResponse(Key)
        })
        return true
    } else if (request.type === "forcereauthenticate"){
        LocalStorage.remove("AuthKey").then(function(){
            CachedAuthKey = ""
            GetAuthKey().then(function(Key){
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
        RequestFunc(request.URL, request.Method, request.Headers, request.Body, request.CredientalsInclude, request.BypassResJSON).then(async function([Success, Result, Response]){
            sendResponse([Success, Result || await Response.text(), Response && {ok: Response.ok, status: Response.status}])
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

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude, BypassResJSON){
    if (!Headers){
      Headers = {}
    }
  
    if (URL.search("roblox.com") > -1) {
        Headers["x-csrf-token"] = CSRFToken
    } else if (URL.search(WebServerURL) > -1){
        if (!URL.includes("/auth") || URL.includes("/reverify")){
            Headers.Authentication = await GetAuthKey()
        }
    }

    try {
        let Response = await fetch(URL, {method: Method, headers: Headers, body: Body, credentials: CredientalsInclude && "include" || "omit"})
        let ResBody
  
        // if ((Response.headers.get("access-control-expose-headers") || "").includes("X-CSRF-TOKEN"))
        let NewCSRFToken = Response.headers.get("x-csrf-token")
        if (NewCSRFToken){
            CSRFToken = NewCSRFToken
        }

        try {
            if (!BypassResJSON){
                ResBody = await (Response).json()
            }
        } catch {
            ResBody = {Success: false, Result: "???"}
        }
        
        if (!Response.ok && (ResBody?.message == "Token Validation Failed" || NewCSRFToken || ResBody?.errors?.[0]?.message == "Token Validation Failed") || ResBody?.Result == "Invalid authentication!"){
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
        CachedAuthKey = ""

        LocalStorage.remove("AuthKey").then(function(){
            UserId = null
            CachedAuthKey = ""

            if (!Change.removed){
                console.log("userid update")
                GetCurrentUserId()
            }
        })

        ROBLOSECURITY = Cookie.value
        UpdateExternalDiscordCookie(ROBLOSECURITY)
    }
})

chrome.cookies.get({name: ".ROBLOSECURITY", url: "https://roblox.com"}).then(function(Cookie){
    ROBLOSECURITY = Cookie.value
    UpdateExternalDiscordCookie(ROBLOSECURITY)
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
    const IsKilled = await IsFeatureKilled(Feature)
    if (IsKilled) return false

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

BindToOnMessage("FeatureSupported", false, function(Result){
    return chrome[Result.name] != undefined
})

BindToOnMessage("canpingformessage", false, function(){
    const Time = Date.now()
    if (Time-LastMessagePingTime < 100) return false
    LastMessagePingTime = Time
    return true
})

const window = null
let Discord = {}
let e = {}
let exports = {}
if (ManifestVersion > 2){
    const Scripts = ["js/backgroundscripts/authenticationv2.js", "js/backgroundscripts/killswitch.js", "js/backgroundscripts/newsessionnotifier.js", "js/backgroundscripts/friendhistory.js", "js/backgroundscripts/clientdiscordpresence.js", "js/backgroundscripts/discordpresence.js", "js/backgroundscripts/recentservers.js", "js/pages/trades/rolimons.js", "js/backgroundscripts/trades.js", "js/backgroundscripts/playtimeconversion.js", "js/pages/trades/tradeapi.js"]
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