async function DeclineTrade(TradeId){
    while (true){
        const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/${TradeId}/decline`, "POST", undefined, undefined, true)

        if (!Success){
            if (Response.status === 429){
                await sleep(5*1000)
                continue
            }

            return [false, Result]
        }

        return [true, Result]
    }
}

async function GetTradeInfo(TradeId, Retry){
    while (true){
        const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/${TradeId}`, "GET", undefined, undefined, true)

        if (!Success){
            if (!Retry){
                return [false, Result]
            }

            if (Response.status === 429){
                await sleep(5*1000)
                continue
            }

            return [false]
        }

        return [true, Result]
    }
}

async function GetTrades(Type, Limit, Cursor, Retry){
    while (true){
        const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/${Type}?cursor=${Cursor || ""}&limit=${Limit}`, "GET", undefined, undefined, true)

        if (!Success){
            if (!Retry){
                return [false, Result]
            }

            if (Response.status === 429){
                await sleep(5*1000)
                continue
            }

            return [false, Result]
        }

        return [true, Result]
    }
}

function GetAllTrades(Type, Limit, Retry, Callback){
    return new Promise((resolve, reject) => {
        let Cursor
        let ReachedEnd = false

        async function FetchNext(){
            if (ReachedEnd){
                resolve()
                return
            }

            const [Success, Result] = await GetTrades(Type, Limit, Cursor, Retry)

            if (!Success){
                Callback(false, Result, FetchNext, resolve)
                return
            }

            Cursor = Result.nextPageCursor
            if (!Cursor) ReachedEnd = true

            Callback(true, Result, FetchNext, resolve)
            return
        }

        FetchNext()
    })
}