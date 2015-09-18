// smvc -- the HTML/jQuery based view / controller for simmatch
// captures input, interprets it, sends it to sm for model updating
// receives output requests fom sm and renders results on screen

/**
 * namespace, a different one because yes
 */

var SMVC = {
	sm: undefined,
	_cellWidth: 48,
	_cellHeight: 48,

	// pseudo-constants; until 'const' isn't a thing, we'll use these

	// hover state of a single cell

	_CELLNOTSELECTED: 0, // cell is not selected
	_CELLSELECTEDSINGLE: 1, // there's only one cell selected, and it's this one
	_CELLSELECTEDSWAP: 2, // cell is selected for chip swapping with a contiguous cell
	_CELLSELECTEDCHECK: 3, // cell is selected for checking if it's part of a valid pattern
	_CELLSELECTEDSUCCESS: 4, // cell is a match in a pattern
	_CELLSELECTEDMAX: 4,



	// game-wide cell interaction state (relating to cell selection and responses to cell operations)

	_CELLINTERACTION_INHIBITED: 0,
	_CELLINTERACTION_NOSELECTION: 1,
	_CELLINTERACTION_ONESELECTED: 2,
	_CELLINTERACTION_CONTIGUOUSSELECTED: 3,
	_CELLINTERACTION_RANGESELECTED: 4,
	_CELLINTERACTION_INVALIDRANGESELECTED: 5,
	_CELLINTERACTION_DO_SWITCHSUCCESS: 100,
	_CELLINTERACTION_DO_RANGESUCCESS: 101,
	_CELLINTERACTION_DO_RANGEFAIL: 102,
	_CELLINTERACTION_DO_PUTCHIP: 103,

	_cellInteractionState: 1,

	_boardInteractions: [],

	// for practical purposes, we'll store the coordinates of the first and second selected cell, if available
	_selectedRangeCorners: [],


	// minutes per play, if the game is time-based
	_maxSeconds: 60 * 3,

	// seconds left in the game, if the game is time based
	_secondsLeft: undefined,

	// reference to the "seconds" timer, if the game is timed
	_secondsTimer: undefined

};



// ██╗███╗   ██╗██╗████████╗
// ██║████╗  ██║██║╚══██╔══╝
// ██║██╔██╗ ██║██║   ██║   
// ██║██║╚██╗██║██║   ██║   
// ██║██║ ╚████║██║   ██║   
// ╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   
                         


/**   
 * The view/controller class.
 * Relies on the main game object being already present in memory,
 * as well as jQuery. Also needs a certain DOM structure to work.
 * Other view/controllers may be created for different interfaces.
 * @constructor
 */

SMVC.VC = function() {

	try {
		// try to get the global game object
		// console.log("VC() > about to get sm's instance");
		SMVC.sm = SM.getInstance();	

		// if we were able to get it:
		// create the cell interaction matrix

		// console.log("VC() > about to initialize SMVC._boardInteractions");
		for(var i = 0; i < sm.numRows; i++) {

			// console.log("VC() > Creating row ", i, " of ", sm.numRows - 1);


			SMVC._boardInteractions.push(new Array());

			for(var j = 0; j < sm.numCols; j++) {
				SMVC._boardInteractions[SMVC._boardInteractions.length - 1].push(SMVC._CELLNOTSELECTED);
			}

		
		}
		// console.log("VC() > _boardInteractions: ", SMVC._boardInteractions);

		// draw the cells and bind things in screen
		this.initialOutput();
	} catch (e) {
		console.log("VC > error initializing; SM not loaded. Aborting.");
		console.log("Error: ", e);
	}
}





/**
 * Page controller. The only "true controller" here.
 * @param {string} pageToShow - the "page" to activate.
 * @returns true on success.
 */

SMVC.VC.prototype.activatePage = function(pageToShow) {
	var pts = $(pageToShow);

	// console.log("VC.activatePage > page to show: ", pts);

	if(!(pts).hasClass("page")) { return false; }
	// $(".activepage").hide().removeClass("activepage");
	// pts.show().addClass("activepage");

	$(".activepage").removeClass("activepage");
	pts.addClass("activepage");


	return true;

}



// ██╗  ██╗███████╗██╗     ██████╗ ███████╗██████╗ ███████╗
// ██║  ██║██╔════╝██║     ██╔══██╗██╔════╝██╔══██╗██╔════╝
// ███████║█████╗  ██║     ██████╔╝█████╗  ██████╔╝███████╗
// ██╔══██║██╔══╝  ██║     ██╔═══╝ ██╔══╝  ██╔══██╗╚════██║
// ██║  ██║███████╗███████╗██║     ███████╗██║  ██║███████║
// ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚══════╝
                                                        



/**
 * Gets the cell coordinates from a class string, given that 
 * in the string there is a class with the format 'cell-x-y',
 * where x and y are the row and column numbers. 
 * Does not verify if the cell is actually valid.
 * @param {string} class - the class attribute of the div.
 * @returns an object with "row" and "col" attributes. If the 
 */ 

SMVC.VC.prototype.getCoordsFromClassName = function(theClass) {

	var cellname = undefined;
	var cellnameArr;
	var cellObj;

	if(typeof theClass != "string" || theClass.length < 1) { return false; }

	// dissect the "class" string of the div; get coordinates
	var classArr = theClass.split(" ");
	for (var i = classArr.length - 1; i >= 0; i--) {

		// The cell class name we're looking for has the format "cell-x-y", where x and y are 
		// the row and column numbers.

		if(classArr[i].indexOf("cell-") != -1) {
			cellname = classArr[i];

			cellnameArr = cellname.split("-");

			if(cellnameArr[1] && cellnameArr[2]) {
				return { row: cellnameArr[1], col: cellnameArr[2] };
			}


		}
	};

	return false;

}





/**
 * Gets the cell object corresponding to a cell div on screen.
 * @param {string} class - the class attribute of the div.
 * @returns the cell object, or false if invalid or not found.
 */

SMVC.VC.prototype.getCellFromDiv = function(theClass) {

	var cellname = undefined;
	var cellObj;

	if(typeof theClass != "string" || theClass.length < 1) { return false; }

	// get the cell coordinates
	var cellCoords = vc.getCoordsFromClassName(theClass);
	if(!cellCoords) { return false; }

	// console.log("VC.getCellFromDiv > cellCoords: ", cellCoords);

	cellObj = SMVC.sm.getCell(cellCoords.row, cellCoords.col);
	if(cellObj) { return cellObj; }

	return false;

}



/**
 * Checks if a cell has a chip and is contiguous to the first selected cell.
 * This method is here, and not in SM, because it refers to a selection. Selections are interaction items.
 * @param {number} row
 * @param {number} col
 * @returns true if the cell has a chip and is contiguous to the first selected cell; false otherwise.
 */ 

SMVC.VC.prototype.cellIsContiguous = function(row, col) {

	var selectedRow = parseInt(SMVC._selectedRangeCorners[0].row, 10),
	selectedCol = parseInt(SMVC._selectedRangeCorners[0].col, 10),

	coordsToCheck = [[selectedRow-1, selectedCol], [selectedRow+1, selectedCol], [selectedRow, selectedCol-1], [selectedRow, selectedCol+1]];


	if(SMVC.sm.cellHasChip(row, col)) {
		for (var i = coordsToCheck.length - 1; i >= 0; i--) {
			if(coordsToCheck[i][0] == row && coordsToCheck[i][1] == col) { return true; }
		}
	}
	return false;
}


/**
 * Removes any words starting with a given substring from a given string.
 * @param {string} origstring - the string to modify; it should not contain consecutive spaces
 * @param {string} substring - the string to look for
 * @returns the modified string 
 */

SMVC.VC.prototype.removeSubstrWords = function(origstring, substring) {

	newstring = ""; 

	// console.log("VC.removeSubstrWords > original string: ", origstring, ", substring to detect: ", substring);

	var origStringArr = origstring.split(" ");

	for (var i = origStringArr.length - 1; i >= 0; i--) {

		// console.log("VC.removeSubstrWords > searching in word '", origStringArr[i], "'");
		if(origStringArr[i].indexOf(substring) == -1) {

			// console.log("VC.removeSubstrWords > substring not detected; will add to new string");

			newstring += origStringArr[i];
			if(i != 0) { newstring += " "; }

		}

		// console.log("VC.removeSubstrWords > the new string is now '", newstring, "'");

	}

	return newstring;
}




/**
 * Returns two coordinate points that define the same range that _selectedRangeCorners[] defines. 
 * The difference is that these points will always be the upper/lefmost and the lower/rightmost ones of said range.
 * This is intended for use in draw methods.
 * Fails if there are not at least two elements in _selectedRangeCorners and/or they do not have the expected format.
 * @reeturns orderedArray: an ordered 2 element object.
 */

SMVC.VC.prototype.getDrawRangeCorners = function() {

	var drawCorners = [];

	if(SMVC._selectedRangeCorners.length < 2) return false;

	drawCorners[0] = {};
	drawCorners[1] = {};

	if (SMVC._selectedRangeCorners[0].row < SMVC._selectedRangeCorners[1].row) {
		drawCorners[0].row = SMVC._selectedRangeCorners[0].row; 
		drawCorners[1].row = SMVC._selectedRangeCorners[1].row; 
	} else {
		drawCorners[0].row = SMVC._selectedRangeCorners[1].row; 
		drawCorners[1].row = SMVC._selectedRangeCorners[0].row; 		
	}


	if (SMVC._selectedRangeCorners[0].col < SMVC._selectedRangeCorners[1].col) {
		drawCorners[0].col = SMVC._selectedRangeCorners[0].col; 
		drawCorners[1].col = SMVC._selectedRangeCorners[1].col; 
	} else {
		drawCorners[0].col = SMVC._selectedRangeCorners[1].col; 
		drawCorners[1].col = SMVC._selectedRangeCorners[0].col; 		
	}

	return drawCorners;

}


/** 
 * Returns true if a range can be defined between both coordinate sets in _selectedRangeCorners[],
 * and if such range does not contain a blocked cell.
 */ 

SMVC.VC.prototype.rangeIsValid = function() {

	var corners = vc.getDrawRangeCorners(); if (!corners) return false;

	return SMVC.sm.rangeIsValid(corners[0].row, corners[0].col, corners[1].row, corners[1].col);

}


/** 
 * Returns true if a range contains a match. For now, a match is defined as "all chips are of the same type or wildcards". 
 * Assumes that the current range is valid. 
 */ 

SMVC.VC.prototype.rangeMatchesSameType = function() {

	var corners = vc.getDrawRangeCorners(); if (!corners) return false;

	return SMVC.sm.rangeMatchesSameType(corners[0].row, corners[0].col, corners[1].row, corners[1].col);

}



/** 
 * Returns true if a range can be defined between both coordinate sets in _selectedRangeCorners[],
 * regardless of blocked cells.
 */ 

SMVC.VC.prototype.rangeIsWithinBoundaries = function() {

	var corners = vc.getDrawRangeCorners(); if (!corners) return false;

	return SMVC.sm.rangeIsWithinBoundaries(corners[0].row, corners[0].col, corners[1].row, corners[1].col);


}






// ██╗███╗   ██╗██████╗ ██╗   ██╗████████╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
// ██║████╗  ██║██╔══██╗██║   ██║╚══██╔══╝    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
// ██║██╔██╗ ██║██████╔╝██║   ██║   ██║       ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
// ██║██║╚██╗██║██╔═══╝ ██║   ██║   ██║       ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
// ██║██║ ╚████║██║     ╚██████╔╝   ██║       ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
// ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝    ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
                                                                                                             
// (aka the controller part)
// the first methods are mostly routing


/**
 * Controller for the cell hovers (actually, both 'hover' and 'mousedown' events, to provide support for touch interfaces).
 * Calls the appropriate function depending on context, which is determined from the current _cellInteractionState.
 * @param {object} event: a jQuery Event object.
 */

SMVC.VC.prototype.getCellHover = function(event) {

	// console.log("VC.getCellHover > Received a hover from a cell. Event: ", event);

	var currentDiv = $(event.target);
	var theClass = currentDiv.attr("class");

	// surely there's a better way to do this
	var currentCell = vc.getCellFromDiv(theClass);
	var currentCoords = vc.getCoordsFromClassName(theClass);	

	if(!currentCell) { return false; }

	// console.log("VC.getCellHover > currentDiv: ", currentDiv);
	// console.log("VC.getCellHover > currentCoords: ", currentCoords);
	// console.log("VC.getCellHover > SMVC._cellInteractionState: ", SMVC._cellInteractionState);

	switch(SMVC._cellInteractionState) {
		case SMVC._CELLINTERACTION_INHIBITED: return false; break;
		case SMVC._CELLINTERACTION_ONESELECTED:
			
			// If this cell is neither the first selected or a contiguous one...
			if(!((SMVC._selectedRangeCorners[0].row == currentCoords.row && SMVC._selectedRangeCorners[0].col == currentCoords.col)
				|| vc.cellIsContiguous(currentCoords.row, currentCoords.col))) {

				// mark this cell as the second selected, temporarily, and highlight the current test range
				vc.markTemporaryRange(currentCoords.row, currentCoords.col);

			} else {
				// auxiliary cleanup
				vc.unmarkTemporaryRange();
			}

		break;
	}
}



/**
 * Controller for the cell clicks (actually, 'mouseup' events).
 * Calls the appropriate function depending on context, which is determined from the current _cellInteractionState.
 * @param {object} event: a jQuery Event object.
 */

SMVC.VC.prototype.getCellClick = function(event) {

	// console.log("VC.getCellClick > Received a click from a cell. Event: ", event);

	var currentDiv = $(event.target);
	var theClass = currentDiv.attr("class");

	// surely there's a better way to do this
	var currentCell = vc.getCellFromDiv(theClass);
	var currentCoords = vc.getCoordsFromClassName(theClass);

	var chipsInRange;


	// currentCell now holds the cell object of the clicked cell div.
	// If there is no cell object (eg. the class is invalid, etc.) return false.
	if(!currentCell) { return false; }

	// console.log("VC.getCellClick > currentDiv: ", currentDiv);
	// console.log("VC.getCellClick > SMVC._cellInteractionState: ", SMVC._cellInteractionState);

	switch(SMVC._cellInteractionState) {
		case SMVC._CELLINTERACTION_INHIBITED: return false; break;
		case SMVC._CELLINTERACTION_NOSELECTION: 
			// There's no selection now. 
			// If the current cell is available, put a new chip in it.
			// If the current cell has a chip, select it.
			// Otherwise, take no action.

			// If the current cell is available...
			if(SMVC.sm.cellIsAvailable(currentCoords.row, currentCoords.col)) {
				// console.log("VC.getCellClick > about to call putChipInCell");

				vc.putChipInCell(currentCoords.row, currentCoords.col);
			} else {
				// If the current cell has a chip...
				if(SMVC.sm.cellHasChip(currentCoords.row, currentCoords.col)) {
					vc.selectFirstCell(currentCoords.row, currentCoords.col);
				}				
			}


		break;

		case SMVC._CELLINTERACTION_ONESELECTED: 
			// There's one cell selected. 

			// if the current cell is the same as the selected one,
			// unselect it.
			if(SMVC._selectedRangeCorners[0].row == currentCoords.row && SMVC._selectedRangeCorners[0].col == currentCoords.col) {
				vc.unselectFirstCell();
			} else {
				// If the current cell is contiguous to the selected one and also has a chip,
				// try to switch this chip with the selected one.
				// (cellIsContiguous() will also return false if there's no chip in the cell.)
				if(vc.cellIsContiguous(currentCoords.row, currentCoords.col)) {
					vc.swapChips(currentCoords.row, currentCoords.col);					
				} else {
					// If the cell is not contiguous, this means a range, either valid or invalid.
					if(vc.rangeIsValid()) {
						// check if the range contains a match; if so, score
						// the range must also have a minimum acceptable number of valid chips

						chipsInRange = vc.rangeMatchesSameType();
						if(chipsInRange > sm.getMinRangeChips()) {
							// console.log("VC.getCellClick > RANGE MATCHES!!!!!!!");
							vc.solveRange();
						}
					}

					// in any case, destroy the selection now.
					// console.log("VC.getCellClick > about to call unselectAllCells()");
					vc.unselectAllCells();

				}
									
			}

			// Otherwise, there's no change.
		break;

	}
}


/**
 * Click controller for the Sell buttons. 
* @param {object} event
*/

SMVC.VC.prototype.getButtonSellClick = function(ev) {

	var currentButton = $(ev.currentTarget);
	var whatChipId;
	// var whatChipId = currentButton.parent().attr("id");
	console.log("getButtonSellClick > currentButton: ", currentButton);

	// if(currentButton.hasClass(".chipvaluecontainer")){
	// 	whatChipId = currentButton.attr("id");
	// } else {
	// 	whatChipId = currentButton.parents(".chipvaluecontainer").attr("id");	
	// }
	whatChipId = currentButton.attr("id");

	var whatChipArr = whatChipId.split("-");
	var whatChip = whatChipArr[1];
	console.log("getButtonSellClick > whatChip: ", whatChip);

	vc.sellChips(whatChip);

}  


// from here on, it's mostly logic

/**
 * Initialize a game using the current starting parameters.
 */

SMVC.VC.prototype.initializeGame = function() {

	// start the game clock

	SMVC._secondsLeft = SMVC._maxSeconds;

	// console.log("VC.initializeGame > SVMC._secondsLeft: ", SMVC._secondsLeft);

	SMVC._secondsTimer = window.setTimeout(vc.doSecondsUpdate(), 1000);

	vc.activatePage("#main");

}

/**
 * Given its coordinates, marks a cell as the first selected cell.
 * Will also unselect the 2nd selection, if any,
 * unselect any other first selected cell (there shouldn't be any anyway)
 * and set the current cell interaction state to _CELLSELECTEDSINGLE.
 * 
 * @param {number} row
 * @param {number} col
 * @returns true on success, false otherwise
 */

SMVC.VC.prototype.selectFirstCell = function(row, col) {

	// console.log("VC.selectFirstCell > about to set cell in ", row, ", ", col, " as first selected");

	// if the coordinates are invalid for this matrix, return false.
	if(!SMVC.sm.cellIsValid(row, col)) { 
		// console.log("VC.selectFirstCell > coordinates are invalid, aborting");
		return false; 
	} 

	// the cell should have a chip in it -- this means the cell is not blocked	
	if(!SMVC.sm.cellHasChip(row, col)) {
		// console.log("VC.selectFirstCell > cell has no chip, aborting"); 
		return false; 
	}

	// unselect the previous first cell, if any
	vc.unselectFirstCell();


	// mark this cell as selected in the board interactions matrix
	SMVC._boardInteractions[row, col] = SMVC._CELLSELECTEDSINGLE;

	// mark the first cell and contiguous cells in the board
	SMVC._selectedRangeCorners[0] = {};
	SMVC._selectedRangeCorners[0].row = row;
	SMVC._selectedRangeCorners[0].col = col;

	// console.log("VC.selectFirstCell > SMVC._selectedRangeCorners[0]: ", SMVC._selectedRangeCorners[0]);

	vc.addInteractionClassToCell(row, col, SMVC._CELLSELECTEDSINGLE, true);

	// change the current interaction state
	SMVC._cellInteractionState = SMVC._CELLINTERACTION_ONESELECTED;
	// console.log("VC.selectFirstCell > SMVC.cellInteractionState is now ", SMVC._cellInteractionState);

}


/** 
 * Unselects the first selection (and therefore also the second), also removing from the board any related classes.
 * If there are no first coordinates in _selectedRangeCorners, does nothing.
 */

SMVC.VC.prototype.unselectFirstCell = function() {
	if(SMVC._selectedRangeCorners[0]) {

		if(SMVC._selectedRangeCorners[1]) {
			vc.clearInteractionClassFromCell(SMVC._selectedRangeCorners[1].row, SMVC._selectedRangeCorners[1].col, false);	
			
		}

		var row = parseInt(SMVC._selectedRangeCorners[0].row, 10);
		var col = parseInt(SMVC._selectedRangeCorners[0].col, 10);

		var coordsToCheck = [[row-1, col], [row+1, col], [row, col-1], [row, col+1]];
		for (var i = coordsToCheck.length - 1; i >= 0; i--) {
			SMVC._boardInteractions[coordsToCheck[i][0], coordsToCheck[i][1]] = SMVC._CELLNOTSELECTED;
		};


		// remove the selected mark in the board interactions matrix
		// console.log("VC.unselectFirstCell > about to reset the cell in ", row, ", ", col);
		SMVC._boardInteractions[row, col] = SMVC._CELLNOTSELECTED;

		// remove the class to the div
		vc.clearInteractionClassFromCell(row, col, true);

		// empty the selectedRangeCorners array
		SMVC._selectedRangeCorners = []; 

		// change the current interaction state
		SMVC._cellInteractionState = SMVC._CELLINTERACTION_NOSELECTION;
		// console.log("VC.unselectFirstCell > SMVC.cellInteractionState is now ", SMVC._cellInteractionState);

	}
}



/**
 * Puts a chip in the cell (row,col); it's assumed that this action is legal (eg. the cell is available). 
 * @param {number} row
 * @param {number} col
 * @returns true on success
 */

SMVC.VC.prototype.putChipInCell = function(row, col) {

	// get the current player's next chip from his next chip queue, put it in the current cell

	var theChip = SMVC.sm.getCurrentPlayerNextChip();
	// console.log("VC.putChipInCell > chip to put: ", theChip);


	var result = SMVC.sm.putChipInCell(row, col, theChip); 

	// console.log("VC.putChipInCell > sm.putChipInCell was successful? ", result);
	// redraw this cell and adjacent ones
	vc.drawBoard();

	// update the info in the subwindow
	vc.drawSubWindow();
}




/**
 * Switches the chip in [row, col] with the one in the first selected cell.
 * Assumes this action is legal (eg. the current cell is contiguous to the first selected one).
 * @param {number} row
 * @param {number} col
 * @returns true on success.
 */

SMVC.VC.prototype.swapChips = function(row, col) {
	SMVC.sm.swapChips(SMVC._selectedRangeCorners[0].row, SMVC._selectedRangeCorners[0].col, row, col);

	// here would be the call to the corresponding animation
	// for now, just refresh the view in the affected cells
	vc.drawCell(SMVC._selectedRangeCorners[0].row, SMVC._selectedRangeCorners[0].col);
	vc.drawCell(row, col);

	// unselect the first cell, reset the board interaction matrix and the interaction state
	vc.unselectFirstCell();
}



/**
 * Marks a temporary range and highlights it.
 * Assumes this action is legal (eg. the current cell is contiguous to the first selected one).
 * @param {number} row
 * @param {number} col
 * @returns true on success.
 */

SMVC.VC.prototype.markTemporaryRange = function(row, col) {

	// Marks the current cell as second selection
	SMVC._selectedRangeCorners[1] = {};
	SMVC._selectedRangeCorners[1].row = row;
	SMVC._selectedRangeCorners[1].col = col;

	// console.log("VC.markTemporaryRange > row: ", row, ", col: ", col);

	// if the range is valid...
	if(vc.rangeIsValid()) {
		// console.log("VC.markTemporaryRange > the range is valid");
		vc.drawTemporaryRange(true);
	} else {
		if(vc.rangeIsWithinBoundaries()) {
			// console.log("VC.markTemporaryRange > the range is invalid but within boundaries");
			vc.drawTemporaryRange(false);
		}
	}

}


/**
 * Unmark temporary range classes for hover cleanup.
 */

SMVC.VC.prototype.unmarkTemporaryRange = function() {
	vc.clearTemporaryRange();
}



/**
 * Definitely unmark the current range; this means emptying _selectedRangeCorners[] and returning the interaction
 * state to _CELLINTERACTION_NOSELECTION.
 */

SMVC.VC.prototype.unselectAllCells = function() {


	// clear both selected cells by emptying the _selectedRangeCorners array
	SMVC._selectedRangeCorners = {};

	SMVC._cellInteractionState = SMVC._CELLINTERACTION_NOSELECTION;

	// visually unmark the range
	// vc.unmarkTemporaryRange();
	vc.drawBoard();

} 



/**
 * Given a valid range, accredits the chips in it to the player, gives bonuses, then erases said chips.
 * Could assume the current range is valid, but I won't do that here.
 * @returns false if the function fails.
 */

SMVC.VC.prototype.solveRange = function() {
	var bonuses;
	var corners = vc.getDrawRangeCorners(); if (!corners) return false;

	bonuses = SMVC.sm.solveRangeForPlayer(corners[0].row, corners[0].col, corners[1].row, corners[1].col);
	if(!bonuses) return false;

	// now bonuses contains an array of objects in the format { "CODE", value }
	// each code can be used to output appropriate strings to inform the player of obtained bonuses
	// for now this is a TODO, though

	// now, actually remove the chips
	SMVC.sm.removeChipsInRange(corners[0].row, corners[0].col, corners[1].row, corners[1].col);

	// now we can get rid of the current selection and devolve the interaction state, and
	// refresh the board
	vc.unselectAllCells();

	// ...and also refresh the subwindow
	vc.drawSubWindow();

}



/**
 * Sells the chips of a certain type.
 * @param {number} chipType; must be a valid type of chip at play
 */

SMVC.VC.prototype.sellChips = function(chipType) {
	// console.log("VC.sellChips(" , chipType, "): calling underlying function");
	SMVC.sm.sellChips(chipType);
	vc.drawSubWindow();
};




/**
 * For timed games, handles the "tick" that runs every second. That is, updates the clock and the chip values.
 */


SMVC.VC.prototype.doSecondsUpdate = function() {

	// ...here goes all that chip value updating...

	// Update the clock.
	// console.log("SMVC.doSecondsUpdate > SMVC._secondsLeft: ", SMVC._secondsLeft);
	SMVC._secondsLeft--;

	// If the game is over, end the game.
	if(SMVC._secondsLeft <= 0) {
		// console.log("doSecondsUpdate > no more seconds! Game over.");
		vc.endGame();
	} else {
		// Rehook the seconds timer.
		SMVC._secondsTimer = window.setTimeout(vc.doSecondsUpdate, 1000);		
	}


	// Refresh the subwindow.
	vc.drawSubWindow();	

}



SMVC.VC.prototype.endGame = function() {

	// here would go any animations saying "time's up!"

	// here we would tally any end-game bonuses

	// update the end screen
	$("#finalpoints").text("$" + SMVC.sm.getCurrentPlayerPoints());

	vc.activatePage("#endwindow");

}



//  ██████╗ ██╗   ██╗████████╗██████╗ ██╗   ██╗████████╗    ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗ ███████╗
// ██╔═══██╗██║   ██║╚══██╔══╝██╔══██╗██║   ██║╚══██╔══╝    ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝
// ██║   ██║██║   ██║   ██║   ██████╔╝██║   ██║   ██║       ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝███████╗
// ██║   ██║██║   ██║   ██║   ██╔═══╝ ██║   ██║   ██║       ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗╚════██║
// ╚██████╔╝╚██████╔╝   ██║   ██║     ╚██████╔╝   ██║       ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║███████║
//  ╚═════╝  ╚═════╝    ╚═╝   ╚═╝      ╚═════╝    ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
                                                                                                                           
// (aka the view part)



/**
 * Generates and binds the cell events and data; binds other objects in the screen; generates elements in the subwindow.
 */

SMVC.VC.prototype.initialOutput = function(){

	var self = this;

	$(document).ready(function(){



		// main game screen

		// assumes #board exists; should be a div
		var board = $("#board");
		board.empty();

		

		var rows = SMVC.sm.numRows,
		cols = SMVC.sm.numCols;

		// create the board's cells
		// console.log("VC.initialOutput > this.sm: ", SMVC.sm);
		var thisDiv;

		board.css("width", cols * SMVC._cellWidth);
		board.css("height", rows * SMVC._cellHeight);

		for(var i = 0; i < rows; i++) {
			for(var j = 0; j < cols; j++) {
				thisDiv = $("<div class='cell cell-" + i + "-" + j + "'><span></span></div>").appendTo(board);

				thisDiv.on("mouseenter mousedown", function(ev){
					// console.log("nyan! mousedown!");
					vc.getCellHover(ev);
				});


				thisDiv.on("mouseup", function(ev){

					vc.getCellClick(ev);

				});


			}
		}

		vc.drawBoard();

		
		// output to the subwindow
		vc.drawSubWindow();

		// connect the hooks for the subwindow buttons
		// $(".button-sell").on("mouseenter mousedown"), function(ev){
		// 	vc.getButtonSellHover(ev);
		// }		

		$("#subwindow").on("mouseup", ".button-sell", function(ev) {
			vc.getButtonSellClick(ev);
		});



		// intro screen

		// console.log("VC.initialOutput > .button-startgame: ", $(".button-startgame"));

		$(".button-startgame").on("mouseup", function(ev){
			// console.log("startgame pushed");

			var md = $("#inputMinutes").val();
			md = parseInt(md, 10); 

			// console.log("VC.initialOutput > .button-startgame.onmouseup > md: ", md);

			if(typeof md != "number") { md = 3; }
			if( md < 1 || md > 5 ) { md = 3; }

			SMVC._maxSeconds = md * 60;


			// console.log("VC.initialOutput > .button-startgame.onmouseup > SMVC._maxSeconds: ", SMVC._maxSeconds);
			vc.initializeGame();	
		});


		// end screen

		$(".button-restartgame").on("mouseup", function(ev){

			// restart the game board with the same parameters, but preserving most player info
			SMVC.sm.reInitSame();

			vc.drawBoard();
			vc.drawSubWindow();

			vc.initializeGame();


		});

		$(".button-settings").on("mouseup", function(ev){
			vc.activatePage("#startwindow");
		});



	});
}




/**
 * Refreshes the view in one cell.
 * @param {number} row - the row number of the cell
 * @param {number} col - the column number of the cell.
 */

SMVC.VC.prototype.drawCell = function(row, col){

	// conceptually I shouldn't be able to get the whole cell object here;
	// I might change this.
	var theCell = SMVC.sm.getCell(row, col);
	var theDiv = $(".cell-" + row + "-" + col);
	var theSpan = theDiv.children().first();

	var cellClassStr = "cell cell-" + row + "-" + col;
	var spanClassStr = "";

	// console.log("VC.drawCell > cell: ", theCell);


	if(theCell) {
		if(theCell.available) { cellClassStr += " available"; }
		if(theCell.blocked) { 
			cellClassStr += " blocked"; 
			spanClassStr = "blocked";
		}
		if(theCell.chip > -1) {
			cellClassStr += " chip";
			spanClassStr = "chip-" + theCell.chip;
		}
		if(theCell.starting) {
			cellClassStr += " starting";
		}

		if(SMVC._boardInteractions[row][col] > 0) {
			cellClassStr += " selection-" + SMVC._boardInteractions[row][col];
		}

		theDiv.attr("class", cellClassStr);
		theSpan.attr("class", spanClassStr);

	} else {
		return false;
	}


}



/**
 * Refreshes the view in all cells.
 */

SMVC.VC.prototype.drawBoard = function(){
	var rows = SMVC.sm.numRows,
	cols = SMVC.sm.numCols;

	for(var i = 0; i < rows; i++) {
		for(var j = 0; j < cols; j++) {
			vc.drawCell(i, j);
		}
	}


}



/**
 * (Re)Draws the entire subwindow.
 */

SMVC.VC.prototype.drawSubWindow = function() {

	var chipqueue, chipcount, chipvalue;
	var divstr = "";
	var mins, secs;

	var playernumber = 1 + SMVC.sm.getCurrentPlayerNumber();

	// player identification
	$("#playernumber").text(playernumber);
	$("#playername").text(SMVC.sm.getCurrentPlayerName());

	// player points
	$("#playerpoints").text("$" + SMVC.sm.getCurrentPlayerPoints());

	if(SMVC.sm.isTurnBased()) {
		// turns available, if this is a turns-based game
		$("#turnnumber").text(SMVC.sm.getCurrentTurn());
		$("#turnsavailable").text(SMVC.sm.getMaxTurns());	
	} else {
		// clock, if this is a time-based game


		// console.log("vc.drawSubWindow > SMVC._secondsLeft: ", SMVC._secondsLeft);

		mins = Math.floor(SMVC._secondsLeft / 60);
		secs = SMVC._secondsLeft - (mins * 60);

		// console.log("vc.drawSubWindow > mins: ", mins, ", secs: ", secs);

		if(mins < 10) { mins = "0" + mins; }
		if(secs < 10) { secs = "0" + secs; }

		$("#clockminutes").text(mins);
		$("#clockseconds").text(secs);

	}

	// next chip queue
	chipqueue = SMVC.sm.getCurrentPlayerChipQueue();

	$("#nextchipqueue").empty().append("<span>Next</span>");
	for(var i = 0; i < chipqueue.length; i++) {
		$("<div class='next-" + i + " chip-" + chipqueue[i] + "'></div>").appendTo("#nextchipqueue");
	}

	// chip values
	$("#chipvalues").empty();
	chipcount = SMVC.sm.getCurrentPlayerAllChipCounts();
	chipvalue = SMVC.sm.getCurrentPlayerAllChipBaseValues();

	// the count starts in 1 because we don't need to display the count for wildcards
	for(i = 1; i < chipcount.length; i++) {
		divstr  = "<div class='chipvaluecontainer button-sell' id='chipvalue-" + i + "'><div class='chipcount'><span class='chipsymbol'></span><span class='by'>x</span> " + chipcount[i] + "</div>";
		// divstr += "<div class='chiptendency'></div><div class='chipcount'>" + chipcount[i] + "</div><span class='button button-sell'>Sell</span></div>";
		divstr += "<div class='chipvalue'>$" + chipvalue[i] + " <span class='chiptendency'></span></div></div>";
		$("#chipvalues").append(divstr);
	}

	return true;

}



/**
 * Refreshes the interaction state class.
 */ 

SMVC.VC.prototype.drawInteractionState = function() {

	var theContainer = $("#container");
	var currentInteractionClass = "";

	// if there is another class for interaction state in #container, erase it.
	var currentClasses = theContainer.attr("class");
	var newClasses = vc.removeSubstrWords(currentClasses, "interactionstate-");

	// add the new class, representing the current interaction state
	newClasses += " interactionstate-" + SMVC._cellInteractionState;
	theContainer.attr("class", newClasses);

	return true;
}



/**
 * Adds an interaction class to the cell at [row, col].
 * If requested, also adds the "contiguous" class to the contiguous cells with chips; this is to be used on first selections.
 * @param {number} row
 * @param {number} col
 * @param {string} classAppend - the string to be appended to "selection-" and added to the cell as a class. Must not be empty.
 * @param {boolean} addContiguous - if true will add the "contiguous" class to contiguous cells with chips.
 * @returns true on success, false otherwise.
 */

SMVC.VC.prototype.addInteractionClassToCell = function(row, col, classAppend, addContiguous) {

	row = parseInt(row, 10);
	col = parseInt(col, 10);

	var coordsToCheck = [[row-1, col], [(row+1), col], [row, col-1], [row, (col+1)]];

	if(classAppend == undefined) { return false; }

	if(typeof classAppend == "number") { 		
		classAppend = parseInt(classAppend, 10); 
	}

	if(SMVC.sm.cellIsValid(row, col)) {
		$(".cell-" + row + "-" + col).addClass("selection-" + classAppend);
	} else { return false; }


	// console.log("VC.addInteractionClassToCell > addContiguous: ", addContiguous);
	if(addContiguous) {
		for (var i = coordsToCheck.length - 1; i >= 0; i--) {
			// console.log("VC.addInteractionClassToCell > now checking: ", coordsToCheck[i][0], ", ", coordsToCheck[i][1]);
			if(SMVC.sm.cellHasChip(coordsToCheck[i][0], coordsToCheck[i][1])) {
				$(".cell-" + coordsToCheck[i][0] + "-" + coordsToCheck[i][1]).addClass("contiguous");
			}
		};		
	}

	return true;

}
 

/**
 * Removes any "selection-" class from the cell at [row, col].
 * Optionally attempts to remove the "contiguous" class from the cells contiguous to [row, col].
 * Will also remove any residual "tmprange" and "invalidrange" class.
 * @param {number} row
 * @param {number} col
 * @param {boolean} removeContiguous - if true will check and clean contiguous cells.
 * @returns true on success, false otherwise.
 */ 

SMVC.VC.prototype.clearInteractionClassFromCell = function(row, col, removeContiguous) {

	var coordsToCheck = [[row-1, col], [row+1, col], [row, col-1], [row, col+1]];
	var currentClasses, currentCell;

	vc.clearTemporaryRange();

	// console.log("vc.clearInteractionClassFromCell > about to check cell in ", row, ", ", col);

	if(SMVC.sm.cellIsValid(row, col)) {

		// console.log("vc.clearInteractionClassFromCell > cell is valid");

		currentCell = $(".cell-" + row + "-" + col);
		currentClasses = currentCell.attr("class");

		// console.log("vc.clearInteractionClassFromCell > current class string for current cell is '", currentClasses, "'");

		currentCell.attr("class", vc.removeSubstrWords(currentClasses, "selection-"));

		// console.log("vc.clearInteractionClassFromCell > new class string for current cell is '", currentCell.attr("class"), "'");


	} else { return false; }

	if(removeContiguous) {
		for (var i = coordsToCheck.length - 1; i >= 0; i--) {
			if(SMVC.sm.cellIsValid(coordsToCheck[i][0], coordsToCheck[i][1])){
				$(".cell-" + coordsToCheck[i][0] + "-" + coordsToCheck[i][1]).removeClass("contiguous");
			}
		};	
	}

	return true;

}



/**
 * Adds a "tmprange" class to the cells defined within the _selectedRangeCorners[].
 * Fails if there are no valid corners defined in said array.
 * @param {boolean} validrange - if false, will also set a "invalidrange" class.
 */

SMVC.VC.prototype.drawTemporaryRange = function(validrange) {

	var theCell;

	var drawRange = vc.getDrawRangeCorners();

	// console.log("VC.drawTemporaryRange > drawRange: ", drawRange);

	vc.clearTemporaryRange();

	for(var i = drawRange[0].row; i <= drawRange[1].row; i++) {
		for(var j = drawRange[0].col; j <= drawRange[1].col; j++) {

			if(i == SMVC._selectedRangeCorners[0].row && j == SMVC._selectedRangeCorners[0].col) continue;

			theCell = $(".cell-" + i + "-" + j);
			theCell.addClass("tmprange");
			if(!validrange) { theCell.addClass("invalidrange"); }
		}
	}

}


/**
 * Clears the "tmprange"  and "invalidrange" classes from all cells.
 */

SMVC.VC.prototype.clearTemporaryRange = function() {
	// a la huevona (por ahora)
	$(".cell").removeClass("tmprange").removeClass("invalidrange");

}




SMVC.VC.prototype.setCursor = function(){
	return false;
}





var vc = new SMVC.VC();