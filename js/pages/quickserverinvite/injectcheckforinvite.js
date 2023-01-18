const InviteScript = document.createElement("script")
InviteScript.src = chrome.runtime.getURL("js/pages/quickserverinvite/checkforinvite.js")

async function Main(){
    while (!document.head) await sleep(1)

    document.head.appendChild(InviteScript)
}

Main()