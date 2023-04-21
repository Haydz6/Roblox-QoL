let FeatureKilledStatus
let IsFetchingFeatureKills = false
let FeatureKilledFails = 0

async function FetchKilledFeatures(){
    let AlreadyFetching = IsFetchingFeatureKills
    while (IsFetchingFeatureKills){
        await sleep(20)
    }
    if (AlreadyFetching) return

    IsFetchingFeatureKills = true
    const [Success, Result] = await RequestFunc(WebServerEndpoints.Configuration+"features", "GET")
    IsFetchingFeatureKills = false

    if (!Success){
        FeatureKilledFails++

        if (!FeatureKilledStatus){
            const Cache = LocalStorage.get("KilledFeatures")
            if (Cache){
                FeatureKilledStatus = JSON.parse(Cache)
                return
            }
        } else if (FeatureKilledFails < 5){
            await sleep(5*1000)
            await FetchKilledFeatures()
        } else {
            FeatureKilledStatus = []
        }

        return
    }

    FeatureKilledFails = 0
    FeatureKilledStatus = Result
    LocalStorage.set("KilledFeatures", JSON.stringify(FeatureKilledStatus))
}

async function IsFeatureKilled(FeatureName){
    while (!FeatureKilledStatus){
        await sleep(100)
    }

    return FeatureKilledStatus.includes(FeatureName)
}

BindToOnMessage("getkilledfeatures", true, async function(){
    await FetchKilledFeatures()
    return FeatureKilledStatus
})

FetchKilledFeatures()
setInterval(FetchKilledFeatures, 60*1000)