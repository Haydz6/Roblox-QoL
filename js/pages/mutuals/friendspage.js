let CurrentPage = 1
let CurrentMutualsElements = []
let MutualHeaderTab

let OriginalFriendsCount

let OpenConnections = []

let AllMutuals

async function LoadPage(Page){
    if (!AllMutuals){
        while (true){
            const [Success, Result] = await GetMutualFriends(GetTargetId())

            if (!Success){
                await sleep(1000)
                continue
            }

            AllMutuals = Result.reverse()
            break
        }
    }

    const PageFriends = []

    const Start = (Page * 18) - 18
    const End = Math.min(Page * 18, AllMutuals.length)

    for (let i = Start; i < End; i++){
        PageFriends.push(AllMutuals[i])
    }

    return [PageFriends, AllMutuals.length > Page * 18, AllMutuals.length]
}

function ModifyHeaderTab(Tab){
    if (Tab.className.includes("rbx-tab")){
        Tab.style = "min-width: 25%;"

        if (!Tab.getAttribute("custom")) Tab.getElementsByTagName("a")[0].className = "rbx-tab-heading"
    }
}

function RemoveOriginalFriendElement(Element){
    if (Element.className === "list-item avatar-card" && !Element.getAttribute("custom")) Element.style = "display:none;"
}

const FriendsListMutationObserver = new MutationObserver(function(Mutations){
    Mutations.forEach(function(Mutation){
        if (Mutation.type == "childList"){
            const NewChildren = Mutation.addedNodes

            for (let i = 0; i < NewChildren.length; i++){
                RemoveOriginalFriendElement(NewChildren[i])
            }
        }
    })
})

function AddConnection(Callback, Type, Element){
    OpenConnections.push({Callback: Callback, Type: Type, Element: Element})
    return Callback
}

async function HandleTabModification(){
    const NavTabs = await WaitForClass("nav nav-tabs")

    ChildAdded(NavTabs, true, ModifyHeaderTab)

    const [Tab, Underline] = CreateHeaderTab("Mutuals", "mutuals", "#!/friends?tab=mutuals", IsMutualsTabOpen())
    NavTabs.appendChild(Tab)
    MutualHeaderTab = Underline
}

function IsMutualsTabOpen(){
    return window.location.href.search("tab=mutuals") > -1
}

function CreateFromFriendHistory(Friend, FriendsList){
    const Element = CreateFriend(Friend.id, Friend.name, Friend.displayName, Friend.Image, undefined, undefined, undefined, Friend.hasVerifiedBadge)

    CurrentMutualsElements.push(Element)

    FriendsList.appendChild(Element)
}

async function AddImagesToHistory(AllHistory){
    const Requests = []
    const IdToHistory = {}

    for (let i = 0; i < AllHistory.length; i++){
        const History = AllHistory[i]

        if (History.Image) continue

        if (!IdToHistory[History.id]){
            IdToHistory[History.id] = []
        }

        IdToHistory[History.id].push(History)

        Requests.push({
            requestId: History.id,
            targetId: History.id,
            type: 2,
            size: "150x150",
            format: "Png",
            isCircular: true
        })
    }

    if (Requests.length === 0) return

    const [Success, Result] = await RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", {"Content-Type": "application/json"}, JSON.stringify(Requests), true)

    if (!Success){
        for (const [Id, TheHistory] of Object.entries(IdToHistory)) {
            for (let i = 0; i < TheHistory.length; i++){
                TheHistory[i].Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
            }
        }
        return
    }

    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const Info = Data[i]
        const TheHistory = IdToHistory[Info.targetId]

        for (let i = 0; i < TheHistory.length; i++){
            const History = TheHistory[i]

            if (Info.state === "Completed") History.Image = Info.imageUrl
            else History.Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
        }
    }
}

async function HandleMutualsPage(){
    await sleep(100)
    const BackButton = await WaitForClass("btn-generic-left-sm")
    const NextButton = await WaitForClass("btn-generic-right-sm")
    const PageLabel = await WaitForId("rbx-current-page")
    const FriendsList = await WaitForClass("hlist avatar-cards")

    function SetButtonStatus(Button, Enabled){
        const NewAttribute = Enabled && "enabled" || "disabled"
        const OldAttribute = !Enabled && "enabled" || "disabled"

        Button.removeAttribute(OldAttribute)
        Button.setAttribute(NewAttribute, NewAttribute)
    }

    async function Fetch(){
        await sleep(50)

        SetButtonStatus(BackButton, false)
        SetButtonStatus(NextButton, false)

        for (let i = 0; i < CurrentMutualsElements.length; i++){
            CurrentMutualsElements[i].remove()
        }
        CurrentMutualsElements = []

        const [History, NextExists, Length] = await LoadPage(CurrentPage)
        await AddImagesToHistory(History)

        for (let i = 0; i < History.length; i++){
            CreateFromFriendHistory(History[i], FriendsList)
        }

        await sleep(50)

        SetButtonStatus(BackButton, CurrentPage > 1)
        SetButtonStatus(NextButton, NextExists)
        PageLabel.innerText = CurrentPage

        WaitForClass("friends-subtitle").then(function(AllLabels){
            let FriendsAmountLabel = AllLabels.childNodes[2]
            let FriendsLabel = AllLabels.childNodes[0]

            if (!OriginalFriendsCount) OriginalFriendsCount = FriendsAmountLabel.data

            FriendsLabel.data = "Mutuals"
            FriendsAmountLabel.data = `(${Length})`
        })
    }

    NextButton.addEventListener("click", AddConnection(function(){
        CurrentPage ++
        Fetch()
    }, "click", NextButton))

    BackButton.addEventListener("click", AddConnection(function(){
        CurrentPage --
        Fetch()
    }, "click", BackButton))

    Fetch()

    FriendsListMutationObserver.observe(FriendsList, {childList: true})

    const children = FriendsList.children
    for (let i = 0; i < children.length; i++){
        RemoveOriginalFriendElement(children[i])
    }
}

function CheckIfMutualsTabOpened(){
    const Open = IsMutualsTabOpen()

    WaitForClass("friends-filter-status input-group-btn dropdown btn-group").then(function(Dropdown){
        Dropdown.style = Open && "display:none;" || ""
    })
    WaitForClass("friends-filter").then(function(Filter){
        Filter.style = Open && "display:none;" || ""
    })

    MutualHeaderTab.className = `rbx-tab-heading${Open && " active" || ""}`

    if (!Open){
        FriendsListMutationObserver.disconnect()

        for (let i = 0; i < CurrentMutualsElements.length; i++){
            CurrentMutualsElements[i].remove()
        }
        CurrentMutualsElements = []

        for (let i = 0; i < OpenConnections.length; i++){
            const Connection = OpenConnections[i]

            Connection.Element.removeEventListener(Connection.Type, Connection.Callback)
        }
        OpenConnections = []

        WaitForClass("hlist avatar-cards").then(function(FriendsList){
            const children = FriendsList.children
            for (let i = 0; i < children.length; i++){
                children[i].style = ""
            }
        })

        WaitForClass("friends-subtitle").then(function(AllLabels){
            let FriendsAmountLabel = AllLabels.childNodes[2]
            let FriendsLabel = AllLabels.childNodes[0]

            FriendsLabel.data = "Friends"
            if (OriginalFriendsCount) FriendsAmountLabel.data = OriginalFriendsCount
        })

        return
    }

    HandleMutualsPage()
}

window.addEventListener('popstate', CheckIfMutualsTabOpened)

IsFeatureEnabled("Mutuals").then(async function(Enabled){
    if (!Enabled) return

    await HandleTabModification()
    CheckIfMutualsTabOpened()
})