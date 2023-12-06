async function GetUniversesBatchToLiveCallback(UniverseIds, Callback){
    const Chunks = SplitArrayIntoChunks(UniverseIds, 10)

    while (Chunks.length > 0){
        Callback(await RequestFunc(`https://games.roblox.com/v1/games?universeIds=${Chunks.pop().join(",")}`, "GET", undefined, undefined, true))
    }
}