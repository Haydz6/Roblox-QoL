let LastAuthKeyAttempt = 0
let LastAuthenticatedUserId
let FirstAuthenticationAttempt = true

let FetchedAuthenticationFromStorage = false
let AuthenticationFailuresCounter = 0
let AuthenticationError = ""

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
    let FetchedKey = ""

    if (!await IsFeatureKilled("OAuthVerification")) FetchedKey = await GetOAuthKey()
    if (FetchedKey == "") FetchedKey = await GetAuthKeyV2()
    if (FetchedKey == "") AuthenticationFailuresCounter++
    else AuthenticationFailuresCounter = 0

    if (AuthenticationFailuresCounter > 5){
        for (let i = 0; i < ActiveRobloxPages.length; i++){
            chrome.tabs.sendMessage(ActiveRobloxPages[i], {type: "AuthenticationFailure", Failed: true})
        }
    }
    
    return FetchedKey
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
    if (!UserId){
        AuthenticationError = "Favourite: Not logged in"
        FetchingAuthKey = false
        return "" //No userid, so we cannot validate
    }

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
            FetchedAuthenticationFromStorage = true

            CachedAuthKey = StoredKey.Key
            LastAuthenticatedUserId = UserId
            FetchingAuthKey = false
            return CachedAuthKey
        }
    }

    FetchedAuthenticationFromStorage = false
    
    if (!await CheckIfSameUser()){
        FetchingAuthKey = false
        return ""
    }

    LastAuthenticatedUserId = UserId
    const [GetFavoriteSuccess, FavoriteResult, FavoriteResponse] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"fetch", "POST", undefined, JSON.stringify({UserId: UserId}))
    
    if (!GetFavoriteSuccess || !await CheckIfSameUser()){
        FetchingAuthKey = false
        AuthenticationError = `Favourite: Starting verification failed or account changed (${JSON.stringify(FavoriteResult)} ${FavoriteResponse?.status})`
        return ""
    }
    
    Key = FavoriteResult.Key
    UniverseId = FavoriteResult.UniverseId

    ForceMustUnfavourite = false
    if (!FavoriteResult.MustUnfavourite){
        [Success, Favourited, Result] = await HasGameFavourited(UniverseId)

        if (!Success){
            FetchingAuthKey = false
            AuthenticationError = `Favourite: Failed to check if favourited (${JSON.stringify(Favourited)} ${Result?.status})`
            return ""
        }

        ForceMustUnfavourite = Favourited
    }
    if (!await CheckIfSameUser()) return

    if (FavoriteResult.MustUnfavourite || ForceMustUnfavourite){
        const [FavouriteSuccess, UnfavouriteResult, UnfavouriteResponse] = await SetFavouriteGame(UniverseId, false)
    
        if (!FavouriteSuccess){
            FetchingAuthKey = false
            AuthenticationError = `Favourite: Failed to unfavourite game for clear (${JSON.stringify(UnfavouriteResult)} ${UnfavouriteResponse?.status})`
            return ""
        }

        if (FavoriteResult.MustUnfavourite){
            await WaitForGameFavourite(UserId, UniverseId, false, 15)
            const [ClearSuccess, ClearResult, ClearResponse] = await RequestFunc(WebServerEndpoints.AuthenticationV2+"clear", "POST", undefined, JSON.stringify({Key: Key}))

            if (!ClearSuccess){
                FetchingAuthKey = false
                AuthenticationError = `Favourite: Failed to send clear verification (${JSON.stringify(ClearResult)} ${ClearResponse?.status})`
                return ""
            }
        }
    }
    
    const [FavouriteSuccess, RefavouriteResult, RefavouriteResponse] = await SetFavouriteGame(UniverseId, true)
    
    if (!FavouriteSuccess || !await CheckIfSameUser()){
        FetchingAuthKey = false
        AuthenticationError = `Favourite: Failed to favourite verification game or account changed (${JSON.stringify(RefavouriteResult)} ${RefavouriteResponse?.status})`
        return ""
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
        let UnfavouriteAttempts = 0

        while (true){
            if (!await CheckIfSameUser(false)) return

            const [FavSuccess] = await SetFavouriteGame(UniverseId, false)
    
            if (FavSuccess) break
            UnfavouriteAttempts++
            if (UnfavouriteAttempts > 10) UnfavouriteAttempts = 10

            await sleep(1000 * (10+UnfavouriteAttempts))
        }
    })
    
    FetchingAuthKey = false
    AuthenticationFailuresCounter = 0
    
    return CachedAuthKey
}

async function GetAuthKeyDetailed(){
    const AuthKey = await GetAuthKey()
    return [AuthKey != "" ? AuthKey : null, AuthKey != "" ? LastAuthenticatedUserId : null]
}

function IsOver13(y, m, d){
    const CurrentDate = new Date()
    const BirthDate = new Date(y, m, d)

    if (CurrentDate.getUTCFullYear() - BirthDate.getUTCFullYear() > 13) return true
    if (CurrentDate.getUTCMonth() > BirthDate.getUTCMonth()) return true
    if (CurrentDate.getUTCDay() >= BirthDate.getUTCDay()) return true

    return false
}

async function GetOAuthKey(){
    if ((Date.now()/1000) - LastAuthKeyAttempt < 3){
        await sleep(3000)
    }

    while (FetchingAuthKey){
        await sleep(100)
    }

    FetchingAuthKey = true
    
    const UserId = await GetCurrentUserId()
    if (!UserId){
        AuthenticationError = "OAuth: Not logged in"
        FetchingAuthKey = false
        return "" //No userid, so we cannot validate
    }

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
            FetchedAuthenticationFromStorage = true

            CachedAuthKey = StoredKey.Key
            LastAuthenticatedUserId = UserId
            FetchingAuthKey = false
            return CachedAuthKey
        }
    }

    FetchedAuthenticationFromStorage = false
    
    if (!await CheckIfSameUser()){
        FetchingAuthKey = false
        return ""
    }

    LastAuthenticatedUserId = UserId

    let [Success, Result, Response] = await RequestFunc("https://accountinformation.roblox.com/v1/birthdate", "GET", undefined, undefined, true)
    if (Success){
        if (!IsOver13(Result.birthYear, Result.birthMonth, Result.birthDay)){
            FetchingAuthKey = false
            AuthenticationError = `OAuth: Not over 13 (${JSON.stringify(Result)} ${Response?.status})`
            return ""
        }
    }

    ;[Success, _, Response] = await RequestFunc(WebServerEndpoints.OAuth, "GET", undefined, undefined, true, true)
    if (!Success){
        FetchingAuthKey = false
        AuthenticationError = `OAuth: Failed to start (${Response?.status})`
        return ""
    }

    if (!await CheckIfSameUser()){
        FetchingAuthKey = false
        return ""
    }

    const Params = new URLSearchParams(Response.url.split("?")[1])
    const Scopes = []

    const UnparsedScopes = Params.get("scope").split(" ")
    for (let i = 0; i < UnparsedScopes.length; i++){
        Scopes[i] = {scopeType: UnparsedScopes[i], operations: ["read"]}
    }

    function Capitalize(string){
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    const AuthorizationBody = {
        clientId: Params.get("client_id"),
        codeChallenge: Params.get("code_challenge"),
        codeChallengeMethod: Params.get("code_challenge_method"),
        nonce: Params.get("nonce"),
        redirectUri: Params.get("redirect_uri"),
        resourceInfos: [{owner: {id: UserId.toString(), type: "User"}, resources: {}}],
        responseTypes: [Capitalize(Params.get("response_type"))],
        scopes: Scopes,
        state: Params.get("state")
    }

    ;[Success, Result, Response] = await RequestFunc("https://apis.roblox.com/oauth/v1/authorizations", "POST", {"Content-Type": "application/json"}, JSON.stringify(AuthorizationBody), true, false)
    if (!Success){
        if (Result?.code === "UnauthorizedAccess" && !await IsFeatureKilled("UnauthorizedWrongUserIdFix")){
            AuthenticationError = `OAuth: Roblox accept authentication failed (${JSON.stringify(Result)} ${Response?.status})`
            UserId = null
            GetCurrentUserId()
            return ""
        } //userid is wrong

        FetchingAuthKey = false
        return ""
    }

    if (!Result?.location){
        FetchingAuthKey = false
        AuthenticationError = `OAuth: Location missing`
        return ""
    }
    ;[Success, Result, Response] = await RequestFunc(Result.location, "GET", {type: "Authentication"}, undefined, false, true)
    if (!Success){
        FetchingAuthKey = false
        AuthenticationError = `OAuth: Callback failed (${JSON.stringify(Result)} ${Response?.status})`
        return ""
    }

    CachedAuthKey = (await Response.json()).Key
    LocalStorage.set("AuthKey", JSON.stringify({UserId: UserId, Key: CachedAuthKey}))
    AlertTabsOfNewAuthKey(CachedAuthKey)

    FetchingAuthKey = false
    AuthenticationFailuresCounter = 0

    return CachedAuthKey
}