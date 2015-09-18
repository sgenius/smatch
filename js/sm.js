// sm.js
// the model / logic for smatch


// ███████╗███╗   ███╗
// ██╔════╝████╗ ████║
// ███████╗██╔████╔██║
// ╚════██║██║╚██╔╝██║
// ███████║██║ ╚═╝ ██║
// ╚══════╝╚═╝     ╚═╝
                   

// Our namespace / main game object; implements singleton
// robdodson.me/javascript-design-patterns-singleton

var SM = (function() {

	// returns a reference to the game object
	var instance;


	// ███████╗███╗   ███╗   ██╗███╗   ██╗██╗████████╗
	// ██╔════╝████╗ ████║   ██║████╗  ██║██║╚══██╔══╝
	// ███████╗██╔████╔██║   ██║██╔██╗ ██║██║   ██║   
	// ╚════██║██║╚██╔╝██║   ██║██║╚██╗██║██║   ██║   
	// ███████║██║ ╚═╝ ██║██╗██║██║ ╚████║██║   ██║   
	// ╚══════╝╚═╝     ╚═╝╚═╝╚═╝╚═╝  ╚═══╝╚═╝   ╚═╝   
                                               

	// Main SM class initialization, plus its public / private declarations
	function init(){

		// private properties


		var i; // lol






		// object representing a board configuration
		// this is JSON, so it should be swappable with the contents of a file or an http request
		var _JSON_board = {
			rows: 6,
			cols: 6,
			minChips: 4,
			cells: [
				"......",
				"......",
				"..ss..",
				"..ss..",
				"......",
				"......"
			]
		}



		// how many rows has the _board
		var _numRows = _JSON_board.rows;

		// how many columns has the _board
		var _numCols = _JSON_board.cols;

		// how many types of chips are there, excluding the wildcard
		var _maxChips = 4;

		// base values for each chip
		var _chipBaseValue = new Array();
		_chipBaseValue.push(0); // the value for the wildcard chip

		for(i = 1; i <= _maxChips; i++) {
			_chipBaseValue.push(200); // starting value for each chip
		}

		// base probabilities for each chip
		// the real probability of chip[i] is
		// _chipBaseProbability[i] / sum(_chipBaseProbability)
		// If there more possible chips than values in this array, the base value will be 0 
		// (eg. the chip won't appear at all)
		var _chipBaseProbability = new Array(1, 5, 5, 4, 3);


		// the game is turn-based? false for time-based
		var _isTurnBased = false;

		// how many turns are there in a game, for a turn-based game
		var _maxTurns = 12;




		// current turn, if the game is turn-based
		var _currentTurn = 0;

		// current action in this turn
		var _currentAction = 0;


		// minimum number of chips in a valid range
		var _minRangeChips = 5;





		// How many players are there in this game
		var _numberOfPlayers = 1;

		// current player index
		var _currentPlayer = 0;

		// how long is the next chip queue of each player
		var _NCQLength = 3;


		// how many actions has each player per turn
		var _MAXACTIONS = 3; 


		// player info, containing name, points, active modifiers, and so on
		var  _players; 




		// the _board itself
		var _board;
	


		// private methods and classes

		/*
		 * The chiptype and chip classes are not used yet. These are foundational classes for a further refinement
		 * of the application. They will be needed to implement the full array of features I want to introduce in the
		 * first non-beta version of the game.
		 */


		/**
		 * The chip type class
		 * I was resisting to do this one, but... in the end, I do need it.
		 * Handles the characteristics of a chip type, including (nominally) render characteristics. 
		 * This data is to be received from a server.
		 *
		 * @param {number} code - a positive integer, or a string representing one, to be used as a UID; required.
		 * @param {string} fgcolor - nominally, the foreground color to use in drawing the chip. Should be a valid css color.
		 * @param {string} bgcolor - nominally, the background color to use in drawing the chip. Should be a valid css color.
		 * @param {string} symbol - a one-char string; this char is to be used (nominally) during drawing, 
		 * 		as a distinctive symbol on the chip.
		 * @param {string} name - a string; anything goes (for now).
		 * @param {string} description - a string. Possibly this will accept MarkDown in the future.
		 * @param {number} varianttable - an array, empty by default. If there is more than one item in this array, they will be
		 *		used as probability values to generate variant styles of this chip type.
		 * @param {number} multipliertable - an array, empty by default. If there is more than one item in this array, they will
		 * 		be used as probability values to generate multipliers.
		 */

		function _ChipType(code, fgcolor, bgcolor, symbol, name, description, variantttable, multipliertable, algorithmtype, algorithmmatrix){

			if(!code) { return false; }
			code = parseInt(code);
			if(code == 0) { return false; }
			if(isNan(code)) { return false; }
			this.code = code;

			this.fgcolor = fgcolor || "#ffffff";
			this.bgcolor = bgcolor || "#333333";

			if(typeof symbol != "string") { symbol = ""; }
			if(symbol.length > 1) { symbol = symbol.substr(0, 1); }

			this.symbol = symbol || "";
			this.name = name;
			this.description = description;

			this.variantttable = varianttable || [];

			this.maxmultipliers = maxmultipliers || 1;
			this.algorithmtype = algorithmtype || "random";
			this.algorithmmatrix = algorithmmatrix || [];

		}





		// the chip class
		// represents a single chip, either in the board or in the next chip queue.

		function _Chip(type, variant, multiplier) {

		}




		//         ██████╗  ██████╗  █████╗ ██████╗ ██████╗ 
		//         ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
		//         ██████╔╝██║   ██║███████║██████╔╝██║  ██║
		//         ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
		// ███████╗██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
		// ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ 
		                                                 

		// the board class / object
		// probably should be a singleton, but probably not... so... it's not
		// handles the board as an array of cells, which may or may not contain a chip

		function _Board(numRows, numCols, maxchips, jsonboard) {

			this.maxchips = maxchips;
			this.board = new Array(numCols);
			this.numRows = numRows;
			this.numCols = numCols;

			for (var i = 0; i < numCols; i++) {

				this.board[i] = new Array(numRows);

				var jsonrow = undefined;
				if(jsonboard && typeof jsonboard.cells[i] == "string") {
					jsonrow = new Array();
					var jstr = jsonboard.cells[i];
					for (var k = 0; k < jstr.length; k++) {
						jsonrow.push(jstr.charAt(k));
					}
 				}

				for (var j = 0; j < numRows; j++){

					var thisObj = {
						chip: -1, // -1 for empty cell, 0 for wildcard; positive values for chip types
						available: false,  // is this cell available for immediate chip placement?
						blocked: false, // is this cell unable to be used at any point in the game?
						starting: false // is this a starting cell?
					}

					if(jsonrow && typeof jsonrow[j] == "string") {

						// console.log("_Board() > reading json; item at [", i, "][", j, "] is ", jsonrow[j]);

						switch(jsonrow[j]) {
							case "0":
							case "1":
							case "2":
							case "3":
							case "4":
							case "5":
							case "6":
							case "7":
							case "8":
							case "9":
								var theChip = parseInt(jsonrow[j], 10);
								if(theChip > maxchips) { jsonrow[j] = "s"; break; } // invalid chips become random
								thisObj.chip = parseInt(jsonrow[j], 10);
								// thisObj.starting = true;
							break;
							case "s": // random starter
								// thisObj.chip = Math.floor(Math.random() * (maxchips - 1)) + 1;
								thisObj.starting = true;
								thisObj.available = true; // needed so that init can a random chip here 
								// thisObj.theChip = 0;
							break;
							case "x":
								thisObj.blocked = true;
							break;
						}

					}

					this.board[i][j] = thisObj;			
					
				} // for (j)
			} // for (i)


			console.log("Board() > this: ", this);
			this.refreshAvailabilityAll();

			console.log("Board() > this.board: ", this.board);

			return this;
		}


		// returns if a cell is valid, that is, its coordinates are valid for this array
		_Board.prototype.cellIsValid = function(row, col) {
			// console.log("_Board.cellIsValid > row: ", row, ", col: ", col);
			return (row < this.numRows && row >= 0 && col < this.numCols && col >= 0);
		}


		/**
		 * gets the full object in a cell, given its coordinates
		 * @param {number} row
		 * @param {number} col
		 * @returns a cell object, or false if the cell is invalid
		 */
		_Board.prototype.getCell = function(row, col){
			return this.cellIsValid(row,col) ? this.board[row][col] : false;
		}


		// if the cell is valid and has a valid chip, returns true
		_Board.prototype.cellHasChip = function(row, col) {
			return (this.cellIsValid(row,col) && this.board[row][col].chip > -1 && this.board[row][col].chip <= this.maxchips);
		}


		// if the cell is valid and available, returns true; returns false otherwise
		// a blocked cell cannot be available, so if the cell is blocked, always returns false
		_Board.prototype.cellIsAvailable = function(row,col){
			return (this.cellIsValid(row,col) && !this.board[row][col].blocked && this.board[row][col].available);
		}


		// determines if this cell should be available and refreshes the "available" cell attribute to reflect so
		// returns the value of the "available" attribute of the cell
		_Board.prototype.refreshAvailability = function(row, col){
			if(!this.cellIsValid(row,col)) {
				// console.log("_Board.refreshAvailability > cell at ", row, ", ", col, " is not valid"); 
				return false; 
			}
			if(this.cellIsBlocked(row,col)) {
				// console.log("_Board.refreshAvailability > cell at ", row, ", ", col, " is blocked"); 
				return false; 
				} // an available cell cannot be blocked
			if(this.cellHasChip(row,col)) { 				
				// console.log("_Board.refreshAvailability > cell at ", row, ", ", col, " has a chip");
				return false; 
			} // an available cell must be empty

			// console.log("_Board.refreshAvailability > checking availability of cell at ", row, ", ", col, "; assuming true");

			var cellsToCheck = [[row-1, col], [row+1, col], [row, col-1], [row, col+1]];
			var check = false;
			var hasNeighboringChip = false;

			for (var i = 0; i < 4; i++) {
				// console.log("_Board.refreshAvailability > checking contiguous cell at ", cellsToCheck[i][0], ", ", cellsToCheck[i][1]);
				if(this.cellIsValid( cellsToCheck[i][0], cellsToCheck[i][1] )) {
					var hasChip = this.cellHasChip( cellsToCheck[i][0], cellsToCheck[i][1] );
					// console.log("_Board.refreshAvailability > has chip? ", hasChip);
					if(hasChip) { 
						hasNeighboringChip = true; 
						// console.log("_Board.refreshAvailability > hasNeighboringChip is now true");
					}

				} else {
					// console.log("_Board.refreshAvailability > alas, it does not exist ");
				}
			}

			check = check || hasNeighboringChip;

			this.board[row][col].available = check;

			// console.log("_Board.refreshAvailability > cell at ", row, ", ", col, ": availability is ", check);
			return check;				
			
		}


		/**
		 * Updates the availability field of all cells.
		 */

		_Board.prototype.refreshAvailabilityAll = function() {

			for(var i = 0; i < this.numRows; i++) {
				for(var j = 0; j < this.numCols; j++) {
					// console.log("_Board.refreshAvailabilityAll > calling refreshAvailability(", i, ", ", j, ")");
					this.refreshAvailability(i, j);
				}
			}
		};

		/**
		 * Updates the availability of the cells contiguous to (row, col), if they are valid.
		 * @param { number } row
		 * @param { number } col
		 */

		_Board.prototype.refreshAvailabilityContiguous = function(row, col) {
			if(this.cellIsValid(row-1, col)) { this.refreshAvailability(row-1,col); }
			if(this.cellIsValid(row+1, col)) { this.refreshAvailability(row+1,col); }
			if(this.cellIsValid(row, col-1)) { this.refreshAvailability(row,col-1); }
			if(this.cellIsValid(row, col+1)) { this.refreshAvailability(row,col+1); }			
		}


		_Board.prototype.generateStarterChips = function() {
			var newChip;
			for(var m = 0; m <= _numRows; m++) {
				for(var n = 0; n <= _numCols; n++) {
					if(_board.cellIsStarting(m, n)) {
						console.log("_Board.generateStarterChips > cell ", m, ", ", n, " is a starting cell");
						newChip = _players[_currentPlayer].generateChip();
						console.log("_Board.generateStarterChips > will attempt to put a chip of type ", newChip);
						_board.putChipInCell(m, n, newChip, true);
					}
				}
			}
		}



		// gets the value of the chip in [row,col], -1 if there's no chip, or false if any value is not valid
		_Board.prototype.getChipValue = function(row, col){
			return this.cellHasChip(row,col) ? this.board[row][col].chip : false;
		}

		// determines if a cell is blocked, that is, it's not usable
		// returns true if cell exists and it's blocked, false otherwise
		_Board.prototype.cellIsBlocked = function(row,col) {
			// console.log("_Board.cellIsBlocked > row: ", row, ", col: ", col);
			return (this.cellIsValid(row,col) && this.board[row][col].blocked);
		}


		// returns true if the cell is a starting cell
		_Board.prototype.cellIsStarting = function(row,col) {
			return (this.cellIsValid(row,col) && this.board[row][col].starting);
		}


		// flags a cell as blocked; returns true on success
		// this typically happens during board initialization but I'm leaving the doors open for possible in-game use
		_Board.prototype.blockCell = function(row,col) {
			if(this.cellIsValid(row,col)) {
				this.board[row][col].blocked = true;
				return true;
			}
			return false;
		}


		// puts a chip in an available, non-blocked cell; also updates the "available" attribute to false; returns true on success
		// returns false if the cell was not available or is blocked, or if the chip value is invalid
		_Board.prototype.putChipInCell = function(row,col,chip, force){

			console.log("_Board.putChipInCell > here I am; row: ", row, ", col: ", col, ", chip: ", chip);


			if(typeof row == "string") { row = parseInt(row, 10); }
			if(typeof col == "string") { col = parseInt(col, 10); }

			if(chip < 0 || chip > this.maxchips) {
				console.log("_Board.putChipInCell > chip value " , chip , " is invalid");
			}
			if(this.cellIsValid(row,col) && this.cellIsAvailable(row,col) || force) {

				console.log("_Board.putChipInCell > chip: " , chip);


				this.board[row][col].chip = chip;
				this.board[row][col].available = false; 

				// console.log("_Board.putChipInCell > this.board[", row, "][", col, "]: " , this.board[row][col]);

				// refreshes the availability of this cell and the contiguous ones

				this.refreshAvailabilityContiguous(row, col);				

				return true;

			}
			return false;
		}


		// swaps the chips of two cells
		// requires that both cells have chips with valid values
		// does *not* require that the cells are contiguous, to allow for future game variations
		// returns true on success
		_Board.prototype.swapChips = function(row1, col1, row2, col2) {

			var swap;

			if(!(this.cellHasChip(row1, col1) && this.cellHasChip(row2, col2))) { return false; }
			swap = this.board[row1][col1].chip;
			this.board[row1][col1].chip = this.board[row2][col2].chip;
			this.board[row2][col2].chip = swap;

			return true;

		}



		/** 
		 * Removes a chip and updates the surrounding fields.
		 * This method is intended for use only when a single chip is to be removed. 
		 * For range removal, this method is not only subobtimal, but could even return incongruent results for availability.
		 * @param {number} row
		 * @param {number} col 
		 */

		_Board.prototype.removeChip = function(row, col) {


			if(typeof row == "string") { row = parseInt(row, 10); }
			if(typeof col == "string") { col = parseInt(col, 10); }

			if(chip < 0 || chip > this.maxchips) {
				console.log("_Board.removeChip > chip value " , chip , " is invalid");
			}
			if(this.cellIsValid(row,col) && this.cellHasChip(row,col)) {



				this.board[row][col].chip = -1; // empty cell
				this.refreshAvailability(row, col); // no way to know for sure if this cell is now available

				// console.log("_Board.putChipInCell > this.board[", row, "][", col, "]: " , this.board[row][col]);

				// refreshes the availability of this cell and the contiguous ones

				this.refreshAvailabilityContiguous(row, col);				

				return true;

			}
			return false;

		}

		/**
		 * Removes all chips and updates all surrounding fields for a range.
		 * @param {number} row1
		 * @param {number} col1
		 * @param {number} row2
		 * @param {number} col2
		 */

		_Board.prototype.removeChipsInRange = function(row1, col1, row2, col2) {

			// there *are* more efficient ways of doing this.
			// and with "this", I mean all of this method. Sorry.

			if(typeof row1 == "string") { row1 = parseInt(row1, 10); }
			if(typeof col1 == "string") { col1 = parseInt(col1, 10); }
			if(typeof row2 == "string") { row2 = parseInt(row2, 10); }
			if(typeof col2 == "string") { col2 = parseInt(col2, 10); }

			// first, we remove all of the chips
			for(var i = row1; i <= row2; i++) {
				for(var j = col1; j <= col2; j++) {
					if(this.cellIsValid(i, j) && this.cellHasChip(i, j)) {
						this.board[i][j].chip = -1;
					}
				}
			}

			// now, we refresh availability 
			for(i = row1 - 1; i <= row2 + 1; i++) {
				for (j = col1 - 1; j <= col2 + 1; j++) {
					if (this.cellIsValid(i, j)) {this.refreshAvailability(i, j);}
				}
			}

		}


		// // gets the selection type of a cell, or false if the cell is not valid
		// _Board.prototype.getSelectionType = function(row, col) {
		// 	if (!this.cellIsValid(row, col)) { return false; }
		// 	return this.board[row][col].selectionType;
		// }


		// // sets the selection type of a cell; returns true on success
		// _Board.prototype.setSelectionType = function(row, col, type){
		// 	if (!this.cellIsValid(row, col)) { return false; }
		// 	if (type < 0 || type > 4) {  
		// 		console.log("_Board.setSelectionType(", row, ", ", col, ", ", type, "): type ", type, " is not valid");
		// 		return false;
		// 	}
		// 	this.board[row][col].selectionType = type;
		// 	return true;
		// }


		// returns the chip type if the chip in a cell is either a wildcard or equal to the parameter 'expected';
		// false otherwise.
		// This is a helper function for match checking
		_Board.prototype.chipMatches = function(row, col, expected) {
			if (!this.cellHasChip(row,col)) { return false; }
			var actual = this.board[row][col].chip;
			if(actual == 0) { return 0; } // a wildcard
			if(actual == expected) { return expected; } // an exact match
			return false;
		}

		// returns true if all of the range falls within the board, false otherwise.
		_Board.prototype.rangeIsWithinBoundaries = function(row1, col1, row2, col2) {
			if(!this.cellIsValid(row1, col1)) { return false; }
			if(!this.cellIsValid(row2, col2)) { return false; }
			return true;
		}


		// returns true if all of the range falls within the board and contains no blocked cells
		// or cells without a chip;
		// returns false otherwise.
		_Board.prototype.rangeIsValid = function(row1, col1, row2, col2) {
			if(!this.cellIsValid(row1, col1)) { return false; }
			if(!this.cellIsValid(row2, col2)) { return false; }

			var currentRow, currentCol;

			for(currentRow = row1; currentRow <= row2; currentRow++) {
				for(currentCol = col1; currentCol <= col2; currentCol++) {
					if(this.cellIsBlocked(currentRow, currentCol) || !this.cellHasChip(currentRow, currentCol)) {
						return false;
					}
				}
			}
			return true;
		};


		// returns the number of chips if all of the chips in a range are either the same type or wildcards.
		// returns 0 otherwise.
		// Note: if the range contains at least one blocked or invalid cell, the match fails.
		_Board.prototype.rangeMatchesSameType = function(row1, col1, row2, col2) {

			var matchedChips = 0;

			if(!this.cellIsValid(row1, col1)) { return 0; }
			if(!this.cellIsValid(row2, col2)) { return 0; }

			var currentRow, currentCol;
			var target = undefined;
			var match = true;
			var currentValue;

			for(currentRow = row1; currentRow <= row2; currentRow++) {
				for(currentCol = col1; currentCol <= col2; currentCol++) {

					// if this cell is blocked, search is over
					if(this.cellIsBlocked(currentRow, currentCol)) {
						match = false; break;
					}

					currentValue = this.getChipValue(currentRow, currentCol);

					// if this cell does not have a chip, the search is off
					// note that we are differentiating between 'false' and '0' values
					if(currentValue === false) {
						match = false; break;
					} else {

						// if we found a wildcard, just go on
						if(currentValue == 0) { 
							matchedChips++;
							continue; 
						}

						// if this is the first match, let the target value be this one
						if(target === undefined) {
							target = currentValue;
							matchedChips++;
						} else {
							// if this value is different to that of the target, the search is off
							if(target != currentValue) {
								match = false; break;
							} else {
								// Else, we found a valid chip.
								matchedChips++;
							}
						}
					}
				}

				// if we broke out of the inner loop due to a mismatch, break this loop too
				// and also set matchedChips to 0
				if(match === false) { matchedChips = 0; break; }

			}

			return matchedChips;

		}


		/**
		 * Counts the remaining chips in the board.
		 * @return remaning, a positive integer.
		 */

		_Board.prototype.countRemainingChips = function() {
			var counter = 0;
			for(var i = 0; i < numRows; i++) {
				for(var j = 0; j < numCols; j++) {
					if(this.cellHasChip(i, j)) { counter++; }
				}
			}
			return counter;
		}




		// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════



		//         ██████╗ ██╗      █████╗ ██╗   ██╗███████╗██████╗ 
		//         ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝██╔════╝██╔══██╗
		//         ██████╔╝██║     ███████║ ╚████╔╝ █████╗  ██████╔╝
		//         ██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██╔══╝  ██╔══██╗
		// ███████╗██║     ███████╗██║  ██║   ██║   ███████╗██║  ██║
		// ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
		                                                         


		/**   
		 * A player.
		 * @constructor
		 * @param {number} actionsperturn - the maximum number of actions per turn
		 */


		function _Player(actionsperturn, maxchips, chipbasevalue, chipbaseprobability, ncqlength) {

			this.name = "nyan";

			this.actionsPerTurn = actionsperturn < 1 ? 1 : actionsperturn; // how many actions has this player per turn, initially
			this.actions = this.actionsPerTurn; // actions left in the current turn

			this.points = 0, // how many points has this player during this game

			this.maxchips = maxchips; // maximum number of chip types plus 1 (0, which stands for 'wildcard')

			this.chipCount = [], // how many chips of each type the player has accumulated; 

			this.nextChipQueue = []; // a queue of the next chips that the player will have available; this might be its own class later on

			this.chipbasevalue = chipbasevalue; // an array of base values for the points each chip type is worth

			this.chipbaseprobability = chipbaseprobability; // an array of probabilities for each chip

			this.ncqlength = ncqlength;

			for (var i = 0; i <= maxchips; i++) {
				this.chipCount[i] = 0;
			}

		}

		/**
		 * Setter for the name
		 * @param {string} name
		 */

		_Player.prototype.setName = function(name) {
			this.name = name;
		}

		/**
		 * Getter for the name
		 * @returns the name
		 */

		_Player.prototype.getName = function() {
			return this.name;
		}


		/**
		 * Getter for the player points
		 * @returns the points
		 */

		_Player.prototype.getPoints = function(name) {
			return this.points;
		}

		/**
		 * Adds points to the player.
		 * @param {number} points -- an integer; can be negative. If a non-integer is provided it will be rounded down.
		 * @returns true on success.
		 */

		_Player.prototype.addToPoints = function(points) {
			// console.log("_Player.addToPoints > will add ", points, " to ", this.points);
			this.points += Math.floor(points);
			// console.log("_Player.addToPoints > this player's points are now ", this.points);


		}


		/* Chip count and value functions */


		/**
		 * Returns the whole chip base value array for display.
		 * @returns {array} chipbasevalue, an array of integers
		 */

		_Player.prototype.getAllChipBaseValues = function() {
			return this.chipbasevalue;
		}


		/**
		 * Returns the whole chip base value array for display.
		 * @param {number} type - the chip type to get the base value for		 
		 * @returns {number} value, an integer
		 */

		_Player.prototype.getChipBaseValue = function() {
			if(typeof type == "string") { type = parseInt(type, 10); }
			if(type < 0 || type > this.maxchips) { return false; }
			return this.chipbasevalue[type];
		}


		/**
		 * Returns the whole chip count array for display.
		 * @returns {array} chipcount, an array of positive integers
		 */

		_Player.prototype.getAllChipCounts = function() {
			return this.chipCount;
		}

		/**
		 * Returns the chip count of a single chip type.
		 * @param {number} type - the chip type to add
		 * @returns {number} howmany, an integer
		 */

		_Player.prototype.getChipCount = function(type) {
			if(typeof type == "string") { type = parseInt(type, 10); }

			if(type < 0 || type > this.maxchips) { return false; }

			return this.chipCount[type];
		}


		/**
		 * Adds one or more to the chip count of a certain chip type.
		 * @param {number} type - the chip type to add
		 * @param {number} howmany - how many chips to add; can be negative
		 * @returns true on success
		 */
		_Player.prototype.addToChipCount = function(type, howmany) {

			if(typeof type == "string") { type = parseInt(type, 10); }
			if(typeof howmany == "string") { type = parseInt(howmany, 10); }

			if(type < 0 || type > this.maxchips) { return false; }

			this.chipCount[type] += howmany;

			return true;

		}


		/*
		 * Next Chip Queue functions -- these may be sent to their own class
		 */


		/**
		 * Initialize the next chip queue for this player.
		 */
		 _Player.prototype.initNCQ = function() {
		 	for(var i = 1; i <= this.ncqlength; i++) {
		 		this.nextChipQueue.unshift(this.generateChip());
		 	}

		 	console.log("_Player.initNCQ > nextChipQueue: ", this.nextChipQueue);
		 }

		/**
		 * Generates a chip using the probability values for each chip
		 * This method is in each player, and not in the game object, to allow for per-player disparities
		 * between proabilities, that would be fluctuating
		 * @returns {number} chip = the index of the next chip, an integer from 0 to this.maxchips 
		 */
		_Player.prototype.generateChip = function() {

			var fullprobabilities = 0;
			var randomnumber;

			// console.log("_Player.generateChip > Will generate a chip.")
			// console.log("_Player.generateChip > chipbaseprobability: ", this.chipbaseprobability);

			for (var i = 0; i <= this.maxchips; i++) {
				fullprobabilities += this.chipbaseprobability[i];
			}

			// console.log("_Player.generateChip > fullprobabilities: ", fullprobabilities);

			randomnumber = Math.ceil(Math.random() * fullprobabilities);


			// console.log("_Player.generateChip > randomnumber: ", randomnumber);

			// console.log("_Player.generateChip > Checking what chip does this randomnumber correspond to.");

			i = -1;
			while(randomnumber > 0 && i <= this.maxchips) {

				i++;
				// console.log("_Player.generateChip > Iteration ", i, ": " );
				// console.log("_Player.generateChip >   Will do ", randomnumber, " - ", this.chipbaseprobability[i]);
				randomnumber -= this.chipbaseprobability[i];
				// console.log("_Player.generateChip >   randomnumber is now ", randomnumber);	
			}

			if(i > this.maxchips) { i = this.maxchips; /* although this shouldn't happen, really */ }


			// console.log("_Player.generateChip > the chip generated is: ", i);


			return i;

		}

		/**
		 * Returns the whole next chip queue for display.
		 * @returns {array} nextChipQueue - an integer array
		 */

		_Player.prototype.getNextChipQueue = function() {
			console.log("_Player.getNextChipQueue > queue: ", this.nextChipQueue);

			return this.nextChipQueue;
		}

		/**
		 * Pulls a chip from the next chip queue and returns its value; then supplants it with a new chip.
		 * @returns the pulled chip value.
		 */ 

		_Player.prototype.getNextChip = function() {
			// console.log("_Player.getNextChip > here I am");
			var nextChip = this.nextChipQueue.shift();

			console.log("_Player.getNextChip > the next chip is ", nextChip);

			this.nextChipQueue.push(this.generateChip());
			return nextChip;
		}

		/**
		 * Sells the accumulated chips of a certain type. 
		 * @param {number} chipType
		 * @returns true on success
		 */

		_Player.prototype.sellChips = function(chipType) {

			chipType = parseInt(chipType, 10);
			if(chipType < 1 || chipType > _maxChips) { return false; }

			this.points += this.chipCount[chipType] * this.chipbasevalue[chipType];
			this.chipCount[chipType] = 0;

			return true;
		};




		// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
		// plain SM.init continues






		// initializing game objects

		// player initialization
		_players = new Array();
		for (i = 0; i < _numberOfPlayers; i++) {
			_players.push(new _Player(_MAXACTIONS, _maxChips, _chipBaseValue, _chipBaseProbability, _NCQLength));	
			_players[i].initNCQ();	
		};



		// board initialization
		_board = new _Board(_numRows, _numCols, _maxChips, _JSON_board);
		_board.generateStarterChips();

		// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


		// methods of the game itself


		/**
		 * (Re)initializes a game with the current parameters, cleaning up the board and the score,
		 * but preserving other data.
		 */
 
		_reInitSame = function() {
			
			// for now this implies re-creating the board 
			// later on, this might have further implications, such as grabbing a 
			// new JSON_board.

			_board = undefined;
			_board = new _Board(_numRows, _numCols, _maxChips, _JSON_board);
			_board.generateStarterChips();


			// the idea is to reuse some player data (useful if using sessions) but for now,
			// just recreate all the players.

			_players = undefined;
			_players = new Array();
			for (i = 0; i < _numberOfPlayers; i++) {
				_players.push(new _Player(_MAXACTIONS, _maxChips, _chipBaseValue, _chipBaseProbability, _NCQLength));	
				_players[i].initNCQ();	
			};

		};



		// ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════



		// ██████╗ ██╗   ██╗██████╗ ██╗     ██╗ ██████╗    ████████╗██╗  ██╗██╗███╗   ██╗ ██████╗ ███████╗
		// ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔════╝    ╚══██╔══╝██║  ██║██║████╗  ██║██╔════╝ ██╔════╝
		// ██████╔╝██║   ██║██████╔╝██║     ██║██║            ██║   ███████║██║██╔██╗ ██║██║  ███╗███████╗
		// ██╔═══╝ ██║   ██║██╔══██╗██║     ██║██║            ██║   ██╔══██║██║██║╚██╗██║██║   ██║╚════██║
		// ██║     ╚██████╔╝██████╔╝███████╗██║╚██████╗       ██║   ██║  ██║██║██║ ╚████║╚██████╔╝███████║
		// ╚═╝      ╚═════╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝       ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
                                                                                               

		// this is the return for init(); here go the public things
		return {

			// expose some variables needed by the view/controller
			maxChips: _maxChips,

			numRows: _numRows,
			numCols: _numCols,

			isTurnBased: function() {
				return _isTurnBased;
			},

			/**
			 * Returns a cell.
			 * @param {number} row
			 * @param {number} col
			 * @returns a cell object, or false if the cell is invalid
			 */

			getCell: function(row, col) {
			 	// console.log("sm.getCell > _row, col: ", row, ", ", col);
				return _board.getCell(row, col);
			},

			cellIsValid: function(row, col) {
				return _board.cellIsValid(row, col);
			},

			cellIsAvailable: function(row, col) {
				return _board.cellIsAvailable(row, col);
			},

			cellHasChip: function(row, col) {
				return _board.cellHasChip(row, col);
			},

			cellIsBlocked: function(row, col) {
				return _board.cellIsBlocked(row, col);
			},

			putChipInCell: function(row, col, chip) {
				return _board.putChipInCell(row, col, chip, false);
			},

			swapChips: function(row1, col1, row2, col2) {
				return _board.swapChips(row1, col1, row2, col2);
			},

			removeChip: function(row, col) {
				return _board.removeChip(row, col);
			},

			removeChipsInRange: function(row1, col1, row2, col2) {
				return _board.removeChipsInRange(row1, col1, row2, col2);
			},

			rangeIsValid: function(row1, col1, row2, col2) {
				return _board.rangeIsValid(row1, col1, row2, col2);
			},

			rangeIsWithinBoundaries: function(row1, col1, row2, col2) {
				return _board.rangeIsWithinBoundaries(row1, col1, row2, col2);				
			},

			rangeMatchesSameType: function(row1, col1, row2, col2) {
				return _board.rangeMatchesSameType(row1, col1, row2, col2);
			},

			getMinRangeChips: function() {
				return _minRangeChips;
			},

			getCurrentPlayerNumber: function() {
				return _currentPlayer;
			},

			getCurrentPlayerName: function() {
				return _players[_currentPlayer].getName();
			},

			setCurrentPlayerName: function(name) {
				return _players[_currentPlayer].setName(name);
			},

			getCurrentPlayerPoints: function() {
				return  _players[_currentPlayer].getPoints();
			},

			addToCurrentPlayerPoints: function(howmany) {
				return  _players[_currentPlayer].addToPoints();
			},

			getCurrentPlayerChipQueue: function() {
				return _players[_currentPlayer].getNextChipQueue();
			},

			getCurrentPlayerNextChip: function() {
				return _players[_currentPlayer].getNextChip();
			},

			getCurrentPlayerAllChipBaseValues: function() {
				return _players[_currentPlayer].getAllChipBaseValues();
			},

			getCurrentPlayerChipBaseValue: function(type) {
				return _players[_currentPlayer].getChipBaseValue(type);
			},

			getCurrentPlayerChipCount: function(type) {
				return _players[_currentPlayer].getChipCount(type);
			},

			getCurrentPlayerAllChipCounts: function() {
				return _players[_currentPlayer].getAllChipCounts();
			},

			addToCurrentPlayerChipCount: function(type, howmany) {
				return _players[_currentPlayer].addToChipCount(type, howmany);
			},

			getCurrentTurn: function() {
				return _currentTurn;
			},

			getMaxTurns: function() {
				return _maxTurns;
			},

			sellChips: function(chipType) {
				return _players[_currentPlayer].sellChips(chipType);
			},

			isTurnBased: function() {
				return _isTurnBased;
			},

			reInitSame: function() {
				return _reInitSame();
			},

			// countRemainingChips: function() {
			// 	return 
			// }



			/** 
			 * Given a valid range, accredits those chips to the current player's 
			 * chip count, and adds any bonus points to the player's points.
			 * Does not alter the contents of the board itself.
			 * @param {number} row1
			 * @param {number} col1
			 * @param {number} row2
			 * @param {number} col2
			 * @returns {array} appliedbonuses - a list of applied bonuses and their values, or false if the range is invalid
			 */

			solveRangeForPlayer: function(row1, col1, row2, col2){

				var chiptype, chipcount = [];
				var appliedbonuses = [];


				for (var i = 0; i <= _maxChips; i++) { // we will also count wildcards
					chipcount.push(0);
				}

				if(!_board.rangeIsValid(row1, col1, row2, col2)) return false;

				for(i = row1; i <= row2; i++) {
					for(var j = col1; j <= col2; j++) {

						// check the chip type
						chiptype = _board.getChipValue(i, j);

						// add to the temporary count
						chipcount[chiptype]++;

					}
				}


				console.log("SM.solveRangeForPlayer > temporary chipcount: ", chipcount);

				// increase the player's count
				for(i = 0; i <= _maxChips; i++) {
					_players[_currentPlayer].addToChipCount(i, chipcount[i]);			
				}

				console.log("SM.solveRangeForPlayer > chip counts increased; now are ", _players[_currentPlayer].chipCount);

				// account for any bonuses
				// 1. if the range is greater than 4 cols, add a $500 bonus
				if(col2 - col1 > 4) {
					appliedbonuses.push({code: "MORETHAN4COLS", value: 500});
					_players[_currentPlayer].addToPoints(500);
				}

				// 2. if the range is greater than 4 rows, add a $500 bonus
				if(row2 - row1 > 4) {
					appliedbonuses.push({code: "MORETHAN4COLS", value: 500});
					_players[_currentPlayer].addToPoints(500);
				}

				// 3. if the range is greater than 3x3, add a $800 bonus
				if(row2 - row1 > 3 && col2 - col1 > 3) {
					appliedbonuses.push({code: "MORETHAN3X3", value: 800});
					_players[_currentPlayer].addToPoints(800);
				}

				// 4. add $300 per wildcard
				if(chipcount[0] > 0) {
					i = chipcount[0] * 300;
					appliedbonuses.push({code: "WILDCARD", value: i});
					_players[_currentPlayer].addToPoints(i);
				}

				return appliedbonuses;


			}


		};

	};


	// this is the return for the anonymous function that is globally stored in SM
	// this is kind of the heart of the singleton implementation
	return {

		// gets the Singleton instance, or creates it if it doesn't exist
		getInstance: function() {
			// console.log("SM.getInstance > getting instance");
			if(!instance) {
				instance = init();
			}
			return instance;
		}
		
	}




})();


var sm = SM.getInstance();