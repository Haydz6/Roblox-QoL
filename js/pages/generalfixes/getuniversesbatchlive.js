async function GetUniversesBatchToLiveCallback(UniverseIds, Callback){
    const Chunks = SplitArrayIntoChunks(UniverseIds, 10)

    while (Chunks.length > 0){
        const [Success, Result] = await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${Chunks.shift().join(",")}`, "GET", undefined, undefined, true)
        if (!Success || !Result?.data) continue

        for (let i = 0; i < Result.data.length; i++){
            Callback(Result.data[i])
        }
    }
}