let IsPurchasedGamesOpened = false
let CurrentPurchasedGamesPage = 1

let OpenPurchasedGamesConnections = []

function HideDefaultCard(Element, Hide){

    if (!Element.getAttribute("custom") && Element.className == "list-item item-card ng-scope place-item"){
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

async function CreateCardsFromPurchasedGames(Servers, ServerListElement){
    //ClearAllChildren(ServerListElement)
    HideRobloxDefaultCards(ServerListElement, true)
    ClearServerCards()

    for (let i = 0; i < Servers.length; i++){
        const Server = Servers[i]
        const Card = CreatePrivateServerCard(Server.Image, Server.Name, Server.OwnerName, Server.OwnerId, Server.Price, Server.PlaceId)

        ServerListElement.appendChild(Card)
        ServerCards.push(Card)
    }

    ServerListElement.parentElement.className = "current-items"
}

function AddConnection(Callback, Type, Element){
    OpenPurchasedGamesConnections.push({Callback: Callback, Type: Type, Element: Element})
    return Callback
}

async function PurchasedGamesOpened(){
    CurrentPurchasedGamesPage = 1
    console.log("opened")

    WaitForClass("breadcrumb-container").then(Container => {
        const LabelContainer = Container.getElementsByTagName("li")[2]
        LabelContainer.getElementsByTagName("span")[0].innerText = "Purchased"
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
        console.log("fetching next page")

        if (!IsPurchasedGamesOpened){
            return
        }

        SetButtonStatus(NextPageButton, false)
        SetButtonStatus(PreviousPageButton, false)
        PageLabel.innerText = `Page ${CurrentPurchasedGamesPage}`

        const PurchasedGames = await GetPurchasedGames(CurrentPurchasedGamesPage)

        if (!IsPurchasedGamesOpened){
            return
        }

        CreateCardsFromPurchasedGames(PurchasedGames, ServerListElement)

        SetButtonStatus(NextPageButton, PurchasedGames.length >= 30)
        SetButtonStatus(PreviousPageButton, CurrentPurchasedGamesPage > 1)
    }

    PreviousPageButton.addEventListener("click", AddConnection(function(){
        CurrentPurchasedGamesPage--
        FetchPage()
    }, "click", PreviousPageButton))

    NextPageButton.addEventListener("click", AddConnection(function(){
        CurrentPurchasedGamesPage++
        FetchPage()
    }, "click", NextPageButton))

    DefaultCardElementObserver.observe(ServerListElement, {childList: true})

    FetchPage()
}

function CheckPurchasedGamesOpened(){
    const TagLocation = window.location.href.split("#")[1] || ""
    const IsURLOpen = TagLocation === "!/places/purchased-games"

    if (IsURLOpen && !IsPurchasedGamesOpened){
        IsPurchasedGamesOpened = true
        PurchasedGamesOpened()
    } else if (!IsURLOpen && IsPurchasedGamesOpened) {
        DefaultCardElementObserver.disconnect()

        for (let i = 0; i < OpenPurchasedGamesConnections.length; i++){
            const Connection = OpenPurchasedGamesConnections[i]

            Connection.Element.removeEventListener(Connection.Type, Connection.Callback)
        }
        ClearServerCards()

        OpenPurchasedGamesConnections = []

        LoadingParagraph.style = "display:none;"

        const ServerListElement = FindFirstClass("hlist item-cards item-cards-embed ng-scope")
        if (ServerListElement) HideRobloxDefaultCards(ServerListElement, false)//ClearAllChildren(ServerListElement)

        IsPurchasedGamesOpened = false
    }
}

window.addEventListener('popstate', CheckPurchasedGamesOpened)

async function RunMain(){
    console.log("RUNNING ACTIVE")

    while (!document.head){
        await sleep(100)
    }

    // const URLSplit = window.location.href.split("users/")
    // const URLSplit2 = URLSplit[1].split("/")

    // PageUserId = parseInt(URLSplit2[0])

    let CategoriesList = await WaitForClass("menu-vertical submenus")
    console.log("got categories")

    let PlacesButton

    while (!PlacesButton){
        await sleep(100)
        PlacesButton = await GetButtonCategoryFromHref(CategoriesList, "places")
        console.log("waiting for place button")
    }

    const Parent = PlacesButton.getElementsByTagName("div")[0].getElementsByTagName("ul")[0]
    const children = Parent.children

    let PurchasedPlacesButton

    for (let i = 0; i < children.length; i++){
        if (children[i].getAttribute("href") === "#!/places/purchased"){
            PurchasedPlacesButton = children[i]
            break
        }
    }

    if (!PurchasedPlacesButton) return

    PurchasedPlacesButton.remove()

    const [NewPurchasedPlacesButton] = CreateActivePrivateServersButton("Purchased", "#!/places/purchased-games")
    Parent.insertBefore(NewPurchasedPlacesButton, Parent.nextSibiling)

    CheckPurchasedGamesOpened()
}

if (IsFeatureEnabled("PurchasedGamesFix")){
    RunMain()
}