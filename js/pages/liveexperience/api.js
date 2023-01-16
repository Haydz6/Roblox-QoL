async function GetLiveStatsFromCurrentPlace(){
    const UniverseId = await GetUniverseIdFromGamePage()

    const [Success, Result] = await RequestFunc("https://games.roblox.com/v1/games?universeIds="+UniverseId, "GET")

    if (!Success) return [false]

    const Info = Result.data[0]
    return [true, {Playing: Info.playing, Visits: Info.visits, Favourites: Info.favoritedCount}]
}

async function GetLikesFromCurrentPlace(){
    const UniverseId = await GetUniverseIdFromGamePage()

    const [Success, Result] = await RequestFunc("https://games.roblox.com/v1/games/votes?universeIds="+UniverseId, "GET")

    if (!Success) return [false]

    const Info = Result.data[0]
    return [true, {Likes: Info.upVotes, Dislikes: Info.downVotes, Ratio: Math.floor((Info.upVotes/(Info.upVotes+Info.downVotes))*100)}]
}