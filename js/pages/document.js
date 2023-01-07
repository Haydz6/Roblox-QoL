const sleep = ms => new Promise(r => setTimeout(r, ms));
const EnabledFeatures = {ExtraOutfits: true, FixFavouritesPage: true, ActivePrivateServers: true, NewMessagePing: true}
let AreEnabledFeaturesFetched = false

function FindFirstClass(ClassName){
  return document.getElementsByClassName(ClassName)[0]
}

function FindFirstId(Id){
  return document.getElementById(Id)
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

async function RequestFunc(URL, Method, Headers, Body, CredientalsInclude){
    if (!Headers){
      Headers = {}
    }
  
    if (URL.search("roblox.com") > -1) {
      Headers["x-csrf-token"] = CSRFToken
    } else if (URL.search(WebserverURL) > -1){
      if (URL.search("authenticate") == -1){
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
  
      if (!Response.ok && (ResBody?.message == "Token Validation Failed" || ResBody?.errors?.[0]?.message == "Token Validation Failed")){
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