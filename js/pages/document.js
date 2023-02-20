const sleep = ms => new Promise(r => setTimeout(r, ms))

const EnabledFeatures = {}
let AreEnabledFeaturesFetched = false

let UserId
let CSRFToken = ""

const Debugging = false
const WebServerURL = !Debugging && "https://qol.haydz6.com/" || "http://localhost:8192/"
const WebServerEndpoints = {Playtime: WebServerURL+"api/presence/", Themes: WebServerURL+"api/themes/", ThemesImg: WebServerURL+"themes/", Authentication: WebServerURL+"api/auth/", Outfits: WebServerURL+"api/outfits/", History: WebServerURL+"api/history/", Servers: WebServerURL+"api/servers/", Limiteds: WebServerURL+"api/limiteds/"}

function FindFirstClass(ClassName){
  return document.getElementsByClassName(ClassName)[0]
}

function FindFirstId(Id){
  return document.getElementById(Id)
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
        Callback(addedNodes[i], Observer.disconnect)
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