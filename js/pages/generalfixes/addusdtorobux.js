IsFeatureEnabled("AddUSDToRobux").then(async function(Enabled){
    if (!Enabled) return

    let USDLabel
    let ChildRemovedObserver

    ChildAdded(await WaitForId("navbar-robux"), true, async function(){
        const Balance = await WaitForId("nav-robux-balance")

        let CanAdd = true

        ChildAdded(Balance, true, async function(){
            if (!CanAdd) return
            CanAdd = false

            if (!USDLabel){
                const Robux = parseInt(Balance.children[0].innerText.replace(/\D/g, ""))
                USDLabel = document.createElement("span")
                USDLabel.className = "text-label"
                USDLabel.style = "font-size: 12px; margin: auto 0px auto 5px;"
                USDLabel.innerText = `(${await RobuxToCurrency(Robux)})`
            }

            if (ChildRemovedObserver) ChildRemovedObserver.disconnect()

            ChildRemovedObserver = ChildRemoved(Balance, function(Node){
                if (Node === USDLabel && USDLabel.parentElement == null) Balance.appendChild(USDLabel)
            })

            Balance.appendChild(USDLabel)
        })
    })
})