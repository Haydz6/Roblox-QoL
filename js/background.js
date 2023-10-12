const sleep = ms => new Promise(r => setTimeout(r, ms))

const Debugging = false
const WebServerURL = !Debugging && "https://roqol.io/" || "http://localhost:8192/"
const WebServerEndpoints = {Feed: WebServerURL+"api/feed/", Friends: WebServerURL+"api/friends/", Game: WebServerURL+"api/game/", User: WebServerURL+"api/user/", Configuration: WebServerURL+"api/config/", Playtime: WebServerURL+"api/presence/", Themes: WebServerURL+"api/themes/", ThemesImg: WebServerURL+"themes/", AuthenticationV2: WebServerURL+"api/auth/v2/", Authentication: WebServerURL+"api/auth/", Outfits: WebServerURL+"api/outfits/", History: WebServerURL+"api/history/", Servers: WebServerURL+"api/servers/", Limiteds: WebServerURL+"api/limiteds/"}

const Manifest = chrome.runtime.getManifest()
const ExtensionVersion = Manifest.version
const ManifestVersion = Manifest["manifest_version"]

const EnabledFeatures = {AvatarSearchbar: true, DontTryBypassHBA: false, FriendsActivity: true, LastOnline: true, TemporaryHomePageContainerFix: true, Feed: true, IgnoreSystemInboxNofitications: false, InboxNotifications: false, GroupShoutNotifications: {Enabled: false, Joined: true, Groups: []}, BestFriends: true, CSVChart: true, MinimizePrivateServers: true, SetThemeToSystem2: false, DiscordSocialLink: true, RemoveAccessoryLimit: true, CancelFriendRequest: true, AddRowToHomeFriends: false, ViewBannedUser: true, ViewBannedGroup: true, ShowFollowsYou: true, HideOffline: false, FriendsHomeLastOnline: true, PinnedGroups: true, PinnedGames: true, SupportedPlatforms: true, DiscordPresenceJoin: true, ExternalDiscordPresence: false, DiscordPresence: false, GameFolders: false, OnlyReadNewLoginNotifierTitle: true, NewLoginNotifierTTSVolume: 0.6, ResizableChatBoxes: true, ShowStateAndCountryOnNewSessionOnly: true, ShowIPOnNewSession: false, StrictlyDisallowOtherIPs2: false, IgnoreSessionsFromSameIP2: true, DisallowOtherIPs2: false, NewLoginNotifierTTS4: false, NewLoginNotifier3: true, FixContinueCuration: true, DetailedGroupTranscationSummary: true, ValueAndCategoriesOnOffer: true, AutodeclineLowTradeValue: false, AutodeclineLowTradeValueThreshold: 0, ShowSimilarUGCItems: false, Currency: "USD", AddUSDToRobux: true, ShowUSDOnAsset: true, AddSales: true, AddCreationDate: true, CountBadges: true, ShowValueOnTrade: true, ShowDemandOnTrade: true, ShowSummaryOnTrade: true, AddDownloadButtonToNewVersionHistory: true, AutodeclineOutboundTradeValue: false, AutodeclineOutboundTradeValueThreshold: 50, AutodeclineTradeValue: false, AutodeclineTradeValueThreshold: 50, Playtime: true, TradeNotifier: true, QuickDecline: true, QuickCancel: true, ProfileThemes: false, HideFooter: false, HideRobloxAds: false, MoveHomeFavouritesToThirdRow: true, HideDesktopAppBanner: true, RapOnProfile: true, ValueOnProfile: true, ValueDemandOnItem: true, ValuesOnOverview: true, RecentServers: true, TradeFilters: true, Mutuals2: true, ExploreAsset: false, QuickInvite: true, AwardedBadgeDates: true, ServerFilters: true, ExtraOutfits: true, FixFavouritesPage: true, ActivePrivateServers: true, NewMessagePing3: true, PurchasedGamesFix: true, FriendHistory: true, FriendNotifications: true, FriendRequestNotifications: false, LiveExperienceStats: true, ServerRegions: true, PreferredServerRegion: "None"}
let AreEnabledFeaturesFetched = false

const PaidFeatures = {FriendsActivity: 1, PinnedGames: 1, PinnedGroups: 1, FriendRequestNotifications: 1, BestFriends: 1, Feed: 1}
let CurrentSubscription = undefined

//let ROBLOSECURITY
let UserId

let CSRFToken = ""

let CachedAuthKey = ""
let FetchingAuthKey = false

let LastMessagePingTime = 0

const OnMessageBind = {}
const OnSettingChanged = {}

function BindToOnMessage(Type, Async, Callback){
    OnMessageBind[Type] = {Callback: Callback, Async: Async}
}

function ListenForSettingChanged(Setting, Callback){
    OnSettingChanged[Setting] = Callback
}

function PaymentRequiredFailure(SubscriptionInfo){
    CurrentSubscription = SubscriptionInfo.Current
    return CurrentSubscription
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (sender.id !== chrome.runtime.id){
        if (request.type === "installed"){
            sendResponse(true)
        }
        return
    }

    if (request.type === "notification"){
        if (chrome.notifications?.create) chrome.notifications.create("", request.notification)
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
            MessageBind.Callback(request, sender).then(function(Result){
                sendResponse(Result)
            })

            return true
        }

        sendResponse(MessageBind.Callback(request, sender))
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

let ActiveRobloxPages = []

function CheckUpdatedTab(URL, Id){
    if (URL && (URL.includes("web.roblox.com") || URL.includes("www.roblox.com"))){
        if (!ActiveRobloxPages.includes(Id)) ActiveRobloxPages.push(Id)
    } else {
        const Index = ActiveRobloxPages.indexOf(Id)
        if (Index !== -1) ActiveRobloxPages.splice(Index, 1)
    }
}

function TabUpdated(Tab){
    if (!Tab.url) chrome.tabs.get(Tab.id, function(tab){
        CheckUpdatedTab(tab.url, Tab.id)
    })
    else CheckUpdatedTab(Tab.url, Tab.id)
}

chrome.tabs.onUpdated.addListener(function(TabId, changeInfo){
    TabUpdated({id: TabId, url: changeInfo.url})
})

chrome.tabs.onRemoved.addListener(function(TabId){
    const Index = ActiveRobloxPages.indexOf(TabId)
    if (Index !== -1) ActiveRobloxPages.splice(Index, 1)
})

chrome.tabs.query({}, function(tabs){
    for (let i = 0; i < tabs.length; i++){
        TabUpdated(tabs[i])
    }
})


function generateBaseHeaders(URL, Body){
    const Page = ActiveRobloxPages[0]
    if (!Page) return false

    return new Promise((resolve) => {
        chrome.tabs.sendMessage(Page, {type: "HBA", URL: URL, Body: Body}, undefined, function(headers){
            resolve(headers || {}) //null if failed :(
        })
    })
}

let HBAclient

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude, BypassResJSON){
    if (!HBAclient){
        HBAclient = new HBAClient({onSite: false}) //init after imported
    }
    if (!Headers){
      Headers = {}
    }

    const IsQOLAPI = URL.search(WebServerURL) > -1
  
    if (URL.search("roblox.com") > -1) {
        Headers["x-csrf-token"] = CSRFToken

        if (await HBAclient.isUrlIncludedInWhitelist(URL)){
            const Generated = await generateBaseHeaders(URL, Body)
            if (Generated === false){
                if (await IsFeatureKilled("DontTryBypassHBA")){
                    return [false, {Success: false, Result: "Open a roblox page"}]
                }
            }
            Headers = {...Generated, ...Headers}
        }
    } else if (IsQOLAPI && !URL.includes("disabled_features")){
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

        if (IsQOLAPI && Response.status === 402){
            PaymentRequiredFailure(ResBody)
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

function GetBrowser(){
    var aKeys = ["MSIE", "Firefox", "Safari", "Chrome", "Opera"];
    var sUsrAg = navigator.userAgent;
    var nIdx = aKeys.length - 1;
    
    while(nIdx > -1 && sUsrAg.indexOf(aKeys[nIdx]) === -1){
        nIdx--;
    }  

    var browserStr = "Unknown";
    if (nIdx > -1){
        browserStr = aKeys[nIdx]
    }

    return browserStr
}

function CallLogin(){
    RequestFunc(WebServerEndpoints.User+"login", "POST")
}

chrome.cookies.onChanged.addListener(function(Change){
    const Cookie = Change.cookie
    if (Cookie.domain.search("roblox.com") > -1 && Cookie.httpOnly && Cookie.name === ".ROBLOSECURITY"){
        UserId = null
        CachedAuthKey = ""

        LocalStorage.remove("AuthKey").then(function(){
            UserId = null
            CachedAuthKey = ""

            if (!Change.removed){
                GetCurrentUserId()
            }
        })

        //ROBLOSECURITY = Cookie.value
        //UpdateExternalDiscordCookie(ROBLOSECURITY)
        CallLogin()
    }
})

// let CookieGetFunc
// if (ManifestVersion > 2) {
//     CookieGetFunc = chrome.cookies.get
// } else {
//     CookieGetFunc = browser.cookies.get
// }

// CookieGetFunc({name: ".ROBLOSECURITY", url: "https://roblox.com"}).then(function(Cookie){
//     if (!Cookie) return //Not logged in

//     //ROBLOSECURITY = Cookie.value
//     //UpdateExternalDiscordCookie(ROBLOSECURITY)
//     CallLogin()
// })

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

async function GetSubscription(){ //Replace with fetch call
    while (CurrentSubscription === true){
        await sleep(20)
    }

    if (!CurrentSubscription){
        CurrentSubscription = true
        const [Success, Body] = await RequestFunc(WebServerEndpoints.User+"subscription", "GET")
        if (!Success){
            CurrentSubscription = 0
        } else {
            CurrentSubscription = Body.Subscription
        }
    }

    return CurrentSubscription
}

async function PaidForFeature(Feature){
    const SubscriptionNeeded = PaidFeatures[Feature]
    if (!SubscriptionNeeded) return true
    return await GetSubscription() >= SubscriptionNeeded
}

async function IsFeatureEnabled(Feature){
    await FetchAllFeaturesEnabled()
    const IsKilled = await IsFeatureKilled(Feature)
    if (IsKilled) return false
    if (!PaidForFeature(Feature)) return false

    return EnabledFeatures[Feature]
}

async function SetFeatureEnabled(Feature, Enabled){
    await FetchAllFeaturesEnabled()

    EnabledFeatures[Feature] = Enabled
    LocalStorage.set("settings", JSON.stringify(EnabledFeatures))
    
    const Callback = OnSettingChanged[Feature]
    if (Callback) Callback(Enabled)
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

BindToOnMessage("FeatureSupported", false, function(Result){
    if (Result.name === "viewbanneduser"){
        return BannedUsersSupported
    }

    return chrome[Result.name] != undefined
})

BindToOnMessage("canpingformessage", false, function(){
    const Time = Date.now()
    if (Time-LastMessagePingTime < 100) return false
    LastMessagePingTime = Time
    return true
})

BindToOnMessage("PaidForFeature", true, function(request){
    return PaidForFeature(request.feature)
})

BindToOnMessage("PaidFeatures", false, function(){
    return PaidFeatures
})

BindToOnMessage("GetSubscription", true, function(){
    return GetSubscription()
})

BindToOnMessage("PaymentRequired", false, function(request){
    return PaymentRequiredFailure(request.result)
})

const BrowserAction = chrome.action || chrome.browserAction
if (BrowserAction?.onClicked) BrowserAction.onClicked.addListener(() => {
    chrome.tabs.create({url: "https://www.roblox.com/my/account?tab=robloxqol"})
})

if (ManifestVersion > 2){
    const Scripts = ["js/modules/hbaClient.js", "js/backgroundscripts/authenticationv2.js", "js/backgroundscripts/inject.js", "js/backgroundscripts/killswitch.js", "js/backgroundscripts/newsessionnotifier.js", "js/backgroundscripts/friendsactivity.js", "js/backgroundscripts/friendhistory.js", "js/backgroundscripts/clientdiscordpresence.js", "js/backgroundscripts/discordpresence.js", "js/backgroundscripts/recentservers.js", "js/pages/trades/rolimons.js", "js/backgroundscripts/trades.js", "js/pages/trades/tradeapi.js", "js/backgroundscripts/hideoffline.js", "js/backgroundscripts/bannedprofile.js", "js/backgroundscripts/friendrequest.js", "js/backgroundscripts/GroupShoutNotifications.js", "js/backgroundscripts/inboxnotifications.js", "js/backgroundscripts/Feed.js"]
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

CallLogin()
GetSubscription()