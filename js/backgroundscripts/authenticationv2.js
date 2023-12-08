let LastAuthKeyAttempt = 0

async function HasGameFavourited(UniverseId){
    const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games/${UniverseId}/favorites`, "GET", undefined, undefined, true)

    if (!Success){
        return [false, false]
    }

    return [true, Result.isFavorited]
}

async function ReauthenticateV2(){
    const [Success, Result] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"reverify", "POST")

    if (Success){
        CachedAuthKey = Result.Key
        LocalStorage.set("AuthKey", CachedAuthKey)
    }
    
    return CachedAuthKey
}

async function GetAuthKey(){
    if ((Date.now()/1000) - LastAuthKeyAttempt < 3){
        await sleep(3000)
    }

    while (FetchingAuthKey){
        await sleep(100)
    }

    if (CachedAuthKey != ""){
        return CachedAuthKey
    }

    FetchingAuthKey = true
    LastAuthKeyAttempt = Date.now()/1000
    StoredKey = await LocalStorage.get("AuthKey")
    
    if (StoredKey){
        CachedAuthKey = StoredKey
        FetchingAuthKey = false
        return CachedAuthKey
    }

    FetchingAuthKey = false

    return await GetAuthKeyV2()
}

async function WaitForGameFavourite(UserId, UniverseId, Favourited = true, Timeout = 15){
    const End = (Date.now()/1000)+Timeout

    while (End > Date.now()/1000){
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
    while (FetchingAuthKey){
        await sleep(100)
    }
    
    if (CachedAuthKey != ""){
        return CachedAuthKey
    }

    FetchingAuthKey = true
    StoredKey = await LocalStorage.get("AuthKey")
    
    if (StoredKey){
        CachedAuthKey = StoredKey
        FetchingAuthKey = false
        return CachedAuthKey
    }
    
    const UserId = await GetCurrentUserId()
    if (!UserId){
        FetchingAuthKey = false
        return CachedAuthKey //No userid, so we cannot validate
    }

    const [GetFavoriteSuccess, FavoriteResult] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"fetch", "POST", undefined, JSON.stringify({UserId: UserId}))
    
    if (!GetFavoriteSuccess){
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
    
    if (!FavouriteSuccess){
        FetchingAuthKey = false
        return CachedAuthKey
    }
    
    await WaitForGameFavourite(UserId, UniverseId, true, 15)
    const [ServerSuccess, ServerResult] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"verify", "POST", undefined, JSON.stringify({Key: Key}))
    
    if (ServerSuccess){
        CachedAuthKey = ServerResult.Key
        LocalStorage.set("AuthKey", CachedAuthKey)
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