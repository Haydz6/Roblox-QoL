function SetTheme(Theme){
    document.body.classList.add(Theme)
}

function IsIframe(){
    try {
        return window.self !== window.top
    } catch {
        return true
    }
}

window.addEventListener("message", function(e){
    if (e.data.type === "theme") SetTheme(e.data.theme)
})

async function HandleClick(){
    chrome.permissions.request({origins: ["*://*.discord.com/"]}, function(Granted){
        if (IsIframe()) parent.postMessage({type: "permission-iframe-remove", success: true}, "*")
        else {
            document.getElementById("request-button").removeEventListener("click", HandleClick)
            document.getElementById("request-button").innerText = "You may return back to the settings page and enable the feature"
        }
    })
}

document.getElementById("request-button").addEventListener("click", HandleClick)
if (!chrome.permissions?.request){
    if (IsIframe()) parent.postMessage({type: "permission-iframe-remove", newtab: true}, "*")
    else document.getElementById("request-button").innerText = "This feature is not supported on your browser."
} else if (IsIframe()) window.parent.postMessage({type: "permission-iframe-ready"}, "*")