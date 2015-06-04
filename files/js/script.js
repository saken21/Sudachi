(function(window,$,_) {
	
	var VERSION = _.VERSION;
	var COOKIE_NAME = "LITALICO_SYSTEM" + VERSION;
	
	var _ajax,_main,_login;
	
	$(document).on("ready",function() {
		
		_ajax  = _.ajax;
		_main  = new Main($(this),$("#main"));
		_login = new Login($("#login"),$.cookie);
		
		return false;
		
	});
	
	/* =======================================================================
	Main
	========================================================================== */
	function Main(_$doc,_$parent) {
		
		var _$table,_$tableHeader,_$tableMain,_$mainContent;
		var _$stockInputs,_$orderInputs,_$itemTitles,_$users,_$enterpriseNavis,_$areaNavis,_$tablecells;
		var _isAdmin,_myID,_myEnterprise,_term,_lastTerm,_tableHeaderW,_scrollbar,_currentEnterprise,_currentArea;
		
		var MAX_ORDER_QUANTITY = 50;
		
		/* =======================================================================
		Constructor
		========================================================================== */
		(function() {
			
			_$table       = _$parent.find("#table");
			_$tableHeader = _$table.find("#table-header");
			_$tableMain   = _$table.find("#table-main");
			_$mainContent = _$tableMain.find(".content");
			
			var getTerm  = _.getTerm;
			var date     = new Date();
			
			_term     = getTerm(date);
			_lastTerm = getTerm(date.setMonth(date.getMonth() - 1));
			
			_currentEnterprise = _currentArea = '';
			
			return false;
			
		})();
		
		/* =======================================================================
		Show
		========================================================================== */
		function show(myParmanentID,myPass) {
			
			_isAdmin = (myParmanentID == "admin");
			
			setHTML(myParmanentID,myPass,function() {
				
				_$parent.fadeIn(300);
				init();
				
				return false;
				
			});
			
			return false;
			
		}
		
		/* =======================================================================
		Set HTML
		========================================================================== */
		function setHTML(myParmanentID,myPass,onReady) {
			
			var isAdmin = _isAdmin;
			var $userName = _$parent.find("#userName").find(".content");
			
			if (isAdmin) _$parent.addClass("admin-mode");
			
			getDataList(myParmanentID,myPass,onLoaded);

			function onLoaded(dataList) {
				
				var items      = dataList.items;
				var users      = dataList.users;
				var stocks     = dataList.stocks;
				var lastStocks = dataList.lastStocks;
				var orders     = dataList.orders;
				
				setItems(_$tableHeader,items,sortArray(stocks,"item_id","user_id"));
				setUsers(_$mainContent,users,items,sortArray(stocks),sortArray(lastStocks),sortArray(orders));
				
				onReady();
				
				return false;

			}
			
			function sortArray(oldArray,parent,child) {
				
				parent = parent || "user_id";
				child  = child  || "item_id";
				
				var length   = oldArray.length;
				var newArray = {};
				
				for (var i = 0; i < length; i++) {
					
					var obj   = oldArray[i];
					var array = newArray[obj[parent]];
					
					if (!array) array = {};
					array[obj[child]] = obj;
					
					newArray[obj[parent]] = array;
					
				}
				
				return newArray;
				
			}
			
			function setItems($parent,array,stocks) {
				
				var $list = $parent.find("dl");
				
				var values = [];
				var length = array.length;
				
				$list.each(function(index) {
					
					var $target = $(this);
					
					var cls     = $target.prop("class");
					var html    = '';
					var isTitle = (cls === "title");
					var isTotal = (cls === "total_stock_quantity");
					
					values[index] = [];
					
					for (var i = 0; i < length; i++) {
						
						var obj        = array[i];
						var id         = obj.id;
						var type       = +obj.type;
						var enterprise = obj.enterprise;
						var val        = array[i][cls] || getTotal(stocks[id]);
						
						if (isTotal) val = +values[index - 2][i] + values[index - 1][i];
						else values[index][i] = val;
						
						if (isTitle && type) val = enterprise.replace("_master","") + val;
						
						html += '<dd class="item-' + id + ' ' + enterprise + '">' + val + '</dd>';
					
					}
					
					$target.append(html);
					
				});
				
				function getTotal(array) {
					
					var quantity = 0;
					if (!array) return quantity;
					
					for (var p in array) quantity += +array[p].quantity;
					
					return quantity;
					
				}
				
				return false;
				
			}
			
			function setUsers($parent,array,items,stocks,lastStocks,orders) {
				
				var length     = array.length;
				var itemLength = items.length;
				var htmls      = {};
				
				for (var i = 0; i < length; i++) {
					
					var obj           = array[i];
					var parmanentID   = obj.parmanent_id;
					var id            = obj.id;
					var name          = obj.name;
					var area          = obj.area;
					var code          = obj.code;
					var enterprise    = obj.enterprise;
					var cls           = "user-" + id;
					var stockList     = stocks[id] || {};
					var lastStockList = lastStocks[id] || {};
					var orderList     = orders[id] || {};
					var html          = '';
					
					if (isAdmin) {
						
						_myEnterprise = "admin";
						
					} else {
						
						_myID = id;
						_myEnterprise = enterprise;
						
					}
					
					html += '<dl class="all ' + enterprise + ' ' + area + ' ' + cls + '" id="' + parmanentID + '">';
					html += '<dt>' + (isAdmin ? name + '<span>（' + code + '）</span>' : "在庫数") + '</dt>';
					
					for (var j = 0; j < itemLength; j++) {
						
						var item              = items[j]
						var itemID            = item.id;
						var itemType          = +item.type;
						var itemEnterprise    = item.enterprise;
						var itemCls           = "item-" + itemID;
						var itemStockQuantity = +item.stock_quantity;
						
						var isEmpty           = (stockList[itemID] === undefined);
						var lastStockQuantity = lastStockList[itemID] ? lastStockList[itemID].quantity : 0;
						var stockQuantity     = isEmpty ? 0 : stockList[itemID].quantity;
						
						if (!isAdmin && isEmpty && lastStockQuantity) {
							
							stockQuantity = lastStockQuantity;
							
							_ajax.setBeforeunload();
							_ajax.overwriteStock(stockQuantity,itemID,_myID,_term,_ajax.unsetBeforeunload);
							
						}
						
						var orderInfo        = orderList[itemID] || { quantity:0, flag:-1 };
						var orderQuantity    = orderInfo.quantity;
						var maxOrderQuantity = itemType ? 9999 : MAX_ORDER_QUANTITY;
						var orderFlag        = +orderInfo.flag;
						var orderLabel       = "注文可能";
						var localClass       = cls + " type-" + itemType + ' ' + itemEnterprise;
						var stockProp        = '';
						var orderProp        = '';
						
						if (maxOrderQuantity > itemStockQuantity) maxOrderQuantity = itemStockQuantity;
						if (itemType) stockProp = ' readonly="readonly"';
						
						if (orderFlag > -1) {
							
							orderProp = ' readonly="readonly"';
							
							if (orderFlag === 0) {

								localClass += ' ordered';
								orderLabel = "注文済み";

							} else if (orderFlag > 0) {

								localClass += ' shipped';
								orderLabel = "発送済み";

							}
							
						}
						
						html += '<dd class="' + localClass + '">';
						
						if (isAdmin) {
							
							html += '<span class="stock">' + stockQuantity + '</span>';
							html += '<span class="lastStock">' + lastStockQuantity + '</span>';
							
						} else {
							
							html += '<p class="stock"><label>在庫</label>';
							html += '<input type="number" min="0" max="99999" value="' + stockQuantity + '"' + stockProp + ' class="stock-input ' + itemCls + ' ' + cls + '" />';
							html += '<span class="lastStock">' + lastStockQuantity + '<span></p>';
							html += '<p class="order"><label>' + orderLabel + '</label>';
							html += '<input type="number" min="0" max="' + maxOrderQuantity + '" value="' + orderQuantity + '"' + orderProp + ' class="order-input ' + itemCls + ' ' + cls + '" /></p>';
							
						}
						
						html += '</dd>'
					
					}
					
					html += '</dl>';
					
					if (!htmls[area]) htmls[area] = [];
					htmls[area].push(html);
					
				}
				
				$parent.html(combineHTML(htmls));
				$userName.text(isAdmin ? "マスター" : _myEnterprise + " " + name);
				
				function combineHTML(htmls) {
					
					var html = '';
					
					for (var area in htmls) {

						var array  = htmls[area];
						var length = array.length;

						for (var i = 0; i < length; i++) html += array[i];

					}
					
					return html;
					
				}
				
				return false;
				
			}
			
			function setOrders($inputs,array) {
				
				var length = array.length;
				
				for (var i = 0; i < length; i++) {
					
					var obj    = array[i];
					var itemID = ".item-" + obj.item_id;
					var userID = ".user-" + obj.user_id;
					var val    = obj.quantity;
					
					$inputs.filter(itemID + userID).prop({ value:val, max:val });
					
				}
				
				return false;
				
			}
			
			return false;
			
		}
		
		/* =======================================================================
		Get Data List
		========================================================================== */
		function getDataList(myParmanentID,myPass,onLoaded) {
			
			var dataList = { items:[], users:[], stocks:[], lastStocks:[], orders:[] };
			var counter  = 0;
			
			load("items","items","id,title,total_quantity,stock_quantity,type,enterprise");
			load("users","users","id,parmanent_id,name,area,code,enterprise",_isAdmin ? 'NOT parmanent_id="admin"' : 'parmanent_id="' + myParmanentID + '"',_isAdmin ? undefined : 'pass="' + myPass + '"');
			load("stocks","stocks","quantity,item_id,user_id,term",'term="' + _term + '"');
			load("lastStocks","stocks","quantity,item_id,user_id,term",'term="' + _lastTerm + '"');
			load("orders","orders","quantity,item_id,user_id,datetime,flag",'term="' + _term + '"');
			
			function load(key,table,column,option,and) {
				
				_ajax.getData({ table:table, column:column, option:option, and:and },function(data) {
					
					dataList[key] = data;
					onSuccess();
					
					return false;
					
				});
				
				return false;
				
			}
			
			function onSuccess() {
				
				counter++;
				if (counter > 4) onLoaded(dataList);
				
				return false;
				
			}
			
			return false;
			
		}
		
		/* =======================================================================
		Init
		========================================================================== */
		function init() {
			
			_tableHeaderW = _$tableHeader.outerWidth();
			
			_$stockInputs     = _$mainContent.find("dl").find(".stock-input");
			_$orderInputs     = _$mainContent.find("dl").find(".order-input");
			_$itemTitles      = _$tableHeader.find(".title").find("dd");
			_$users           = _$mainContent.find("dl");
			_$enterpriseNavis = _$parent.find("#enterpriseNavi").find("li");
			_$areaNavis       = _$parent.find("#areaNavi").find("li");
			_$tablecells      = _$tableHeader.add(_$tableMain).find("dd");
			
			_$mainContent.find("input").not('[readonly="readonly"]').on({
				
				focus : function() {
					
					var $target = $(this);

					if ($target.prop("value") == "0") $target.prop("value","")
					$target.parents("dd").addClass("focus");
					
				},
				
				blur : function() {
					
					var $target = $(this);
					
					var val = +$target.prop("value") || 0;
					var max = +$target.prop("max") || 0;
					
					if (val > max) val = max;
					else if (val < 0) val = 0;
					
					$target.prop("value",val).parents("dd").removeClass("focus");
					
					var isStock = $target.hasClass("stock-input");
					var isOrder = $target.hasClass("order-input")
					
					if ((isStock && val === max) || (isOrder && val === 0)) {
						$target.removeClass("changed");
					}
					
				},
				
				change : function() {
					
					$(this).addClass("changed");
					
				}
				
			});
			
			_scrollbar = new Scrollbar(_$doc,_$tableMain.find("#scrollbar"),_$mainContent);
			
			_$parent.find("#logout").on("click",_login.logout);
			_$parent.find("#submit").on("click",submit);
			_$parent.find("#csv").on("click",exportCSV);
			
			$(window).on({ resize:onResize, keydown:onKeydown }).trigger("resize");
			
			var enterprise = _isAdmin ? "WINGLE" : _myEnterprise.replace(" Hybrid","").split(" ").join(".");
			
			_$enterpriseNavis.on("click",sortEnterprise).filter("." + enterprise).trigger("click");
			_$areaNavis.on("click",sortArea).filter('.all').trigger("click");
			
			_$mainContent.on("mousewheel",function(event,delta) {
				
				if (_scrollbar.getIsActive()) {
					
					_scrollbar.moveDialRelatively(-delta * 3);
					 return false;
					
				}
				
			});
			
			return false;
			
		}
		
		/* =======================================================================
		On Resize
		========================================================================== */
		function onResize() {
			
			_$tableMain.width(_$table.width() - _tableHeaderW - 1);
			_scrollbar.onResize();
			
			return false;
			
		}
		
		/* =======================================================================
		On Keydown
		========================================================================== */
		function onKeydown(event) {
			
			if (event.ctrlKey) {
				
				if (event.keyCode === 76) {
					
					_login.logout();
					return false;
					
				}
				
			}
			
		}
		
		/* =======================================================================
		Sort Enterprise
		========================================================================== */
		function sortEnterprise() {
			
			_$enterpriseNavis.removeClass("active");
			
			var $target = $(this);
			
			var prop     = "." + $target.prop("class");
			var splits   = prop.split(" ");
			var cls      = splits[0];
			var mergeCls = splits.join(".");
			
			_currentEnterprise = mergeCls;
			
			resizeMainContent(mergeCls + _currentArea);
			
			if (/LITALICO/.test(cls)) _$tablecells.show();
			else _$tablecells.hide().filter(cls + "," + ".LITALICO").show();
			
			$target.addClass("active");
			
			return false;
			
		}
		
		/* =======================================================================
		Sort Area
		========================================================================== */
		function sortArea() {
			
			_$areaNavis.removeClass("active");
			
			var $target = $(this);
			var cls = "." + $target.prop("class");
			
			_currentArea = cls;
			
			resizeMainContent(cls + _currentEnterprise);
			$target.addClass("active");
			
			return false;
			
		}
		
		/* =======================================================================
		Resize Main Content
		========================================================================== */
		function resizeMainContent(cls) {
			
			var w = 0;
			
			_$users.hide().filter(cls).show().each(function() {
				w += $(this).outerWidth();
			});
			
			_$mainContent.width(w);
			
			_scrollbar.moveDialAbsolutely(0);
			onResize();
			
			return false;
			
		}
		
		/* =======================================================================
		Submit
		========================================================================== */
		function submit() {
			
			if (_ajax.getIsConnecting()) {
				
				alert("データベース登録中です。");
				return false;
				
			}
			
			var stocks  = [];
			var orders  = [];
			var $orderd = $();
			
			var string = getString(_$stockInputs,stocks,"以下アイテムの在庫数を更新します。") + getString(_$orderInputs,orders,"以下のアイテムを注文します。",true);
			if (!string.length) return false;
			
			var stockLength = stocks.length;
			var orderLength = orders.length;
			var counter     = stockLength + orderLength;
			
			start(string);
			
			function getString($inputs,array,message,isAdd) {
				
				var string = "";
				
				$inputs.filter(".changed").each(function() {

					var $target = $(this);

					var max      = +$target.prop("max");
					var quantity = +$target.prop("value");

					if (quantity > 0 && quantity <= max) {

						var matches   = $target.prop("class").match(/\s*item-(\d+)/);
						var itemID    = matches[1];
						var itemTitle = _$itemTitles.filter(".item-" + itemID).text();

						string += "・" + itemTitle + " : " + quantity + "冊\n";
						array.push({ quantity:quantity, itemID:itemID });
						
						if (isAdd) $orderd = $orderd.add($target);

					}

				});
				
				if (string.length) string = message + "\n" + string + "\n";
				
				return string;
				
			}
			
			function start(string) {
				
				if (confirm(string)) {
					
					_$stockInputs.add(_$orderInputs).removeClass("changed");
					_ajax.setBeforeunload();
					
					for (var i = 0; i < stockLength; i++) {

						var obj = stocks[i];
						update("overwriteStock",obj.quantity,obj.itemID);

					}
					
					for (i = 0; i < orderLength; i++) {

						var obj      = orders[i];
						var quantity = obj.quantity;
						var itemID   = obj.itemID;
						
						update("addOrder",quantity,itemID);

					}

				}
				
				return false;
				
			}
			
			function update(func,quantity,itemID) {
				
				_ajax[func](quantity,itemID,_myID,_term,function() {
					
					counter--;
					if (counter < 1) finish();
					
					return false;

				});
				
				return false;
				
			}
			
			function finish() {
				
				_ajax.unsetBeforeunload();
				$orderd.prop("readonly","readonly").prev("label").text("注文済み").parents("dd").addClass("ordered");
				
				alert("更新/注文処理が完了しました。");
				
				return false;
				
			}
			
			return false;
			
		}
		
		/* =======================================================================
		Export CSV
		========================================================================== */
		function exportCSV() {
			
			var data   = [];
			var titles = [];
			
			_$table.find("dl:visible").each(function() {
				
				var $target = $(this);
				titles.push($target.find("dt").text());
				
				$target.find("dd").each(function(index) {
					
					var $target    = $(this);
					var $stock     = $target.find(".stock");
					var $lastStock = $target.find(".lastStock");
					
					var stock     = $stock.text();
					var lastStock = $lastStock.text();
					
					if (!data[index + 1]) data[index + 1] = [];
					data[index + 1].push($stock.length ? stock : $target.text());
					
				});
				
			});
			
			data[0] = titles;
			_ajax.exportCSV({ data:data });
			
			return false;
			
		}
		
		return { show:show };
		
	}
	
	/* =======================================================================
	Login
	========================================================================== */
	function Login(_$parent,_$cookie) {
		
		/* =======================================================================
		Constructor
		========================================================================== */
		(function() {
			
			var cookie = _$cookie(COOKIE_NAME);

			var $id     = _$parent.find("#login-id").focus();
			var $pass   = _$parent.find("#login-pass");
			var $submit = _$parent.find("#login-submit").on("click",submit);

			if (cookie) {

				var account = JSON.parse(cookie);

				$id.prop("value",account.id);
				$pass.prop("value",account.pass);

				$submit.trigger("click");

			}

			function submit() {
				
				send({ id:$id.prop("value"), pass:$pass.prop("value") });
				return false;

			}
			
			return false;
			
		})();
		
		/* =======================================================================
		Send
		========================================================================== */
		function send(account) {

			_ajax.getData({
				
				table  : "users",
				column : "parmanent_id,pass",
				option : "parmanent_id='" + account.id + "'",
				and    : "pass='" + account.pass + "'"
				
			},onSuccess);

			function onSuccess(data) {

				if (data.length) start(account);
				else alert("登録されていないID/PASSです。");

			}

			return false;

		}

		/* =======================================================================
		Start
		========================================================================== */
		function start(account) {

			_$cookie(COOKIE_NAME,JSON.stringify(account),{ path:"/", expires:1 });
			
			_$parent.hide();
			_main.show(account.id,account.pass);

			return false;

		}
		
		/* =======================================================================
		Logout
		========================================================================== */
		function logout() {
			
			if (_ajax.getIsConnecting()) {
				
				alert("データベース登録中です。");
				return false;
				
			}
			
			_$cookie(COOKIE_NAME,null,{ path:"/" });
			location.reload(false);
			
			return false;
			
		}
		
		return { logout:logout };
		
	}
	
	/* =======================================================================
	Scrollbar
	========================================================================== */
	function Scrollbar(_$doc,_$scrollbar,_$content) {

		var _$field,_$dial;
		var _def,_ratio,_max,_p,_isPassive;

		/* =======================================================================
		Constructor
		========================================================================== */
		(function() {
			
			_$field = _$scrollbar.find(".field");
			_$dial  = _$field.find(".dial");

			_$dial.on("mousedown",startDrag);
			_$field.on("mousedown",jump);
			
			_$scrollbar.find(".left").on("mousedown",moveLeft);
			_$scrollbar.find(".right").on("mousedown",moveRight);

			return false;

		})();

		/* =======================================================================
		On Resize
		========================================================================== */
		function onResize() {
			
			_$scrollbar.addClass("active");
			
			var scrollbarW = _$scrollbar.outerWidth();
			var fieldW     = _$field.width();
			var contentW   = _$content.outerWidth();
			var dialW      = fieldW * fieldW / contentW;
			
			_isPassive = scrollbarW > contentW;
			if (_isPassive) _$scrollbar.removeClass("active");
			
			_$dial.width(dialW);
			
			_def   = _$dial.offset().left + dialW * .5;
			_max   = fieldW - dialW;
			_ratio = (scrollbarW - contentW) / _max;
			_p     = 0;

			return false;

		}

		/* =======================================================================
		Start Drag
		========================================================================== */
		function startDrag(event) {

			_$doc.on({ mousemove:onMousemove, mouseup:onMouseup });

			function onMousemove(event) {

				moveDialAbsolutely(event.pageX);
				return false;

			}

			function onMouseup(event) {

				_$doc.off({ mousemove:onMousemove, mouseup:onMouseup });
				return false;

			}

			return false;

		}

		/* =======================================================================
		Jump
		========================================================================== */
		function jump(event) {

			moveDialAbsolutely(event.pageX);
			return false;

		}
		
		/* =======================================================================
		Move Left
		========================================================================== */
		function moveLeft() {
			
			moveDirections(-1);
			return false;

		}
		
		/* =======================================================================
		Move Right
		========================================================================== */
		function moveRight() {
			
			moveDirections(1);
			return false;

		}
		
		/* =======================================================================
		Move Directions
		========================================================================== */
		function moveDirections(sign) {
			
			moveDialRelatively(_max * .1 * sign);
			return false;

		}

		/* =======================================================================
		Move Dial Absolutely
		========================================================================== */
		function moveDialAbsolutely(val) {

			moveDial(val - _def);
			return false;

		}
		
		/* =======================================================================
		Move Dial Relatively
		========================================================================== */
		function moveDialRelatively(val) {
			
			moveDial(_p + val);
			return false;

		}

		/* =======================================================================
		Move Dial
		========================================================================== */
		function moveDial(val) {
			
			if (_isPassive) return false;
			
			val = val | 0;

			if (val < 0) val = 0;
			else if (val > _max) val = _max;
			
			_p = val;
			var goal = val * _ratio | 0;

			_$dial.stop().animate({ left:val }, 60, "linear");
			_$content.stop().animate({ left:goal }, 120, "linear");

			return false;

		}

		/* =======================================================================
		Move Content
		========================================================================== */
		function moveContent(val) {

			moveDial(val / _ratio);
			return false;

		}
		
		/* =======================================================================
		Get Is Active
		========================================================================== */
		function getIsActive() {

			return !_isPassive;

		}

		return {
			
			onResize           : onResize,
			moveDialAbsolutely : moveDialAbsolutely,
			moveDialRelatively : moveDialRelatively,
			getIsActive        : getIsActive
			
		};

	}
	
	return false;
	
})(window,jQuery,baseJS);