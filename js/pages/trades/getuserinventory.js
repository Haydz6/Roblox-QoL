const LimitedInventoryCache = {}

async function GetUserLimitedInventory(UserId){
    let Inventory = []
    let Cursor = ""

    if (LimitedInventoryCache[UserId]){
        return [true, LimitedInventoryCache[UserId]]
    } else if (LimitedInventoryCache[UserId] === false){
        return [true, false]
    }

    while (true){
        if (Cursor === null) break

        const [Success, Result, Response] = await RequestFunc(`https://inventory.roblox.com/v1/users/${UserId}/assets/collectibles?cursor=${Cursor}&limit=100`)

        if (!Success){
            if (Response.status === 429){
                await sleep(2000)
                continue
            } else if (Response.status === 403){
                LimitedInventoryCache[UserId] = false
                return [true, false]
            }

            return [false, false, Inventory]
        }

        Cursor = Result.nextPageCursor
        Inventory = Inventory.concat(Result.data)
    }

    LimitedInventoryCache[UserId] = Inventory

    return [true, true, Inventory]
}