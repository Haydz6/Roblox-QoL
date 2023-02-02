async function GetRoproKey(){
    const [Success, Result] = await RequestFunc("https://api.ropro.io/verificationMetadata.php", "POST", undefined, undefined, true)
    if (!Success) return

    const UniverseId = Result.universeId
    const [FavSuccess] = await SetFavouriteGame(UniverseId, true)
    if (!FavSuccess) return

    const [KeySuccess, KeyResult] = await RequestFunc("https://api.ropro.io/generateVerificationToken.php", "POST", undefined, undefined, true)

    while (true){
        const [UnfavSuccess] = await SetFavouriteGame(UniverseId, false)

        if (!UnfavSuccess){
            await sleep(10*1000)
            continue
        }
        break
    }

    if (!KeySuccess || !KeyResult.success) return

    return KeyResult.token
}

async function ConvertPlaytime(){
    const CurrentUserId = await GetCurrentUserId()
    if (!CurrentUserId) return

    const RoproKey = await GetRoproKey()
    if (!RoproKey) return

    const [Success, RoproPlaytime] = await RequestFunc("https://api.ropro.io/getMostPlayedUniverse.php?time=999", "POST", {"ropro-id": CurrentUserId, "ropro-verification": RoproKey})
    if (!Success) return

    const [PushSuccess] = await RequestFunc(WebServerEndpoints.Playtime+"convert", "POST", undefined, JSON.stringify(RoproPlaytime))
    if (!PushSuccess) return

    LocalStorage.set("ConvertedPlaytime", true)
}

LocalStorage.get("ConvertedPlaytime").then(function(Converted){
    if (!Converted) {
        ConvertPlaytime()
    }
})