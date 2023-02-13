let DropdownOptionsOpen = false
let TradesDropdown

function UpdateOptionsDropdownVisibility(){
    TradesDropdown.style = !DropdownOptionsOpen && "display: none;" || "display: block;"
}

IsFeatureEnabled("TradeFilters").then(async function(Enabled){
    if (!Enabled) return

    const DropdownsList = await WaitForClass("input-group-btn group-dropdown trade-list-dropdown")
    const DefaultButtonsList = DropdownsList.getElementsByClassName("dropdown-menu")[0]

    TradesDropdown = CreateTradeDropdown()
    const OptionsButton = CreateTradeDropdownOption("Trade Options")

    let ShouldKeepOpen = false

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type === "attributes"){
                if (Mutation.attributeName === "class"){
                    if (ShouldKeepOpen){
                        DropdownsList.className = "input-group-btn group-dropdown trade-list-dropdown open"
                        ShouldKeepOpen = false
                    } else if (DropdownsList.className.search("open") === -1){
                        DropdownOptionsOpen = false
                        UpdateOptionsDropdownVisibility()
                        ShouldKeepOpen = false
                    }
                }
            }
        })
    }).observe(DropdownsList, {attributes: true})

    OptionsButton.addEventListener("click", async function(){
        DropdownOptionsOpen = !DropdownOptionsOpen
        UpdateOptionsDropdownVisibility()

        ShouldKeepOpen = true
    })
    UpdateOptionsDropdownVisibility()

    DeclineAllInbounds()
    CancelAllOutbounds()
    DeclineAgedTrades()
    DeclineLoss()
    DeclineInboundProjections()
    DeclineInvalidTrades()

    DropdownsList.appendChild(TradesDropdown)

    DefaultButtonsList.appendChild(OptionsButton)
})