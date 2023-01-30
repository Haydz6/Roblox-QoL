function SetupImages(){
    const [ImageList, SetImages] = CreateThemeList()

    RequestFunc(WebServerEndpoints.Themes, "GET").then(function([Success, Result]){
        if (!Success) return

        SetImages(Result)
    })

    return ImageList
}

async function Main(){
    const ProfileHeader = await WaitForClass("section profile-header")
    const Sections = ProfileHeader.parentElement

    const [ThemeSection, ThemeContent] = CreateThemeSection()
    Sections.insertBefore(ThemeSection, ProfileHeader.nextSibling)

    ThemeContent.appendChild(SetupImages())
}

IsFeatureEnabled("ProfileThemes").then(function(Enabled){
    if (Enabled) Main()
})