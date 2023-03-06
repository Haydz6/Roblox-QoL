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

    const [Success, Result] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"metadata", "GET")
    FetchingAuthKey = false

    if (!Success){
        return await GetAuthKeyV2()
    }

    if (Result.Version == 1){
        return await GetAuthKeyV1()
    } else if (Result.Version >= 2){
        return await GetAuthKeyV2()
    }
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
    
    const [GetFavoriteSuccess, FavoriteResult] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"fetch", "POST", undefined, JSON.stringify({UserId: parseInt(await GetCurrentUserId())}))
    
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