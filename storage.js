var maxNumLocalThreads = 300;

var storageKey = "localthreads";

function LocalThread(url, numComments)
{
	this.url = url;
	this.numComments = numComments;
}

function normalizeThreadUrl(url)
{
	var splitted = url.split("/");
	splitted.pop();
	return splitted.join("/") + "/";
}

function getLocalThreads()
{
	var data = localStorage.getItem(storageKey);
	if (data != null)
	{
		var lines = data.split("|");
		var threads = new Array();
		for (var i = 0; i < lines.length; i++)
		{
			var splitted = lines[i].split(",");
			var thread = new LocalThread(splitted[0], parseInt(splitted[1]));
			threads.push(thread);
		}
		return threads;
	}
	else
	{
		return new Array();
	}
}

function getLocalThreadsDictionary()
{
	var threads = getLocalThreads();
	var dic = new Object();
	for (var i = 0; i < threads.length; i++)
	{
		dic[threads[i].url] = threads[i];
	}
	return function(url)
	{
		var normalizedUrl = normalizeThreadUrl(url);
		return dic[normalizedUrl];
	};
}

function setLocalThreads(threads)
{
	if (threads.length > 0)
	{
		var data = threads[0].url + "," + threads[0].numComments;
		for (var i = 1; i < threads.length; i++)
		{
			data += "|" + threads[i].url + "," + threads[i].numComments;
		}
		localStorage.setItem(storageKey, data);
	}
	else
	{
		localStorage.removeItem(storageKey);
	}
}

function clearLocalThreads()
{
	localStorage.clear();
}

function getLocalThread(url)
{
	var normalizedUrl = normalizeThreadUrl(url);
	var threads = getLocalThreads();
	for (var i = 0; i < threads.length; i++)
	{
		if (threads[i].url == normalizedUrl)
		{
			return threads[i];
		}
	}
	return null;
}

function addLocalThread(url, numComments)
{
	var normalizedUrl = normalizeThreadUrl(url);
	var oldLocalThreads = getLocalThreads();
	var newLocalThreads = new Array();
	var newThread = new LocalThread(normalizedUrl, numComments);
	newLocalThreads.push(newThread);
	for (var i = 0; i < oldLocalThreads.length; i++)
	{
		if (oldLocalThreads[i].url != normalizedUrl)
		{
			newLocalThreads.push(oldLocalThreads[i]);
		}
		if (newLocalThreads.length == maxNumLocalThreads) break;
	}
	setLocalThreads(newLocalThreads);
}

function deleteLocalThread(url)
{
	var normalizedUrl = normalizeThreadUrl(url);
	var oldLocalThreads = getLocalThreads();
	var newLocalThreads = new Array();
	for (var i = 0; i < oldLocalThreads.length; i++)
	{
		if (oldLocalThreads[i].url != normalizedUrl)
		{
			newLocalThreads.push(oldLocalThreads[i]);
		}
	}
	setLocalThreads(newLocalThreads);
}
