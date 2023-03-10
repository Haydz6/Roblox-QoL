const sleep = ms => new Promise(r => setTimeout(r, ms))

const EnabledFeatures = {}
let AreEnabledFeaturesFetched = false

let UserId
let CSRFToken = ""

const Debugging = false
const WebServerURL = !Debugging && "https://qol.haydz6.com/" || "http://localhost:8192/"
const WebServerEndpoints = {UGC: WebServerURL+"api/ugc/", Currency: WebServerURL+"api/currency/", Playtime: WebServerURL+"api/presence/", Themes: WebServerURL+"api/themes/", ThemesImg: WebServerURL+"themes/", Authentication: WebServerURL+"api/auth/", Outfits: WebServerURL+"api/outfits/", History: WebServerURL+"api/history/", Servers: WebServerURL+"api/servers/", Limiteds: WebServerURL+"api/limiteds/"}

function FindFirstClass(ClassName){
  return document.getElementsByClassName(ClassName)[0]
}

function FindFirstId(Id){
  return document.getElementById(Id)
}

function FindFirstTag(Tag){
  return document.getElementsByTagName(Tag)[0]
}

async function WaitForChildIndex(Parent, Index){
  let Element = null

  while (true) {
    Element = Parent.children[Index || 0]
    console.log(Parent.children)
    if (Element != undefined) {
      break
    }

    await sleep(50)
  }

  return Element
}

async function WaitForClass(ClassName){
    let Element = null
  
    while (true) {
      Element = FindFirstClass(ClassName)
      if (Element != undefined) {
        break
      }
  
      await sleep(50)
    }
  
    return Element
}

async function WaitForId(Id){
    let Element = null
  
    while (true) {
      Element = FindFirstId(Id)
      if (Element != undefined) {
        break
      }
  
      await sleep(50)
    }
  
    return Element
}

async function WaitForTag(Tag){
  let Element = null

  while (true) {
    Element = FindFirstTag(Tag)
    if (Element != undefined) {
      break
    }

    await sleep(50)
  }

  return Element
}

async function WaitForClassPath(Element, ...Paths){
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

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude, BypassResJSON){
  if (!Headers){
    Headers = {}
  }

  if (URL.search("roblox.com") > -1) {
    Headers["x-csrf-token"] = CSRFToken
  } else if (URL.search(WebServerURL) > -1){
    if (URL.search("/auth") == -1){
      Headers.Authentication = await GetAuthKey()
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
        await InvalidateAuthKey()
        console.log("auth key invalid, getting a new one")
      }

      console.log("sending with csrf token")
      return await RequestFunc(URL, Method, Headers, Body, CredientalsInclude)
    }

    return [Response.ok, ResBody, Response]
  } catch (err) {
    console.log(err)
    return [false, {Success: false, Result: "???"}]
  }
}

function ClearAllChildren(Element){
    while (Element.firstChild) {
        Element.removeChild(Element.lastChild)
    }
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

function SecondsToLengthShort(Seconds){
  const h = Math.floor(Seconds / 3600)
  const m = Math.floor(Seconds % 3600 / 60)
  const s = Math.floor(Seconds % 60)

  if (h > 0){
    if (h < 100){
      return `${h} hr${h == 1 && "" || "s"} ${m} min${m == 1 && "" || "s"}`
    }
    return `${h} hr${h == 1 && "" || "s"}`
  } else if (m > 0){
    return `${m} min${m == 1 && "" || "s"}`
  }

  return `${s} second${s == 1 && "" || "s"}`
}

function SecondsToLength(Seconds, OnlyOne, HideDays){
  const d = Math.floor(Seconds / (3600*24))
  const h = Math.floor(Seconds % (3600*24) / 3600)
  const m = Math.floor(Seconds % 3600 / 60)
  const s = Math.floor(Seconds % 60)

  const trueh = Math.floor(Seconds / 3600)

  if (d > 0 && !HideDays){
      return `${d} day${d > 1 && "s" || ""}`
  } else if (HideDays && trueh > 0 || h > 0){
      return `${HideDays && trueh || h} hour${(HideDays && trueh > 1 || h > 1) && "s" || ""}`
  } else if (m > 0 && !OnlyOne){
      return `${m} minute${m > 1 && "s" || ""} ${s} second${s > 1 && "s" || ""}`
  } else if (m > 0 && OnlyOne){
    return `${m} minute${m > 1 && "s" || ""}`
  }

  return `${s} second${s == 1 && "" || "s"}`
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

function RobuxToUSD(Robux){
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

  return new Intl.NumberFormat(Language, {style: "currency", currency: ForceUSDCurrency && "USD" || await IsFeatureEnabled("Currency"), currencyDisplay: "narrowSymbol", maximumFractionDigits: 2}).format(RobuxToUSD(Robux) * Multiplier)
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
  if (SendInitial){
    const children = Node.children
    for (let i = 0; i < children.length; i++){
      Callback(children[i])
    }
  }

  return new MutationObserver(function(Mutations, Observer){
    Mutations.forEach(function(Mutation) {
      if (Mutation.type !== "childList") return

      const addedNodes = Mutation.addedNodes
      for (let i = 0; i < addedNodes.length; i++){
        Callback(addedNodes[i], function(){
          try {Observer.disconnect()} catch {}
        })
      }
    })
  }).observe(Node, {childList: true})
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

async function IsFeatureEnabled(Feature){
    await FetchAllFeaturesEnabled()
    return EnabledFeatures[Feature]
}

async function SetFeatureEnabled(Feature, Enabled){
    await FetchAllFeaturesEnabled()

    EnabledFeatures[Feature] = Enabled
    //window.localStorage.setItem("robloxQOL-settings", JSON.stringify(EnabledFeatures))
    chrome.runtime.sendMessage({type: "changesetting", feature: Feature, enabled: Enabled})
}

GetUserId()