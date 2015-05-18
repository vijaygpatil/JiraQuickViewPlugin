jQuery(document).ready(function() {
    var j = new Date().getTime();
    jQuery("#issue_actions_container, #description-val, #gadget-10002").on("mouseover", ".action-body a, .user-content-block a, .issuekey a", function() {
        if (this.href.match(/\/browse\/[A-Z]+\-\d+$/)) {
        	var href = this.href;
            var split = href.split('/browse/');
            var base = split[0];
            if(base == null || base == "") {
            	var hreference = jQuery(location).attr('href');
            	var hreferenceSplit = hreference.split('/browse/');
            	var base = split[0];
            } 
            	
            var key = split[1];
            var options = { cacheContent: true, onHover: true, showDelay: 400, hideDelay: 400, closeOthers: false, width: 800, noBind: true };
            var draw = function(contents, trigger, showPopup) {
                jQuery.getJSON(base + '/rest/api/latest/issue/' + key, function(data) {
                    
                	var fields = data["fields"];
                    var watchersText = null;
                    var resolutionName = "Unresolved";
                    
                    if(fields["resolution"] != null) {
                    	resolutionName = fields["resolution"]["name"];
                    }
                    
                    var commentText = "";
                    for(i = 0; i < fields["comment"]["maxResults"]; i++) {
                    	commentText += "<tr><td><img src="+ 
                    				   fields["comment"]["comments"][i]["author"]["avatarUrls"]["16x16"] +"></img> "+ 
									   fields["comment"]["comments"][i]["author"]["name"] +"</td><td>" + 
									   fields["comment"]["comments"][i]["created"]+ "<br/>" +
									   fields["comment"]["comments"][i]["body"] + "</td></tr>"
                	}
                    
                    contents.empty();
                    contents.append(
                    	"<div class=\"linker\">"
                        + "<table class=\"table borderless\">"
                        + "<tr><th>Summary </th></tr>"
                        + "<tr><td>" + fields["summary"] + "<td></tr></table>"
                        + "<table class=\"table borderless detailsTable\">"
                        + "<tr><th>Details </th></tr>"
                        + "<tr><td>Project: </td>" + "<td><img src="+ fields["project"]["avatarUrls"]["16x16"] +"></img> " + fields["project"]["name"] + "</td></tr>"
                        + "<tr><td>Type: </td>" + "<td><img src="+ fields["issuetype"]["iconUrl"] +"></img> " + fields["issuetype"]["name"] + "</td></tr>"
                        + "<tr><td>Priority: </td>" + "<td><img src="+ fields["priority"]["iconUrl"] +"></img> " + fields["priority"]["name"] + "</td></tr>"
                        + "<tr><td>Status: </td>" + "<td><img src="+ fields["status"]["iconUrl"] +"></img> " + fields["status"]["name"] + "</td></tr>"
                        + "<tr><td>Resolution: </td>" + "<td>" + resolutionName + "</td></tr>"
                        + "<tr><th>People </th></tr>"
                        + "<tr><td>Assignee: </td>" + "<td><img src="+ fields["assignee"]["avatarUrls"]["16x16"] +"></img> " + fields["assignee"]["name"] + "</td></tr>"
                        + "<tr><td>Reporter: </td>" + "<td><img src="+ fields["reporter"]["avatarUrls"]["16x16"] +"></img> " + fields["reporter"]["name"] + "</td></tr>"
                        + "<tr><th>Dates </th></tr>"
                        + "<tr><td>Created: </td>" + "<td>" + fields["created"] + "</td></tr>"
                        + "<tr><td>Updated: </td>" + "<td>" + fields["updated"] + "</td></tr></table>"
                        + "<table class=\"table borderless\">"
                        + "<tr><th>Description </th></tr>"
                        + "<tr><td><div class=\"descriptionDiv\"><textarea rows=\"10\" cols=\"100\" class=\"descriptionTextArea\">" + fields["description"] + "</textarea></div></td></tr>"
                        + "<tr><th>Comment </th></tr>"
                        + "<tr><td><div class=\"commentDiv\"><table class=\"table table-hover borderless commentTable\">" + commentText + "</table>" +
                        		"<button class=\"btn btn-default addComment\">Add Comment</button><button class=\"btn btn-default saveComment\">Save Comment</button></div></td></tr></table>"
                        + "<button class=\"btn btn-default watch\">Watch</button><button class=\"btn btn-default unwatch\">Unwatch</button> <button class=\"btn btn-default goToJIRA pull-right\">Go To "+key+"</button></div>");
                    
                    var newCommentText = "";
                    
                    jQuery(".addComment").click(function() {
                    	jQuery.getJSON(base + '/rest/auth/latest/session', function(data) {
                    		jQuery.getJSON(data['self'], function(user) {
                    			jQuery('.commentTable tr:last').after("<tr><td><img src="+ user["avatarUrls"]["16x16"] +"></img> "+user['name']+"</td><td><textarea class=\"newCommentText\" rows=\"2\" cols=\"80\"></textarea></td></tr>");
                    		});
                    	});
                    	jQuery(".addComment").hide();
                    	jQuery(".saveComment").show();
                    });
                    
                    
                    jQuery(".saveComment").click(function(){
                    	
                    	var data = {
                    			 body: "This is a new Comment."
                    	}
                    	
                    	jQuery.ajax({ 
                    		type: "POST", 
                    		url: base + "/rest/api/latest/issue/" + key +"/comment", 
                    		data: JSON.stringify(data), 
                    		dataType: "json", 
                    		contentType: "application/json"
                    	});
                    	
                    	jQuery(".addComment").show();
                    	jQuery(".saveComment").hide();
                    });
                    
                    jQuery(".goToJIRA").click(function() {
                    	var win = window.open(href, '_blank');
                    	if(win){
                    	    win.focus();
                    	}else{
                    	    alert('Please allow popups for this site');
                    	}
                    });
                    
                    jQuery(".watch").click(function() {
                        jQuery.getJSON(base + '/rest/auth/latest/session', function(data) {
							jQuery.ajax({
								type: "POST", 
								url: base + "/rest/api/latest/issue/" + key + "/watchers", 
								data: JSON.stringify(data['name']), 
								dataType: "json", 
								contentType: "application/json" 
                            });
                        });
                    });
                    
                    jQuery(".unwatch").click(function() {
                        jQuery.getJSON(base + '/rest/auth/latest/session', function(data) {
                            jQuery.ajax({
                            	type: "DELETE", 
                            	url: base + "/rest/api/latest/issue/" + key + "/watchers?username="+data['name']
                            });
                        });
                    });
                    
                    jQuery.getJSON(base + '/rest/api/latest/issue/' + key + '/watchers', function(watchers) {
                        var watchersCount = watchers["watchCount"];
                        if(watchersCount == 0) {
                        	jQuery(".watch").show();
                     		jQuery(".unwatch").hide();
                        } else {
                        	jQuery.getJSON(base + '/rest/auth/latest/session', function(session) {
                           	 for(i = 0; i < watchersCount; i++) {
                                	if(watchers["watchers"][i][name] = session["name"]) {
                                		jQuery(".watch").hide();
                                		jQuery(".unwatch").show();
                                	}
                                }
                           });
                        }
                    });
                    
                    jQuery(".descriptionTextArea").change(function() {
                    	
                    	var data = {
                    			fields: {
                    				description: jQuery(".descriptionTextArea").val()
                    			}
                    	};
                    	
                    	jQuery.ajax({ 
                    		type: "PUT", 
                    		url: base + "/rest/api/latest/issue/" + key, 
                    		data: JSON.stringify(data), 
                    		dataType: "json", 
                    		contentType: "application/json"
                    	});
                    });
                    
                    jQuery(".watch").on("click", function() {
                    	jQuery(".watch").hide();
                		jQuery(".unwatch").show();
                    });
                    
                    jQuery(".unwatch").on("click", function() {
                    	jQuery(".watch").show();
                 		jQuery(".unwatch").hide();
                    });
                    
                    showPopup();
                    return false;
                });
            }
            
            var dialog = AJS.InlineDialog(jQuery(this), "issue-linking-" + (j++), draw, options);
            dialog.click(function(event) {
                event.stopImmediatePropagation();
                return false;
            });
        }
    });
})