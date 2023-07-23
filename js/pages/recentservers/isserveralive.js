async function IsRobloxServerAlive(PlaceId, JobId){
    const [Success, Result] = await RequestFunc("https://gamejoin.roblox.com/v1/join-game-instance", "POST", {"Content-Type": "application/json", "User-Agent": "Roblox/WinInet", "Referer": `https://www.roblox.com/games/${PlaceId}/`, "Origin": "https://www.roblox.com"}, JSON.stringify({placeId: PlaceId, gameId: JobId}), true)

    if (!Success) {
        return [false, false]
    }

    if (Result.status === 6 || Result.status === 12 || Result.status === 11){
        return [true, false]
    } else if (Result.Status === 2){
        return [true, true]
    }

    return [false, false]
}