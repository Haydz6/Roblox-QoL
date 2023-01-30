async function DisableFooter(){
    const Footer = await WaitForId("footer-container")
    Footer.style = "display: none;"

    document.body.style = "margin-bottom: 0px;"
}

IsFeatureEnabled("HideFooter").then(function(Enabled){
    if (Enabled) DisableFooter()
})