$(document).ready(function() {

	/* 
		class Piece 
	*/
	class Piece {

		/**
		 * Create a piece
		 * @param {int} id - An ID where the piece can be called with
		 * @param {array} logic - An array with the logic
		 * @param {string} artwork - A relative path to the artwork
		 */
	  constructor(id, name, logic, artwork) {
	    this.id = id;
	    this.artwork = artwork;
	    this.roads = (logic["road"] === undefined) ? [] : logic["road"];
	    this.cities = (logic["city"] === undefined) ? [] : logic["city"];
	    this.building = (logic["building"] === undefined) ? [] : logic["building"];
	    this.rotation = 0;
	    this.name = name;

	    console.log(this.cities);
	  }

	  rotate(dir) {
	  	for(var i = 0; i < this.cities.length; i++){
	  		for(var j = 0; j < this.cities[i][0].length; j++){
	  			var city = this.cities[i][0][j];
	  			this.cities[i][0][j] = (city + dir > 3) ? 0 : (city + dir < 0) ? 3 : city + dir;
	  			console.log(this.cities[i][0][j]);
	  		}
	  	}

	  	for(var i = 0; i < this.roads.length; i++){
	  		for(var j = 0; j < this.roads[i].length; j++){
	  			var road = this.roads[i][j];
	  			this.roads[i][j] = (road + dir > 3) ? 0 : (road + dir < 0) ? 3 : road + dir;
	  			console.log(this.roads[i][j]);
	  		}
	  	}


	  	this.rotation = (this.rotation + dir > 3) ? 0 : (this.rotation + dir < 0) ? 3 : this.rotation + dir;
	  	console.log(this.rotation);
	  }

	}

	class Deck {

		constructor() {
			this.deck = [];
			this.id = 1;
			this.setupDeckContainer();	
		}

		setupDeckContainer() {
			this.latestPieceContainer = "<div id='latest-piece'></div>";
			var container = "#deck-container";

			$(this.latestPieceContainer).prependTo(container);			
			this.custom_css = new CustomCSS("piecesCSS");
		}

		updateDeckContainer() {
			var piece = this.deck[this.deck.length-1];
			var artwork = piece["artwork"];
			var name = piece["name"];
			var rotation = piece.rotation;
			console.log(piece);
			$("#latest-piece").attr({"piece_name": name, "rotation" : rotation});
		}

		add(name, logic, artwork, times) {
			for(var i = 0, length1 = times; i < length1; i++){				
				this.deck.push(new Piece(this.id, name, logic, artwork));

				this.id++;
			}

			this.custom_css.append(`[piece_name="${name}"] { background-image:url("${artwork}") }`);

		}

		rotate(dir) {
			this.deck[this.deck.length-1].rotate(dir);
			this.updateDeckContainer();
		}

		shuffle() {
			for (var i = this.deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this.deck[i];
        this.deck[i] = this.deck[j];
        this.deck[j] = temp;
   		}
		}

		getAll() {
			return this.deck;
		}

		getTop() {
			return this.deck[this.deck.length-1];
		}

		popTop() {
			this.deck.pop();
		}

		nextMove() {
			this.popTop();
			this.updateDeckContainer();
		}


	}


	class CustomCSS {

		constructor(name) {
			this.css = "<style id='" + name + "'></style>";
			this.name = name;
			$(this.css).appendTo("body");
		}

		append(css) {
			$("#" + this.name).append(css);
		}	

	}

	/* 
		class Board 
	*/
	class Board {

		/**
		 * Create a board
		 * @param {string} element - a search query for the board element
		 * @param {int} window_width - The width of the board window
		 * @param {int} window_height - The height of the board window
		 * @param {int} cell_size - The size of a singular cell
		 */
		constructor(element, width, height, cell_size) {
			this.element = element;
			this.width = width;
			this.height = height;
			this.cell_size = cell_size;

			this.place_location;
			this.place_piece;
			this.cells;

		}
		/**
		 * Sets up cells and board array
		 */
		setupBoard() {
			this.custom_css = new CustomCSS("boardCSS");
			this.custom_css.append(`.cell { width:${this.cell_size}px; height: ${this.cell_size}px }`);
			this.custom_css.append(`#board { width:${this.cell_size * this.width}px; height: ${this.cell_size * this.height}px }`);
			this.board = [];

			for (var i = 0; i < this.width * this.height; i++) {
				var cell = "<div class='cell'><p>" + i + "</p></div>";
				$(cell).appendTo(this.element);
				this.board.push(0);
			}

			this.cells = $(".cell");



			console.log(this.board);
			
		}

		centerViewport(index) {
			var el = $(this.element).parent();
			var el_width = el.innerWidth();
			var el_height = el.innerHeight();
			var cell = this.cells.eq(index);
			el.scrollTop((cell.offset().top - (el_height / 2) + this.cell_size));
			el.scrollLeft((cell.offset().left - (el_width / 2) + this.cell_size));
			console.log(el_height);
		}


		/**
		 * determines the start tile
		 * @param  {string} name    The name the piece type can be refered to
		 * @param  {array} logic   	An array with all the logic from the piece
		 * @param  {string} artwork A relative path to the image
		 */
		startTile(name, logic, artwork) {
			var index = Math.floor((this.width * this.height) / 2);
				this.instantPlacePiece(index, new Piece(0, name, logic, artwork));
				this.custom_css.append(`[piece_name="${name}"] { background-image:url("${artwork}") }`);
				this.centerViewport(index);
		}

		/**
		 * Places piece at index 
		 * @param {index} index - the index of the cell
		 * @param {Piece} piece - The piece object to be placed at the index
		 */		
		prePlacePiece(index, piece) {
			

			// is place empty
			if (this.cellIsEmpty(index) && this.pieceFits(index, piece) && this.isConnected(index, piece)) {
				this.place_location = index;
				this.place_piece = piece;
				console.log(index, piece);
				$(".cell[temp]").removeAttr("temp").removeAttr("piece_name").removeAttr("rotation").removeClass("active");
				$(".cell").eq(index).attr({"piece_name": piece.name, "rotation": piece.rotation, "temp": ""});
				$(".cell").eq(index).addClass("active");
			}
			
		}

		/**
		 * Places piece at index 
		 * @param {index} index - the index of the cell
		 * @param {Piece} piece - The piece object to be placed at the index
		 */		
		 instantPlacePiece(index, piece) {
			

				this.place_location = index;
				this.place_piece = piece;
				console.log(index, piece);
				$(".cell[temp]").removeAttr("temp").removeAttr("piece_name").removeAttr("rotation").removeClass("active");
				$(".cell").eq(index).attr({"piece_name": piece.name, "rotation": piece.rotation, "temp": ""});
				$(".cell").eq(index).addClass("active");
				this.placePiece();
		}

		/**
		 * returns state of cell
		 * @param  {int} index 	The index of the cell
		 * @return {boolean}		     
		 */	
		cellIsEmpty(index) {
			index = index;
			if ($(".cell").eq(index).attr("temp") == undefined) {
				return $(".cell").eq(index).attr("piece_name") == undefined ? true : false;
			} 
			return true;
		}

		/**
		 * returns if piece fits at a given cell
		 * @param  {int} index 		The index of the cell
		 * @param  {Piece} piece 	a Piece object
		 * @return {boolean}					     
		 */	
		pieceFits(index, piece) {
			var found = false;
			console.log(this.board);
			var directions = [[0,-1], [1,0], [0,1], [-1,0]];
			for (var i = 0; i < directions.length; i++) {
				var s_index = this.calcIndex(index, directions[i]);
				var s_piece = this.board[s_index];
				if (s_piece !== 0) {
						found = true;
						// console.log(this.roadsFit(index, piece, s_index, s_piece), this.citiesFit(index, piece, s_index, s_piece));
					if (this.roadsFit(index, piece, s_index, s_piece) == false || this.citiesFit(index, piece, s_index, s_piece) == false) {
						return false;

					}
				}
			}
			if (found) {
				return true;
			} else {
				return false;
			}
		}

		roadsFit(index, piece, s_index, s_piece) {
			var dir = this.getPieceDir(index, s_index);
			var s_dir = this.opDir(dir);
			console.log("new piece = " + index + ", piece on board = " + s_index);
			if (this.hasRoadAtDir(piece, dir) !== this.hasRoadAtDir(s_piece, s_dir)) {
				console.log("roads colliding");
				return false;
			}
			return true;
		}

		citiesFit(index, piece, s_index, s_piece) {
			var dir = this.getPieceDir(index, s_index);
			var s_dir = this.opDir(dir);
			console.log("newpiece = " + index + ", piece on board = " + s_index);
			if (this.hasCityAtDir(piece, dir) !== this.hasCityAtDir(s_piece, s_dir)) {
				console.log("cities colliding");
				return false;
			}
			return true;
		}

		hasCityAtDir(piece, dir) {
			for (var i = 0; i < piece.cities.length; i++) {
					console.log(piece.cities[i][0], "city at " + dir + "?");
				if (piece.cities[i][0].includes(dir)) {
					console.log("yes");
					return true;
				}
			}
			return false;
			
		}

		hasRoadAtDir(piece, dir) {
			for (var i = 0; i < piece.roads.length; i++) {
				console.log(piece.roads[i], "road at " + dir + "?");
				if (piece.roads[i].includes(dir)) {
					console.log("yes");
					return true;
				}
			}
			return false;
			
		}

		getPieceDir(index, s_index) {
			var dir;
			var t_dir = index - s_index;
			if (t_dir == -1) { dir = 1 } else 
			if (t_dir ==  1) { dir = 3 } else 
			if (t_dir <  -1) { dir = 2 } else 
			if (t_dir >   1) { dir = 0 }
			return dir;
		}

		/**
		 * Gets the opposite direction
		 * @param  {int} 		top: 0, right: 1, bottom: 2, left: 3
		 * @return {int}    opposite dir
		 */
		opDir(dir) {
			return Math.abs((dir + 2) % 4)
		}

		/**
		 * [calcIndex description]
		 * @param  {[type]} index      [description]
		 * @param  {[type]} directions [description]
		 * @return {[type]}            [description]
		 */
		calcIndex(index, direction) {
			return index + direction[0] + (direction[1] * this.width);
		}

		/**
		 * returns if a piece is connected at a given cell
		 * @param  {int}  	 index The index of the cell
		 * @param  {Piece}   piece a Piece object
		 * @return {Boolean}       
		 */
		isConnected(index, piece) {
			return true;
		}

		/**
		 * Finalizes placing sequence and adds the piece to the board manager
		 */
		placePiece() {
			$(".cell[temp]").removeAttr("temp");
			var newPiece = JSON.parse(JSON.stringify(this.place_piece));
			this.board[this.place_location] = newPiece;
			console.log(this.board, this.place_location, this.place_piece);
		}

	}


	class Game {
		
		constructor(custom_settings) {

			// manage settings
			var default_settings = {
				"board" 		:	"#board",
				"width" 		: 30,
				"height"		: 20,
				"cell_size" : 100
			}
			var settings = {};
			$.extend(settings, default_settings, custom_settings);

			// setup Deck
			this.deck = new Deck();



			console.log(settings);
			this.board = new Board(settings["board"], settings["width"], settings["height"], settings["cell_size"]);
			this.board.setupBoard();

			this.setupDefaultDeck();
			this.setupEvents();
			this.deck.updateDeckContainer();
		}

		setupDefaultDeck() {
			this.deck.add("A", {"road": [[2]], "building": [0]}, "img/pieces/A.SVG", 2);
			this.deck.add("B", {"building": [0]}, "img/pieces/B.SVG", 4);
			this.deck.add("C", {"city": [[[0, 1, 2, 3], 2]]}, "img/pieces/C.SVG", 1);
			this.deck.add("D", {"city": [[[1], 1]], "road":[[0,2]]}, "img/pieces/D.SVG", 4);
			this.deck.add("E", {"city": [[[0], 1]]}, "img/pieces/E.SVG"), 5;
			this.deck.add("F", {"city": [[[1, 3], 2]]}, "img/pieces/F.SVG", 2);
			this.deck.add("G", {"city": [[[0, 2], 1]]}, "img/pieces/G.SVG", 1);			
			this.deck.add("H", {"city": [[[1], 1], [[3], 1]]}, "img/pieces/H.SVG", 3);
			this.deck.add("I", {"city": [[[1], 1], [[2], 1]]}, "img/pieces/I.SVG", 2);
			this.deck.add("J", {"city": [[[0], 1]], "road":[[1, 2]]}, "img/pieces/J.SVG", 3);
			this.deck.add("K", {"city": [[[1], 1]], "road":[[0, 3]]}, "img/pieces/K.SVG", 3);
			this.deck.add("L", {"city": [[[1], 1]], "road":[[0], [2], [3]]}, "img/pieces/L.SVG", 3);
			this.deck.add("M", {"city": [[[0, 3], 2]]}, "img/pieces/M.SVG", 2);
			this.deck.add("N", {"city": [[[0, 3], 1]]}, "img/pieces/N.SVG", 3);
			this.deck.add("O", {"city": [[[0, 3], 2]], "road": [[1,2]]}, "img/pieces/O.SVG", 2);
			this.deck.add("P", {"city": [[[0, 3], 1]], "road": [[1,2]]}, "img/pieces/P.SVG", 3);
			this.deck.add("Q", {"city": [[[0, 1, 3], 2]]}, "img/pieces/Q.SVG", 1);
			this.deck.add("R", {"city": [[[0, 1, 3], 1]]}, "img/pieces/R.SVG", 3);
			this.deck.add("S", {"city": [[[0, 1, 3], 2]], "road":[[2]]}, "img/pieces/S.SVG", 2);
			this.deck.add("T", {"city": [[[0, 1, 3], 1]], "road":[[2]]}, "img/pieces/T.SVG", 1);
			this.deck.add("U", {"road": [[0, 2]]}, "img/pieces/U.SVG", 8);
			this.deck.add("V", {"road": [[2, 3]]}, "img/pieces/V.SVG", 9);
			this.deck.add("W", {"road": [[1], [2], [3]]}, "img/pieces/W.SVG", 4);
			this.deck.add("X", {"road": [[0], [1], [2], [3]]}, "img/pieces/X.SVG", 1);

			this.board.startTile("Y", {"city": [[[1], 1]], "road":[[0,2]]}, "img/pieces/D.SVG");

			console.log(this.deck.getAll());
			this.deck.shuffle();
			console.log(this.deck.getAll());
		}


		setupEvents() {
			this.clickCellEvent();
			this.rotateEvents();
			this.nextEvent();
		}

		clickCellEvent() {
			var _self = this;
			$(".cell").on("click", function() {
				var index = $(this).index();

				_self.deck.updateDeckContainer();
				_self.board.prePlacePiece(index, _self.deck.getTop());		
			})
		}

		rotateEvents() {
			var _self = this;
			$(".rotate-left").on("click", function() {
				_self.deck.rotate(-1);
			})

			$(".rotate-right").on("click", function() {
				_self.deck.rotate(1);
			})
		}

		nextEvent() {
			var _self = this;
			$(".next-move").on("click", function() {
				_self.deck.nextMove();
				_self.board.placePiece();
			})
		}

	}


	game = new Game({
		"board": "#board", 
		"width": 30, 
		"height": 15, 
		"cell_size": 100
	});

	var pieces = [];
	var piece  = new Piece(1, "henk", [], "henk.png"); 
	pieces.push(piece);
	piece.name = "piet";
	console.log(pieces[0].name, piece.name);


	pieces[0].name = "hans";
	console.log(pieces[0].name, piece.name);

})

