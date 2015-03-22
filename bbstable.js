var maxNumLinesPerCol = 70;

document.addEventListener("DOMContentLoaded", init);

function Category(title, boards)
{
	this.title = title;
	this.boards = boards;
}

function Board(title, url)
{
	this.title = title;
	this.url = url;
}

function init()
{
	var boardListUrl = location.search.substring(1);
	requestBoardListHtml(boardListUrl, onRequestComplete, onRequestError);
}

function requestBoardListHtml(url, onComplete, onError)
{
	$.get(url, onComplete).error(onError);
}

function onRequestComplete(html)
{
	var boardListUrl = location.search.substring(1);
	
	$("#message").hide();
	var siteTitle = getSiteTitleFromHtml(html);
	document.title = siteTitle;
	
	var categories = getCategoriesFromHtml(html);
	var cols = new Array();
	var colIndex = 0;
	cols[colIndex] = new Array();
	var numLines = 0;
	for (var i = 0; i < categories.length; i++)
	{
		var len = categories[i].boards.length;
		if (numLines + len + 2 <= maxNumLinesPerCol)
		{
			cols[colIndex].push(categories[i]);
			numLines += len + 2;
		}
		else
		{
			colIndex++;
			cols[colIndex] = new Array();
			cols[colIndex].push(categories[i]);
			numLines = len;
		}
	}
	var $tr = $("<tr>");
	for (var c = 0; c < cols.length; c++)
	{
		var $td = $("<td>");
		for (var i = 0; i < cols[c].length; i++)
		{
			var $cate = $("<div>").addClass("bbsmenucate").html(cols[c][i].title);
			$td.append($cate);
			for (var j = 0; j < cols[c][i].boards.length; j++)
			{
				var $link = $("<a>").html(cols[c][i].boards[j].title).attr("href", cols[c][i].boards[j].url);
				var $item = $("<div>").addClass("bbsmenuitem").append($link);
				$td.append($item);
			}
			$td.append("<br>");
		}
		$tr.append($td);
	}
	$("#uibbsmenu").append($tr);
}

function onRequestError()
{
	document.title = "ÉGÉâÅ[";
	$("#message").text("ì«Ç›çûÇ›Ç…é∏îsÇµÇ‹ÇµÇΩÅB");
}

function getSiteTitleFromHtml(html)
{
	return html.match(/<TITLE>(.*?)<\/TITLE>/)[1];
}

function getCategoriesFromHtml(html)
{
	var lines = html.split("\n");
	var currTitle = null;
	var currBoards = null;
	var categories = new Array();
	for (var i = 0; i < lines.length; i++)
	{
		if (lines[i].indexOf("<B>") != -1)
		{
			if (currTitle != null && currBoards.length > 0)
			{
				categories.push(new Category(currTitle, currBoards));
			}
			currTitle = lines[i].match(/<B>(.+)<\/B>/)[1];
			currBoards = new Array();
		}
		if (currTitle != null)
		{
			var matched = lines[i].match(/<A HREF=(.+)>(.+)<\/A>/);
			if (matched != null)
			{
				if (isValidUrl(matched[1]))
				{
					var board = new Board(matched[2], matched[1] + "subback.html");
					currBoards.push(board);
				}
			}
		}
	}
	return categories;
}

function isValidUrl(url)
{
	var splitted = url.split("/");
	if (splitted.length != 5) return false;
	if (splitted[4] != "") return false;
	splitted = splitted[2].split(".");
	var site = splitted[1] + "." + splitted[2];
	if (site == "2ch.net" || site == "2ch.sc" || site == "bbspink.com")
	{
		return true;
	}
	return false;
}
