const sleep = ms => new Promise(r => setTimeout(r, ms))

const EnabledFeatures = {}
const PaidFeatures = {}
let AreEnabledFeaturesFetched = false
let ArePaidFeaturesFetched = false

let CurrentSubscription = undefined

let UserId
let CSRFToken = ""

const Debugging = true
const IgnoreDisabledFeatures = false
const UseV2Waiters = false

const WebServerURL = !Debugging && "https://roqol.io/" || "http://localhost:8192/"
const WebServerEndpoints = {User: WebServerURL+"api/user/", Configuration: WebServerURL+"api/config/", Voice: WebServerURL+"api/voice/", Ads: WebServerURL+"api/ads/", Feed: WebServerURL+"api/feed/", Friends: WebServerURL+"api/friends/", BestFriends: WebServerURL+"api/bestfriends/", Pinned: WebServerURL+"api/pinned/", Game: WebServerURL+"api/game/", UGC: WebServerURL+"api/ugc/", Currency: WebServerURL+"api/currency/", Playtime: WebServerURL+"api/presence/", Themes: WebServerURL+"api/themes/", ThemesImg: WebServerURL+"themes/", Authentication: WebServerURL+"api/auth/", Outfits: WebServerURL+"api/outfits/", History: WebServerURL+"api/history/", Servers: WebServerURL+"api/servers/", Limiteds: WebServerURL+"api/limiteds/"}
const SubscriptionToName = ["Free", "Pro"]

function WaitForClassV2(ClassName){
  return new Promise((resolve) => {
    
    const Mutator = new MutationObserver(async function(){
      Mutator.disconnect()
      await sleep(0)

      const Element = document.getElementsByClassName(ClassName)[0]
      if (Element) resolve(Element)
      else Mutator.observe(document, {childList: true, subtree: true})
    })
    Mutator.observe(document, {childList: true, subtree: true})
  })
}

function WaitForIdV2(Id){
  return new Promise((resolve) => {
    
    const Mutator = new MutationObserver(async function(){
      Mutator.disconnect()
      await sleep(0)

      const Element = document.getElementById(Id)
      if (Element) resolve(Element)
      else Mutator.observe(document, {childList: true, subtree: true})
    })
    Mutator.observe(document, {childList: true, subtree: true})
  })
}

function WaitForQuerySelectorV2(Query){
  return new Promise((resolve) => {
    
    const Mutator = new MutationObserver(async function(){
      Mutator.disconnect()
      await sleep(0)

      const Element = document.querySelector(Query)
      if (Element) resolve(Element)
      else Mutator.observe(document, {childList: true, subtree: true})
    })
    Mutator.observe(document, {childList: true, subtree: true})
  })
}

function WaitForTagV2(Tag){
  return new Promise((resolve) => {
    
    const Mutator = new MutationObserver(async function(){
      Mutator.disconnect()
      await sleep(0)

      const Element = document.getElementsByTagName(Tag)[0]
      if (Element) resolve(Element)
      else Mutator.observe(document, {childList: true, subtree: true})
    })
    Mutator.observe(document, {childList: true, subtree: true})
  })
}

function WaitForChildIndexV2(Parent, Index){
  return new Promise((resolve) => {
    
    const Mutator = new MutationObserver(async function(){
      Mutator.disconnect()
      await sleep(0)

      const Element = Parent.children[Index || 0]
      if (Element) resolve(Element)
      else Mutator.observe(Parent, {childList: true})
    })
    Mutator.observe(Parent, {childList: true})
  })
}

function WaitForClassPathV2(Parent, ...Paths){
  function WaitForClassInElement(Element, Class){
    return new Promise((resolve) => {
      const Mutator = new MutationObserver(async function(){
        Mutator.disconnect()
        await sleep(0)

        const Child = Element.getElementsByClassName(Class)[0]
        if (Child) resolve(Child)
        else Mutator.observe(Parent, {childList: true})
      })
      Mutator.observe(Parent, {childList: true})
    })
  }

  return new Promise(async(resolve) => {
    let CurrentElement = Parent
    for (let i = 0; i < Paths.length; i++){
      CurrentElement = await WaitForClassInElement(CurrentElement, Paths[i])
    }

    resolve(CurrentElement)
  })
}

function FindFirstClass(ClassName){
  return document.getElementsByClassName(ClassName)[0]
}

function FindFirstId(Id){
  return document.getElementById(Id)
}

function FindFirstTag(Tag){
  return document.getElementsByTagName(Tag)[0]
}

function WaitForChildIndex(Parent, Index){
  if (UseV2Waiters) return WaitForChildIndexV2(Parent, Index)

  function Look(resolve){
    let Element = null
  
    Element = Parent.children[Index || 0]
    if (Element == undefined) {
      setTimeout(Look, 50, resolve)
      return
    }
  
    resolve(Element)
  }

  return new Promise((resolve) => {
    Look(resolve)
  })
}

function WaitForClass(ClassName, Timeout){
  if (UseV2Waiters) return WaitForClassV2(ClassName)

  let CurrentTime = 0

  function Look(resolve){
    let Element = null
  
    Element = FindFirstClass(ClassName)
    if (Element == null){
      CurrentTime += 0.05
      if (Timeout && CurrentTime >= Timeout) return resolve()

      setTimeout(Look, 50, resolve)
      return
    }
  
    resolve(Element)
  }

  return new Promise((resolve) => {
    Look(resolve)
  })
}

function WaitForId(Id){
  if (UseV2Waiters) return WaitForIdV2(Id)

  function Look(resolve){
    let Element = null
  
    Element = FindFirstId(Id)
    if (Element == null){
      setTimeout(Look, 50, resolve)
      return
    }
  
    resolve(Element)
  }

  return new Promise((resolve) => {
    Look(resolve)
  })
}

function WaitForQuerySelector(Query){
  if (UseV2Waiters) return WaitForQuerySelectorV2(Query)

  function Look(resolve){
    let Element = null
  
    Element = document.querySelector(Query)
    if (Element == null){
      setTimeout(Look, 50, resolve)
      return
    }
  
    resolve(Element)
  }

  return new Promise((resolve) => {
    Look(resolve)
  })
}

function WaitForTag(Tag){
  if (UseV2Waiters) return WaitForTagV2(Tag)

  function Look(resolve){
    let Element = null
  
    Element = FindFirstTag(Tag)
    if (Element == null){
      setTimeout(Look, 50, resolve)
      return
    }
  
    resolve(Element)
  }

  return new Promise((resolve) => {
    Look(resolve)
  })
}

async function FindFromAttribute(AttributeName, AttributeValue){
  let Element
  
  while (true){
    Element = document.querySelector(`[${AttributeName}="${AttributeValue}"]`)

    if (Element != undefined){
      break
    }

    await sleep(50)
  }

  return Element
}

function FindClassPath(Element, ...Paths){
  let LastElement = Element

  for (let i = 0; i < Paths.length; i++){
    const NewElement = LastElement.getElementsByClassName(Paths[i])[0]
      
    if (NewElement){
      LastElement = NewElement
    } else return
  }

  return LastElement
}

async function WaitForClassPath(Element, ...Paths){
  if (UseV2Waiters) return await WaitForClassPathV2(Element, Paths)

  let LastElement = Element

  for (let i = 0; i < Paths.length; i++){
    while (true){
      const NewElement = LastElement.getElementsByClassName(Paths[i])[0]
      
      if (NewElement){
        LastElement = NewElement
        break
      }

      await sleep(50)
    }
  }

  return LastElement
}

async function WaitForTagPath(Element, ...Paths){
  let LastElement = Element

  for (let i = 0; i < Paths.length; i++){
    while (true){
      const NewElement = LastElement.getElementsByTagName(Paths[i])[0]
      
      if (NewElement){
        LastElement = NewElement
        break
      }

      await sleep(50)
    }
  }

  return LastElement
}

async function GetUserId(){
  if (UserId){
    return UserId
  }

  while (!document.head) await sleep(100)

  while (true){
    const UserIdElement = document.head.querySelector("[name~=user-data][data-userid]")

    if (!UserIdElement){
      await sleep(100)
    } else {
      UserId = UserIdElement.getAttribute("data-userid")
      break
    }
  }

  return UserId
}

async function GetUniverseIdFromGamePage(){
  const GameDetails = await WaitForId("game-detail-meta-data")
  let UniverseId

  while (!UniverseId){
    await sleep(100)
    UniverseId = GameDetails.getAttribute("data-universe-id")
  }

  return parseInt(UniverseId)
}

async function GetPlaceIdFromGamePage(){
  const GameDetails = await WaitForId("game-detail-page")
  let PlaceId

  while (!PlaceId){
    await sleep(100)
    PlaceId = GameDetails.getAttribute("data-place-id")
  }

  return parseInt(PlaceId)
}

function RequestFuncCORSBypass(URL, Method, Headers, Body, CredientalsInclude, BypassResJSON){
  return chrome.runtime.sendMessage({type: "fetch", URL: URL, Method: Method, Headers: Headers, Body: Body, CredientalsInclude: CredientalsInclude, BypassResJSON: BypassResJSON})
}

const hbaClient = new HBAClient({
  onSite: true,
})

const BackgroundEventListeners = {}
function ListenToEventFromBackground(Type, Callback){
  BackgroundEventListeners[Type] = Callback
}

chrome.runtime.onMessage.addListener(function(Message, _, sendResponse){
  if (Message.type === "HBA"){
    hbaClient.generateBaseHeaders(Message.URL, Message.CredientalsInclude, Message.Body).then(function(Headers){
      sendResponse(Headers)
    })
    return true
  } else if (Message.type === "Reauthenticating"){
    CachedAuthKey = Message.AuthKey || ""
    return true
  }

  const Listener = BackgroundEventListeners[Message.type]
  if (Listener) Listener(Message)
})

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude, BypassResJSON){
  if (!Headers){
    Headers = {}
  }

  const IsQOLAPI = URL.search(WebServerURL) > -1

  if (URL.search("roblox.com") > -1) {
    Headers["x-csrf-token"] = CSRFToken
    Headers = {...(await hbaClient.generateBaseHeaders(URL, CredientalsInclude || false, Body)), ...Headers}
  } else if (IsQOLAPI){
    if (URL.search("/auth") == -1){
      Headers.Authentication = await GetAuthKey()
    }
  }

  try {
    let Response = await fetch(URL, {method: Method, headers: Headers, body: Body, credentials: CredientalsInclude && "include" || "omit"})
    let ResBody

    if (!BypassResJSON){
      try {
        ResBody = await (Response).json()
      } catch (err) { //Hacky way for roblox's new api
        ResBody = {Success: false, Result: `decode failed: ${err}`}
        Response.ok = false
      }
    }

    let NewCSRFToken = Response.headers.get("x-csrf-token")
    
    if (NewCSRFToken){
      CSRFToken = NewCSRFToken
    }

    if (!Response.ok && (ResBody?.message == "Token Validation Failed" || ResBody?.errors?.[0]?.message == "Token Validation Failed" || NewCSRFToken) || ResBody?.Result == "Invalid authentication!"){
      if (ResBody?.Result == "Invalid authentication!"){
        await InvalidateAuthKey()
      }

      return await RequestFunc(URL, Method, Headers, Body, CredientalsInclude)
    }

    if (IsQOLAPI && Response.status === 402){ //Payment required
      CurrentSubscription = await chrome.runtime.sendMessage({type: "PaymentRequired", result: ResBody})
    }

    return [Response.ok, ResBody, Response]
  } catch (err) {
    console.log(err)
    return [false, {Success: false, Result: `fetch failed: ${err}`}]
  }
}

function ClearAllChildren(Element){
    while (Element.firstChild) {
        Element.removeChild(Element.lastChild)
    }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function SecondsToLengthSingle(Seconds, Full){
  if (Full){
    const y = Math.floor(Seconds / (3600*24*365))
    const mo = Math.floor(Seconds / (3600*24*30))
    const d = Math.floor(Seconds / (3600*24))
    const h = Math.floor(Seconds % (3600*24) / 3600)
    const m = Math.floor(Seconds % 3600 / 60)
    const s = Math.floor(Seconds % 60)

    if (y > 0){
      return `${y} year${y == 1 ? "" : "s"}`
    } else if (mo > 0){
      return `${mo} month${mo == 1 ? "" : "s"}`
    } else if (d > 0){
      return `${d} day${d == 1 ? "" : "s"}`
    } else if (h > 0){
      return `${h} hour${h == 1 ? "" : "s"}`
    } else if (m > 0){
      return `${m} minute${m == 1 ? "" : "s"}`
    }

    return `${s} second${s == 1 ? "" : "s"}`
  }

  const d = Math.floor(Seconds / (3600*24))
  const h = Math.floor(Seconds % (3600*24) / 3600)
  const m = Math.floor(Seconds % 3600 / 60)
  const s = Math.floor(Seconds % 60)

  if (d > 0){
    return `${d} day${d == 1 ? "" : "s"}`
  } else if (h > 0){
    return `${h} hour${h == 1 ? "" : "s"}`
  } else if (m > 0){
    return `${m} minute${m == 1 ? "" : "s"}`
  }

  return `${s} second${s == 1 ? "" : "s"}`
}

function SecondsToLengthShort(Seconds){
  const h = Math.floor(Seconds / 3600)
  const m = Math.floor(Seconds % 3600 / 60)
  const s = Math.floor(Seconds % 60)

  if (h > 0){
    if (h < 100){
      return `${h} hr${h == 1 ? "" : "s"} ${m} min${m == 1 ? "" : "s"}`
    }
    return `${h} hr${h == 1 ? "" : "s"}`
  } else if (m > 0){
    return `${m} min${m == 1 ? "" : "s"}`
  }

  return `${s} second${s == 1 ? "" : "s"}`
}

function SecondsToLength(Seconds, OnlyOne, HideDays){
  const d = Math.floor(Seconds / (3600*24))
  const h = Math.floor(Seconds % (3600*24) / 3600)
  const m = Math.floor(Seconds % 3600 / 60)
  const s = Math.floor(Seconds % 60)

  const trueh = Math.floor(Seconds / 3600)

  if (d > 0 && !HideDays){
      return `${d} day${d > 1 ? "s" : ""}`
  } else if (HideDays && trueh > 0 || h > 0){
      return `${HideDays ? trueh : h} hour${(HideDays && trueh > 1 || h > 1) && "s" || ""}`
  } else if (m > 0 && !OnlyOne){
      return `${m} minute${m > 1 ? "s" : ""} ${s} second${s > 1 ? "s" : ""}`
  } else if (m > 0 && OnlyOne){
    return `${m} minute${m > 1 ? "s" : ""}`
  }

  return `${s} second${s == 1 ? "" : "s"}`
}

function SplitArrayIntoChunks(Array, chunkSize){
  const Chunks = []

  for (let i = 0; i < Array.length; i += chunkSize) {
      const chunk = Array.slice(i, i + chunkSize)
      Chunks.push(chunk)
  }

  return Chunks
}

function TimestampToDate(Timestamp, NumberFirst){
  const DateStamp = new Date(typeof(Timestamp) == "number" && Timestamp * 1000 || Timestamp)

  const CurrentLanguage = getNavigatorLanguages()[0]

  NumberDate = DateStamp.toLocaleTimeString(CurrentLanguage, {hour: "2-digit", minute: "2-digit"})
  DayDate = DateStamp.toLocaleDateString(CurrentLanguage)

  return `${NumberFirst && NumberDate || DayDate} ${NumberFirst && DayDate || NumberDate}`
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function RobuxToUSD(Robux){
  if (await IsFeatureEnabled("ShowUSDPurchaseRate")) return Robux * 0.0125
  return Robux * 0.0035
}

let ExchangeRateCache
let ForceUSDCurrency = false

async function RobuxToCurrency(Robux){
  if (ExchangeRateCache == true || !ExchangeRateCache){
    while (ExchangeRateCache == true) await sleep(20)

    if (!ExchangeRateCache){
      ExchangeRateCache = true

      const [Success, Result] = await RequestFunc(WebServerEndpoints.Currency+"rates", "GET")
      if (!Success){
        ForceUSDCurrency = true
        ExchangeRateCache = {}
        return
      }

      ExchangeRateCache = Result
    }
  }

  const Language = getNavigatorLanguages()[0]
  const Currency = ForceUSDCurrency && "USD" || await IsFeatureEnabled("Currency")
  const Multiplier = Currency === "USD" && 1 || ExchangeRateCache[Currency]

  return new Intl.NumberFormat(Language, {style: "currency", currency: ForceUSDCurrency && "USD" || await IsFeatureEnabled("Currency"), currencyDisplay: "narrowSymbol", maximumFractionDigits: 2}).format(await RobuxToUSD(Robux) * Multiplier)
}

let PageTargetId
function GetTargetId(){
  if (!PageTargetId){
    PageTargetId = parseInt(window.location.href.split("users/")[1].split("/")[0])
    if (isNaN(PageTargetId)) PageTargetId = null  
  }
  return PageTargetId
}

function SanitizeString(Unsanitized){
  const Replacements = {"<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&#039;", "\\": "&#39;"}
  let Sanitized = ""

  for (let i = 0; i < Unsanitized.length; i++) {
    const Character = Unsanitized.charAt(i)
    const Replacement = Replacements[Character]
    Sanitized += Replacement || Character
  }

  return Sanitized
}

function GetDaysInMonth(Time){
  if (!Time) return []

  const DaysInMonth = []
  const SaleDate = new Date(Time)
  for (let i = 1; i <= new Date(SaleDate.getUTCFullYear(), SaleDate.getUTCMonth(), 0).getDate(); i++){
      DaysInMonth.push(i)
  }
  return DaysInMonth
}

function AbbreviateNumber(number, decPlaces, noPlus){
  decPlaces = Math.pow(10, decPlaces || 0)

  var abbrev = ['k', 'm', 'b', 't']

  for (var i = abbrev.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3)

    if (size <= number) {
      number = Math.floor((number * decPlaces) / size) / decPlaces

      if (number == 1000 && i < abbrev.length - 1) {
        number = 1
        i++
      }

      number += abbrev[i].toUpperCase()+(!noPlus && "+" || "")

      break
    }
  }

  return number
}

function ChildAdded(Node, SendInitial, Callback){
  let Observer
  async function Disconnect(){
    while (!Observer) await sleep(0)
    try {Observer.disconnect()} catch {}
  }

  if (SendInitial){
    const children = Node.children
    if (children){
      for (let i = 0; i < children.length; i++){
        Callback(children[i], Disconnect)
      }
    }
  }

  Observer = new MutationObserver(function(Mutations){
    Mutations.forEach(function(Mutation) {
      if (Mutation.type !== "childList") return

      const addedNodes = Mutation.addedNodes
      for (let i = 0; i < addedNodes.length; i++){
        Callback(addedNodes[i], Disconnect)
      }
    })
  })
  Observer.observe(Node, {childList: true})

  return Observer
}

function DescendantAdded(Node, SendInitial, Callback){
  let Observer
  async function Disconnect(){
    while (!Observer) await sleep(0)
    try {Observer.disconnect()} catch {}
  }

  if (SendInitial){
    function ScanChildren(Node){
      const children = Node.children
      if (children){
        for (let i = 0; i < children.length; i++){
          Callback(children[i], Disconnect)
          ScanChildren(children[i])
        }
      }
    }

    ScanChildren(Node)
  }

  Observer = new MutationObserver(function(Mutations){
    Mutations.forEach(function(Mutation) {
      if (Mutation.type !== "childList") return

      const addedNodes = Mutation.addedNodes
      for (let i = 0; i < addedNodes.length; i++){
        Callback(addedNodes[i], Disconnect)
      }
    })
  })
  Observer.observe(Node, {childList: true, subtree: true})

  return Observer
}


function ChildRemoved(Node, Callback){
  return new MutationObserver(function(Mutations, Observer){
    Mutations.forEach(function(Mutation) {
      if (Mutation.type !== "childList") return

      const removedNodes = Mutation.removedNodes
      for (let i = 0; i < removedNodes.length; i++){
        Callback(removedNodes[i], function(){
          try {Observer.disconnect()} catch {}
        })
      }
    })
  }).observe(Node, {childList: true})
}

function LoadLocalFile(Path){
  return new Promise((resolve, reject) => {
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = async function(){
        if (xmlhttp.status == 200 && xmlhttp.readyState == 4){
          resolve(xmlhttp.responseText)
          return
        }
    }

    xmlhttp.open("GET", Path, true)
    xmlhttp.send()
  })
}

async function FetchSubscription(){
  if (!CurrentSubscription){
    CurrentSubscription = await chrome.runtime.sendMessage({type: "GetSubscription"})
  }
  return CurrentSubscription
}

async function FetchAllPaidFeatures(){
  if (!ArePaidFeaturesFetched){
    const NewPaidFeatures = await chrome.runtime.sendMessage({type: "PaidFeatures"})
        
        if (NewPaidFeatures){
            for (const [key, value] of Object.entries(NewPaidFeatures)){
                PaidFeatures[key] = value
            }
        }

        AreEnabledFeaturesFetched = true
  }
}

async function FetchAllFeaturesEnabled(){
    if (!AreEnabledFeaturesFetched){
        //const NewSettings = window.localStorage.getItem("robloxQOL-settings")
        const NewSettings = await chrome.runtime.sendMessage({type: "getsettings"})
        
        if (NewSettings){
            for (const [key, value] of Object.entries(NewSettings)){
                EnabledFeatures[key] = value
            }
        }

        AreEnabledFeaturesFetched = true
    }
}

let KilledFeatures
async function FetchAllFeaturesKilled(BypassCheck){
  if (KilledFeatures && !BypassCheck) return
  KilledFeatures = await chrome.runtime.sendMessage({type: "getkilledfeatures"})
}

async function IsFeatureKilled(FeatureName){
  if (IgnoreDisabledFeatures) return false
  await FetchAllFeaturesKilled(false)
  return KilledFeatures ? KilledFeatures.includes(FeatureName) : false
}

async function PaidForFeature(Feature){
  await FetchAllPaidFeatures()
  const SubscriptionNeeded = PaidFeatures[Feature]
  if (!SubscriptionNeeded) return true
  return await FetchSubscription() >= SubscriptionNeeded
}

async function IsFeatureEnabled(Feature){
  await FetchAllFeaturesEnabled()
  const IsKilled = await IsFeatureKilled(Feature)
  if (IsKilled) return false
  if (!await PaidForFeature(Feature)) return false

  return EnabledFeatures[Feature]
}

const OnSettingChanged = {}
function ListenForFeatureChanged(Setting, Callback){
  OnSettingChanged[Setting] = Callback
}

async function SetFeatureEnabled(Feature, Enabled, WaitForResponse){
  await FetchAllFeaturesEnabled()

  EnabledFeatures[Feature] = Enabled

  const Message = {type: "changesetting", feature: Feature, enabled: Enabled}
  if (WaitForResponse) await chrome.runtime.sendMessage(Message)
  else chrome.runtime.sendMessage(Message)

  const Callback = OnSettingChanged[Feature]
  if (Callback) Callback(Enabled)
}

setInterval(FetchAllFeaturesKilled, 20*1000, true)
GetUserId()

chrome.runtime.sendMessage({type: "InjectContentScripts"})

GetUserId().then(function(UserId){
  chrome.runtime.sendMessage({type: "DocumentUserIdUpdate", UserId: parseInt(UserId)})
})

document.addEventListener("RobloxQoL.IsFeatureEnabled", async function(e){
  document.dispatchEvent(new CustomEvent("RobloxQoL.IsFeatureEnabledResponse", {detail: await IsFeatureEnabled(e.detail)}))
})

let AlreadySetAuthenticationError = false

function ReportAuthenticationError(request){
  if (!request?.Failed || !window.location.href.includes("www.roblox.com") || AlreadySetAuthenticationError) return
  AlreadySetAuthenticationError = true

  setTimeout(async function(){
    const SettingsIcon = await WaitForId("settings-icon")
    const Error = document.createElement("img")
    Error.src = chrome.runtime.getURL("img/warning.png")
    Error.style = "position: absolute; bottom: 10px; left: 10px; width: 26px; height: 26px;"

    SettingsIcon.appendChild(Error)
  }, 0)
}

ListenToEventFromBackground("AuthenticationFailure", ReportAuthenticationError)
chrome.runtime.sendMessage({type: "AuthenticationFailureCheck"}).then(ReportAuthenticationError)