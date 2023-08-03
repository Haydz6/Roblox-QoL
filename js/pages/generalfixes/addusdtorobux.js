IsFeatureEnabled("AddUSDToRobux").then(async function(Enabled){
    if (!Enabled) return

    let USDLabel
    let ChildRemovedObserver

    ChildAdded(await WaitForId("navbar-robux"), true, async function(){
        const Balance = await WaitForId("nav-robux-balance")
        if (ChildRemovedObserver) ChildRemovedObserver.disconnect()
        if (USDLabel) USDLabel.remove()

        ChildRemovedObserver = ChildRemoved(Balance, function(Node){
            if (Node === USDLabel && USDLabel.parentElement == null) Balance.appendChild(USDLabel)
        })

        const Robux = parseInt(Balance.innerText.replace(/\D/g, ""))

        USDLabel = document.createElement("span")
        USDLabel.className = "text-label"
        USDLabel.style = "font-size: 12px; margin: auto 0px auto 5px;"
        USDLabel.innerText = `(${await RobuxToCurrency(Robux)})`
    
        Balance.appendChild(USDLabel)

        // console.log("a")
        // const Balance = await WaitForId("nav-robux-balance")
        // console.log("b")

        // let CanAdd = true

        // ChildAdded2(Balance, true, async function(){
        //     console.log(USDLabel, CanAdd)
        //     if (!CanAdd) return
        //     CanAdd = false
            
        //     if (!USDLabel){
        //         const Robux = parseInt(Balance.children[0].innerText.replace(/\D/g, ""))
        //         USDLabel = document.createElement("span")
        //         USDLabel.className = "text-label"
        //         USDLabel.style = "font-size: 12px; margin: auto 0px auto 5px;"
        //         USDLabel.innerText = `(${await RobuxToCurrency(Robux)})`
        //     }

        //     if (ChildRemovedObserver) ChildRemovedObserver.disconnect()

        //     ChildRemovedObserver = ChildRemoved(Balance, function(Node){
        //         if (Node === USDLabel && USDLabel.parentElement == null) Balance.appendChild(USDLabel)
        //     })

        //     Balance.appendChild(USDLabel)
        // })
    })
})