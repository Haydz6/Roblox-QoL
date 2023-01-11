let IsActivePrivateServersOpened = false
let LoadingParagraph = CreateLoadingParagraph()
let CurrentPage = 1

let OpenConnections = []
let ServerCards = []

function HideDefaultCard(Element, Hide){
    if (!Element.getAttribute("custom") && Element.className == "list-item item-card ng-scope"){
        Element.style = Hide && "display:none;" || ""
    }
}

function HideRobloxDefaultCards(ServerListElement, Hide){
    const children = ServerListElement.children

    for (let i = 0; i < children.length; i++){
       HideDefaultCard(children[i], Hide)
    }
}

function ClearServerCards(){
    for (let i = 0; i < ServerCards.length; i++){
        ServerCards[i].remove()
    }
    ServerCards = []
}

async function CreateCardsFromServers(Servers, ServerListElement){
    //ClearAllChildren(ServerListElement)
    HideRobloxDefaultCards(ServerListElement, true)
    ClearServerCards()

    for (let i = 0; i < Servers.length; i++){
        const Server = Servers[i]
        const Card = CreatePrivateServerCard(Server.Thumbnail, Server.Name, Server.OwnerName, Server.OwnerId, Server.Price, Server.PlaceId)

        ServerCards.push(Card)
        ServerListElement.appendChild(Card)
    }

    ServerListElement.parentElement.className = "current-items"
}

function AddConnection(Callback, Type, Element){
    OpenConnections.push({Callback: Callback, Type: Type, Element: Element})
    return Callback
}

async function ActivePrivateServersOpened(){
    CurrentPage = 1
    console.log("opened")

    WaitForClass("breadcrumb-container").then(Container => {
        const LabelContainer = Container.getElementsByTagName("li")[2]
        LabelContainer.getElementsByTagName("span")[0].innerText = "Active Private Servers"
    })

    const ServerListElement = await WaitForClass("hlist item-cards item-cards-embed ng-scope")
    //ClearAllChildren(ServerListElement)
    ClearServerCards()
    HideRobloxDefaultCards(ServerListElement, true)

    function SetButtonStatus(Button, Enabled){
        const NewAttribute = Enabled && "enabled" || "disabled"
        const OldAttribute = !Enabled && "enabled" || "disabled"
        Button.removeAttribute(OldAttribute)
        Button.setAttribute(NewAttribute, NewAttribute)
    }

    const NextPageButton = await WaitForClass("btn-generic-right-sm")
    const PreviousPageButton = await WaitForClass("btn-generic-left-sm")
    const PageLabel = (await WaitForClass("pager")).getElementsByTagName("li")[1].getElementsByTagName("span")[0]

    async function FetchPage(){
        if (!IsActivePrivateServersOpened){
            return
        }

        SetButtonStatus(NextPageButton, false)
        SetButtonStatus(PreviousPageButton, false)
        PageLabel.innerText = `Page ${CurrentPage}`

        const Servers = await GetActivePrivateServers(CurrentPage)

        if (!IsActivePrivateServersOpened){
            return
        }

        CreateCardsFromServers(Servers, ServerListElement)

        SetButtonStatus(NextPageButton, Servers.length >= 30)
        SetButtonStatus(PreviousPageButton, CurrentPage > 1)
    }

    PreviousPageButton.addEventListener("click", AddConnection(function(){
        CurrentPage--
        FetchPage()
    }, "click", PreviousPageButton))

    NextPageButton.addEventListener("click", AddConnection(function(){
        CurrentPage++
        FetchPage()
    }, "click", NextPageButton))

    DefaultCardElementObserver.observe(ServerListElement, {childList: true})

    FetchPage()
}

function CheckActivePrivateServersOpened(){
    const TagLocation = window.location.href.split("#")[1] || ""
    const IsURLOpen = TagLocation === "!/private-servers/active-private-servers"

    if (IsURLOpen && !IsActivePrivateServersOpened){
        IsActivePrivateServersOpened = true
        ActivePrivateServersOpened()
    } else if (!IsURLOpen && IsActivePrivateServersOpened) {
        DefaultCardElementObserver.disconnect()

        for (let i = 0; i < OpenConnections.length; i++){
            const Connection = OpenConnections[i]

            Connection.Element.removeEventListener(Connection.Type, Connection.Callback)
        }
        ClearServerCards()

        OpenConnections = []

        LoadingParagraph.style = "display:none;"

        const ServerListElement = FindFirstClass("hlist item-cards item-cards-embed ng-scope")
        if (ServerListElement) HideRobloxDefaultCards(ServerListElement, false)//ClearAllChildren(ServerListElement)

        IsActivePrivateServersOpened = false
    }
}

window.addEventListener('popstate', CheckActivePrivateServersOpened)

const DefaultCardElementObserver = new MutationObserver(function(mutationList, observer){
    mutationList.forEach(function(mutation) {
      if (mutation.type === "childList") {
        const NewNodes = mutation.addedNodes

        for (let i = 0; i < NewNodes.length; i++){
            if (NewNodes[i].nodeType === Node.ELEMENT_NODE){
                HideDefaultCard(NewNodes[i], true)
            }
        }
      }
    })
})

async function RunMain(){
    console.log("RUNNING ACTIVE")

    while (!document.head){
        await sleep(100)
    }

    // const URLSplit = window.location.href.split("users/")
    // const URLSplit2 = URLSplit[1].split("/")

    //UserId = parseInt(URLSplit2[0])

    let CategoriesList = await WaitForClass("menu-vertical submenus")
    console.log("got categories")

    let PrivateServersButton

    while (!PrivateServersButton){
        await sleep(100)
        PrivateServersButton = await GetButtonCategoryFromHref(CategoriesList, "private-servers")
    }

    console.log("got private server button")

    const [List, ActiveButton] = CreateActivePrivateServersButton()

    PrivateServersButton.getElementsByTagName("div")[0].getElementsByTagName("ul")[0].appendChild(List)

    CheckActivePrivateServersOpened()
}

if (IsFeatureEnabled("ActivePrivateServers")){
    RunMain()
}