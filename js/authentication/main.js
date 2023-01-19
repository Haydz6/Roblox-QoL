let CachedAuthKey = ""
let FetchingAuthKey = false
  
async function GetAuthKey(){
    while (FetchingAuthKey){
      await sleep(100)
    }
  
    if (CachedAuthKey != ""){
      return CachedAuthKey
    }
  
    FetchingAuthKey = true
    CachedAuthKey = await chrome.runtime.sendMessage({type: "authentication"})
    console.log(CachedAuthKey)
    FetchingAuthKey = false
  
    return CachedAuthKey
}

async function InvalidateAuthKey(){
  CachedAuthKey = ""
  return await chrome.runtime.sendMessage({type: "reauthenticate"})
}