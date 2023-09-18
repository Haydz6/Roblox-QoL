//I should just make a dispatch event for this :(

function TooltipDiscord(){
    const Icons = document.getElementsByClassName("discord-social-button")

    if (Icons.length > 0){
        new MutationObserver(function(Mutations){
            Mutations.forEach(function(Mutation){
                if (Mutation.type === "attributes" && Mutation.attributeName == "data-original-title"){
                    const Tooltip = Icons[0].parentElement.getElementsByClassName("tooltip-inner")[0]
                    if (Tooltip) Tooltip.innerText = Icons[0].getAttribute("data-original-title")
                }
            })
        }).observe(Icons[0], {attributes: true})

        $(Icons[0]).tooltip()
    }
}

TooltipDiscord()