IsFeatureEnabled("AddUSDToTransactions").then(async function(Enabled){
    if (!Enabled) return

    const Container = await WaitForClass("user-transactions-container")
    ChildAdded(Container, true, async function(Child){
        if (Child.className !== "summary") return

        const Summary = await WaitForTagPath(await WaitForClassPath(Child, "table summary"), "tbody")
        ChildAdded(Summary, true, function(Child){
            const RobuxContainer = Child.getElementsByClassName("icon-robux-container")[0]
            if (!RobuxContainer) return

            const Children = RobuxContainer.children
            const Label = Children[Children.length-1]

            const USDLabel = document.createElement("span")
            USDLabel.style = "margin-left: 6px; font-size: 14px; color: #4cb13f;"

            let Update = 0
            async function UpdateRobux(){
                const Robux = parseInt(Label.innerText.replace(/\D/g, ""))
                if (!isNaN(Robux)){
                    Update++
                    const Cache = Update
                    const Currency = await RobuxToCurrency(Robux)

                    if (Cache == Update) USDLabel.innerText = `(${Currency})`
                }
            }

            RobuxContainer.appendChild(USDLabel)

            new MutationObserver(UpdateRobux).observe(Label, {subtree: true, characterData: true})
            UpdateRobux()
        })
    })
})