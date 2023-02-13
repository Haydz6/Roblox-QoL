function CreateDownloadButton(){
    const Button = document.createElement("span")
    Button.className = "btn-control btn-control-medium revertLink"
    Button.innerText = "Download"

    return Button
}

IsFeatureEnabled("AddDownloadButtonToNewVersionHistory").then(async function(Enabled){
    if (!Enabled) return

    const PlaceId = GetPlaceId()

    ChildAdded(await WaitForId("versionHistoryItems"), true, async function(Container){
        console.log("new")
        let Table

        while (!Table){
            Table = Container.getElementsByTagName("tbody")[0]
            await sleep(20)
        }

        ChildAdded(Table, true, function(History){
            const TDs = History.getElementsByTagName("td")
            if (TDs.length === 0) return

            const VersionNumber = parseInt(History.children[0].innerText)

            const Buttons = TDs[TDs.length-1]
            const DownloadButton = CreateDownloadButton()
            Buttons.insertBefore(DownloadButton, Buttons.firstChild)

            DownloadButton.addEventListener("click", function(e){
                e.stopPropagation()
                StartDownloadForVersion(PlaceId, VersionNumber)
            })
        })
    })
})