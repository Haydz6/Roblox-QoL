let IsActivePrivateServersOpened = false
let LoadingParagraph = CreateLoadingParagraph()
let CurrentPage = 1

async function CreateCardsFromServers(Servers){
    const ServerListElement = await WaitForClass("hlist item-cards item-cards-embed ng-scope")
    
    ClearAllChildren(ServerListElement)

    for (let i = 0; i < Servers.length; i++){
        const Server = Servers[i]
        const Card = CreatePrivateServerCard(Server.Thumbnail, Server.Name, Server.OwnerName, Server.OwnerId, Server.Price, Server.PlaceId)

        ServerListElement.appendChild(Card)
    }

    ServerListElement.parentElement.className = "current-items"
}

async function ActivePrivateServersOpened(){
    CurrentPage = 1
    console.log("opened")

    const Servers = await GetActivePrivateServers(CurrentPage)
    console.log(Servers)

    CreateCardsFromServers(Servers)
}

function CheckActivePrivateServersOpened(){
    const TagLocation = window.location.href.split("#")[1] || ""

    console.log(TagLocation)
    if (TagLocation === "!/private-servers/active-private-servers"){
        if (IsActivePrivateServersOpened) return

        IsActivePrivateServersOpened = true
        ActivePrivateServersOpened()
    } else {
        if (!IsActivePrivateServersOpened) return

        IsActivePrivateServersOpened = false
    }
}

window.addEventListener('popstate', CheckActivePrivateServersOpened)

async function RunMain(){
    console.log("RUNNING ACTIVE")

    while (!document.head){
        await sleep(100)
    }

    const URLSplit = window.location.href.split("users/")
    const URLSplit2 = URLSplit[1].split("/")

    UserId = parseInt(URLSplit2[0])

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

RunMain()