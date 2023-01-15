async function GetRobloxServers(Cursor, Ascending, ExcludeFullGames, MaxServers){
    return await RequestFunc(`https://games.roblox.com/v1/games/${await GetPlaceIdFromGamePage()}/servers/0?sortOrder=${Ascending && 1 || 2}&excludeFullGames=${ExcludeFullGames || false}&limit=${MaxServers || 100}&cursor=${Cursor || ""}`, "GET", undefined, undefined, true)
}