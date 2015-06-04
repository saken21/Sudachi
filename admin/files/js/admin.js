(function(window,$,_) {
	
	var _ajax,_orders;
	
	$(document).on("ready",function() {
		
		_ajax   = _.ajax;
		_orders = new Orders($("#orders"));
		
		return false;
		
	});
	
	/* =======================================================================
	Class - Orders
	========================================================================== */
	function Orders(_$parent) {
		
		var _$table,_$headers,_$orders,_$inputs,_$navis,_$boxnum;
		var _data,_term;
		
		/* =======================================================================
		Constructor
		========================================================================== */
		(function() {
			
			_term = _.getTerm(new Date());
			loadDatabase();
			
			return false;
			
		})();
		
		/* =======================================================================
		Load Database
		========================================================================== */
		function loadDatabase() {

			var dataList = { items:[], users:[], orders:[] };
			var counter  = 0;

			load("items","id,title,type,enterprise");
			load("users","id,name,enterprise");
			load("orders","id,quantity,item_id,user_id,datetime,flag,shippedDatetime,boxnum");

			function load(table,column,option) {

				_ajax.getData({ table:table, column:column, option:option },function(data) {

					dataList[table] = data;
					onSuccess();

					return false;

				});

				return false;

			}

			function onSuccess() {

				counter++;
				if (counter > 2) setHTML(dataList);

				return false;

			}

			return false;

		}

		/* =======================================================================
		Set HTML
		========================================================================== */
		function setHTML(dataList) {

			var items  = sortByKey(dataList.items);
			var users  = sortByKey(dataList.users);
			var orders = dataList.orders;
			var length = orders.length;
			var html   = '';

			orders.sort(function(a,b) { return Date.parse(b.datetime) - Date.parse(a.datetime); });

			for (var i = 0; i < length; i++) {

				var obj       = orders[i];
				var id        = obj.id;
				var itemID    = obj.item_id;
				var userID    = obj.user_id;
				var isChecked = +obj.flag > 0;
				var cls       = isChecked ? " shipped" : " waiting";
				var domID     = "order-" + id;
				var checkbox  = isChecked ? "出荷済み" : '<input type="checkbox" id="input-' + domID + '" />';
				var item      = items[itemID];
				var user      = users[userID];

				html += '<tr class="content all item-' + itemID + ' user-' + userID + cls + '" id="' + domID + '">';
				html += '<td class="item">' + (+item.type ? item.enterprise + ' ' : '') + item.title + '</td>';
				html += '<td class="user">' + user.enterprise + ' ' + user.name + '</td>';
				html += '<td class="quantity">' + obj.quantity + '</td>';
				html += '<td class="datetime">' + obj.datetime + '</td>';
				html += '<td class="flag">' + checkbox + '</td>';
				html += '<td class="shippedDatetime">' + obj.shippedDatetime + '</td>';
				html += '<td class="boxnum">' + obj.boxnum + '</td>';
				html += '</tr>';

			}

			_$parent.find("table").find(".header").after(html);
			
			_data = sortByKey(orders);
			setEvent();

			return false;

		}

		/* =======================================================================
		Set Event
		========================================================================== */
		function setEvent() {
			
			_$table   = _$parent.find("table");
			_$headers = _$table.find(".header").find("th");
			_$orders  = _$table.find(".content");
			_$navis   = _$parent.find(".navi").find("li");
			_$boxnum  = _$parent.find("#boxnum").find("input");
			
			setCheckEvent();
			
			_$headers.not(".flag,.boxnum").on("mousedown",sortOrders);
			_$navis.on("mousedown",selectOrders).filter(".waiting").trigger("mousedown");
			
			_$boxnum.on("blur",adjustBoxnum);
			
			_$parent.find("#submit").on("click",submit);
			
			return false;

		}
		
		/* =======================================================================
		Set Check Event
		========================================================================== */
		function setCheckEvent() {
			
			var $flags = _$orders.find(".flag");
			
			_$inputs = $flags.find("input").on("change",function() {
				
				var $target = $(this);
				var $parent = $target.parents(".content");
				
				if ($target.prop("checked")) $parent.addClass("checked");
				else $parent.removeClass("checked");
				
				return false;
				
			});
			
			$flags.on("mousedown",function(event) {
				
				var $input = $(this).find("input");
				
				if (!$(event.target).is("input")) {
					$input.prop("checked",$input.prop("checked") ? false : true).trigger("change");
				}
				
			});
			
			return false;
			
		}

		/* =======================================================================
		Sort By Key
		========================================================================== */
		function sortByKey(oldArray,key) {

			var length   = oldArray.length;
			var newArray = {};

			for (var i = 0; i < length; i++) {

				var obj = oldArray[i];
				newArray[obj.id] = obj;

			}

			return newArray;

		}
		
		/* =======================================================================
		Select Orders
		========================================================================== */
		function selectOrders() {
			
			var $target = $(this);
			if ($target.hasClass("active")) return false;
			
			_$navis.removeClass("active");
			
			var cls = $target.prop("class");
			
			$target.addClass("active");
			_$table.removeClass().addClass(cls);
			
			var defaultSortClass = (cls === "shipped") ? ".shippedDatetime" : ".datetime";
			_$headers.filter(defaultSortClass).trigger("mousedown");
			
			return false;
			
		}
		
		/* =======================================================================
		Sort Orders
		========================================================================== */
		function sortOrders() {
			
			var $target = $(this);
			if ($target.hasClass("active")) return false;
			
			_$headers.removeClass("active");
			
			var cls = $target.prop("class");
			$target.addClass("active");
			
			sortHTML(_$orders,cls);
			
			return false;
			
		}
		
		/* =======================================================================
		Sort HTML
		========================================================================== */
		function sortHTML($list,key) {
			
			var cls  = "." + key;
			var sign = -1;
			
			if (key === "item" || key === "user") sign *= -1;
			
			var funcs = {
				
				item            : function($target) { return +$target.prop("class").split("item-")[1].split(" ")[0] },
				user            : function($target) { return +$target.prop("class").split("user-")[1].split(" ")[0] },
				quantity        : function($target) { return +$target.find(cls).text(); },
				datetime        : function($target) { return new Date($target.find(cls).text()); },
				shippedDatetime : function($target) { return new Date($target.find(cls).text()); }
				
			};
			
			var func = funcs[key];
			
			var $clone = $list.clone();
			$list.remove();

			_$table.append($clone.sort(function(a,b) {
				return func($(a)) > func($(b)) ? sign : -sign;
			}));
			
			_$orders = $clone;
			
			(function($list) {
				
				var $first,lastShippedDatetime;
				
				var length  = $list.length;
				var counter = 0;
				
				$list.each(function(index) {
					
					var $target = $(this);
					var $boxnum = $target.find(".boxnum").show();
					var $shippedDatetime = $target.find(".shippedDatetime");
					
					var shippedDatetime = $shippedDatetime.text();
					var isFirst         = (shippedDatetime !== lastShippedDatetime);
					var isLast          = (index === length - 1);
					
					if (isFirst) {
						
						if ($first) $first.find(".boxnum").prop("rowspan",counter);
						
						$first = $target;
						counter = 0;
						
					} else {
						
						$boxnum.hide();
						if (isLast) $first.find(".boxnum").prop("rowspan",++counter);
						
					}
					
					lastShippedDatetime = shippedDatetime;
					counter++;
					
				});
				
				return false;
				
			})($clone.filter(":visible"));
			
			setCheckEvent();

			return false;

		}
		
		/* =======================================================================
		Adjust Boxnum
		========================================================================== */
		function adjustBoxnum() {
			
			var val = +_$boxnum.prop("value") || 1;
			if (val < 1) val = 1;
			
			_$boxnum.prop("value",val);
			
			return false;
			
		}
		
		/* =======================================================================
		Submit
		========================================================================== */
		function submit() {
			
			var $checked = _$inputs.filter(":checked");
			
			var boxnum  = +_$boxnum.prop("value");
			var length  = $checked.length;
			var counter = 0;
			
			if (!length) {
				
				alert("出荷済みのオーダーをチェックしてください。");
				return false;
				
			}
			
			if (confirm("出荷ステータスを更新します。")) {

				_ajax.setBeforeunload();
				
				_ajax.getDatetime(function(datetime) {
					
					$checked.each(function() {

						var $target = $(this);

						var id  = $target.prop("id").split("input-order-")[1];
						var obj = _data[id];

						_ajax.shipOrder(obj.id,+obj.quantity,obj.item_id,obj.user_id,_term,datetime,boxnum,function() {

							var $parent = $target.parents(".flag").html("出荷済み").parents(".content").removeClass("waiting").addClass("shipped");

							$parent.find(".shippedDatetime").text(datetime);
							$parent.find(".boxnum").text(boxnum);

							addCounter();

							return false;

						},addCounter);

					});
					
				});

			}
			
			function addCounter() {
				
				counter++;
				if (counter > length - 1) finish();
				
				return false;
				
			}
			
			function finish() {
				
				_ajax.unsetBeforeunload();
				alert("出荷処理が完了しました。");
				
				_$boxnum.prop("value",1);
				
				return false;
				
			}
			
			return false;
			
		}
		
		return {};
		
	}
	
	return false;
	
})(window,jQuery,baseJS);