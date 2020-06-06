var budgetController = (function(){
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage =  function(totalIncome){
		if (totalIncome>0){
			this.percentage = Math.round((this.value/totalIncome)*100);
		}
		else{
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};
	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var data = {
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,
		expPer:-1
	};
	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(curr){
			sum = sum + parseInt(curr.value);
			});
		data.totals[type] = sum;
	};
	return{
		addItem:function(type,description,value){
			var newItem,Id,lastIdx;
			lastIdx = data.allItems[type].length - 1;
			if (lastIdx>=0){  
				Id = data.allItems[type][lastIdx].id + 1;
			}
			else{
				Id = 0;
			}
			if (type === 'inc'){
				newItem = new Income(Id,description,value);
			}
			else if (type==='exp'){
				newItem = new Expense(Id,description,value);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},
		calculateBudget:function(){
			calculateTotal('inc');
			calculateTotal('exp');
			// budget
			data.budget = data.totals.inc - data.totals.exp;
			if (data.totals.inc > 0){
				data.expPer = Math.round((data.totals.exp/data.totals.inc)*100) +'%';
			}
			else{
				data.expPer = '---';
			}
	    },
		getBudget:function(){
			return{
				budget   : data.budget,
				totalInc : data.totals.inc,
				totalExp : data.totals.exp,
				expPer   : data.expPer
			};
		},
		deleteItem:function(type,ID){
			var index,indices;
			indices = data.allItems[type].map(function(curr){
				return curr.id;
			});
			//console.log(indices);
			index = indices.indexOf(ID);
			if (index!==-1){
				data.allItems[type].splice(index,1);
			} 

		},
		calcPercentages:function(){
			data.allItems.exp.forEach(function(curr){
				curr.calcPercentage(data.totals.inc);
			});
		},
		getPercentages:function(){
			var allPer = data.allItems.exp.map(function(curr){
				return curr.percentage;
			});
			return allPer;
		}
	};

})();
var UIController    =  (function(){
	var DOM ={
		inputType        :'.add__type',
		inputDescription :'.add__description',
		inputValue       :'.add__value',
		inputBtn         :'.add__btn',
		incomeContainer  :'.income__list',
		expenseContainer :'.expenses__list',
		budgetLabel      :'.budget__value',
		incomeLabel      :'.budget__income--value',
		expenseLabel     :'.budget__expenses--value',
		percentageLabel  :'.budget__expenses--percentage',
		container        :'.container',
		expensePerLabel  :'.item__percentage',
		dateLabel        :'.budget__title--month'

	};
	var formatNumber = function(num,type){
		var numSplit,dec;
		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};
	var nodeListForEach = function(list,callback){
				for(var i = 0;i<list.length;i++){
					callback(list[i],i);
				}
	};
	return{
		getInput: function(){
			return{
				type        : document.querySelector(DOM.inputType).value,// inc or exp
				description : document.querySelector(DOM.inputDescription).value,
				value       : parseFloat(document.querySelector(DOM.inputValue).value)
			};
		},
		addListItem: function(obj,type){
			var html ,newHtml,element;
			// create an HTML string with placeHolder text
			if (type==='inc'){
				element = DOM.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			else if (type==='exp'){
				element = DOM.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			// replace the placeHolder text with actual data
			newHtml = html.replace('%id%',obj.id);
			newHtml = newHtml.replace('%description%',obj.description);
			newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
			// Insert the HTML into the DOM 
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
		},
		clearFields:function(){
			var fields;
			fields = document.querySelectorAll(DOM.inputDescription + ', '+ DOM.inputValue);
			var fieldsArray =  Array.prototype.slice.call(fields);
			fieldsArray.forEach(function(curr,index,array){
				curr.value = "";
			});
			fieldsArray[0].focus();
		},
		displayBudget:function(obj){
			var type;
			obj.budget > 0 ? type='inc':type = 'exp'; 
			document.querySelector(DOM.budgetLabel).textContent  = formatNumber(obj.budget,type);
			document.querySelector(DOM.incomeLabel).textContent  = formatNumber(obj.totalInc,'inc');
			document.querySelector(DOM.expenseLabel).textContent  = formatNumber(obj.totalExp,'exp');
			if (obj.expPer!==0){
				document.querySelector(DOM.percentageLabel).textContent  = obj.expPer;
			}
			else{
				document.querySelector(DOM.percentageLabel).textContent  = '---';
			}

		},
		deleteListItem:function(itemId){
			var el = document.getElementById(itemId);
            el.parentNode.removeChild(el);
		},
		displayPercentages:function(percentages){
			var fields = document.querySelectorAll(DOM.expensePerLabel);
			nodeListForEach(fields,function(curr,index){
				if (percentages[index]>0){
					curr.textContent = percentages[index]+'%';
				}
				else{
					curr.textContent = '---';
				}
			});
		},
		displayMonth : function(){
			var today,month,year;
			today = new Date();
			year  = today.getFullYear();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = today.getMonth();
			document.querySelector(DOM.dateLabel).textContent = months[month] + ' ' + year;
		},
		changeType:function(){
			var fields = document.querySelectorAll(
				DOM.inputType + ',' +
				DOM.inputDescription + ',' +
				DOM.inputValue
				);
			nodeListForEach(fields,function(curr){
				curr.classList.toggle('red-focus');
			});
			document.querySelector(DOM.inputBtn).classList.toggle('red');

		},
		getDOM:function(){
			return DOM;
		}
	};
})();
var controller      = (function(UICtrl,budgetCtrl){
	var updateBudget = function(){
			// calculate budget
			budgetCtrl.calculateBudget();
			var budget = budgetCtrl.getBudget();
			//console.log(budget);
			UICtrl.displayBudget(budget);
	}
	var setUpEventListeners = function(){
		
		var ctrlAddItem = function(){
			var input , newItem;
			// get the input fields

			input   = UICtrl.getInput();
			// input to the budget
			if (input.description !== "" && !isNaN(input.value) && input.value > 0){
				newItem = budgetCtrl.addItem(input.type,input.description,input.value);
				// add to UI
				UICtrl.addListItem(newItem , input.type);
				// clear fields
				UICtrl.clearFields();
				// calc budget and updateBudget
				updateBudget();

				// calc and update percentages
				updatePercentages();
			}
		}
		var ctrlDeleteItem = function(event){
			var itemId,type,id,splitId;
			// event.target tells where the event was fired
			itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
			if (itemId){
				splitId = itemId.split('-');
				type    = splitId[0];
				id     = parseInt(splitId[1]);
				//console.log('id = '+ id);
				// delete the item from data
				budgetCtrl.deleteItem(type,id);

				// delete the item from UI

				UICtrl.deleteListItem(itemId);

				// update the UI
				updateBudget();

				// calc and update percentages
				updatePercentages();
			}

		}
		var updatePercentages = function(){
			// 1. Calculate percentages
        	budgetCtrl.calcPercentages();
        	// 2. Read percentages from the budget controller
        	var percentages = budgetCtrl.getPercentages();
        	// 3. Update the UI with the new percentages
        	UICtrl.displayPercentages(percentages);
    
		} 
		var	DOM = UICtrl.getDOM();
		// adding event listeners for taking inputs
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
		document.addEventListener('keypress', function(event) {
        	if (event.keyCode === 13 || event.which === 13) {
            	ctrlAddItem();
        	}
    	});

    	// adding event listeners for deleting item
    	document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    	// changing color of input boxes
    	document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
	}
    return{
    	init:function(){
    		console.log("the show has started");
    		UICtrl.clearFields();
    		UICtrl.displayMonth();
    		UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
    		setUpEventListeners();
    	}
    };
 
}) (UIController,budgetController);
controller.init();
