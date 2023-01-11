const sleep = ms => new Promise(r => setTimeout(r, ms));
const EnabledFeatures = {ExtraOutfits: true, FixFavouritesPage: true, ActivePrivateServers: true, NewMessagePing: true, PurchasedGamesFix: true, FriendHistory: true, FriendNotifications: true}
let AreEnabledFeaturesFetched = false

let UserId
let CSRFToken = ""

const WebServerURL = "http://localhost:8192/"//"https://qol.haydz6.com/"
const WebServerEndpoints = {Authentication: WebServerURL+"api/auth/", Outfits: WebServerURL+"api/outfits/", History: WebServerURL+"api/history/"}

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

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude){
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
    const ResBody = await (Response).json()

    let NewCSRFToken = Response.headers.get("x-csrf-token")

    if (NewCSRFToken){
      CSRFToken = NewCSRFToken
    }

    if (!Response.ok && (ResBody?.message == "Token Validation Failed" || ResBody?.errors?.[0]?.message == "Token Validation Failed") || ResBody?.Result == "Invalid authentication!"){
      if (ResBody?.Result == "Invalid authentication!"){
        CachedAuthKey = ""
        window.localStorage.removeItem("robloxqol-AuthKey")
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

function FetchAllFeaturesEnabled(){
    if (!AreEnabledFeaturesFetched){
        const NewSettings = window.localStorage.getItem("robloxQOL-settings")

        if (NewSettings){
            for (const [key, value] of Object.entries(JSON.parse(NewSettings))){
                EnabledFeatures[key] = value
            }
        }

        AreEnabledFeaturesFetched = true
    }
}

function IsFeatureEnabled(Feature){
    FetchAllFeaturesEnabled()
    return EnabledFeatures[Feature]
}

function SetFeatureEnabled(Feature, Enabled){
    FetchAllFeaturesEnabled()

    EnabledFeatures[Feature] = Enabled
    window.localStorage.setItem("robloxQOL-settings", JSON.stringify(EnabledFeatures))
}

GetUserId()