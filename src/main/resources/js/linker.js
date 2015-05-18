jQuery(document).ready(function() {
    var j = new Date().getTime();
    jQuery("#issue_actions_container, #description-val").find('.action-body a, .user-content-block a').each(function() {
        if (this.href.match(/\/browse\/[A-Z]+\-\d+$/)) {
            var split = this.href.split('/browse/');
            var base = split[0];
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
                        + "<tr><td>Summary: </td>" + "<td>" + fields["summary"] + "</td></tr>"
                        + "<tr><td>Type: </td>" + "<td><img src="+ fields["issuetype"]["iconUrl"] +"></img> " + fields["issuetype"]["name"] + "</td></tr>"
                        + "<tr><td>Priority: </td>" + "<td><img src="+ fields["priority"]["iconUrl"] +"></img> " + fields["priority"]["name"] + "</td></tr>"
                        + "<tr><td>Status: </td>" + "<td><img src="+ fields["status"]["iconUrl"] +"></img> " + fields["status"]["name"] + "</td></tr>"
                        + "<tr><td>Assignee: </td>" + "<td><img src="+ fields["assignee"]["avatarUrls"]["16x16"] +"></img> " + fields["assignee"]["name"] + "</td></tr>"
                        + "<tr><td>Reporter: </td>" + "<td><img src="+ fields["reporter"]["avatarUrls"]["16x16"] +"></img> " + fields["reporter"]["name"] + "</td></tr>"
                        + "<tr><td>Project: </td>" + "<td><img src="+ fields["project"]["avatarUrls"]["16x16"] +"></img> " + fields["project"]["name"] + "</td></tr>"
                        + "<tr><td>Resolution: </td>" + "<td>" + resolutionName + "</td></tr>"
                        + "<tr><td>Created: </td>" + "<td>" + fields["created"] + "</td></tr>"
                        + "<tr><td>Updated: </td>" + "<td>" + fields["updated"] + "</td></tr>"
                        + "<tr><td>Description: </td>" + "<td><textarea rows=\"6\" cols=\"90\" class=\"descriptionTextArea\">" + fields["description"] + "</textarea></td></tr>"
                        + "<tr><td>Comment: </td>" + "<td><div class=\"commentDiv\"><table class=\"table table-hover borderless\">" + commentText + "</table></div></td></tr></table>"
                        + "<button class=\"btn btn-default watch\">Watch</button><button class=\"btn btn-default unwatch\">Unwatch</button></div>");
                    
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
                    
                    jQuery(".descriptionTextArea").on("change", function() {
                    	
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
    })
})