document.addEventListener("DOMContentLoaded", init);

var threadsCache = null;

function Thread(url, index, title, numComments)
{
	this.url = url;
	this.index = index;
	this.title = title;
	this.numComments = numComments;
}

function init()
{
	var threadListUrl = location.search.substring(1);
	if (threadListUrl.indexOf("2ch.net") != -1 || threadListUrl.indexOf("bbspink.com") != -1)
	{
		$(".uiboardlist").attr("href", "http://menu.2ch.net/bbstable.html");
	}
	else if (threadListUrl.indexOf("2ch.sc") != -1)
	{
		$(".uiboardlist").attr("href", "http://menu.2ch.sc/bbstable.html");
	}
	requestThreadListHtml(threadListUrl, onRequestComplete, onRequestError);
}

function requestThreadListHtml(url, onComplete, onError)
{
	$.get(url, onComplete).error(onError);
}

function onRequestComplete(html)
{
	var threadListUrl = location.search.substring(1);
	
	$("#message").hide();
	var boardTitle = getBoardTitleFromHtml(html);
	document.title = boardTitle;
	$("#origurl").html(threadListUrl).attr("href", threadListUrl);
	$("#maintitle").html(boardTitle);
	threadsCache = getThreadsFromHtml(html);
	displayThreads($("#uithreadlist"), threadsCache);
}

function onRequestError()
{
	document.title = "エラー";
	$("#message").text("読み込みに失敗しました。");
}

function getBoardTitleFromHtml(html)
{
	return html.match(/<title>(.*?)<\/title>/)[1];
}

function getThreadsFromHtml(html)
{
	var baseUrl = getBaseUrlByHtml(html);
	var lines = html.split("\n");
	var threads = new Array();
	var state = 0;
	for (var i = 0; i < lines.length; i++)
	{
		if (lines[i].indexOf("<small id=\"trad\">") != -1)
		{
			state = 1;
		}
		else if (state == 1)
		{
			if (lines[i].indexOf("</small>") != -1) break;
			threads.push(getThreadFromLine(lines[i], baseUrl));
		}
	}
	return threads;
}

function getBaseUrlByHtml(html)
{
	return html.match(/<base\shref=\"(.+?)\".*?>/)[1];
}

function getThreadFromLine(line, baseUrl)
{
	var matched = line.match(/<a href=\"(.+)\".*?>(\d+):(.+)\((\d+)\)<\/a>/);
	var url = baseUrl + matched[1];
	var index = parseInt(matched[2]);
	var title = matched[3];
	var numComments = parseInt(matched[4]);
	return new Thread(url, index, title, numComments);
}

function displayThreads($table, threads)
{
	var localDic = getLocalThreadsDictionary();
	var upper = new Array();
	var lower = new Array();
	for (var i = 0; i < threads.length; i++)
	{
		if (localDic(threads[i].url) != undefined) upper.push(threads[i]);
		else lower.push(threads[i]);
	}
	$table.empty();
	$table.append("<tr><th>番号</th><th>レス</th><th>タイトル</th></tr>");
	for (var i = 0; i < upper.length; i++)
	{
		var $td1 = $("<td>").html(String(upper[i].index)).addClass("uilistnum");;
		var $td2 = $("<td>").html("<b>" + upper[i].numComments + "</b>").addClass("uilistnum");
		if (upper[i].numComments > localDic(upper[i].url).numComments)
		{
			$td2.children().css("color", "#FF0000");
		}
		var $link = $("<a>" + upper[i].title + "</a>");
		var $uidelete = $("<a><small>×</small></a>").attr("href", "#")
		                                             .attr("targeturl", upper[i].url)
		                                             .addClass("uilistitem")
		                                             .click(onDeleteLocalThread);
		$link.attr("href", upper[i].url).addClass("uilistitem");
		var $td3 = $("<td>").append($link).append(" ").append($uidelete);
		var $tr = $("<tr>");
		$tr.append($td1).append($td2).append($td3);
		$table.append($tr);
	}
	for (var i = 0; i < lower.length; i++)
	{
		var $td1 = $("<td>").html(String(lower[i].index)).addClass("uilistnum");;
		var $td2 = $("<td>").html(String(lower[i].numComments)).addClass("uilistnum");
		var $link = $("<a>" + lower[i].title + "</a>");
		$link.attr("href", lower[i].url).addClass("uilistitem");
		var $td3 = $("<td>").append($link);
		var $tr = $("<tr>");
		$tr.append($td1).append($td2).append($td3);
		$table.append($tr);
	}
}

function onDeleteLocalThread()
{
	var url = $(this).attr("targeturl");
	deleteLocalThread(url);
	if (threadsCache != null)
	{
		displayThreads($("#uithreadlist"), threadsCache);
	}
}
