function CalcuateValueWithDuplicates(AssetIds, Result){
    let Value = 0

    for (let i = 0; i < AssetIds.length; i++){
        const AssetId = AssetIds[i]
        const Info = Result[AssetId]
        Value += Info.Value
    }

    return Value
}

function CalcuateDemandAverageWithDuplicates(AssetIds, Result){
    let Demand = 0
    let Counts = 0

    for (let i = 0; i < AssetIds.length; i++){
        const AssetId = AssetIds[i]
        const Info = Result[AssetId]
        Demand += Info.Demand + 1
        Counts ++
    }

    let Average = Math.floor((Demand/Counts)*10)/10
    if (Math.floor(Average) === Average) Average = `${Average}.0`

    return Average
}

async function GetItemDetails(AssetIds, CalcuateValue){
    const [Success, Result] = await RequestFunc(WebServerEndpoints.Limiteds+"details", "POST", undefined, JSON.stringify(AssetIds))

    if (!Success) return [false]

    let Value = CalcuateValue && CalcuateValueWithDuplicates(AssetIds, Result) || 0

    return [true, Result, Value]
}

let RolimonsQueue = []

async function QueueForItemDetails(AssetId){
    return new Promise(async(resolve) => {
        RolimonsQueue.push({Resolve: resolve, AssetId: AssetId})

        if (RolimonsQueue.length > 1) return
        await sleep(50)

        if (RolimonsQueue.length === 0) return

        const AssetIds = []
        let CloneRolimonsQueue = []

        for (let i = 0; i < RolimonsQueue.length; i++){
            CloneRolimonsQueue.push(RolimonsQueue[i])
            AssetIds.push(RolimonsQueue[i].AssetId)
        }
        RolimonsQueue = []

        const [Success, Result] = await GetItemDetails(AssetIds)

        if (!Success){
            for (let i = 0; i < CloneRolimonsQueue.length; i++){
                CloneRolimonsQueue[i].Resolve([false])
            }
            return
        }

        for (let i = 0; i < CloneRolimonsQueue.length; i++){
            const Queue = CloneRolimonsQueue[i]
            Queue.Resolve([true, Result[Queue.AssetId]])
        }
    })
}