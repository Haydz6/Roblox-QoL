const InviteScript = document.createElement("script")
InviteScript.src = chrome.runtime.getURL("js/pages/quickserverinvite/checkforinvite.js")

async function InjectCheckForInvite(){
    const Internalsleep = ms => new Promise(r => setTimeout(r, ms))

    while (!document.head) await Internalsleep(1)

    document.head.appendChild(InviteScript)
}

InjectCheckForInvite()