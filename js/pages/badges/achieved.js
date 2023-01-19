let PendingBadgeAwardedFetches = []

function RequestBadgeInfo(BadgeId){
    return new Promise(async(resolve) => {
        PendingBadgeAwardedFetches.push({Resolve: resolve, Badge: BadgeId})

        if (PendingBadgeAwardedFetches.length > 1) return

        await sleep(100)

        const PendingFetches = PendingBadgeAwardedFetches
        PendingBadgeAwardedFetches = []

        const PendingBadgeIds = []

        for (let i = 0; i < PendingFetches.length; i++){
            PendingBadgeIds.push(PendingFetches[i].Badge)
        }

        const [Success, Result] = await RequestFunc(`https://badges.roblox.com/v1/users/${UserId}/badges/awarded-dates?badgeIds=${PendingBadgeIds.join(",")}`)

        if (!Success){
            for (let i = 0; i < PendingFetches.length; i++){
                PendingFetches[i].Resolve([false])
            }
            return
        }

        const BadgeIdToResolve = {}
        for (let i = 0; i < PendingFetches.length; i++){
            const Info = PendingFetches[i]
            BadgeIdToResolve[Info.Badge] = Info.Resolve
        }

        const Data = Result.data

        for (let i = 0; i < Data.length; i++){
            const Badge = Data[i]
            const Resolve = BadgeIdToResolve[Badge.badgeId]

            Resolve([true, Badge.awardedDate])
            delete BadgeIdToResolve[Badge.badgeId]
        }

        for (const [BadgeId, Resolve] of Object.entries(BadgeIdToResolve)) {
            Resolve([false])
        }
    })
}

async function NewBadge(Element){
    if (!Element.className || Element.className.search("badge-row") === -1) return

    const Stats = Element.getElementsByClassName("badge-content")[0].getElementsByClassName("badge-stats-container")[0]
    const BadgeId = parseInt(Element.getElementsByClassName("badge-image")[0].getElementsByTagName("a")[0].getElementsByTagName("thumbnail-2d")[0].getElementsByClassName("thumbnail-2d-container")[0].getAttribute("thumbnail-target-id"))

    const [Success, Timestamp] = await RequestBadgeInfo(BadgeId)

    if (!Success) return

    const StatContainer = document.createElement("li")
    const Title = document.createElement("div")
    Title.className = "text-label ng-binding"
    Title.innerText = "Achieved At"

    const Value = document.createElement("div")
    Value.className = "font-header-2 badge-stats-info ng-binding"
    Value.innerText = TimestampToDate(Timestamp, false)

    StatContainer.appendChild(Title)
    StatContainer.appendChild(Value)

    Stats.appendChild(StatContainer)

    const children = Stats.children
    for (let i = 0; i < children.length; i++){
        children[i].style = "width: 25%!important;"
    }
}

const NewBadgeObserver = new MutationObserver(function(Mutations){
    Mutations.forEach(function(Mutation){
        if (Mutation.type !== "childList") return

        const addedNodes = Mutation.addedNodes

        for (let i = 0; i < addedNodes.length; i++){
            NewBadge(addedNodes[i])
        }
    })
})

async function HookToBadgeList(){
    const BadgeList = await WaitForClass("stack-list")

    NewBadgeObserver.observe(BadgeList, {childList: true})

    const children = BadgeList.children
    for (let i = 0; i < children.length; i++){
        NewBadge(children[i])
    }
}

IsFeatureEnabled("AwardedBadgeDates").then(function(Enabled){
    if (Enabled){
        HookToBadgeList()
    }
})