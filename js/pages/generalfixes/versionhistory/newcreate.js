function CreateDownloadButton(){
    const Button = document.createElement("button")
    Button.className = "MuiButtonBase-root MuiButton-root jss1469 jss4591 MuiButton-text jss1472 jss4594 MuiButton-textSecondary MuiButton-textSizeSmall MuiButton-sizeSmall"
    Button.style["overflow-x"] = "visible"

    const ButtonLabel = document.createElement("span")
    ButtonLabel.className = "MuiButton-label"
    ButtonLabel.innerText = "Download"

    const SVGImage = document.createElement("img")
    SVGImage.src = chrome.runtime.getURL("img/CreateDownloadIcon.svg")
    SVGImage.className = "MuiSvgIcon-root"
    SVGImage.style = "height: 19px; margin-right: 7px;"

    const Root = document.createElement("span")
    Root.className = "MuiTouchRipple-root"

    ButtonLabel.insertBefore(SVGImage, ButtonLabel.firstChild)
    Button.append(ButtonLabel, Root)

    return Button
}

async function VersionHistoryAdded(VersionHistory){
    if (VersionHistory.nodeType !== Node.ELEMENT_NODE) return

    let Buttons

    while (!Buttons){
        Buttons = VersionHistory.getElementsByClassName("MuiTableCell-root MuiTableCell-body MuiTableCell-alignRight")[0]
        await sleep(20)
    }

    const DownloadButton = CreateDownloadButton()
    Buttons.insertBefore(DownloadButton, Buttons.firstChild)

    const PlaceId = GetPlaceId()
    const VersionNumber = parseInt(VersionHistory.getElementsByClassName("MuiTableCell-root MuiTableCell-body")[0].innerText)

    DownloadButton.addEventListener("click", function(e){
        e.stopPropagation()
        StartDownloadForVersion(PlaceId, VersionNumber)
    })
}

async function NewContainerAdded(Container){
    let VersionHistory

    while (!VersionHistory){
        VersionHistory = Container.getElementsByClassName("MuiTableBody-root")[0]
        await sleep(20)
    }

    new MutationObserver(function(Mutations){
        Mutations.forEach(function(Mutation){
            if (Mutation.type !== "childList") return

            const addedNodes = Mutation.addedNodes

            for (let i = 0; i < addedNodes.length; i++){
                VersionHistoryAdded(addedNodes[i])
            }
        })
    }).observe(VersionHistory, {childList: true})

    const children = VersionHistory.children

    for (let i = 0; i < children.length; i++){
        VersionHistoryAdded(children[i])
    }
}

let LastVersionHistoryContainer

IsFeatureEnabled("AddDownloadButtonToNewVersionHistory").then(async function(Enabled){
    if (!Enabled) return

    while (true){
        const VersionHistoryContainer = await WaitForClass("MuiTable-root")
        if (VersionHistoryContainer !== LastVersionHistoryContainer){
            LastVersionHistoryContainer = VersionHistoryContainer
            NewContainerAdded(VersionHistoryContainer)
        }

        await sleep(20)
    }
})