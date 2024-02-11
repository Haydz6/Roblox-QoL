async function CreateSubscriptionSection(List){
    const CustomList = document.createElement("div")
    CustomList.style = "display: flex; justify-content: center; margin-bottom: 16px; flex-direction: column;"

    CustomList.innerHTML = `
    <div style="margin-top: 50px; margin-bottom: 50px; display: flex; flex-direction: column; align-items: center;"><input class="form-control input-field new-input-field" placeholder="Subscription key" maxlength="999" autocomplete="false" autocapitalize="false" spellcheck="false" style="width: 400px; float: right; height: 33px;"><p style="margin-top: 20px; display: none;" class="status"></p><button style="margin-top: 20px;" class="btn-primary-md">Reedem</button></div>
    <div><h3>Next payment</h3><p class="renewal">Renews on ...</p><h3>Tier</h3><p class="tier">...</p><h3>Price</h3><p style="margin-bottom: 25px;" class="price">$...</p> <a href="https://roqol.io/pages/account">Manage Account</a><br><br><a href="https://roqol.io/pages/pricing">Purchase subscription</a><br><br><a href="https://roqol.io/pages/faq#redeem">How to redeem</a></div>
    `

    const InputBox = CustomList.getElementsByTagName("input")[0]
    const RedeemButton = CustomList.getElementsByTagName("button")[0]
    const StatusLabel = CustomList.getElementsByClassName("status")[0]

    async function GetSubscriptionInfo(){
        const [Success, Result] = await RequestFunc(WebServerEndpoints.User+"subscription/detailed", "GET")
        if (Success){
            CustomList.getElementsByClassName("renewal")[0].innerText = typeof(Result.Renewal) == "number" ? `Renews on ${new Date(Result.Renewal).toLocaleDateString(undefined, {month: "long", day: "2-digit"})}` : Result.Renewal
            CustomList.getElementsByClassName("tier")[0].innerText = `${Result.Tier}`
            CustomList.getElementsByClassName("price")[0].innerText = `${Result.Price}`
        } else if (Result?.Result === "Invalid Subscription Key"){
            CustomList.getElementsByClassName("renewal")[0].innerText = "Not subscribed"
            CustomList.getElementsByClassName("tier")[0].innerText = "Free"
            CustomList.getElementsByClassName("price")[0].innerText = ""
        }
    }

    RedeemButton.addEventListener("click", async function(){
        RedeemButton.setAttribute("disabled", "disabled")

        StatusLabel.innerText = "Redeeming"
        StatusLabel.style.display = ""

        const [Success, Result] = await RequestFunc(WebServerEndpoints.User+"subscription/redeem", "POST", {"Content-Type": "application/json"}, JSON.stringify({Key: InputBox.value}))
        if (!Success){
            StatusLabel.innerText = `Failed to redeem key (${Result.Result})`
        } else {
            StatusLabel.innerText = "Updating subscription status"

            CurrentSubscription = await chrome.runtime.sendMessage({type: "RefreshSubscription"})

            StatusLabel.innerText = "Redeemed"
            InputBox.value = ""

            GetSubscriptionInfo()
        }

        RedeemButton.removeAttribute("disabled")
    })

    GetSubscriptionInfo()
   
    List.append(CustomList)
}