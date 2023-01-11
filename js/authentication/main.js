let CachedAuthKey = ""
let FetchingAuthKey = false

async function SetFavouriteGame(UniverseId, Favourited){
    return RequestFunc(`https://games.roblox.com/v1/games/${UniverseId}/favorites`, "POST", undefined, JSON.stringify({isFavorited: Favourited}), true)
}
  
async function GetAuthKey(){
    while (FetchingAuthKey){
      await sleep(100)
    }
  
    if (CachedAuthKey != ""){
      return CachedAuthKey
    }
  
    StoredKey = window.localStorage.getItem("robloxqol-AuthKey")
  
    if (StoredKey){
      CachedAuthKey = StoredKey
      return CachedAuthKey
    }
    
    const [GetFavoriteSuccess, FavoriteResult] = await RequestFunc(WebServerEndpoints.Authentication+"fetch", "POST", undefined, JSON.stringify({UserId: parseInt(UserId)}))
  
    if (!GetFavoriteSuccess){
      CreateAlert(FavoriteResult.Result, false)
      return CachedAuthKey
    }
  
    UniverseId = FavoriteResult.UniverseId
  
    const [FavouriteSuccess] = await SetFavouriteGame(UniverseId, true)
  
    if (!FavouriteSuccess){
      CreateAlert("Failed to verify with database!", false)
      return CachedAuthKey
    }
  
    const [ServerSuccess, ServerResult] = await RequestFunc(WebServerEndpoints.Authentication+"verify", "POST", undefined, JSON.stringify({UserId: parseInt(UserId)}))
  
    if (ServerSuccess){
      CachedAuthKey = ServerResult.Key
      window.localStorage.setItem("robloxqol-AuthKey", CachedAuthKey)
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

function InvalidateAuthKey(){
  CachedAuthKey = ""
  window.localStorage.removeItem("robloxqol-AuthKey")
  return GetAuthKey()
}