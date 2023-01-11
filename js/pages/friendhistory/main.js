let CurrentPage = 1
let CurrentHistoryElements = []
let HistoryHeaderTab

function ModifyHeaderTab(Tab){
    if (Tab.className === "rbx-tab"){
        Tab.style = "min-width: 20%;"

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

const TabWidthMutationObserver = new MutationObserver(function(Mutations){
    Mutations.forEach(function(Mutation){
        if (Mutation.type == "childList"){
            const NewChildren = Mutation.addedNodes

            for (let i = 0; i < NewChildren.length; i++){
                ModifyHeaderTab(NewChildren[i])
            }
        }
    })
})

async function HandleTabModification(){
    const NavTabs = await WaitForClass("nav nav-tabs")

    TabWidthMutationObserver.observe(NavTabs, {childList: true})

    const Children = NavTabs.children
    for (let i = 0; i < Children.length; i++){
        ModifyHeaderTab(Children[i])
    }

    const [Tab, Underline] = CreateHeaderTab("History", "history", "#!/friends?tab=history", IsHistoryTabOpen())
    NavTabs.appendChild(Tab)
    HistoryHeaderTab = Underline
}

function IsHistoryTabOpen(){
    return window.location.href.search("tab=history") > -1
}

function CreateFromFriendHistory(Friend, FriendsList){
    const Element = CreateFriend(Friend.Id, Friend.Name, Friend.DisplayName, Friend.Image, Friend.Type, Friend.FriendedTimestamp, Friend.UnfriendedTimestamp, Friend.Verified)

    CurrentHistoryElements.push(Element)

    FriendsList.appendChild(Element)
}

async function AddNamesToHistory(AllHistory){
    const IdsToFetch = []
    const IdToHistory = {}

    for (let i = 0; i < AllHistory.length; i++){
        const History = AllHistory[i]

        if (History.Name) continue

        IdsToFetch.push(History.Id)
        IdToHistory[History.Id] = History
    }

    if (IdsToFetch.length === 0) return

    const [Success, Result] = await RequestFunc("https://users.roblox.com/v1/users", "POST", {"Content-Type": "application/json"}, JSON.stringify({userIds: IdsToFetch, excludeBannedUsers: false}))

    if (!Success){
        for (const [Id, History] of Object.entries(IdToHistory)) {
            History.Name = "???"
            History.DisplayName = "???"
        }
        return
    }

    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const Info = Data[i]
        const History = IdToHistory[Info.id]

        History.Name = Info.name
        History.DisplayName = Info.displayName
        History.Verified = Info.hasVerifiedBadge

        delete IdToHistory[Info.id]
    }

    for (const [Id, History] of Object.entries(IdToHistory)) {
        History.DisplayName = "Terminated"
        History.Name = Id
    }
}

async function AddImagesToHistory(AllHistory){
    const Requests = []
    const IdToHistory = {}

    for (let i = 0; i < AllHistory.length; i++){
        const History = AllHistory[i]

        if (History.Image) continue

        IdToHistory[History.Id] = History

        Requests.push({
            requestId: History.Id,
            targetId: History.Id,
            type: 2,
            size: "150x150",
            format: "Png",
            isCircular: true
        })
    }

    if (Requests.length === 0) return

    const [Success, Result] = await RequestFunc("https://thumbnails.roblox.com/v1/batch", "POST", {"Content-Type": "application/json"}, JSON.stringify(Requests), true)

    if (!Success){
        for (const [Id, History] of Object.entries(IdToHistory)) {
            History.Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
        }
        return
    }

    const Data = Result.data

    for (let i = 0; i < Data.length; i++){
        const Info = Data[i]
        const History = IdToHistory[Info.targetId]

        if (Info.state === "Completed") History.Image = Info.imageUrl
        else History.Image = "https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/150/150/Image/Png"
    }
}

async function HandleHistoryPage(){
    console.log("handling")

    const FriendsList = await WaitForClass("hlist avatar-cards")
    let FriendsAmountLabel = (await WaitForClass("friends-subtitle")).childNodes[2]
    let FriendsLabel = (await WaitForClass("friends-subtitle")).childNodes[0]

    const BackButton = await WaitForClass("btn-generic-left-sm")
    const NextButton = await WaitForClass("btn-generic-right-sm")
    const PageLabel = await WaitForId("rbx-current-page")

    console.log("got pages")

    FriendsLabel.innerText = "All Friends"

    function SetButtonStatus(Button, Enabled){
        const NewAttribute = Enabled && "enabled" || "disabled"
        const OldAttribute = !Enabled && "enabled" || "disabled"

        Button.removeAttribute(OldAttribute)
        Button.setAttribute(NewAttribute, NewAttribute)
    }

    async function Fetch(){
        SetButtonStatus(BackButton, false)
        SetButtonStatus(NextButton, false)

        for (let i = 0; i < CurrentHistoryElements.length; i++){
            CurrentHistoryElements[i].remove()
        }
        CurrentHistoryElements = []

        const [History, NextExists, Length] = await LoadPage(CurrentPage)
        await Promise.all([AddNamesToHistory(History), AddImagesToHistory(History)])

        for (let i = 0; i < History.length; i++){
            CreateFromFriendHistory(History[i], FriendsList)
        }

        SetButtonStatus(BackButton, CurrentPage > 1)
        SetButtonStatus(NextButton, NextExists)
        PageLabel.innerText = CurrentPage

        FriendsAmountLabel.innerText = `(${Length})`
    }

    NextButton.addEventListener("click", function(){
        CurrentPage ++
        Fetch()
    })

    BackButton.addEventListener("click", function(){
        CurrentPage --
        Fetch()
    })

    Fetch()

    FriendsListMutationObserver.observe(FriendsList, {childList: true})

    const children = FriendsList.children
    for (let i = 0; i < children.length; i++){
        RemoveOriginalFriendElement(children[i])
    }
}

function CheckIfHistoryTabOpened(){
    const Open = IsHistoryTabOpen()

    WaitForClass("friends-filter-status input-group-btn dropdown btn-group").then(function(Dropdown){
        Dropdown.style = Open && "display:none;" || ""
    })
    WaitForClass("friends-filter").then(function(Filter){
        Filter.style = Open && "display:none;" || ""
    })

    HistoryHeaderTab.className = `rbx-tab-heading${Open && " active" || ""}`

    if (!Open){
        for (let i = 0; i < CurrentHistoryElements.length; i++){
            CurrentHistoryElements[i].remove()
        }
        CurrentHistoryElements = []

        WaitForClass("hlist avatar-cards").then(function(FriendsList){
            const children = FriendsList.children
            for (let i = 0; i < children.length; i++){
                children[i].style = ""
            }
        })

        return
    }

    HandleHistoryPage()
}

window.addEventListener('popstate', CheckIfHistoryTabOpened)

async function Main(){
    await HandleTabModification()
    CheckIfHistoryTabOpened()
}

if (IsFeatureEnabled("FriendHistory")){
    Main()
}