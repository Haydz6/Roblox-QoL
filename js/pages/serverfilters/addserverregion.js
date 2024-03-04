let PendingServerRegions = []
let PendingPrivateServerRegions = []

const CacheAccessCodeToRegion = {}

function AddPrivateServerRegion(NewElement){
    return new Promise(async(resolve) => {
        if (NewElement.getAttribute("has-region") || NewElement.getAttribute("jobid") === "null") return

        PendingPrivateServerRegions.push({element: NewElement, resolve: resolve})
        NewElement.setAttribute("has-region", true)

        if (PendingPrivateServerRegions.length > 1) return

        await sleep(100)

        if (PendingPrivateServerRegions.length > 10) PendingPrivateServerRegions.length = 10 //Limit to 10

        const PendingServers = {}
        const IPs = []

        let PlaceId = 0

        const ResolveLookup = {}
        let FoundOne = false

        for (let i = 0; i < PendingPrivateServerRegions.length; i++){
            const Info = PendingPrivateServerRegions[i]
            const Element = Info.element
            const Resolve = Info.resolve

            ResolveLookup[Element] = Resolve

            while (!Element.getAttribute("accesscode")) await sleep(100)

            const AccessCode = Element.getAttribute("accesscode")

            if (!PendingServers[AccessCode]) PendingServers[AccessCode] = []
            PlaceId = parseInt(Element.getAttribute("placeid"))

            if (CacheAccessCodeToRegion[AccessCode]){
                PendingServers[AccessCode].push(Element)
            }

            const [Success, Result] = await RequestFunc("https://gamejoin.roblox.com/v1/join-private-game", "POST", {"Content-Type": "application/json"}, JSON.stringify({accessCode: AccessCode, placeId: PlaceId}), true)

            PendingServers[AccessCode].push(Element)

            if (Success && Result.joinScript) IPs.push({IP: Result.joinScript.UdmuxEndpoints[0].Address || Result.joinScript.MachineAddress, Version: Result.RccVersion, AccessCode: AccessCode})
        }

        PendingPrivateServerRegions = []

        if (IPs.length === 0){
            for (const [_,Info] of Object.entries(ResolveLookup)){
                Info()
            }
            return
        }

        const [Success, Result] = await RequestFunc(WebServerEndpoints.Servers+"private", "POST", {"Content-Type": "application/json"}, JSON.stringify({PlaceId: PlaceId, IPs: IPs}))

        if (!Success){
            for (const [_,resolve] of Object.entries(ResolveLookup)){
                resolve()
            }
            return
        }

        for (let i = 0; i < Result.length; i++){
            const Server = Result[i]

            const Elements = PendingServers[Server.AccessCode]

            if (!Elements) continue

            for (let e = 0; e < Elements.length; e++){
                ResolveLookup[Elements[e]](CreateServerInfo(Elements[e], Server))
            }
        }

        for (const [_,resolve] of Object.entries(ResolveLookup)){
            resolve()
        }
    })
}

function AddServerRegion(NewElement){
    if (NewElement.parentNode?.id === "rbx-private-game-server-item-container") return AddPrivateServerRegion(NewElement)

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

        const Paid = await PaidForFeature("ServerRegions")
        const ServerEndpoint = Paid ? WebServerEndpoints.Servers : WebServerEndpoints.Servers+"discover"
        const [Success, Result] = await RequestFunc(ServerEndpoint, "POST", {"Content-Type": "application/json"}, JSON.stringify({PlaceId: PlaceId, JobIds: JobIds}))

        if (!Success || !Paid){
            for (const [_,resolve] of Object.entries(ResolveLookup)){
                resolve()
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

        for (const [_,resolve] of Object.entries(ResolveLookup)){
            resolve()
        }
    })
}