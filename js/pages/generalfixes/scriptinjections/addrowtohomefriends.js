async function AddRowToHomeFriends(){
    let PeopleList
    while (true){
        PeopleList = document.querySelector('[ng-controller="peopleListContainerController"]')
        if (PeopleList) break
        await new Promise(r => setTimeout(r, 0))
    }

    const PeopleController = angular.element(PeopleList).scope()
    PeopleController.layout.maxNumberOfFriendsDisplayed *= 2

    while (!PeopleController.library.numOfFriends) await new Promise(r => setTimeout(r, 0))
    if (PeopleController.library.numOfFriends < PeopleController.layout.maxNumberOfFriendsDisplayed) return

    const Style = document.createElement("style")
    Style.innerHTML = ".people-list {height: 280px !important; max-height: 280px !important;} .people-list-container {height: 340px !important;}"
    document.body.appendChild(Style)
}
AddRowToHomeFriends()