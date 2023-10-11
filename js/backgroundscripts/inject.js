const ContentScripts = [{
    "matches": [
        "*://*.roblox.com/my/avatar*"
    ],
    "js": [
        "js/pages/extraoutfits/createelements.js",
        "js/pages/extraoutfits/handleconversion.js",
        "js/pages/extraoutfits/createnormaloutfitelement.js",
        "js/pages/extraoutfits/main.js",
        "js/pages/extraoutfits/outfitsearch.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/users/friends*"
    ],
    "js": [
        "js/pages/friendhistory/createelements.js",
        "js/pages/friendhistory/loadpages.js",
        "js/pages/friendhistory/main.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/users/*/inventory*"
    ],
    "js": [
        "js/pages/activeprivateservers/createelements.js",
        "js/pages/activeprivateservers/getactiveprivateservers.js",
        "js/pages/activeprivateservers/getelements.js",
        "js/pages/activeprivateservers/main.js",

        "js/pages/purchasedgamesinventoryfix/getpurchasedgames.js",
        "js/pages/purchasedgamesinventoryfix/main.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/discover*"
    ],
    "css": [
        "css/playtime.css"
    ],
    "js": [
        "js/pages/fixfavouritespage/createelement.js",
        "js/pages/fixfavouritespage/createSortDiscover.js",
        "js/pages/fixfavouritespage/main.js",

        "js/pages/playtime/createcards.js",
        "js/pages/playtime/createelements.js",
        "js/pages/playtime/allgames.js",

        "js/pages/pinned/allgames.js",

        "js/pages/friendsactivity/allgames.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/discover*"
    ],
    "css": [
        "css/playtime.css"
    ],
    "js": [
        "js/pages/generalfixes/fixcontinuecuration.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/games/*"
    ],
    "css": [
        "css/playtime.css",
        "css/games.css"
    ],
    "js": [
        "js/pages/liveexperience/api.js",
        "js/pages/liveexperience/main.js",
        "js/pages/serverfilters/createelements.js",
        "js/pages/serverfilters/showservers.js",
        "js/pages/serverfilters/filterservers.js",
        "js/pages/serverfilters/addserverregion.js",
        "js/pages/serverfilters/filters.js",
        "js/pages/serverfilters/preferredregion.js",
        "js/pages/serverfilters/main.js",
        
        "js/pages/quickserverinvite/createelements.js",
        "js/pages/quickserverinvite/main.js",

        "js/pages/badges/achieved.js",

        "js/pages/recentservers/createelements.js",
        "js/pages/recentservers/isserveralive.js",
        "js/pages/recentservers/recentservers.js",
        "js/pages/recentservers/main.js",

        "js/pages/playtime/createelements.js",
        "js/pages/playtime/game.js",

        "js/pages/generalfixes/supportedplatforms.js",

        "js/pages/pinned/game.js",

        "js/pages/generalfixes/minimizeprivateservers.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/my/account*"
    ],
    "css": [
        "css/settings.css"
    ],
    "js": [
        "js/pages/settings/createelements.js",
        "js/pages/settings/main.js",
        "js/pages/settings/mainv2.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/feeds"
    ],
    "js": [
        "js/pages/feed/dynamicfeed.js",
        "js/pages/feed/feedpage.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/users/*/profile*"
    ],
    "css": [
        "css/theme.css"
    ],
    "js": [
        "js/pages/friendhistory/createelements.js",
        "js/pages/mutuals/createelements.js",
        "js/pages/mutuals/api.js",
        "js/pages/mutuals/profilepage.js",

        "js/pages/rolimonsprofile/createelements.js",
        "js/pages/trades/rolimons.js",
        "js/pages/trades/getuserinventory.js",
        "js/pages/rolimonsprofile/rolimons.js",

        "js/pages/badges/profilecount.js",

        "js/pages/profile/followsyou.js",
        "js/pages/profile/discord.js",
        "js/pages/profile/lastonline.js",

        "js/pages/bestfriend/profile.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/users/*/friends*"
    ],
    "js": [
        "js/pages/friendhistory/createelements.js",
        "js/pages/mutuals/createelements.js",
        "js/pages/mutuals/api.js",
        "js/pages/mutuals/friendspage.js",

        "js/pages/banned/clickonterminatedprofile.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/trades*",
        "*://*.roblox.com/users/*/trade"
    ],
    "css": [
        "css/trades.css",
        "css/assets.css"
    ],
    "js": [
        "js/pages/trades/tradeapi.js",
        "js/pages/trades/createelements.js",
        "js/pages/assets/createelements.js",
        "js/pages/trades/buttonhandlers.js",
        "js/pages/trades/getuserinventory.js",
        "js/pages/trades/rolimons.js",
        "js/pages/trades/addvaluestotradeoverview.js",
        "js/pages/trades/main.js",
        "js/pages/trades/addinfototrade.js",
        "js/pages/trades/createtrade.js",
        "js/pages/trades/openontrade.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/catalog/*"
    ],
    "css": [
        "css/assets.css",
        "css/trades.css"
    ],
    "js": [
        "js/pages/assets/createelements.js",
        "js/pages/assets/main.js",
        "js/pages/trades/rolimons.js",
        "js/pages/assets/addrolimons.js",
        "js/pages/assets/addinfo.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/catalog/*/*/item",
        "*://*.roblox.com/library/*/*/item"
    ],
   "js": [
        "js/pages/assets/itemfromimage.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/library/*"
    ],
    "css": [
        "css/assets.css",
        "css/trades.css"
    ],
    "js": [
        "js/pages/assets/createelements.js",
        "js/pages/assets/main.js",
        "js/pages/assets/addinfo.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/game-pass/*"
    ],
    "js": [
        "js/pages/assets/createelements.js",
        "js/pages/assets/addinfo.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/home",
        "*://*.roblox.com/home?*"
    ],
    "css": [
        "css/playtime.css"
    ],
    "js": [
        "js/pages/generalfixes/movehomefavouritestothirdrow.js",
        "js/pages/fixfavouritespage/replacehomelink.js",

        "js/pages/playtime/createelements.js",
        "js/pages/playtime/createcards.js",
        "js/pages/playtime/home.js",

        "js/pages/pinned/home.js",
        
        "js/pages/friendsactivity/home.js",
        
        "js/pages/bestfriend/home.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://create.roblox.com/dashboard*"
    ],
    "js": [
        "js/pages/generalfixes/versionhistory/download.js",
        "js/pages/generalfixes/versionhistory/newcreate.js"
    ],
    "run_at": "document_idle"
},
{
    "matches": [
        "*://*.roblox.com/places/*/update*"
    ],
    "js": [
        "js/pages/generalfixes/versionhistory/download.js",
        "js/pages/generalfixes/versionhistory/olddevelop.js"
    ],
    "run_at": "document_idle"
},
{
    "matches": [
        "*://*.roblox.com/transactions"
    ],
    "css": [
        "css/transactions.css"
    ],
    "js": [
        "js/pages/playtime/createelements.js",
        "js/pages/economy/csvtypeparser.js",
        "js/pages/economy/csvtojson.js",
        "js/pages/economy/summarycache.js",
        "js/pages/economy/summary.js",
        "js/pages/economy/chartcsv.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/groups/configure*"
    ],
    "css": [
        "css/transactions.css"
    ],
    "js": [
        "js/pages/playtime/createelements.js",
        "js/pages/economy/csvtypeparser.js",
        "js/pages/economy/csvtojson.js",
        "js/pages/economy/summarycache.js",
        "js/pages/economy/summary.js",
        "js/pages/economy/chartcsv.js"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/groups/*"
    ],
    "js": [
       "js/pages/banned/group.js",
       "js/pages/pinned/group.js"
    ],
    "css": [
        "css/groups.css"
    ],
    "run_at": "document_start"
},
{
    "matches": [
        "*://*.roblox.com/banned-user/*"
    ],
    "js": [
       "js/pages/banned/profile.js"
    ],
    "run_at": "document_start"
}]

function RemoveDuplicateFromArray(Array){
    const Exists = {}
    const NewArray = []

    for (let i = 0; i < Array.length; i++){
        const Value = Array[i]
        if (Exists[Value]) continue
        NewArray.push(Value)
        Exists[Value] = true
    }

    return NewArray
}

function ParseAndRunJS(TabId, JS, CSS, runAt){
    const FilteredJS = RemoveDuplicateFromArray(JS)
    const FilteredCSS = RemoveDuplicateFromArray(CSS)
    if (ManifestVersion > 2){
        if (FilteredJS.length > 0) {
            chrome.scripting.executeScript({files: FilteredJS, injectImmediately: runAt == "document_start", target: {tabId: TabId}})
        }
        if (FilteredCSS.length > 0) {
            chrome.scripting.insertCSS({files: FilteredCSS, target: {tabId: TabId}})
        }
    } else {
        for (let i = 0; i < FilteredJS.length; i++){
            chrome.tabs.executeScript(TabId, {file: FilteredJS[i], runAt: runAt})
        }
        for (let i = 0; i < FilteredCSS.length; i++){
            chrome.tabs.insertCSS(TabId, {file: FilteredCSS[i], runAt: runAt})
        }
    }
}

function ExecuteContentScriptsFromTab(Tab){
    const JS = {document_start: [], document_idle: []}
    const CSS = []

    const URL = Tab.url
    const TabId = Tab.id

    for (let i = 0; i < ContentScripts.length; i++){
        const Info = ContentScripts[i]

        for (let o = 0; o < Info.matches.length; o++){
            const Match = Info.matches[o]
            if (URL.match(Match.replace(/\*/g, "[^]*"))){
                if (Info.js) JS[Info.run_at || "document_start"].push(...Info.js)
                if (Info.css) CSS.push(...Info.css)
            }
        }
    }

    ParseAndRunJS(TabId, JS.document_start, CSS, "document_start")
    ParseAndRunJS(TabId, JS.document_idle, [], "document_idle")
}

BindToOnMessage("InjectContentScripts", false, function(_, Sender){
    ExecuteContentScriptsFromTab(Sender.tab)
})