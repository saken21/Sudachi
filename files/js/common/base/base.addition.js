/* =======================================================================
base.addition
========================================================================== */
baseJS.fn.addition = function(data) {
	
	baseJS.ajax = new Ajax($(window),$.ajax);
	
	/* =======================================================================
	Ajax
	========================================================================== */
	function Ajax(_$win,_$ajax) {
		
		var _getFilledNumber,_isConnecting;
		
		var PATH       = _.absolutePath;
		var BREAK_DATE = 15;
		
		/* =======================================================================
		Constructor
		========================================================================== */
		(function() {
			
			_getFilledNumber = _.getFilledNumber;
			_isConnecting    = false;
			
			baseJS.getTerm = getTerm;
			
			return false;
			
		})();

		/* =======================================================================
		Send
		========================================================================== */
		function send(type,kind,data,onSuccess,onError) {

			_$ajax({

				type          : type,
				url           : PATH + "files/php/" + kind + ".php",
				data          : data,
				cache         : false,
				scriptCharset : "utf-8",
				success       : success,
				error         : onError || empty

			});

			function success(data) {
				
				if (onSuccess) onSuccess(JSON.parse(data));
				return false;

			}

			function empty() { return false; }

			return false;

		}

		/* =======================================================================
		Get Data
		========================================================================== */
		function getData(data,onSuccess,onError) {

			send("GET","getData",data,onSuccess,onError);
			return false;

		}
		
		/* =======================================================================
		Add Order
		========================================================================== */
		function addOrder(quantity,itemID,userID,term,onSuccess,onError) {
			
			getDatetime(function(datetime) {
				
				insertData({

					table  : "orders",
					column : "quantity,item_id,user_id,datetime,term",
					value  : quantity + "," + itemID + "," + userID + "," + datetime + "," + term

				}, onSuccess, onError);
				
				return false;
				
			});
			
			return false;

		}
		
		/* =======================================================================
		Check Order
		========================================================================== */
		function checkOrder(quantity,itemID,onComplete) {
			
			getData({
				
				table  : "items",
				column : "stock_quantity",
				option : 'id="' + itemID + '"'
				
			},function(data) {

				var stockQuantity = (+data[0].stock_quantity) - quantity;
				onComplete(stockQuantity > -1);

				return false;

			});
			
			return false;
			
		}
		
		/* =======================================================================
		Ship Order
		========================================================================== */
		function shipOrder(id,quantity,itemID,userID,term,shippedDatetime,boxnum,onSuccess,onError) {
			
			var t = {
				
				table  : "items",
				column : "stock_quantity",
				option : 'id="' + itemID + '"'
				
			};
			
			var o = {
				
				table  : "orders",
				column : "quantity",
				option : 'id="' + id + '"'
				
			};
			
			var counter = 0;
			
			getData(t,function(data) {

				var stockQuantity = (+data[0].stock_quantity) - quantity;

				t.value = stockQuantity;
				updateData(t,addCounter);

				o.column = "flag";
				o.value  = "1";
				updateData(o,addCounter);

				o.column = "shippedDatetime";
				o.value  = shippedDatetime;
				updateData(o,addCounter);

				o.column = "boxnum";
				o.value  = boxnum;
				updateData(o,addCounter);

				updateStock(quantity,itemID,userID,term,true,addCounter,onError);

				return false;

			});
			
			function addCounter() {
				
				counter++;
				if (counter > 4) onSuccess();
				
				return false;
				
			}
			
			return false;

		}
		
		/* =======================================================================
		Overwrite Stock
		========================================================================== */
		function overwriteStock(quantity,itemID,userID,term,onSuccess,onError) {
			
			updateStock(quantity,itemID,userID,term,false,onSuccess,onError);
			return false;

		}
		
		/* =======================================================================
		Update Stock
		========================================================================== */
		function updateStock(quantity,itemID,userID,term,isAdd,onSuccess,onError) {
			
			var s = {
				
				table  : "stocks",
				column : "quantity",
				option : "item_id='" + itemID + "'",
				and    : "user_id='" + userID + "'",
				more   : "term='" + term + "'"
				
			};
			
			getData(s,function(data) {
				
				getDatetime(function(datetime) {
					
					sendData(data,datetime);
					return false;
					
				});
				
				return false;

			});
			
			function sendData(data,datetime) {
				
				var term = getTerm(datetime);
				
				if (data.length) {
					
					s.value  = quantity + (isAdd ? (+data[0].quantity) : 0);
					
					updateData(s,function() {
						
						updateDatetime(datetime,function() {
							
							updateTerm(term,onSuccess);
							return false;
							
						});
						
						return false;
						
					},onError);

				} else {

					s.column = "quantity,item_id,user_id,datetime,term";
					s.value  = quantity + "," + itemID + "," + userID + "," + datetime + "," + term;
					s.option = null;

					insertData(s,onSuccess,onError);

				}

				return false;
				
			}
			
			function updateDatetime(val,onSuccess) {
				
				updateColumn("datetime",val,onSuccess);
				return false;
				
			}
			
			function updateTerm(val,onSuccess) {
				
				updateColumn("term",val,onSuccess);
				return false;
				
			}
			
			function updateColumn(key,val,onSuccess) {
				
				s.column = key;
				s.value  = val;
				
				updateData(s,onSuccess,onError);
				
				return false;
				
			}
			
			return false;

		}
		
		/* =======================================================================
		Get Datetime
		========================================================================== */
		function getDatetime(onSuccess,onError) {

			send("GET","getDatetime",{},onSuccess,onError);
			return false;

		}
		
		/* =======================================================================
		Get Term
		========================================================================== */
		function getTerm(datetime) {
			
			var date = new Date(datetime);
			var y    = date.getFullYear();
			var m    = date.getMonth() + 1;
			var d    = date.getDate();
			
			if (d > BREAK_DATE) m += 1;
			
			return +(y + _getFilledNumber(m,2));

		}

		/* =======================================================================
		Insert Data
		========================================================================== */
		function insertData(data,onSuccess,onError) {
			
			send("POST","insertData",data,onSuccess,onError);
			return false;

		}

		/* =======================================================================
		Update Data
		========================================================================== */
		function updateData(data,onSuccess,onError) {

			send("POST","updateData",data,onSuccess,onError);
			return false;

		}
		
		/* =======================================================================
		Set Beforeunload
		========================================================================== */
		function setBeforeunload() {
			
			_$win.on("beforeunload",function() { return "データベース登録中です。"; });
			_isConnecting = true;
			
			return false;
			
		}
		
		/* =======================================================================
		Unset Beforeunload
		========================================================================== */
		function unsetBeforeunload() {
			
			_$win.off("beforeunload");
			_isConnecting = false;
			
			return false;
			
		}
		
		/* =======================================================================
		Get Is Connecting
		========================================================================== */
		function getIsConnecting() {
			
			return _isConnecting;
			
		}
		
		/* =======================================================================
		Export CSV
		========================================================================== */
		function exportCSV(data,onSuccess,onError) {

			send("POST","exportCSV",data,function() {
				
				if (onSuccess) onSuccess();
				
				var filename = "data.csv";
				var anchor   = document.createElement("a");
				
				anchor.download = filename;
				anchor.href     = PATH + "files/php/" + filename;
				anchor.target   = "_blank";
				
				document.body.appendChild(anchor);
				anchor.click();
				
				document.body.removeChild(anchor);
				
				return false;
				
			},onError);
			
			return false;

		}

		return {
			
			getData           : getData,
			addOrder          : addOrder,
			checkOrder        : checkOrder,
			shipOrder         : shipOrder,
			overwriteStock    : overwriteStock,
			getDatetime       : getDatetime,
			setBeforeunload   : setBeforeunload,
			unsetBeforeunload : unsetBeforeunload,
			getIsConnecting   : getIsConnecting,
			exportCSV         : exportCSV
			
		};

	}
	
	return false;
	
}