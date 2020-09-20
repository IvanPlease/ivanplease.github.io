var cluster_check = false;
var api_host = "https://delta-communicator.herokuapp.com/";
var api_local = "http://localhost:8080";

$(document).ready(function(){
    var box = [{userMsg: true, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in volutpat ligula. Etiam tempus quis massa rutrum lobortis. Integer ut scelerisque ex. Praesent in magna sed tellus viverra auctor. Morbi quis nisl tempor, mattis diam quis, aliquam magna. Proin eget pulvinar lectus. In non nisi sed ex molestie blandit. Curabitur dignissim tellus quis arcu cursus sagittis. Ut neque velit, pulvinar quis neque sit amet, porta feugiat diam. Morbi euismod sit amet urna et laoreet. Ut lacus justo, sodales vel volutpat sit amet, auctor id quam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce faucibus condimentum auctor."},{userMsg: true, content: "message"},{userMsg: true, content: "message"},{userMsg: false, content: "message #2"}, {userMsg: false, content: "message #3"}, {userMsg: false, content: "message #4"}];
    $("#friendSearch").on('click', function(){
        var element = $("#friendSearch").parent().find("input");
        var searchTerm = element.val().trim();
        var ajaxValue = {searchType: 0, searchValue: searchTerm};
        searchLogic(ajaxValue);
    });
    $("#friendSearch").parent().find("input").keyup(function(e){
        if (e.which <= 90 && e.which >= 48){
            var element = $(this);
            var searchTerm = element.val().trim();
            var ajaxValue = {searchType: 0, searchValue: searchTerm};
            clearSearchBox(false);
            searchLogic(ajaxValue);
        }
    })
    $("#sendMessage").on('click', function(){
        var element = $("#sendMessage").parent().find("input");
        var inputMessage = element.val();
        var reciever = $.trim($(".messanger-input").closest(".flex-column").find(".row:first-child").text());
        var ajaxValue = {messageReceiver: reciever, messageValue: ""};
        if($.trim(inputMessage)){
            ajaxValue.messageValue = $.trim(inputMessage);
        }
        element.val('');
    });
    $("#addFriendModal").on('hidden.bs.modal', clearSearchBox(true));
});

function addMessage(msg){ //on new message recieved while online
    var messageBoxTag = "#messageBoxTag";
    var messageBlop = '<div class="d-flex flex-row${messageSide} mb-3 restore-paddings"><div class="d-inline-flex p-2 message-blop" data-author="${messageAuthor}"${clusterContent}>${messageContent}</div></div>';
    var author = (msg.userMsg) ? "user":"sender";
    var side = (msg.userMsg) ? "-reverse":"";
    var check = $("#messageBoxTag")[0].children.length;
    if(check != 0){
        if($("#messageBoxTag")[0].children[0].children[0].dataset.author == author){
            if(cluster_check == false){
                $("#messageBoxTag")[0].children[0].classList.remove("mb-3");
                $("#messageBoxTag")[0].children[0].children[0].setAttribute("data-cluster", true);
                $("#messageBoxTag")[0].children[0].children[0].setAttribute("data-cluster-pos", "start");
                messageBlop = messageBlop.replace("${clusterContent}", " data-cluster=true data-cluster-pos=\"end\"");
                cluster_check = true;
            }else{
                $("#messageBoxTag")[0].children[0].classList.remove("mb-3");
                $("#messageBoxTag")[0].children[0].children[0].setAttribute("data-cluster-pos", "middle");
                messageBlop = messageBlop.replace("${clusterContent}", " data-cluster=true data-cluster-pos=\"end\"");
            }
        }else{
            if(cluster_check){
                cluster_check = false;
            }
        }
    }
    $(messageBoxTag).prepend(messageBlop.replace("${messageContent}", msg.content).replace("${messageAuthor}", author).replace("${messageSide}", side).replace("${clusterContent}", ""));
}

function clearSearchBox(type){
    if(type){
        $("#searchBoxReturn").children().find(".friend-name-input-box>input").val('');
    }
    $("#searchBoxReturn").children().not(":first").remove();
}

function searchLogic(ajaxValue){
    var searchBox = '<div class="d-flex flex-row searchBackground mt-2"><div class="d-inline-flex p-2 w-100"><div class="image-wrap"><img src="${dataPath}" alt="${dataAlt}"/></div><div class="ml-3 position-relative w-100"><span class="searchData w-100">${dataNameAndSurname}</span></div></div></div>'
    if(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g.test(ajaxValue.searchValue)){
        ajaxValue.searchType = 2;
    }else if(/^\b[a-zA-Z]+\b\s\b[a-zA-Z]+\b$/g.test(ajaxValue.searchValue)){
        ajaxValue.searchType = 1;
    }else if(/\b[a-zA-Z]+\b$/g.test(ajaxValue.searchValue)){
        ajaxValue.searchType = 0;
    }
    console.log(ajaxValue.searchValue);
    $.ajax({
        method: "GET",
        url: api_local + "/v1/users",
        dataType: "json",
        data: ajaxValue,
        success: function(data){
            data.forEach(user => {
                var name = user.firstname + " " + user.lastname;
                var box = $(searchBox.replace("${dataPath}", user.profilePic.filePath).replace("${dataAlt}", user.profilePic.fileName).replace("${dataNameAndSurname}", name))
                            .hide()
                            .fadeIn(500);
                $("#searchBoxReturn").append(box);
            });
        },
        error: function(data){
            console.log(data);
        }
    })
}