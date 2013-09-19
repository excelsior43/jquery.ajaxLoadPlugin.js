(function($) {
	 var babAjaxLoadPlugin = function(element, options) {
	 		
		  var elem = $(element);
		  var emptyFunction = function() {
			 log("load callback... calling empty function...");
		 };
		 var defaults = {
		            'class': 'babAjaxLoadPlugin', 
		            loadingPage: "<div id='page-content-loading-div' class='page-content'><div class='loadingDiv'></div></div>",
		            'url' 	 	: '',
		            'params' 	: { contentType: "text/html;charset=windows-1256" },
					'callback' 	: emptyFunction,
					'afterAuthorizationActionName' : 'mfa/autoWireAction',
					'loadMFAPopUpActionName' : 'multiFactorAuthentication/multiFactorAuthentication-init'
					};
		 var settings = $.extend(defaults, options || {});
		 
		 var initializePlugin=function(){
		 	log("inside initializePlugin() function");
		 	settings.tokenKey="";
		 	$(".Delete_Before_Submitting").remove();
		 	};
		 
		 this.closeAndUnbind= function(boolOp){ 
		 	log("removing the plugin "+boolOp);
		 	var popupElement=getPopupElement();
		 	popupElement.dialog("close");
		 	$("#page-content-loading-div").detachAndReplaceWith(settings.preservedHTML);
			if(boolOp==true)
		 		{
		 			elem.html(settings.loadingPage);
		 			elem.load(
								getUrl(settings.afterAuthorizationActionName),
								{"TOKEN_KEY": this.getTokenKey()},
								function(){
									log("Loaded the autowire"); 
									//callBackFunction();
									settings.callback();
								});
					log("calling babload");
					/*elem.babLoad(act, $("#registrationForm").serialize(),callBackFunction); */
		 		}
		 	jQuery.removeData(elem, "ajaxLoadPlugin");
		 	$("#multiFactorAuthenticationPopupDiv").remove();
		 	settings.callback();
		 	};

		 this.getTokenKey= function(){
		 		log("getting the token "+settings.tokenKey);
		 		return settings.tokenKey;
		 	};
		 this.loaddivUrl= function(){
		 		initializePlugin();
		 		settings.preservedHTML=elem.detachAndReplaceWith(settings.loadingPage);
		 		$("#page-content-loading-div").data("preservedHTML", settings.preservedHTML);
		 		$.post(settings.url, settings.params, function(data, status, xhr, dataType) {
					$("#page-content-loading-div").detachAndReplaceWith(settings.preservedHTML);
					if(data.indexOf("theLoginPage")!=-1)
						{ 
						$("#login").html(data);  // this is a special case. If the session expires then we need to replace the content with the login div.
						settings.callback();
						}
					else
						{
						elem.html(toUnicode(data.replace(/&amp;/g, '&')));  	// normal scenario. 
						settings.callback();
						}
			 	}).error(function(xhr, textStatus, errorThrown) { 
					if(xhr.status=="550")
						performLoadmultiFactorAuthenticationPopup(xhr.responseText);
						settings.callback();
					});
				
		 };  
		 var dataForLoadingPopup= function(tkn){
			 return {'TOKEN_KEY' : tkn};
		 };
		 var performLoadmultiFactorAuthenticationPopup = function(dat){
		 	log("inside performLoadmultiFactorAuthenticationPopup");
		 	 saveTokenInTheElement(dat.token); 
			 popupElement=getPopupElement();
			 popupElement.dialog({
				    height: "auto",
	                width: '600px',
	                modal: true,
	                resizable: false,
	                closeOnEscape: false,
	                open: function(event, ui) {
	                	popupElement.prepend(settings.loadingPage);
	                	 $.get(getUrl(settings.loadmultiFactorAuthenticationPopUpActionName), dataForLoadingPopup(dat.token), function(data){
	                		 popupElement.html(data);		
	                	 });
	                },
	                close: function(event, ui){
	                	log("Closing dialog box");
	                	$(this).dialog('destroy').remove();
	                	}
			   });
		
		 };
		 var getUrl=function(actionName){
		 	return contextPathOfIBSPassword+"/"+actionName;
		 	};
		 var getPopupElement = function(){
		 	 if($("#multiFactorAuthenticationPopupDiv").length==0)
				 $("body").append("<div id='multiFactorAuthenticationPopupDiv' />");
			 return $("#multiFactorAuthenticationPopupDiv");
		 };
		 var saveTokenInTheElement= function(token){
			settings.tokenKey=token;
			log("saving the token "+settings.tokenKey);
		 };
		 
		 
		 
	 };
	 $.fn.ajaxLoadPlugin = function(options) {
		 	
		 return this.each(function() {
	                var plugin = new ajaxLoadPlugin(this, options);
	                $(this).data('ajaxLoadPlugin', plugin);
	        });
	    };
})(jQuery);



$(document).ready(function(){
	
$.fn.babLoad = function(url, params,callback) { // url parameters and event are the must
		 // var pres=this.html();
			$(this).ajaxLoadPlugin({
					'url' 	 	: url,
					'params' 	: params,
					'callback' 	: callback
				});
			var loadDiv=$(this).data('ajaxLoadPlugin');
			loadDiv.loaddivUrl();
		};
		
function log(message) {
	if( typeof window.console != 'undefined' && typeof window.console.log != 'undefined') {
		console.log(message);}
}


});




