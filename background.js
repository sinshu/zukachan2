chrome.webRequest.onBeforeRequest.addListener(
	function(details)
	{
		var url;
		if (details.type == "xmlhttprequest")
		{
			url = details.url;
		}
		else if (details.url.indexOf("read.cgi") != -1)
		{
			url = chrome.extension.getURL("read.html") + "?" + details.url;
		}
		else if (details.url.indexOf("subback.html") != -1)
		{
			url = chrome.extension.getURL("subback.html") + "?" + details.url;
		}
		else if (details.url.indexOf("bbstable.html")!= -1)
		{
			url = chrome.extension.getURL("bbstable.html") + "?" + details.url;
		}
		
		return {
			redirectUrl: url
		};
	},
	
	{
		urls: [
			"http://*.2ch.net/*",
			"http://*.bbspink.com/*",
			"http://*.2ch.sc/*"
		]
	},
	
	["blocking"]);
