let NextCursor
let ReachedEnd = false

const Sales = []
const SalesLookup = {}

async function FetchTranscations(Type, Id){
    const [Success, Result] = await RequestFunc(`https://economy.roblox.com/v2/${Type}s/${Id}/transactions?cursor=${NextCursor}&limit=100&transactionType=Sale`, "GET", undefined, undefined, true)

    if (!Success) return

    if (!Result.nextPageCursor) ReachedEnd = true
    NextCursor = Result.nextPageCursor

    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const Purchase = Data[i]

        const NewDate = new Date(Purchase.created)
        NewDate.setSeconds(0)
        NewDate.setMilliseconds(0)
        NewDate.setMinutes(0)

        const Timestamp = NewDate.getTime()

        if (!SalesLookup[Timestamp]){
            const Info = {Timestamp: Timestamp, Sales: 1, Revenue: Purchase.currency.amount}
            Sales.push(Info)
            SalesLookup[Timestamp] = Info

            return
        }

        const Info = SalesLookup[Timestamp]

        Info.Sales ++
        Info.Revenue += Purchase.currency.amount
    }
}

async function GetSalesAndRevenue(Type, Id){
    while (!ReachedEnd){
        await FetchTranscations(Type, Id)
        await sleep(100)
    }

    return Sales
}