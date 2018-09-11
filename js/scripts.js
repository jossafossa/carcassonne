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
	    this.road = (logic["road"] === undefined) ? [] : logic["road"];
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
	  		}
	  	}

	  	for(var i = 0; i < this.road.length; i++){
	  		for(var j = 0; j < this.road[i][0].length; j++){
	  			var road = this.road[i][0][j];
	  			this.road[i][0][j] = (road + dir > 3) ? 0 : (road + dir < 0) ? 3 : road + dir;
	  		}
	  	}


	  	this.rotation = (this.rotation + dir > 3) ? 0 : (this.rotation + dir < 0) ? 3 : this.rotation + dir;
	  }

	}

	class Deck {

		constructor() {
			this.deck = [];
			this.id = 0;
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

		add(name, logic, artwork, times = 1) {
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
		}

		setupBoard() {
			var cell = "<div class='cell'></div>";
			this.setupCustomCSS();
			this.appendCSS(`.cell { width:${this.cell_size}px; height: ${this.cell_size}px }`);
			this.appendCSS(`#board { width:${this.cell_size * this.width}px; height: ${this.cell_size * this.height}px }`);
			for (var i = 0; i < this.width * this.height; i++) {
				$(cell).appendTo(this.element);
			}
			
		}

		prePlacePiece(index, piece) {

			// is place empty
			if (this.cellIsEmpty(index) && this.pieceFits(index, piece)) {
				console.log(index, piece);
				$(".cell[temp]").removeAttr("temp").removeAttr("piece_name").removeAttr("rotation").removeClass("active");
				$(".cell").eq(index).attr({"piece_name": piece.name, "rotation": piece.rotation, "temp": ""});
				$(".cell").eq(index).addClass("active");
			}
			
		}

		cellIsEmpty(index) {
			return $(".cell").eq(index).attr("piece_name") == undefined ? true : false;
		}

		pieceFits(index, piece) {
			return true;
		}

		placePiece() {
			$(".cell[temp]").removeAttr("temp").removeAttr("temp");
		}

		setupCustomCSS() {
			this.css = "<style id='custom-board-css'></style>";
			$(this.css).appendTo(this.element);

		}

		appendCSS(css) {
			$("#custom-board-css").append(css)
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
			this.deck.add("A", {"road": [[2]], "building": [0]}, "img/pieces/A.svg", 2);
			this.deck.add("B", {"building": [0]}, "img/pieces/B.svg", 4);
			this.deck.add("C", {"city": [[[0, 1, 2, 3], 2]]}, "img/pieces/C.svg", 1);
			this.deck.add("D", {"city": [[[1], 1]], "road":[[0,2]]}, "img/pieces/D.svg", 4);
			this.deck.add("E", {"city": [[[0], 1]]}, "img/pieces/E.svg"), 5;
			this.deck.add("F", {"city": [[[1, 3], 2]]}, "img/pieces/F.svg", 2);
			this.deck.add("G", {"city": [[[0, 2], 1]]}, "img/pieces/G.svg", 1);			
			this.deck.add("H", {"city": [[[1], 1], [[3], 1]]}, "img/pieces/H.svg", 3);
			this.deck.add("I", {"city": [[[1], 1], [[2], 1]]}, "img/pieces/I.svg", 2);
			this.deck.add("J", {"city": [[[0], 1]], "road":[[1, 2]]}, "img/pieces/J.svg", 3);
			this.deck.add("K", {"city": [[[1], 1]], "road":[[0, 3]]}, "img/pieces/K.svg", 3);
			this.deck.add("L", {"city": [[[1], 1]], "road":[[0], [2], [3]]}, "img/pieces/L.svg", 3);
			this.deck.add("M", {"city": [[[0, 3], 2]]}, "img/pieces/M.svg", 2);
			this.deck.add("N", {"city": [[[0, 3], 1]]}, "img/pieces/N.svg", 3);
			this.deck.add("O", {"city": [[[0, 3], 2]], "road": [[1,2]]}, "img/pieces/O.svg", 2);
			this.deck.add("P", {"city": [[[0, 3], 1]], "road": [[1,2]]}, "img/pieces/P.svg", 3);
			this.deck.add("Q", {"city": [[[0, 1, 3], 2]]}, "img/pieces/Q.svg", 1);
			this.deck.add("R", {"city": [[[0, 1, 3], 1]]}, "img/pieces/R.svg", 3);
			this.deck.add("S", {"city": [[[0, 1, 3], 2]], "road":[[2]]}, "img/pieces/S.svg", 2);
			this.deck.add("T", {"city": [[[0, 1, 3], 1]], "road":[[2]]}, "img/pieces/T.svg", 1);
			this.deck.add("U", {"road": [[0, 2]]}, "img/pieces/U.svg", 8);
			this.deck.add("V", {"road": [[2, 3]]}, "img/pieces/V.svg", 9);
			this.deck.add("W", {"road": [[1], [2], [3]]}, "img/pieces/W.svg", 4);
			this.deck.add("X", {"road": [[0], [1], [2], [3]]}, "img/pieces/X.svg", 1);

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
				var index = $(this).index() - 1;

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
		"width": 15, 
		"height": 30, 
		"cell_size": 100
	});


})

