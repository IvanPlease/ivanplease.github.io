var cluster_check = false;

$(document).ready(function(){
    var box = [{userMsg: true, content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus in volutpat ligula. Etiam tempus quis massa rutrum lobortis. Integer ut scelerisque ex. Praesent in magna sed tellus viverra auctor. Morbi quis nisl tempor, mattis diam quis, aliquam magna. Proin eget pulvinar lectus. In non nisi sed ex molestie blandit. Curabitur dignissim tellus quis arcu cursus sagittis. Ut neque velit, pulvinar quis neque sit amet, porta feugiat diam. Morbi euismod sit amet urna et laoreet. Ut lacus justo, sodales vel volutpat sit amet, auctor id quam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Fusce faucibus condimentum auctor."},{userMsg: true, content: "message"},{userMsg: true, content: "message"},{userMsg: false, content: "message #2"}, {userMsg: false, content: "message #3"}, {userMsg: false, content: "message #4"}];
    box.forEach(msg => {
        addMessage(msg)
    });
    box.forEach(msg => {
        addMessage(msg)
    });
    box.forEach(msg => {
        addMessage(msg)
    });
    $("#friendSearch").on('click', function(){
        var element = $("#friendSearch").parent().find("input");
        var searchTerm = element.val().toLowerCase();
        var ajaxValue = {searchType: 0, searchValue: searchTerm};
        if(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/g.test(searchTerm)){
            ajaxValue.searchType = 2;
        }else if(/^\b[a-zA-Z]+\b\s\b[a-zA-Z]+\b$/g.test(searchTerm) || /\b[a-zA-Z]+\b$/g.test(searchTerm)){
            ajaxValue.searchType = 1;
        }
        element.val('');
    });
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
    $.ajax({
        method: "GET",
        url: "https://delta-communicator.herokuapp.com/v1/users/1",
        success: function(data){
            console.log(data);
        }
    })
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