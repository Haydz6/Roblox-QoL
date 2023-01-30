let PendingServerRegions = []

function AddServerRegion(NewElement){
    return new Promise(async(resolve) => {
        if (NewElement.getAttribute("has-region")) return

        PendingServerRegions.push({element: NewElement, resolve: resolve})
        NewElement.setAttribute("has-region", true)

        if (PendingServerRegions.length > 1) return

        await sleep(100)

        const PendingServers = {}
        const JobIds = []

        let PlaceId = 0

        const ResolveLookup = {}

        for (let i = 0; i < PendingServerRegions.length; i++){
            const Info = PendingServerRegions[i]
            const Element = Info.element
            const Resolve = Info.resolve

            ResolveLookup[Element] = Resolve

            while (!Element.getAttribute("jobid")) await sleep(100)

            const JobId = Element.getAttribute("jobid")

            if (!PendingServers[JobId]) PendingServers[JobId] = []

            PendingServers[JobId].push(Element)
            JobIds.push(JobId)

            PlaceId = parseInt(Element.getAttribute("placeid"))
        }

        PendingServerRegions = []

        const [Success, Result] = await RequestFunc(WebServerEndpoints.Servers, "POST", undefined, JSON.stringify({PlaceId: PlaceId, JobIds: JobIds}))

        if (!Success){
            for (const [_,Info] of Object.entries(ResolveLookup)){
                Info.resolve()
            }
            return
        }

        for (let i = 0; i < Result.length; i++){
            const Server = Result[i]

            const Elements = PendingServers[Server.JobId]

            if (!Elements) continue

            for (let e = 0; e < Elements.length; e++){
                ResolveLookup[Elements[e]](CreateServerInfo(Elements[e], Server))
            }
        }
    })
}