IsFeatureEnabled("DiscordSocialLink").then(async function(Enabled){
    if (!Enabled) return

    const [Success] = [false] //not done
    if (!Success) return

    const SocialLinks = await WaitForClass("profile-social-networks")
    const Discord = document.createElement("li")

    const DiscordTag = ""

    const Clickable = document.createElement("a")
    Clickable.className = "discord-social-button"
    Clickable.title = DiscordTag

    Discord.append(Clickable)

    const Image = document.createElement("span")
    Image.className = "profile-social Discord"
    Clickable.appendChild(Image)

    Clickable.setAttribute("data-toggle", "tooltip")
    Clickable.setAttribute("data-placement", "bottom")
    Clickable.setAttribute("data-original-title", DiscordTag)

    Clickable.addEventListener("click", function(){
        navigator.clipboard.writeText(DiscordTag).then(() => {
            Clickable.setAttribute("data-original-title", "Copied to clipboard!")
            setTimeout(function(){
                Clickable.setAttribute("data-original-title", DiscordTag)
            }, 2*1000)
        })
    })

    SocialLinks.insertBefore(Discord, SocialLinks.children[0])

    InjectScript("TooltipDiscord")
})