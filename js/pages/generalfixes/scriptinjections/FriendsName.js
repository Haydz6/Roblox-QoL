async function FriendsNameOnHomePage(){
    let PeopleController
    const WaitingPeopleControllers = []

    function GetPeopleController(){
        if (PeopleController) return PeopleController

        return new Promise((resolve) => {
            WaitingPeopleControllers.push(resolve)
        })
    }

    async function WaitForClass(Element, Class){
        while (true){
            const List = Element.getElementsByClassName(Class)[0]
            if (List) return List
            await new Promise(r => setTimeout(r, 100))
        }
    }

    async function HandleList(Container){
        const List = await WaitForClass(Container, "hlist")
        const Children = List.children

        async function ChildAdded(Element){
            const UserId = parseInt(Element.getAttribute("rbx-user-id"))
            await GetPeopleController()

            const Name = PeopleController?.library?.friendsDict?.[UserId]?.name
            if (!Name) return

            const Label = document.createElement("span")
            Label.className = "text-overflow friend-name font-caption-header"
            Label.style = "font-size: x-small; color: darkgrey; top: -6px; position: inherit; margin-bottom: -9 px;"
            Label.innerText = `@${Name}`
            Label.title = Name

            const LinkContainer = Element.getElementsByClassName("friend-link")[0]
            const NextElement = LinkContainer.getElementsByClassName("friend-parent-container")[0]?.nextSibling
            if (NextElement) LinkContainer.insertBefore(Label, NextElement)
            else LinkContainer.appendChild(Label)
        }

        new MutationObserver(function(Mutations){
            Mutations.forEach(function(Mutation){
                const Added = Mutation.addedNodes
                for (let i = 0; i < Added.length; i++){
                    ChildAdded(Added[i])
                }
            })
        }).observe(List, {childList: true})

        for (let i = 0; i < Children.length; i++){
            ChildAdded(Children[i])
        }
    }

    document.addEventListener("RobloxQoL.BestFriendsLoaded", function(){
        HandleList(document.getElementById("best-friend-list-container"))
    })

    let PeopleList
    while (true){
        PeopleList = document.querySelector('[ng-controller="peopleListContainerController"]')
        if (PeopleList) break
        await new Promise(r => setTimeout(r, 100))
    }

    const Controller = angular.element(PeopleList).scope()
    while (Controller.library?.numOfFriends === null) await new Promise(r => setTimeout(r, 100))
    PeopleController = Controller

    for (let i = 0; i < WaitingPeopleControllers.length; i++){
        WaitingPeopleControllers[i](PeopleController)
    }

    HandleList(PeopleList)
}
FriendsNameOnHomePage()