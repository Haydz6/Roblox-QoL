IsFeatureEnabled("AddUSDToRobux").then(async function(Enabled){
    if (!Enabled) return

    let USDLabel
    let MainUSDLabel
    let ChildRemovedObserver

    let CurrentRobux

    function UpdateVisibility(){
        if (window.innerWidth < 992 || (CurrentRobux !== undefined && CurrentRobux >= 10000)){
            if (MainUSDLabel) MainUSDLabel.style.display = "none"
        } else {
            if (MainUSDLabel) MainUSDLabel.style.display = ""
        }
    }

    window.addEventListener("resize", UpdateVisibility)

    WaitForId("nav-robux-icon").then(async function(Container){
        const [Success, Result] = await RequestFunc(`https://economy.roblox.com/v1/users/${await GetUserId()}/currency`, "GET", null, null, true)
        if (!Success) return

        CurrentRobux = Result.robux

        MainUSDLabel = document.createElement("span")
        MainUSDLabel.style = "font-size: 12px; margin-left: 4px;"

        MainUSDLabel.innerText = `(${await RobuxToCurrency(Result.robux)})`

        UpdateVisibility()
        Container.appendChild(MainUSDLabel)
    })

    ChildAdded(await WaitForId("navbar-robux"), true, async function(){
        const Balance = await WaitForId("nav-robux-balance")
        if (ChildRemovedObserver) ChildRemovedObserver.disconnect()
        if (USDLabel) USDLabel.remove()

        ChildRemovedObserver = ChildRemoved(Balance, function(Node){
            if (Node === USDLabel && USDLabel.parentElement == null) Balance.appendChild(USDLabel)
        })

        const Robux = parseInt(Balance.innerText.replace(/\D/g, ""))
        if (CurrentRobux === undefined) CurrentRobux = Robux

        USDLabel = document.createElement("span")
        USDLabel.className = "text-label"
        USDLabel.style = "font-size: 12px; margin: auto 0px auto 5px;"
        USDLabel.innerText = `(${await RobuxToCurrency(Robux)})`
    
        Balance.appendChild(USDLabel)
    })
})