var cachedComments = new Array();

var popupCount = 0;

document.addEventListener("DOMContentLoaded", init);

function Comment(number, userName, mail, date, userId, body, option)
{
	this.number = number;
	this.userName = userName;
	this.mail = mail;
	this.date = date;
	this.userId = userId;
	this.body = body;
	this.option = option;
}

function init()
{
	var threadUrl = location.search.substring(1);
	var normalizedThreadUrl = normalizeThreadUrl(threadUrl);
	$(".uithreadlist").attr("href", getThreadListUrl(threadUrl));
	$(".uireadall").attr("href", normalizedThreadUrl);
	requestThreadHtml(threadUrl, onRequestComplete, onRequestError);
	$(document.body).click(clearPopups);
}

function getThreadListUrl(threadUrl)
{
	var splitted = threadUrl.split("/");
	var s = splitted[0];
	for (var i = 1; i < 3; i++)
	{
		s += "/" + splitted[i];
	}
	s += "/" + splitted[splitted.length - 3] + "/subback.html";
	return s;
}

function requestThreadHtml(url, onComplete, onError)
{
	$.get(url, onComplete).error(onError);
}

function onRequestComplete(html)
{
	var threadUrl = location.search.substring(1);
	
	$("#message").hide();
	var threadTitle = getThreadTitleFromHtml(html);
	document.title = threadTitle;
	$("#origurl").html(threadUrl).attr("href", threadUrl);
	$("#maintitle").html(threadTitle);
	var comments = getCommentsFromHtml(html);
	cacheComments(comments);
	
	var oldNumComments = 0;
	var localThread = getLocalThread(threadUrl);
	if (localThread != null) oldNumComments = localThread.numComments;
	var newNumComments = comments[comments.length - 1].number;
	
	displayComments(
		$("#maincomments"), comments, oldNumComments,
		threadUrl != normalizeThreadUrl(threadUrl));
	
	addLocalThread(threadUrl, newNumComments);
}

function onRequestError()
{
	document.title = "エラー";
	$("#message").text("読み込みに失敗しました。");
}

function getThreadTitleFromHtml(html)
{
	return html.match(/<title>(.*?)<\/title>/)[1];
}

function getCommentsFromHtml(html)
{
	var lines = html.split("\n");
	var comments = new Array();
	for (var i = 0; i < lines.length; i++)
	{
		if (lines[i].substring(0, 4) == "<dt>")
		{
			var number = getCommentNumFromLine(lines[i]);
			var userName = getUserNameFromLine(lines[i]);
			var mail = getMailFromLine(lines[i]);
			var date = getDateFromLine(lines[i]);
			var userId = getUserIdFromLine(lines[i]);
			var body = getCommentBodyFromLine(lines[i]);
			var option = getOptionalMessage(lines[i]);
			var comment =
				new Comment(number, userName, mail, date, userId, body, option);
			comments.push(comment);
		}
	}
	return comments;
}

function getCommentNumFromLine(line)
{
	return parseInt(line.match(/\d+/));
}

function getUserNameFromLine(line)
{
	var matched = line.match(/：(<.*?>)：/);
	if (matched != null)
	{
		return matched[1];
	}
	else
	{
		return "";
	}
}

function getMailFromLine(line)
{
	var matched = line.match(/\"mailto:(.*?)\"/);
	if (matched != null)
	{
		return matched[1];
	}
	else
	{
		return "";
	}
}

function getCommentBodyFromLine(line)
{
	var body = line.match(/<dd>(.*)/)[1];
	return body.replace(/<a.*?>(.*?)<\/a>/g, "$1");
}

function getDateFromLine(line)
{
	var matched =
		line.match(/(\d\d\d\d)\/(\d\d)\/(\d\d)\(.\)\s(\d\d):(\d\d):(\d\d)\.(\d\d)/);
	if (matched != null)
	{
		var year = parseInt(matched[1], 10);
		var month = parseInt(matched[2], 10) - 1;
		var date = parseInt(matched[3], 10);
		var hours = parseInt(matched[4], 10);
		var minutes = parseInt(matched[5], 10);
		var seconds = parseInt(matched[6], 10);
		var ms = 10 * parseInt(matched[7], 10);
		return new Date(year, month, date, hours, minutes, seconds, ms);
	}
	else
	{
		return null;
	}
}

function getUserIdFromLine(line)
{
	var matched = line.match(/ID:([\+\/0-9\?A-Za-z]+)/);
	if (matched != null)
	{
		return matched[1];
	}
	else
	{
		return null;
	}
}

function getOptionalMessage(line)
{
	return line.match(/>：(.*?)<dd>/)[1];
}

function cacheComments(comments)
{
	for (var i = 0; i < comments.length; i++)
	{
		cachedComments[comments[i].number] = comments[i];
	}
	//dumpCache();
}

function dumpCache()
{
	var s = "";
	for (key in cachedComments)
	{
		var comment = cachedComments[key];
		s += comment.number + " " + comment.userName + "\r\n";
	}
	alert(s);
}

function displayComments($dl, comments, oldNumComments, autoScroll)
{
	var $scrollTarget = null;
	var highlighted = false;
	for (var i = 0; i < comments.length; i++)
	{
		var highlight = comments[i].number > oldNumComments;
		var $dt = $createDt(comments[i], highlight)
		$dt.attr("id", "comment" + comments[i].number);
		$dl.append($dt);
		if (!highlighted)
		{
			if (highlight)
			{
				$scrollTarget = $dt;
				highlighted = true;
			}
			else
			{
				$scrollTarget = $dt;
			}
		}
		
		var $dd = $createDd(comments[i]);
		$dl.append($dd);
	}
	if (autoScroll && oldNumComments > 0 && $scrollTarget != null)
	{
		$scrollTarget[0].scrollIntoView(true);
	}
}

function $createDt(comment, highlight)
{
	var numHtml =
		highlight ? "<b>" + comment.number + "</b>" : String(comment.number);
	var dtHtml = "<a href=\"#\">" + numHtml + "</a>"
	           + " 名前：" + comment.userName + "[" + comment.mail + "]";
	if (comment.date != null)
	{
		dtHtml += " 投稿日：" + getDateString(comment.date);
		if (comment.userId != null)
		{
			dtHtml += " ID:" + comment.userId;
		}
	}
	else
	{
		dtHtml += "：" + comment.option;
	}
	var $dt = $("<dt>");
	$dt.addClass("commentinfo");
	$dt.html(dtHtml);
	return $dt;
}

function getDateString(date)
{
	var yyyy = String(date.getFullYear());
	var MM = String(100 + date.getMonth() + 1).substring(1);
	var dd = String(100 + date.getDate()).substring(1);
	var HH = String(100 + date.getHours()).substring(1);
	var mm = String(100 + date.getMinutes()).substring(1);
	var ss = String(100 + date.getSeconds()).substring(1);
	var day = "日月火水木金土".charAt(date.getDay());
	return yyyy + "/" + MM + "/" + dd + "(" + day + ") " + HH + ":" + mm + ":" + ss;
}

function $createDd(comment)
{
	var ddHtml = comment.body;
	if (!hasUnsafeTag(ddHtml))
	{
		ddHtml = ddHtml.replace(/(h?(ttps?))(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g,
		                        "<a href=\"h$2$3\">$1$3</a>");
	}
	ddHtml = ddHtml.replace(/(&gt;(?:&gt;)?)((?:\d+\-\d+|\d+)(?:,\d+\-\d+|,\d+)*)/g,
	                        "<a class=\"anchor\"href=\"#comment$2\">$1$2</a>");
	var $dd = $("<dd>");
	$dd.addClass("commentbody");
	$dd.html(ddHtml);
	var $children = $dd.children(".anchor");
	for (var i = 0; i < $children.length; i++)
	{
		var $child = $children.eq(i);
		$child.attr("popupid", "");
		$child.attr("popupfixed", "false");
		$child.mouseover(onAnchorMouseover);
		$child.mouseout(onAnchorMouseout);
		$child.click(onAnchorClick);
		$child.dblclick(onAnchorDoubleClick);
	}
	return $dd;
}

function hasUnsafeTag(html)
{
	var matches = html.match(/<.+?>/g);
	for (var i = 0; i < matches.length; i++)
	{
		if (matches[i] != "<br>")
		{
			return true;
		}
	}
	return false;
}

function onAnchorMouseover()
{
	var $anchor = $(this);
	if ($anchor.attr("popupid").length > 0) return;
	var offset = $anchor.offset();
	var $popup = $createPopup(getNumbersFromAnchor($anchor), offset.left, offset.top);
	$anchor.attr("popupid", $popup.attr("id"));
}

function onAnchorMouseout()
{
	var $anchor = $(this);
	if ($anchor.attr("popupfixed") == "true") return;
	if ($anchor.attr("popupid").length > 0)
	{
		var popupId = $anchor.attr("popupid");
		$anchor.attr("popupid", "");
		$("#" + popupId).remove();
	}
}

function onAnchorClick()
{
	var $anchor = $(this);
	if ($anchor.attr("popupfixed") == "true") return false;
	var popupId = $anchor.attr("popupid");
	if (popupId.length == 0) return false;
	$anchor.attr("popupfixed", "true");
	$("#" + popupId).addClass("fixedpopup");
	return false;
}

function onAnchorDoubleClick()
{
	var $anchor = $(this);
	if ($anchor.attr("popupid").length > 0)
	{
		var popupId = $anchor.attr("popupid");
		$anchor.attr("popupid", "");
		$anchor.attr("popupfixed", "false");
		$("#" + popupId).remove();
	}
	location.href = $anchor.attr("href");
}

function getNumbersFromAnchor($anchor)
{
	var numbers = new Array();
	var bounds = $anchor.text().replace(/>>?/, "").split(",");
	for (var i = 0; i < bounds.length; i++)
	{
		var splitted = bounds[i].split("-");
		if (splitted.length == 1)
		{
			numbers.push(parseInt(splitted[0]));
		}
		else
		{
			var num1 = parseInt(splitted[0]);
			var num2 = parseInt(splitted[1]);
			var start = Math.min(num1, num2);
			var end = Math.max(num1, num2);
			for (var n = start; n <= end; n++)
			{
				numbers.push(n);
			}
		}
	}
	return numbers;
}

function $createPopup(numbers, x, y)
{
	var $dl = $("<dl>");
	for (var i = 0; i < numbers.length; i++)
	{
		var comment = cachedComments[numbers[i]];
		var $dt, $dd;
		if (comment == undefined)
		{
			$dt = $("<dt>" + numbers[i] + " 未取得のレス</dt>").addClass("commentinfo");
			$dd = $("<dd><br></dd>").addClass("commentbody");
		}
		else
		{
			$dt = $createDt(comment, false);
			$dd = $createDd(comment);
		}
		$dl.append($dt);
		$dl.append($dd);
	}
	var $popup = $("<div>");
	$popup.attr("id", "popup" + popupCount);
	$popup.addClass("popup");
	$popup.append($dl);
	$(document.body).append($popup);
	$popup.css("top", y - $popup.height() - 9 + "px").css("left", x + "px");
	popupCount++;
	return $popup;
}

function clearPopups()
{
	var $anchors = $(".anchor");
	$anchors.attr("popupid", "");
	$anchors.attr("popupfixed", "false");
	$(".popup").remove();
}

function clearFixedPopups()
{
	var $anchors = $(".anchor[popupfixed=\"true\"]");
	for (var i = 0; i < $anchors.length; i++)
	{
		$anchor = $anchors.eq(i);
		var popupId = $anchor.attr("popupid");
		$anchor.attr("popupid", "");
		$anchor.attr("popupfixed", "false");
		$("#" + popupId).remove();
	}
}
