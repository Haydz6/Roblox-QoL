async function FilterTeamCreateUniverses(UniverseIds){
    const Chunks = SplitArrayIntoChunks(UniverseIds, 100)
    const TeamUniverses = []

    while (Chunks.length > 0){
        while (true){
            const [Success, Result] = await RequestFunc("https://develop.roblox.com/v1/universes/multiget/teamcreate?ids=1259281718&ids=4460388970&ids=4202076347")
    
            if (!Success){
                if (Result.StatusCode == 429){
                    await sleep(5*1000)
                    continue
                }
                return [false]
            }
    
            const Data = Result.data
            for (let i = 0; i < Data.length; i++){
                const Universe = Data[i]
                if (Universe.isEnabled) TeamUniverses.push(Universe.id)
            }
            break
        }
    }

    return [true, TeamUniverses]
}

async function GetPlayerOwnedUniverses(){
    let Cursor = ""
    const Universes = []

    while (true){
        const [Success, Result] = await RequestFunc("https://develop.roblox.com/v1/user/universes?isArchived=true&limit=100&sortOrder=Asc")

        if (!Success){
            if (Result.StatusCode == 429){
                await sleep(5*1000)
                continue
            }
            return [false]
        }

        const Data = Result.data
        for (let i = 0; i < Data.length; i++){
            Universes.push(Data[i].id)
        }

        Cursor = Result.nextPageCursor

        if (!Cursor) break
    }

    return [true, Universes]
}