function CreateValueOverview(){
    const Container = document.createElement("span")
    Container.className = "trade-value-overview"

    const Stripe = document.createElement("div")
    Stripe.className = "stripe"
    Stripe.style = "background-color: #00000000;"

    const Divider = document.createElement("div")
    Divider.className = "divider"

    const Price1 = document.createElement("p")
    Price1.className = "price"
    Price1.innerText = "..."

    const Price2 = document.createElement("p")
    Price2.className = "price"
    Price2.innerText = "..."

    Container.append(Stripe, Divider, Price1, Price2)

    return [Container, Stripe, Price1, Price2]
}

async function AddQuickDecline(TradeRow){
    const SelectionLabel = await WaitForClass("rbx-selection-label")
    const Type = SelectionLabel.innerText

    if (Type !== "Outbound" && Type !== "Inbound") return

    if (Type === "Inbound" && !IsFeatureEnabled("QuickDecline")) return
    if (Type === "Outbound" && !IsFeatureEnabled("QuickCancel")) return

    const OpenLabel = TradeRow.getElementsByClassName("text-date-hint ng-binding")[0]
    OpenLabel.innerText += " | "

    const DeclineButton = document.createElement("a")
    DeclineButton.innerText = Type === "Inbound" && "Decline" || "Cancel"
    OpenLabel.appendChild(DeclineButton)

    DeclineButton.addEventListener("click", async function(){
        const TradeListDetails = await WaitForClass("trades-list-detail")
        let DataTrade

        while (!DataTrade || DataTrade.getAttribute("tradeid") != TradeRow.getAttribute("tradeid")){
            await sleep(20)
            DataTrade = TradeListDetails.getElementsByTagName("div")[0]
        }

        const TradeButtons = DataTrade.getElementsByClassName("trade-buttons")[0]

        if (!TradeButtons) return

        const AllButtons = TradeButtons.children

        for (let i = 0; i < AllButtons.length; i++){
            const Button = AllButtons[i]
            console.log(Button.className.search("btn-control-md"), Button.innerText === "Decline", Button.className.search("ng-hide"))
            if (Button.className.search("btn-control-md") > -1 && Button.innerText === "Decline" && Button.className.search("ng-hide") === -1){
                Button.click()
                const Confirm = FindFirstId("modal-action-button")
                if (Confirm) Confirm.click()
                break
            }
        }
    })
}

async function TradeRowAdded(TradeRow){
    if (!TradeRow.className || TradeRow.className.search("trade-row") === -1) return
    AddQuickDecline(TradeRow)

    const DetailsElement = TradeRow.getElementsByTagName("div")[1].getElementsByTagName("div")[0].getElementsByTagName("div")[0]

    const [Container, Stripe, Price1, Price2] = CreateValueOverview()
    DetailsElement.appendChild(Container)

    let TradeId
    while (!TradeId){
        TradeId = TradeRow.getAttribute("tradeid")
        await sleep(20)
    }

    DetailsElement.getElementsByClassName("text-lead ng-binding")[0].appendChild(CreateLinkIcon(`https://www.rolimons.com/player/${TradeRow.getAttribute("userid")}`))

    while (true){
        const [Success, Result, Response] = await RequestFunc(`https://trades.roblox.com/v1/trades/${TradeId}`, "GET", undefined, undefined, true)

        function Failed(){
            Price1.innerText = "???"
            Price2.innerText = "???"
        }

        if (!Success){
            if (Response.status === 429){
                await sleep(1000*2)
                continue
            }
            Failed()
            break
        }

        let Values = {Received: 0, Gave: 0}

        const Offers = Result.offers

        for (let i = 0; i < Offers.length; i++){
            const Offer = Offers[i]
            const Type = Offer.user.id == UserId && "Gave" || "Received"
            const Assets = Offer.userAssets

            const AssetIds = []

            for (let o = 0; o < Assets.length; o++){
                AssetIds.push(Assets[o].assetId)
                // const [Success, Info] = await GetItemDetails(Assets[o].assetId)

                // if (!Success){
                //     Failed()
                //     return
                // }

                // Values[Type] += Info.Value
            }

            const [Success, _, Value] = await GetItemDetails(AssetIds, true)

            if (!Success){
                Failed()
                return
            }

            Values[Type] = Value
        }

        Price1.innerText = numberWithCommas(Values.Gave)
        Price2.innerText = numberWithCommas(Values.Received)

        Stripe.style = `background-color: ${Values.Gave > Values.Received && "#ab3130" || "#4f7b58"};`
        break
    }   
}

async function Main(){
    const InviteScript = document.createElement("script")
    InviteScript.src = chrome.runtime.getURL("js/pages/trades/injecttrade.js")
    document.head.appendChild(InviteScript)

    const OuterList = await WaitForId("trade-row-scroll-container")
    const TradesList = OuterList.getElementsByClassName("simplebar-wrapper")[0].getElementsByClassName("simplebar-mask")[0].getElementsByClassName("simplebar-offset")[0].getElementsByClassName("simplebar-content-wrapper")[0].getElementsByClassName("simplebar-content")[0]

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const NewElements = Mutation.addedNodes

            for (let i = 0; i < NewElements.length; i++){
                TradeRowAdded(NewElements[i])
            }
        })
    }).observe(TradesList, {childList: true})

    const Children = TradesList.children

    for (let i = 0; i < Children.length; i++){
        TradeRowAdded(Children[i])
    }
}

IsFeatureEnabled("ValuesOnOverview").then(function(Enabled){
    if (Enabled) Main()
})