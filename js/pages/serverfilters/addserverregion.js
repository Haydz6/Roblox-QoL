let PendingServerRegions = []

async function AddServerRegion(NewElement){
    if (NewElement.getAttribute("has-region")) return

    PendingServerRegions.push(NewElement)
    NewElement.setAttribute("has-region", true)

    if (PendingServerRegions.length > 1) return

    await sleep(100)

    const PendingServers = {}
    const JobIds = []

    let PlaceId = 0

    for (let i = 0; i < PendingServerRegions.length; i++){
        const Element = PendingServerRegions[i]

        while (!Element.getAttribute("data-gameid")) await sleep(100)

        const JobId = Element.getAttribute("data-gameid")

        if (!PendingServers[JobId]) PendingServers[JobId] = []

        PendingServers[JobId].push(Element)
        JobIds.push(JobId)

        PlaceId = parseInt(Element.getAttribute("data-placeid"))
    }

    PendingServerRegions = []

    const [Success, Result] = await RequestFunc(WebServerEndpoints.Servers, "POST", undefined, JSON.stringify({PlaceId: PlaceId, JobIds: JobIds}))

    if (!Success) return

    for (let i = 0; i < Result.length; i++){
        const Server = Result[i]

        const Elements = PendingServers[Server.JobId]

        if (!Elements) continue

        for (let e = 0; e < Elements.length; e++){
            CreateServerInfo(Elements[e], Server)
        }
    }
}