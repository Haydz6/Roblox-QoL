let LastAuthKeyAttempt = 0
let LastAuthenticatedUserId
let FirstAuthenticationAttempt = true

async function HasGameFavourited(UniverseId){
    const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games/${UniverseId}/favorites`, "GET", undefined, undefined, true)

    if (!Success){
        return [false, false]
    }

    return [true, Result.isFavorited]
}

function AlertTabsOfNewAuthKey(NewAuthKey){
    for (let i = 0; i < ActiveRobloxPages.length; i++){
        chrome.tabs.sendMessage(ActiveRobloxPages[i], {type: "Reauthenticating", AuthKey: NewAuthKey})
    }
}

async function ReauthenticateV2(){
    const UserId = await GetCurrentUserId()
    if (!UserId) return CachedAuthKey

    const [Success, Result] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"reverify", "POST")

    if (Success){
        CachedAuthKey = Result.Key
        AlertTabsOfNewAuthKey(CachedAuthKey)
        LocalStorage.set("AuthKey", JSON.stringify({UserId: UserId, Key: CachedAuthKey}))
    }
    
    return CachedAuthKey
}

async function GetAuthKey(){
    return await GetAuthKeyV2()
}

async function WaitForGameFavourite(UserId, UniverseId, Favourited = true, Timeout = 15){
    const End = (Date.now()/1000)+Timeout

    while (End > Date.now()/1000){
        if (await GetCurrentUserId() !== UserId) return false

        const [Success, Result] = await RequestFunc(`https://www.roblox.com/users/favorites/list-json?assetTypeId=9&itemsPerPage=1&pageNumber=1&userId=${UserId}`, "GET", undefined, undefined, true)
        
        if (Success){
            const FavouritedUniverseId = Result?.Data?.Items?.[0]?.Item?.UniverseId

            if (Favourited && UniverseId == FavouritedUniverseId) return true
            if (!Favourited && UniverseId != FavouritedUniverseId) return true
        }
        await sleep(2000)
    }

    return false
}

async function GetAuthKeyV2(){
    if ((Date.now()/1000) - LastAuthKeyAttempt < 3){
        await sleep(3000)
    }

    while (FetchingAuthKey){
        await sleep(100)
    }

    FetchingAuthKey = true
    
    const UserId = await GetCurrentUserId()

    async function CheckIfSameUser(ResetAuthKey = true){
        if (UserId !== await GetCurrentUserId()){
            if (ResetAuthKey) FetchingAuthKey = false
            return false
        }
        return true
    }

    if (CachedAuthKey != "" && UserId == LastAuthenticatedUserId){
        FetchingAuthKey = false
        return CachedAuthKey
    }
    if (UserId != LastAuthenticatedUserId && !FirstAuthenticationAttempt){
        CachedAuthKey = ""
        FetchingAuthKey = true
        AlertTabsOfNewAuthKey()
        await LocalStorage.remove("AuthKey")
    }

    FirstAuthenticationAttempt = false
    FetchingAuthKey = true
    LastAuthKeyAttempt = Date.now()/1000

    StoredKey = await LocalStorage.get("AuthKey")
    if (StoredKey){
        try {
            StoredKey = JSON.parse(StoredKey)
        } catch {}
    }
    
    if (StoredKey){
        if (typeof(StoredKey) == "string"){
            StoredKey = {UserId: UserId, Key: StoredKey}
            await LocalStorage.set("AuthKey", JSON.stringify(StoredKey))
        }

        if (StoredKey.UserId == UserId){
            CachedAuthKey = StoredKey.Key
            LastAuthenticatedUserId = UserId
            FetchingAuthKey = false
            return CachedAuthKey
        }
    }
    
    if (!UserId || !await CheckIfSameUser()){
        FetchingAuthKey = false
        return CachedAuthKey //No userid, so we cannot validate
    }

    LastAuthenticatedUserId = UserId
    const [GetFavoriteSuccess, FavoriteResult] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"fetch", "POST", undefined, JSON.stringify({UserId: UserId}))
    
    if (!GetFavoriteSuccess || !await CheckIfSameUser()){
        FetchingAuthKey = false
        return CachedAuthKey
    }
    
    Key = FavoriteResult.Key
    UniverseId = FavoriteResult.UniverseId

    ForceMustUnfavourite = false
    if (!FavoriteResult.MustUnfavourite){
        [Success, Favourited] = await HasGameFavourited(UniverseId)

        if (!Success){
            FetchingAuthKey = false
            return CachedAuthKey
        }

        ForceMustUnfavourite = Favourited
    }
    if (!await CheckIfSameUser()) return

    if (FavoriteResult.MustUnfavourite || ForceMustUnfavourite){
        const [FavouriteSuccess] = await SetFavouriteGame(UniverseId, false)
    
        if (!FavouriteSuccess){
            FetchingAuthKey = false
            return CachedAuthKey
        }

        if (FavoriteResult.MustUnfavourite){
            await WaitForGameFavourite(UserId, UniverseId, false, 15)
            const [UnfavoriteSuccess] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"clear", "POST", undefined, JSON.stringify({Key: Key}))

            if (!UnfavoriteSuccess){
                FetchingAuthKey = false
                return CachedAuthKey
            }
        }
    }
    
    const [FavouriteSuccess] = await SetFavouriteGame(UniverseId, true)
    
    if (!FavouriteSuccess || !await CheckIfSameUser()){
        FetchingAuthKey = false
        return CachedAuthKey
    }
    
    await WaitForGameFavourite(UserId, UniverseId, true, 15)
    if (!await CheckIfSameUser()) return

    const [ServerSuccess, ServerResult] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"verify", "POST", undefined, JSON.stringify({Key: Key}))
    if (!await CheckIfSameUser()) return

    if (ServerSuccess){
        CachedAuthKey = ServerResult.Key
        LocalStorage.set("AuthKey", JSON.stringify({UserId: UserId, Key: CachedAuthKey}))
        AlertTabsOfNewAuthKey(CachedAuthKey)
    }
    
    new Promise(async function(){
        while (true){
            if (!await CheckIfSameUser(false)) return

            const [FavSuccess] = await SetFavouriteGame(UniverseId, false)
    
            if (FavSuccess) break
            await sleep(1000)
        }
    })
    
    FetchingAuthKey = false
    
    return CachedAuthKey
}