const	pausetimesTable = document.getElementById('id.pauseTimes'),
			infoField = document.getElementsByClassName('infoFont')[0],
			fieldNumber = document.getElementById('id.number'),
			MAXDAYSEXCEED = 1000,
			FORMATMIXEDTIME = 'd hh:mm:ss',
			TYPEOPTIONS = {
				'DAYS': 'days',
				'HOURS': 'hours',
				'MINUTES': 'minutes',
				'SECONDS': 'seconds',
				'MIXED': 'mixed'
			};

var clockInterval = 0,
		infoTimeout = [],   // that info-messages will be displayed the appropriate time
		pauseStart = 0,
		pauseEnd = 0,
		breakTime = 0,
		predefHoverCount = 0,
		infoDisplayCount = 0,
		pauseOn = false,
		pauseTimes = [];

function init() {
	document.getElementById('id.play').onclick = function () {
		pauseOn = false;
	}
	document.getElementById('id.pause').onclick = function () {
		pauseOn = true;
	}
	document.getElementById('id.export').onclick = function () {
		exportTimes();
	}
	document.getElementById('id.predefined').onmouseover = function () {
		++predefHoverCount;
		$(".paragraph.btn-margin-top.btn-format.hide, .paragraph.btn-margin-bottom.btn-format.hide").fadeIn();
	}
	document.getElementById('id.predefined').onmouseout = function () {
		setTimeout(function() {
		--predefHoverCount;
			if (predefHoverCount <= 0) {
				$(".paragraph.btn-margin-top.btn-format.hide, .paragraph.btn-margin-bottom.btn-format.hide").fadeOut();
			}
		}, 2000);			
	}
	document.getElementById('id.unit').onchange = function (event) {
		if (event.target.value === TYPEOPTIONS.MIXED) {
			fieldNumber.placeholder = FORMATMIXEDTIME;
		} else {
			fieldNumber.placeholder = 'value';
		}
	}
}

function infoGui(msg) {
	++infoDisplayCount;
	infoField.innerHTML = msg;
	$('.infoFont').fadeIn();
	infoTimeout.push( setTimeout(function() {
		--infoDisplayCount;
		if (infoDisplayCount <= 0) {
			$('.infoFont').fadeOut();
			setTimeout(function() {
				clearInfoField();
			},1000);
		}
	}, 3000) );
}

function clearInfoField() {
	infoField.innerHTML = '';
	infoDisplayCount = 0;
	infoTimeout.forEach(function(e) {
		clearTimeout(e);
	});
	infoTimeout.splice(0);
}

function getMaximumTimeExceeded() {
	return calculateMS(MAXDAYSEXCEED, 'days');
}

function getInitialCountdown() { 
	let customNum = new Date(
								((	1 	 // Anzahl Tage
								* 1   // fuer Stunden
								* 1   // fuer Minuten
								* 10   // fuer Sek
								)+ 00
								)
								* 1000 // fuer Milisekunden
								); 
	return new Date(customNum).getTime();
}

function getTimeShowable(p_timeFormatted) {
	return p_timeFormatted.days+' '+ 
			('0'+p_timeFormatted.hours).slice(-2)+':'+ 
			('0'+p_timeFormatted.minutes).slice(-2)+':'+ 
			('0'+p_timeFormatted.seconds).slice(-2);
}

function calculateMS(value, unit) {
	let ms;

	switch (unit) {
		case 'days':
			ms = value * 1000 * 60 * 60 * 24;
			break;
		case 'hours':
			ms = value * 1000 * 60 * 60;
			break;
		case 'minutes':
			ms = value * 1000 * 60;
			break;
		case 'seconds':
			ms = value * 1000;
			break;
		case 'mixed':   // d hh:mm:ss
			ms = calculateMS(value.split(' ')[0], 'days')
				+ calculateMS(value.split(' ')[1].split(':')[0], 'hours')
				+ calculateMS(value.split(' ')[1].split(':')[1], 'minutes')
				+ calculateMS(value.split(' ')[1].split(':')[2], 'seconds');
			break;
	}
	return ms;
}

	function prepareTimeToEnd(p_distance) {	
		return {
			'days': Math.floor(p_distance / (1000 * 60 * 60 * 24)),
			'hours': Math.floor((p_distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
			'minutes': Math.floor((p_distance % (1000 * 60 * 60)) / (1000 * 60)),
			'seconds': Math.floor((p_distance % (1000 * 60)) / 1000)
		};
	}

function startClock(countDowndate) {
	const clock = document.getElementById('id.clockdiv'),
				daysSpan = clock.querySelector('.days'),
				hoursSpan = clock.querySelector('.hours'),
				minutesSpan = clock.querySelector('.minutes'),
				secondsSpan = clock.querySelector('.seconds'),
				nut = document.getElementById('id.nut');

	let distanceToFinish = 0;

	function finishClock() {
		nut.classList.add('finish');
		daysSpan.classList.add('finish');
		hoursSpan.classList.add('finish');
		minutesSpan.classList.add('finish');
		secondsSpan.classList.add('finish');
	}

	function prepareClockForNewRun() {
		nut.classList.remove('finish');
		daysSpan.classList.remove('finish');
		hoursSpan.classList.remove('finish');
		minutesSpan.classList.remove('finish');
		secondsSpan.classList.remove('finish');
	}

	function showTimeOnClock(endTime) { 
		daysSpan.innerHTML = endTime.days;
		hoursSpan.innerHTML = ('0' + endTime.hours).slice(-2);
		minutesSpan.innerHTML = ('0' + endTime.minutes).slice(-2);
		secondsSpan.innerHTML = ('0' + endTime.seconds).slice(-2); 

		if (endTime.days <= 0
				&& endTime.hours <= 0
				&& endTime.minutes <= 0
				&& endTime.seconds <= 0
			) {
			clearInterval(clockInterval);
			finishClock();
		}
	}

	function addPauseTimeToTable(time, lnNumber) {
		let newCol, 
				newLine = document.createElement('tr'),
				timeFormatted;

		newCol = document.createElement('td');
		newCol.appendChild(document.createTextNode(lnNumber + ' -- '));
		newLine.appendChild(newCol);

		timeFormatted = prepareTimeToEnd(time);
		newCol = document.createElement('td');
		newCol.appendChild(document.createTextNode( 
			getTimeShowable(timeFormatted)
		));
		newLine.appendChild(newCol);
		pausetimesTable.appendChild(newLine);
	}

	function getCurrentTimeMS() {
		return Math.ceil(new Date().getTime() / 1000) * 1000;
	}

	function earsePauseInformation() {
		pauseOn = false;
		pauseStart = 0;
		breakTime = 0;
		while (pausetimesTable.hasChildNodes()) {
			pausetimesTable.removeChild(pausetimesTable.firstChild);
		}
		pauseTimes = [];
	}

	clearInfoField();
	if (countDowndate < getMaximumTimeExceeded()) {				// Check: maximal Time for clock
		showTimeOnClock( prepareTimeToEnd(countDowndate)); 	// immediate show-up
		countDowndate = countDowndate + getCurrentTimeMS();
		clearInterval(clockInterval);
		prepareClockForNewRun();
		earsePauseInformation();

		clockInterval = setInterval(function() {
			if (pauseOn == true && pauseStart == 0) { // check: pause on
					pauseStart = getCurrentTimeMS();
					pauseTimes.push(distanceToFinish);
					addPauseTimeToTable(distanceToFinish, pauseTimes.length);
			} else if (pauseOn == false) {  // in else area: after resuming check: if pausedcounttime > 0 and add it
				if (pauseStart > 0) { // after resuming immediately after pause
					breakTime = getCurrentTimeMS() - pauseStart;
					pauseStart = 0;
				}
				if (breakTime > 0) { // check: was there are break 
					countDowndate = countDowndate + breakTime;
					breakTime = 0;
				}
				distanceToFinish = countDowndate - getCurrentTimeMS();				
				showTimeOnClock( prepareTimeToEnd(distanceToFinish));
			}
		}, 1000);
	} else {
		infoGui('Maximal time exceeded');
	}

}

function startVal(t) {
	startClock(t.getAttribute('value')*1000);
}

function startManual(t) {
	const value = t.parentNode.querySelector('#id\\.number').value,
				unit = t.parentNode.querySelector('#id\\.unit').value,
				regex = new RegExp('^([0-9]|[1-9][0-9]|[1-9][0-9][0-9])\\s([0-1]?[0-9]|2[0-3]):[0-5]?[0-9]:[0-5]?[0-9]$');

	if (value.length > 0) {
		if ( (unit !== 'mixed' && isNaN(value) === false) 
			|| (unit === 'mixed' && regex.test(value)) ) {
			startClock( calculateMS(value, unit));
		} else {
			infoGui('Wrong format');
		}
	} else {
		infoGui('Empty field');
	}
}

function exportTimes() {
	let csvData = 'Pause-Times\n',
	    hiddenElement,
	    pauseTimesPrepared = [];

	if (pauseTimes.length > 0) {
		for (var i = 0; i < pauseTimes.length; i++) {
			pauseTimesPrepared[i] = getTimeShowable( prepareTimeToEnd( pauseTimes[i]));
		};
	  pauseTimesPrepared.forEach(function(row) {
	  	csvData += row + ',';
	  });
	  csvData = csvData.substring(0, csvData.length - 1);

		hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvData);
		hiddenElement.target = '_blank';
		hiddenElement.download = 'times.csv';
		hiddenElement.click();
	} else {
		infoGui('Nothing to export');
	}
}

init();
startClock(getInitialCountdown());

$(document).ready(function() {
	$(".paragraph.btn-margin.btn-format.hide").each(function() {
		$( this ).addClass(".hide");
	})
});