IsFeatureEnabled("HideSerials").then(async function(Enabled){
    if (!Enabled) return

    const ButtonContainer = document.createElement("div")
    ButtonContainer.className = "trades-header-option"

    ButtonContainer.innerHTML = `<span class="limited-icon-container hide-serials" style="cursor: pointer;"> <span class="icon-shop-limited"> </span> <span class="limited-number-container dont-hide">  <span class="font-caption-header text-header" style="white-space: nowrap;"></span> </span></span>`

    const HideSerials = ButtonContainer.getElementsByClassName("hide-serials")[0]
    const Label = HideSerials.getElementsByClassName("text-header")[0]
    let SerialsHidden = false

    const HideStyle = document.createElement("style")
    document.head.appendChild(HideStyle)

    function UpdateSerialToggle(){
        Label.innerText = SerialsHidden ? "Show Serials" : "Hide Serials"
        
        if (SerialsHidden) HideStyle.innerHTML = `.limited-number-container:not(.dont-hide) {display: none!important;} body .tooltip {display: none!important;}`
        else HideStyle.innerHTML = ``
    }

    HideSerials.addEventListener("click", function(){
        SerialsHidden = !SerialsHidden
        UpdateSerialToggle()
    })

    UpdateSerialToggle()

    const TradeList = await WaitForClass("trades-list-detail")
    ChildAdded(TradeList, true, function(Trade){
        if (!Trade.tagName) return
        Trade.insertBefore(ButtonContainer, Trade.getElementsByClassName("trades-header-nowrap")[0].nextSibling)
    })
})