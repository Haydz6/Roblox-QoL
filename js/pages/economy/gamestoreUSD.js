IsFeatureEnabled("AddUSDToGameStore").then(function(Enabled){
    if (!Enabled) return

    setTimeout(async function(){
        function Recheck(){
            setTimeout(Check, 100)
        }

        async function Check(){
            const Store = await WaitForClass("store-cards")
            if (Store.getAttribute("roqol")) return Recheck()
            Store.setAttribute("roqol", true)

            ChildAdded(Store, true, async function(Item){
                if (!Item.className || !Item.classList.contains("list-item")) return
    
                const PriceContainer = Item.getElementsByClassName("store-card-price")[0]
                if (!PriceContainer) return
                const RobuxLabel = PriceContainer.getElementsByClassName("text-robux")[0]
                if (!RobuxLabel) return
    
                const Robux = parseInt(RobuxLabel.innerText.replace(/\D/g, ""))
    
                const MainUSDLabel = document.createElement("span")
                MainUSDLabel.style = "font-size: 12px; margin-left: 4px;"
    
                MainUSDLabel.innerText = `(${await RobuxToCurrency(Robux)})`
    
                ChildRemoved(PriceContainer, function(Child){
                    if (Child === MainUSDLabel) PriceContainer.appendChild(MainUSDLabel)
                })
    
                PriceContainer.appendChild(MainUSDLabel)
            })

            Recheck()
        }

        Check()
    }, 0)
})