/**
 * The page Js file
 */
var PageJs = new Class.create();
PageJs.prototype = Object.extend(new BPCPageJs(), {
	_htmlIds: {itemDiv: '',searchPanel: '',paymentPanel: '',supplierInfoPanel: '',partsTable:'',barcodeInput:''}
	,_purchaseOrder: null
	/**
	 * Setting the HTMLIDS
	 */
	,setHTMLIDs: function(itemDivId,searchPanelDivId,paymentPanelDivId,supplierInfoPanelDivId,partsTableDivId,barcodeInputDivId) {
		this._htmlIds.itemDiv = itemDivId;
		this._htmlIds.searchPanel = searchPanelDivId;
		this._htmlIds.paymentPanel = paymentPanelDivId;
		this._htmlIds.supplierInfoPanel = supplierInfoPanelDivId;
		this._htmlIds.partsTable = partsTableDivId;
		this._htmlIds.barcodeInput = barcodeInputDivId;
		return this;
	}
	/**
	 * Getting the customer list panel
	 */
	,_getPOListPanel: function () {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('div', {'id': tmp.me._htmlIds.searchPanel, 'class': 'panel panel-warning search-panel'})
			.insert({'bottom': new Element('div', {'class': 'panel-heading form-inline'})
				.insert({'bottom': new Element('strong').update('Searching for PO: ') })
				.insert({'bottom': new Element('span', {'class': 'input-group col-sm-6'})
					.insert({'bottom': new Element('input', {'required': true, 'class': 'form-control search-txt init-focus', 'placeholder': 'any of PO number, Supplier, Supplier Ref Number ...'}) 
						.observe('keydown', function(event){
							tmp.txtBox = this;
							tmp.me.keydown(event, function() {
								if(tmp.txtBox.hasClassName('search-finished') && $(pageJs._htmlIds.searchPanel).getElementsBySelector('.item_row .btn').size() === 1) {
									$(pageJs._htmlIds.searchPanel).down('.item_row .btn').click();
								} else {
									$(tmp.me._htmlIds.searchPanel).down('.search-btn').click();
									tmp.txtBox.addClassName('search-finished');
								}
							}, function() {
								$(tmp.txtBox).removeClassName('search-finished');
							});
							return false;
						})
					})
					.insert({'bottom': new Element('span', {'class': 'input-group-btn search-btn'})
						.insert({'bottom': new Element('span', {'class': ' btn btn-primary'})
							.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-search'}) })
						})
						.observe('click', function(){
							tmp.btn = this;
							if($(tmp.me._htmlIds.searchPanel).down('.search-txt').value!=='')
								tmp.me._searchPO($(tmp.me._htmlIds.searchPanel).down('.search-txt'));
						})
					})
				})
				.insert({'bottom': new Element('span', {'class': 'btn btn-success pull-right btn-sm btn-danger'})
					.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-remove'}) })
					.observe('click', function(){
						$(tmp.me._htmlIds.searchPanel).down('.search-txt').clear();
						tmp.me._searchPO($(tmp.me._htmlIds.searchPanel).down('.search-txt'));
					})
				})
			})
			;
		return tmp.newDiv;
	}
	/**
	 * Ajax: searching for POs
	 */
	,_searchPO: function (txtbox) {
		var tmp = {};
		tmp.me = this;
		tmp.searchTxt = $F(txtbox).strip();
		tmp.searchPanel = $(txtbox).up('#' + tmp.me._htmlIds.searchPanel);
		tmp.me.postAjax(tmp.me.getCallbackId('searchPO'), {'searchTxt': tmp.searchTxt}, {
			'onLoading': function() {
				if($(tmp.searchPanel).down('.list-div'))
					$(tmp.searchPanel).down('.list-div').remove();
				$(tmp.searchPanel).insert({'bottom': new Element('div', {'class': 'panel-body'}).update(tmp.me.getLoadingImg()) });
			}
			,'onSuccess': function (sender, param) {
				$(tmp.searchPanel).down('.panel-body').remove();
				try {
					tmp.result = tmp.me.getResp(param, false, true);
					if(!tmp.result || !tmp.result.items)
						return;
					$(tmp.searchPanel).insert({'bottom': new Element('small', {'class': 'table-responsive list-div'})
						.insert({'bottom': new Element('table', {'class': 'table table-hover table-condensed'})
							.insert({'bottom': new Element('thead') 
								.insert({'bottom': tmp.me._getPORow({'purchaseOrderNo': 'PO Number', 'supplier': {'name': 'Supplier'} , 'supplierRefNo': 'Supplier Ref', 'orderDate': 'Order Date', 'totalAmount': 'Total Amount', 'totalProdcutCount': 'Total Prodcut Count','status': 'Status', 'active': 'Active?'}, true)  })
							})
							.insert({'bottom': tmp.listDiv = new Element('tbody') })
						})
					});
					tmp.result.items.each(function(item) {
						tmp.listDiv.insert({'bottom': tmp.me._getPORow(item) });
					});
				} catch (e) {
					$(tmp.searchPanel).insert({'bottom': new Element('div', {'class': 'panel-body'}).update(tmp.me.getAlertBox('ERROR', e).addClassName('alert-danger')) });
				}
			}
		});
		return tmp.me;
	}
	/**
	 * Getting the PO row for displaying the searching result
	 */
	,_getPORow: function(po, isTitle) {
		var tmp = {};
		tmp.me = this;
		tmp.isTitle = (isTitle || false);
		tmp.tag = (tmp.isTitle === true ? 'th': 'td');
		tmp.newDiv = new Element('tr', {'class': (tmp.isTitle === true ? 'item_top_row' : 'item_row') + (po.active == 0 ? ' danger' : ''), 'item_id': (tmp.isTitle === true ? '' : po.id)})
			.insert({'bottom': new Element(tmp.tag)
				.insert({'bottom': (tmp.isTitle === true ? '&nbsp;':
					new Element('span', {'class': 'btn btn-primary btn-xs'}).update('select')	
					.observe('click', function(){
						tmp.me.selectPO(po);
					})
				) })
			})
			.insert({'bottom': new Element(tmp.tag).update(po.purchaseOrderNo) })
			.insert({'bottom': new Element(tmp.tag).update(po.supplier.name) })
			.insert({'bottom': new Element(tmp.tag).update(po.supplierRefNo) })
			.insert({'bottom': new Element(tmp.tag).update(po.orderDate) })
			.insert({'bottom': new Element(tmp.tag).update(po.totalAmount) })
			.insert({'bottom': new Element(tmp.tag).update(po.totalProdcutCount) })
			.insert({'bottom': new Element(tmp.tag).update(po.status) })
			.insert({'bottom': new Element(tmp.tag)
				.insert({'bottom': (tmp.isTitle === true ? po.active : new Element('input', {'type': 'checkbox', 'disabled': true, 'checked': po.active}) ) })
			})
		;
		return tmp.newDiv;
	}
	/**
	 * when user select (click) one PO
	 */
	,selectPO: function(po) {
		var tmp = {};
		tmp.me = this;
		tmp.me._purchaseOrder = po;
		tmp.newDiv = tmp.me._getViewOfPurchaseOrder();
		$(tmp.me._htmlIds.itemDiv).update(tmp.newDiv).down('[new-order-item=product]').focus();
		
		tmp.me._purchaseOrder.purchaseOrderItem.each(function(item) {
			tmp.currentRow = $$('.new-order-item-input').first();
			tmp.product = {
					'name': ''
					,'id' : ''
					,'qty': 0
					,'barcode': ''
			};
			tmp.data = {
					'product': tmp.product, 
					'btns': new Element('span', {'class': 'pull-right'})
						.insert({'bottom': new Element('span', {'class': 'btn btn-danger btn-xs'})
						.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-trash'}) })
						.observe('click', function(event) {
							Event.stop(event);
							if(!confirm('You are about to remove this entry.\n\nContinue?'))
								return;
							tmp.row = $(this).up('.item_row');
							tmp.row.remove();
						})
					})
				};
			tmp.currentRow.insert({'after': tmp.lastRow = tmp.me._getProductRow(tmp.data, false) });
			tmp.product = item.product;
			tmp.product.purchaseOrderItem = item.purchaseOrderItem;
			tmp.me._selectProduct(tmp.product, tmp.lastRow);
		});
		
		return tmp.me;
	}
	/**
	 * Getting the div of the PO view
	 */
	,_getViewOfPurchaseOrder: function() {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('div')
			.insert({'bottom': new Element('div', {'class': 'row'})
				.insert({'bottom': new Element('div', {'class': 'col-sm-9'}).update(tmp.me._getSupplierInfoPanel()) })
				.insert({'bottom': new Element('div', {'class': 'col-sm-3'}).update(tmp.me._getPaymentPanel()) })
			})
			.insert({'bottom': new Element('div', {'class': 'row'})
				.insert({'bottom': new Element('div', {'class': 'col-sm-12'}).update(tmp.me._getPartsTable()) })
			})
			.insert({'bottom': new Element('div', {'class': 'row', 'style': 'padding: 0 15px'})
				.insert({'bottom': new Element('div', {'class': 'col-sm-1'})
					.insert({'bottom': new Element('label', {'class': 'control-label'}).update('Comment: ') })
				})
				.insert({'bottom': new Element('div', {'class': 'col-sm-9'})
					.insert({'bottom': new Element('textarea', {'save-order': 'comments', 'style': 'height:33px; width: 100%;'}) })
				})
				.insert({'bottom': new Element('div', {'class': 'col-sm-2'}).update(tmp.me._saveBtns()) })
			});
		return tmp.newDiv;
	}
	/**
	 * getting the supplier information div
	 */
	,_getSupplierInfoPanel: function() {
		var tmp = {};
		tmp.me = this;
		tmp.purchaseOrder = tmp.me._purchaseOrder;
		tmp.supplier = tmp.purchaseOrder.supplier;
		tmp.newDiv = new Element('div', {'class': 'panel panel-warning', 'id': tmp.me._htmlIds.supplierInfoPanel})
			.insert({'bottom': new Element('div', {'class': 'panel-heading'})
				.insert({'bottom': new Element('div', {'class': 'row'})
					.insert({'bottom': new Element('div', {'class': 'col-xs-8'})
						.insert({'bottom': new Element('span').update('Receiving items for PO: ') 
							.insert({'bottom': new Element('strong').update(tmp.purchaseOrder.purchaseOrderNo + ' ') })
						})
					})
					.insert({'bottom': new Element('div', {'class': 'col-xs-4 text-right'})
						.insert({'bottom': new Element('span').update('Status: ') })
						.insert({'bottom': new Element('strong').update(tmp.me._purchaseOrder.status) })
					})
				})
			})
			.insert({'bottom': new Element('div', {'class': 'panel-body', 'style': 'padding: 0 10px'})
				.insert({'bottom': new Element('div', {'class': 'row'})
					.insert({'bottom': new Element('div', {'class': 'col-sm-3'})
						.insert({'bottom': new Element('strong').update('Supplier Name:') })
						.insert({'bottom': new Element('div', {'style': 'padding: 2px 8px'}).update(tmp.supplier.name ? tmp.supplier.name : '') })
					})
					.insert({'bottom': new Element('div', {'class': 'col-sm-3'})
						.insert({'bottom': new Element('strong').update('Contact Name:') })
						.insert({'bottom': new Element('div', {'style': 'padding: 2px 8px'}).update(tmp.purchaseOrder.supplierContact ? tmp.purchaseOrder.supplierContact : tmp.supplier.contactName) })
					})
					.insert({'bottom': new Element('div', {'class': 'col-sm-3'})
						.insert({'bottom': new Element('strong').update('Contact Number:') })
						.insert({'bottom': new Element('div', {'style': 'padding: 2px 8px'}).update(tmp.purchaseOrder.supplierContactNumber ? tmp.purchaseOrder.supplierContactNumber : tmp.supplier.supplierContactNumber) })
					})
					.insert({'bottom': new Element('div', {'class': 'col-sm-3'})
						.insert({'bottom': new Element('strong').update('Contact Email:') })
						.insert({'bottom': new Element('div', {'style': 'padding: 2px 8px'}).update(tmp.supplier.email) })
					})
				})
				.insert({'bottom': new Element('div', {'class': 'row'})
					.insert({'bottom': new Element('div', {'class': 'col-sm-3'})
						.insert({'bottom': new Element('strong').update('Order Date:') })
						.insert({'bottom': new Element('div', {'style': 'padding: 2px 8px'}).update(tmp.me._purchaseOrder.orderDate ? tmp.me.loadUTCTime(tmp.me._purchaseOrder.orderDate).toLocaleString() : '') })
					})
					.insert({'bottom': new Element('div', {'class': 'col-sm-3'})
						.insert({'bottom': new Element('strong').update('Supplier Ref Number:') })
						.insert({'bottom': new Element('div', {'style': 'padding: 2px 8px'}).update(tmp.purchaseOrder.supplierRefNo) })
					})
				 })
			});
		return tmp.newDiv;
	}
	/**
	 * Getting the form group
	 */
	,_getFormGroup: function(title, content) {
		return new Element('div', {'class': 'form-group'})
			.insert({'bottom': title ? new Element('label', {'class': 'control-label'}).update(title) : '' })
			.insert({'bottom': content.addClassName('form-control') });
	}
	,_getPaymentPanel: function () {
		var tmp = {};
		tmp.me = this;
		tmp.purchaseOrder = tmp.me._purchaseOrder;
		tmp.supplier = tmp.purchaseOrder.supplier;
		tmp.shippingCostEl = new Element('input', {'disabled': true, 'class': 'text-right', 'value': tmp.purchaseOrder.shippingCost ? tmp.purchaseOrder.shippingCost : 0});
		tmp.handlingCostEl = new Element('input', {'disabled': true, 'class': 'text-right', 'value': tmp.purchaseOrder.handlingCost ? tmp.purchaseOrder.handlingCost : 0});
		tmp.totalAmountExGstEl = new Element('input', {'disabled': true, 'class': 'text-right', 'value': tmp.purchaseOrder.totalAmount ? tmp.purchaseOrder.totalAmount : 0});
		tmp.totalPaidEl = new Element('input', {'disabled': true, 'class': 'text-right', 'value': tmp.purchaseOrder.totalPaid ? tmp.purchaseOrder.totalPaid : 0});
		
		tmp.totalAmount = (tmp.purchaseOrder.totalAmount ? tmp.purchaseOrder.totalAmount : 0) ;
		tmp.totalPaid = (tmp.purchaseOrder.totalPaid ? tmp.purchaseOrder.totalPaid : 0) ;
		tmp.totalDue = tmp.totalAmount * 1 - tmp.totalPaid * 1;
		
		tmp.newDiv = new Element('div', {'class': 'panel panel-warning', 'id': tmp.me._htmlIds.paymentPanel})
			.insert({'bottom': new Element('div', {'class':'panel-heading text-right'})
				.insert({'bottom': new Element('div')
					.insert({'bottom': new Element('strong').update('Payment Due: ') })
					.insert({'bottom': new Element('span', {'class': 'badge'}).update( tmp.me.getCurrency(tmp.totalDue) )  })
				})
			})
			.insert({'bottom': new Element('div', {'class': 'panel-body', 'style': 'padding: 0 10px'})
				.insert({'bottom': new Element('div', {'class': 'row'})
					.insert({'bottom': new Element('div', {'class': 'col-xs-7 text-right'}).update(new Element('strong').update('Total Inc GST:')) })
					.insert({'bottom': new Element('div', {'class': 'col-xs-5'}).update( tmp.me.getCurrency(tmp.totalAmount) ) })
				})
				.insert({'bottom': new Element('div', {'class': 'row'})
					.insert({'bottom': new Element('div', {'class': 'col-xs-7 text-right'}).update(new Element('strong').update('Total Paid:')) })
					.insert({'bottom': new Element('div', {'class': 'col-xs-5'}).update( tmp.me.getCurrency(tmp.totalPaid) ) })
				})
				.insert({'bottom': new Element('div', {'class': 'row'})
					.insert({'bottom': new Element('div', {'class': 'col-xs-7 text-right'}).update(new Element('strong').update('Total Due:')) })
					.insert({'bottom': new Element('div', {'class': 'col-xs-5'}).update( tmp.me.getCurrency(tmp.totalDue) ) })
				})
					
//					.insert({'bottom': new Element('div', {'class': 'col-sm-3'}).update(tmp.me._getFormGroup('Total Ex GST', new Element('input', {'disabled': true, 'type': 'text', 'value': tmp.purchaseOrder.totalAmount ? tmp.me.getCurrency(tmp.purchaseOrder.totalAmount) : ''}) ) ) })
//					.insert({'bottom': new Element('div', {'class': 'col-sm-3'}).update(tmp.me._getFormGroup('Contact Name', new Element('input', {'disabled': true, 'type': 'text', 'value': tmp.purchaseOrder.totalPaid ? tmp.me.getCurrency(tmp.purchaseOrder.totalPaid) : ''}) ) ) })
//					.insert({'bottom': new Element('div', {'class': 'col-sm-3'}).update(tmp.me._getFormGroup('Contact Number', new Element('input', {'disabled': true, 'type': 'value', 'value': tmp.purchaseOrder.shippingCost ? tmp.me.getCurrency(tmp.purchaseOrder.shippingCost) : ''}) ) ) })
//					.insert({'bottom': new Element('div', {'class': 'col-sm-3'}).update(tmp.me._getFormGroup('Supplier Ref Num', new Element('input', {'disabled': true, 'type': 'text', 'value': tmp.purchaseOrder.handlingCost ? tmp.me.getCurrency(tmp.purchaseOrder.handlingCost) : ''}) ) ) })
//				 })
			});
		return tmp.newDiv;
	}
	/**
	 * Getting the parts panel
	 */
	,_getPartsTable: function () {
		var tmp = {};
		tmp.me = this;
		//header row
		tmp.productListDiv = new Element('div', {'class': 'list-group', 'id': tmp.me._htmlIds.partsTable})
			.insert({'bottom': tmp.newDiv = tmp.me._getProductRow({'product': {'sku': 'SKU', 'name': 'Product Name', 'qty': 'Qty', 'EANcode': 'EAN code', 'UPCcode': 'UPC code', 'wareLocation': 'Warehouse Location'} }, true) });
		tmp.newDiv.setStyle({cursor:'pointer'});
		tmp.newDiv.observe('dblclick', function(event){
			tmp.allClosed = true;
			$$('.row.product-content-row').each(function(item){
				if(item.visible())
					tmp.allClosed = false;
			});
			if(tmp.allClosed) {
				$$('.row.product-content-row').each(function(item){
					item.show();
				});
			} else {
				$$('.row.product-content-row').each(function(item){
					item.hide();
				});
			};
			return false;
		});
		tmp.productListDiv.insert({'bottom': tmp.newDiv = tmp.me._getNewProductRow()});
		return new Element('div', {'class': 'panel panel-warning'}).insert({'bottom':  tmp.productListDiv});
	}
	/**
	 * Getting each product row
	 */
	,_getProductRow: function(orderItem, isTitleRow) {
		var tmp = {};
		tmp.me = this;
		tmp.isTitle = (isTitleRow || false);
		tmp.EANcodeEl = new Element('div', {'class': 'form-group'} )
			.insert({'bottom': new Element('input', {'class': 'form-control', 'save-item': 'EANcode', 'placeholder': 'EAN code', 'type': 'text', 'value': orderItem.product.codes ? (orderItem.product.codes.EAN ? orderItem.product.codes.EAN : '') : ''}) })
			.observe('keydown', function(event){
				tmp.txtBox = $(this);
				tmp.me.keydown(event, function() {
					tmp.txtBox.up('.product-head-row').down('[save-item="UPCcode"]').select();
				});
			})
			.observe('change', function(event){
				tmp.txtBox = $(this);
				tmp.rowData = tmp.txtBox.up('.item_row.list-group-item').retrieve('data');
				tmp.rowData.EANcode = $F(tmp.txtBox.down('[save-item]') );
				if(tmp.rowData.EANcode)
					tmp.txtBox.up('.item_row.list-group-item').store('data',tmp.rowData);
			})
			.observe('click', function(event){
				Event.stop(event);
				$(this).select();
			});
		tmp.UPCcodeEl = new Element('div', {'class': 'form-group'} )
			.insert({'bottom': new Element('input', {'class': 'form-control', 'save-item': 'UPCcode', 'placeholder': 'UPC code', 'type': 'text', 'value': orderItem.product.codes ? (orderItem.product.codes.UPC ? orderItem.product.codes.UPC : '') : ''}) })
			.observe('keydown', function(event){
				tmp.txtBox = $(this);
				tmp.me.keydown(event, function() {
					tmp.txtBox.up('.item_row').down('[save-item="wareLocation"]').select();
				});
			})
			.observe('change', function(event){
				tmp.txtBox = $(this);
				tmp.rowData = tmp.txtBox.up('.item_row.list-group-item').retrieve('data');
				tmp.rowData.UPCcode = $F(tmp.txtBox.down('[save-item]') );
				if(tmp.rowData.UPCcode)
					tmp.txtBox.up('.item_row.list-group-item').store('data',tmp.rowData);
			})
			.observe('click', function(event){
				Event.stop(event);
				$(this).select();
			});
		tmp.wareLocationEL = new Element('div', {'class': 'form-group'} )
			.insert({'bottom': new Element('input', {'class': 'form-control', 'save-item': 'wareLocation', 'placeholder': 'Warehouse Location', 'type': 'text', 'value': orderItem.product.locations ? (orderItem.product.warehouseLocation ? orderItem.product.warehouseLocation : '') : ''}) })
			.observe('keydown', function(event){
				tmp.txtBox = $(this);
				tmp.me.keydown(event, function() {
					tmp.txtBox.up('.item_row').down('[scanned-item="serialNo"]').select();
				});
			})
			.observe('change', function(event){
				tmp.txtBox = $(this);
				tmp.rowData = tmp.txtBox.up('.item_row.list-group-item').retrieve('data');
				tmp.rowData.warehouseLocation = $F(tmp.txtBox.down('[save-item]') );
				if(tmp.rowData.UPCcode)
					tmp.txtBox.up('.item_row.list-group-item').store('data',tmp.rowData);
			})
			.observe('click', function(event){
				Event.stop(event);
				$(this).select();
			});
		if(tmp.me._canReceive() !== true) {
			tmp.EANcodeEl.down('input[save-item=EANcode]').disabled = true;
			tmp.UPCcodeEl.down('input[save-item=UPCcode]').disabled = true;
			tmp.wareLocationEL.down('input[save-item=wareLocation]').disabled = true;
			orderItem.btns = '';
		}
		tmp.row = new Element((tmp.isTitle === true ? 'strong' : 'div'), {'class': 'item_row list-group-item'})
			.store('data', orderItem.product)
			.insert({'bottom': tmp.infoRow = new Element('div', {'class': tmp.isTitle ? 'row btn-hide-row' : 'row btn-hide-row product-head-row'})
				.insert({'bottom': new Element('span', {'class': ' col-sm-2 productName'})
					.insert({'bottom': orderItem.product.name ? orderItem.product.name : orderItem.product.barcode })
				})
				.insert({'bottom': new Element('span', {'class': 'col-sm-1'})
					.insert({'bottom': new Element('span', {'class': 'scannedQty'}).update(tmp.isTitle === true ? 'Qty': (!orderItem.product.id ? '' : (orderItem.product.purchaseOrderItem ? orderItem.product.purchaseOrderItem.receivedQty : 0))) })
					.insert({'bottom': new Element('span', {'class': 'orderedQty'}).update(orderItem.product.purchaseOrderItem ? '/' + orderItem.product.purchaseOrderItem.qty : '') })
				})
				.insert({'bottom': new Element('span', {'class': ' col-sm-2 EANcode'})
					.update(orderItem.product.id ? tmp.EANcodeEl : orderItem.product.EANcode)
				})
				.insert({'bottom': new Element('span', {'class': ' col-sm-2 UPCcode'})
					.update(orderItem.product.id ? tmp.UPCcodeEl : orderItem.product.UPCcode)
				})
				.insert({'bottom': new Element('span', {'class': ' col-sm-2 wareLocation'})
					.update(orderItem.product.id ? tmp.wareLocationEL : orderItem.product.wareLocation)
				})
				.insert({'bottom': tmp.btns = new Element('span', {'class': 'btns col-sm-1'}).update(orderItem.btns ? orderItem.btns : '') })
			});
			tmp.infoRow.insert({'top': new Element('span', {'class': 'col-sm-2 productSku'}).update(orderItem.product.sku ? orderItem.product.sku : '') });
		if(orderItem.scanTable && tmp.me._canReceive() === true) {
			tmp.row.insert({'bottom': new Element('div', {'class': 'row product-content-row'})
				.insert({'bottom': new Element('span', {'class': 'col-sm-10 col-sm-offset-2'}).update(orderItem.scanTable) })
			});
		}
		
		return tmp.row;
	}
	/**
	 * Getting the new product row
	 */
	,_getNewProductRow: function() {
		var tmp = {};
		tmp.me = this;
		tmp.skuAutoComplete = tmp.me._getNewProductProductAutoComplete();
		tmp.data = {
			'product': {'name': tmp.skuAutoComplete	}
			,'btns': ''
		};
		tmp.newRow = tmp.me._getProductRow(tmp.data, false).addClassName('new-order-item-input list-group-item-warning').removeClassName('order-item-row btn-hide-row');
		if(tmp.me._canReceive() !== true)
			tmp.newRow.hide();
		return tmp.newRow
	}
	/**
	 * Getting the autocomplete input box for product
	 */
	,_getNewProductProductAutoComplete: function() {
		var tmp = {};
		tmp.me = this;
		tmp.skuAutoComplete = tmp.me._getFormGroup( null, new Element('div', {'class': 'input-group input-group-sm product-autocomplete'})
			.insert({'bottom': new Element('input', {'id': tmp.me._htmlIds.barcodeInput, 'class': 'form-control search-txt visible-xs visible-sm visible-md visible-lg', 'new-order-item': 'product', 'required': 'Required!', 'placeholder': 'Enter BARCODE for products'})
				.observe('keydown', function(event){
					tmp.txtBox = this;
					tmp.me.keydown(event, function() {
						$(tmp.txtBox).up('.product-autocomplete').down('.search-btn').click();
					});
					tmp.me.keydown(event, function() {
						$(tmp.txtBox).up('.product-autocomplete').down('.search-btn').click();
					}, null, 9);
					return false;
				})
			})
			.insert({'bottom': new Element('span', {'class': 'input-group-btn'}) 
				.insert({'bottom': new Element('span', {'class': ' btn btn-primary search-btn' , 'data-loading-text': 'searching...'})
					.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-search'}) })
					.observe('click', function(){
						tmp.me._searchProduct(this);
					})
				})
			}) 
		);
		tmp.skuAutoComplete.down('.input-group').removeClassName('form-control');
		return tmp.skuAutoComplete;
	}
	,_getScanTableROW: function(item, isTitle) {
		var tmp = {};
		tmp.me = this;
		tmp.tag = isTitle === true ? 'th' : 'td';
		tmp.newDiv = new Element('tr', {'class': isTitle === true ? '' : 'scanned-item-row'}).store('data', item)
			.insert({'bottom': new Element(tmp.tag, {'class': 'col-sm-1'}).update(item.qty ? item.qty : '') })
			.insert({'bottom': new Element(tmp.tag).update(item.serialNo ? item.serialNo : '') })
			.insert({'bottom': new Element(tmp.tag).update(item.unitPrice ? item.unitPrice : '') })
			.insert({'bottom': new Element(tmp.tag).update(item.invoiceNo ? item.invoiceNo : '') })
			.insert({'bottom': new Element(tmp.tag).update(item.comments ? item.comments : '') })
			.insert({'bottom': new Element(tmp.tag, {'class': 'btns'}).update(item.btns ? item.btns : '') });
		return tmp.newDiv;
	}
	,_getScanTable: function(product) {
		var tmp = {};
		tmp.me = this;
		tmp.table = new Element('table', {'class': 'table scanTable'})
			.insert({'bottom': new Element('thead').update(tmp.me._getScanTableROW({'qty': 'Qty', 'serialNo': 'Serial No.', 'unitPrice': 'Unit Price (Ex)', 'invoiceNo': 'Inv. No.', 'comments': 'Comments', 'btns': ''}, true)) })
			.insert({'bottom': new Element('tbody')
				.insert({'bottom': tmp.me._getScanTableROW({
						'qty': tmp.me._getFormGroup('',new Element('input', {'class': 'form-control', 'scanned-item': 'qty', 'type': 'text', 'placeholder': 'How many you received.', 'required': true, 'value': 1})
							.observe('change', function() {
								tmp.serialNoBox = $(this).up('.scanned-item-row').down('[scanned-item=serialNo]');
								if($F(this) > 1) {
									tmp.serialNoBox.setValue('No S/N, as qty > 1').disabled = true;
								} else {
									tmp.serialNoBox.setValue('').disabled = false;
									tmp.serialNoBox.select();
								}
							})
						), 
						'serialNo': tmp.me._getFormGroup('',new Element('input', {'class': 'form-control', 'scanned-item': 'serialNo', 'type': 'text', 'placeholder': 'Serial Number:', 'required': true})), 
						'unitPrice': tmp.me._getFormGroup('', new Element('input', {'class': 'form-control', 'scanned-item': 'unitPrice', 'type': 'value', 'placeholder': 'Unit Price:', 'validate_currency': 'Invalid currency', 'value': product.purchaseOrderItem ? tmp.me.getValueFromCurrency(tmp.me.getCurrency(product.purchaseOrderItem.unitPrice)) : ''})), 
						'invoiceNo': tmp.me._getFormGroup('', new Element('input', {'class': 'form-control', 'scanned-item': 'invoiceNo', 'type': 'text', 'placeholder': 'Inv. No.:'})), 
						'comments': tmp.me._getFormGroup('', new Element('input', {'class': 'form-control', 'scanned-item': 'comments', 'type': 'text', 'placeholder': 'Comments:'})), 
						'btns': new Element('span', {'class': 'btn-group btn-group-sm pull-right'})
								.insert({'bottom': new Element('span', {'class': 'scanned-item-save-btn btn btn-primary'})
									.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-floppy-saved'}) })
									.observe('click', function() {
										tmp.currentRow = $(this).up('.scanned-item-row');
										tmp.data = tmp.me._collectFormData(tmp.currentRow, 'scanned-item');
										if(tmp.data !== null) {
											tmp.newRow = tmp.currentRow.clone(true);
											tmp.newDeleteBtn = new Element('td')
												.insert({'bottom': new Element('span', {'class': 'scanned-item-delte-btn btn btn-danger btn-xs pull-right'}) 
													.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-trash'}) })
													.observe('click', function(event) {
														if(!confirm('You are about to remove this entry.\n\nContinue?'))
															return;
														$(this).up('.item_row').down('.product-head-row .scannedQty').innerHTML--;
														if ($(this).up('.item_row').down('.product-head-row .scannedQty').innerHTML > product.purchaseOrderItem.qty || !$(this).up('.item_row').down('.product-head-row .scannedQty').innerHTML)
															$(this).up('.item_row').down('.product-head-row .scannedQty').setStyle({color: 'red'});
														else
															$(this).up('.item_row').down('.product-head-row .scannedQty').setStyle({color: 'inherit'});
														if($(this).up('.item_row').down('.product-head-row .scannedQty').innerHTML == 0)
															$(this).up('.item_row').down('.product-head-row .scannedQty').setStyle({color: 'red'});
														$(this).up('.scanned-item-row').remove();
													})
												});
											tmp.newRow.removeClassName('warning new-scan-row').addClassName('btn-hide-row');
											tmp.newRow.down('.scanned-item-save-btn').remove();
											tmp.newRow.down('.btns').replace(tmp.newDeleteBtn);
											
											tmp.currentRow.insert({'after': tmp.newRow});
											tmp.currentRow.down('input[scanned-item=comments]').clear();
											tmp.currentRow.down('input[scanned-item=serialNo]').clear().focus();
											
											$(this).up('.item_row').down('.scannedQty').innerHTML++;
											if ($(this).up('.item_row').down('.product-head-row .scannedQty').innerHTML > product.purchaseOrderItem.qty || !$(this).up('.item_row').down('.product-head-row .scannedQty').innerHTML)
												$(this).up('.item_row').down('.product-head-row .scannedQty').setStyle({color: 'red'});
											else
												$(this).up('.item_row').down('.product-head-row .scannedQty').setStyle({color: 'inherit'});
										}
									})
							})
							.insert({'bottom': new Element('span', {'class': 'scanned-item-delete-btn btn btn-default'})
								.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-floppy-remove'}) })
								.observe('click', function() {
									if(!confirm('You about to clear this entry. All input data for this entry will be lost.\n\nContinue?'))
										return;
									
									tmp.row = $(this).up('.scanned-item-row');
									
									tmp.serialNoBox = tmp.row.down('input[scanned-item=serialNo]');
									tmp.unitPriceBox = tmp.row.down('input[scanned-item=unitPrice]');
									tmp.invoiceNoBox = tmp.row.down('input[scanned-item=invoiceNo]');
									tmp.commentsBox = tmp.row.down('input[scanned-item=comments]');
									
									tmp.serialNoBox.clear();
									tmp.unitPriceBox.clear();
									tmp.invoiceNoBox.clear();
									tmp.commentsBox.clear();
									
									tmp.serialNoBox.focus();
								})
							})
					}).addClassName('warning')
				})
			});
		return tmp.table;
	}
	/**
	 * Ajax: searching the product based on a string
	 */
	,_searchProduct: function(btn) {
		var tmp = {};
		tmp.me = this;
		tmp.btn = btn;
		tmp.me._signRandID(tmp.btn);
		tmp.searchTxtBox = $(tmp.btn).up('.product-autocomplete').down('.search-txt');
		tmp.searchTxt = $F(tmp.searchTxtBox);
		if (!tmp.searchTxt)
			return;
		tmp.currentRow = $(btn).up('.new-order-item-input');
		tmp.product = {
				'name': ''
				,'id' : ''
				,'qty': 0
				,'barcode': tmp.searchTxt
		};
		tmp.data = {
				'product': tmp.product, 
				'btns': new Element('span', {'class': 'pull-right'})
					.insert({'bottom': new Element('span', {'class': 'btn btn-danger btn-xs'})
					.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-trash'}) })
					.observe('click', function(event) {
						Event.stop(event);
						if(!confirm('You are about to remove this entry.\n\nContinue?'))
							return;
						tmp.row = $(this).up('.item_row');
						tmp.row.remove();
					})
				})
			};
		tmp.currentRow.insert({'after': tmp.lastRow = tmp.me._getProductRow(tmp.data, false) });
		tmp.newRow = tmp.me._getNewProductRow();
		tmp.currentRow.replace(tmp.newRow);
		tmp.newRow.down('[new-order-item=product]').focus();
		
		tmp.inputBox = jQuery('#' + tmp.me._htmlIds.barcodeInput);
		
		tmp.me.postAjax(tmp.me.getCallbackId('searchProduct'), {'searchTxt': tmp.searchTxt}, {
			'onLoading': function() {
				jQuery('#' + tmp.me._htmlIds.barcodeInput).button('loading');
			}
			,'onSuccess': function(sender, param) {
				tmp.resultList = new Element('div', {'style': 'overflow: auto; max-height: 400px;'});
				try {
					tmp.result = tmp.me.getResp(param, false, true);
					if(!tmp.result || !tmp.result.items || tmp.result.items.size() === 0) {
						tmp.lastRow.down('.productSku').insert({'bottom': new Element('strong', {'class': 'text-danger'}).update('No Product Found!') });
						tmp.lastRow.down('.productName').insert({'top': new Element('span', {'class': ''}).update('Barcode: ') });
						throw 'Nothing Found for: ' + tmp.searchTxt;
					}
					if(tmp.result.items.size()>1) {
						tmp.searchTxtBox = tmp.newRow.down('.search-txt');
						tmp.resultList = new Element('div', {'style': 'overflow: auto; max-height: 400px;', 'class': 'selectProductPanel'});
						tmp.result.items.each(function(product) {
							tmp.resultList.insert({'bottom': tmp.me._getSearchPrductResultRow(product, tmp.searchTxtBox,tmp.lastRow,tmp.newRow) });
						});
						tmp.resultList.addClassName('list-group'); 
						tmp.me.showModalBox('Products that has: ' + tmp.searchTxt, tmp.resultList, false);
						return tmp.me;
					}
						tmp.data.product = tmp.result.items[0];
						tmp.me._selectProduct(tmp.data.product,tmp.lastRow,tmp.newRow);
				} catch(e) {
					tmp.resultList.update(tmp.me.getAlertBox('Error: ', e).addClassName('alert-danger'));
				}
			}
			,'onComplete': function(sender, param) {
				jQuery('#' + tmp.me._htmlIds.barcodeInput).button('reset');
			}
		});
		return tmp.me;
	}
	,_selectProduct: function(product,lastRow) {
		var tmp = {};
		tmp.me = this;
		tmp.data = [];
		tmp.product = product;
		tmp.lastRow = lastRow;
		
		tmp.btn = $('barcode_input');
		tmp.me._signRandID(tmp.btn);
		
		tmp.data = {
				'product': tmp.product, 
				'btns': new Element('span', {'class': 'pull-right'})
					.insert({'bottom': new Element('span', {'class': 'btn btn-danger btn-xs'})
					.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-trash'}) })
					.observe('click', function(event) {
						Event.stop(event);
						if(!confirm('You are about to remove this entry.\n\nContinue?'))
							return;
						tmp.row = $(this).up('.item_row');
						tmp.row.remove();
					})
				}),
				'qty': 0,
			};
		tmp.data.scanTable = tmp.me._getScanTable(tmp.data.product);
		tmp.lastRow.replace(tmp.newRow = tmp.me._getProductRow(tmp.data, false) );
		
		tmp.me._checkProduct(tmp.product, tmp.newRow.down('.product-head-row'));
		
		tmp.newRow.down('[save-item="EANcode"]').select();
		
		tmp.me._focusNext(tmp.newRow,'serialNo','unitPrice');
		tmp.me._focusNext(tmp.newRow,'unitPrice','invoiceNo');
		tmp.me._focusNext(tmp.newRow,'invoiceNo','comments');
		
		tmp.newRow.down('.product-head-row').setStyle({cursor: 'pointer'});
		tmp.newRow.down('.product-head-row').observe('click', function(event){
			if(tmp.newRow.down('.product-content-row'))
				tmp.newRow.down('.product-content-row').toggle();
		});
		
		tmp.serialNoBox = tmp.newRow.down('input[scanned-item=serialNo]');
		if(tmp.serialNoBox) {
			tmp.serialNoBox.observe('keydown', function(event){
				tmp.me.keydown(event, function() {
					if(!$F(tmp.serialNoBox).blank() && !$F(tmp.unitPriceBox).blank() && !$F(tmp.invoiceNoBox).blank() ) {
						tmp.newRow.down('.scanned-item-save-btn span').click();
					}
				});
				return false;
			});
			tmp.serialNoBox.up('.scanned-item-row').addClassName('new-scan-row');
		}
		tmp.unitPriceBox = tmp.newRow.down('input[scanned-item=unitPrice]');
		if(tmp.unitPriceBox)
			tmp.unitPriceBox.observe('keydown', function(event){
				tmp.me.keydown(event, function() {
					if(!$F(tmp.serialNoBox).blank() && !$F(tmp.unitPriceBox).blank() && !$F(tmp.invoiceNoBox).blank() ) {
						tmp.newRow.down('.scanned-item-save-btn span').click();
					}
				});
				return false;
			});
		tmp.invoiceNoBox = tmp.newRow.down('input[scanned-item=invoiceNo]');
		if(tmp.invoiceNoBox)
			tmp.invoiceNoBox.observe('keydown', function(event){
				tmp.me.keydown(event, function() {
					if(!$F(tmp.serialNoBox).blank() && !$F(tmp.unitPriceBox).blank() && !$F(tmp.invoiceNoBox).blank() ) {
						tmp.newRow.down('.scanned-item-save-btn span').click();
					}
				});
				return false;
			});
		tmp.commentsBox = tmp.newRow.down('input[scanned-item=comments]');
		if(tmp.commentsBox)
			tmp.commentsBox.observe('keydown', function(event){
				tmp.me.keydown(event, function() {
					if(!$F(tmp.serialNoBox).blank() && !$F(tmp.unitPriceBox).blank() && !$F(tmp.invoiceNoBox).blank() ) {
						tmp.newRow.down('.scanned-item-save-btn span').click();
					}
				});
				return false;
			});
		tmp.me._scanRowAutoSave(tmp.newRow);
		return tmp.me;
	}
	,_scanRowAutoSave: function(row) {
		var tmp = {};
		tmp.me = this;
		tmp.row = row;
		if(tmp.row.down('[scanned-item="comments"]'))
			tmp.row.down('[scanned-item="comments"]').observe('keydown', function(event){
				tmp.me.keydown(event, function() {
					tmp.row.down('.scanned-item-save-btn').click();
				});
				return false;
			});
		return tmp.me;
	}
	,_focusNext: function(row,from,to) {
		var tmp = {};
		tmp.me = this;
		tmp.row = row;
		tmp.from = from;
		tmp.to = to;
		if(tmp.row.down('[scanned-item="' + tmp.from + '"]')) {
			tmp.row.down('[scanned-item="' + tmp.from + '"]').observe('keydown', function(event){
				tmp.me.keydown(event, function() {
					tmp.row.down('[scanned-item="' + tmp.to + '"]').select();
				});
				return false;
			});
		}
		return tmp.me;
	}
	,_checkProduct: function(product, row) {
		var tmp = {};
		tmp.me = pageJs;
		tmp.newRow = row;
		tmp.product = product;
		tmp.btn = $('barcode_input');
		tmp.me._signRandID(tmp.btn);
		tmp.me.postAjax(tmp.me.getCallbackId('checkProduct'), {'product': tmp.product, 'purchaseOrder': tmp.me._purchaseOrder}, {
			'onLoading': function(sender, param) {
				jQuery('#' + tmp.btn.id).button('loading');
			}
			,'onSuccess': function(sender, param) {
				try {
					tmp.result = tmp.me.getResp(param, false, true);
					if (tmp.result.count == 0) {
						tmp.newRow.down('.productSku').insert({'bottom': new Element('strong', {'style': 'color:red'}).update('  (Not found in PO)') });
						tmp.newRow.up('.item_row').addClassName('not-in-po');
					}
				} catch(e) {
					tmp.me.showModalBox('Error!', e, false);
				}
			}
			,'onComplete': function(sender, param) {
				jQuery('#' + tmp.btn.id).button('reset');
			}
		});
	}
	,_canReceive: function (){
		var tmp = {};
		tmp.me = this;
		return (tmp.me._purchaseOrder.status === 'RECEIVING' || tmp.me._purchaseOrder.status === 'ORDERED');
	}
	/**
	 * Getting the save btn for this order
	 */
	,_saveBtns: function() {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('span', {'class': 'btn-group pull-right'})
			.insert({'bottom': new Element('span', {'class': 'btn btn-primary', 'data-loading-text' : 'saving...'})
				.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-ok-circle'}) })
				.insert({'bottom': new Element('span').update(' save ') })
				.observe('click', function() {
					tmp.me._submitOrder($(this));
				})
			})
			.insert({'bottom': new Element('span', {'class': 'btn btn-default'})
				.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-remove-sign'}) })
				.insert({'bottom': new Element('span').update(' cancel ') })
				.observe('click', function(){
					tmp.me.showModalBox('<strong class="text-danger">Cancelling this PO receiving</strong>', 
							'<div>You are about to cancel this receiving process, all input data will be lost.</div><br /><div>Continue?</div>'
							+ '<div>'
								+ '<span class="btn btn-primary" onclick="window.location = document.URL;"><span class="glyphicon glyphicon-ok"></span> YES</span>'
								+ '<span class="btn btn-default pull-right" data-dismiss="modal"><span aria-hidden="true"><span class="glyphicon glyphicon-remove-sign"></span> NO</span></span>'
							+ '</div>',
					true);
				})
			})
		;
		return tmp.newDiv;
	}
	/**
	 * Ajax: collect data and post ajax
	 */
	,_submitOrder: function(btn) {
		var tmp = {};
		tmp.me = this;
		tmp.btn = btn;
		tmp.data = tmp.me._collectFormData($(tmp.me._htmlIds.itemDiv),'save-order');
		tmp.data.purchaseOrder = tmp.me._purchaseOrder;
		tmp.data.products = {};
		tmp.data.products.matched = [];
		tmp.data.products.notMatched = [];
		$(tmp.me._htmlIds.partsTable).getElementsBySelector('div.item_row').each(function(item) {
			if(!item.hasClassName('new-order-item-input')) {
				if(item.retrieve('data').id !== '') {
					tmp.scanData = [];
					item.getElementsBySelector('.table.scanTable .scanned-item-row').each(function(scanItem) {
						if(!scanItem.hasClassName('new-scan-row')){
							tmp.scanData.push(tmp.me._collectFormData(scanItem,'scanned-item'));
						}
					});
          tmp.data.products.matched.push({'product':item.retrieve('data'),'serial':tmp.scanData});
				} else {
					tmp.data.products.notMatched.push(item.retrieve('data'));
				}
			}
		});
		if(tmp.data === null)
			return tmp.me;
		if( (tmp.data.products.matched.size() + tmp.data.products.notMatched.size()) <= 0) {
			tmp.me.showModalBox('<strong class="text-danger">Error</strong>', 'At least one item is needed!', true);
			return tmp.me;
		}
		tmp.me._signRandID(tmp.btn);
		tmp.me.postAjax(tmp.me.getCallbackId('saveOrder'), tmp.data, {
			'onLoading': function(sender, param) {
				jQuery('#' + tmp.btn.id).button('loading');
			}
			,'onSuccess': function(sender, param) {
				try {
					tmp.result = tmp.me.getResp(param, false, true);
					if(!tmp.result || !tmp.result.item)
						return;
					if(tmp.result.item.status === 'RECEIVING') {
						tmp.me.showModalBox('<strong class="text-success">Success!</strong>', 
							'<div>The current receiving process is succussed and saved.</div><br /><div><strong>There are more to go, Another One?</strong></div>'
							+ '<div>'
								+ '<span class="btn btn-primary" onclick="window.location = document.URL;"><span class="glyphicon glyphicon-ok"></span> YES</span>'
								+ '<span class="btn btn-default pull-right" data-dismiss="modal"><span aria-hidden="true"><span class="glyphicon glyphicon-remove-sign"></span> NO</span></span>'
							+ '</div>',
							true);
					} else {
						tmp.me.showModalBox('<strong class="text-success">Success!</strong>', '<h3>Saved successfully</h3>', true);
						window.location = document.URL;
					}
				} catch(e) {
					tmp.me.showModalBox('Error!', e, false);
				}
			}
			,'onComplete': function(sender, param) {
				jQuery('#' + tmp.btn.id).button('reset');
			}
		});
		return tmp.me;
	}
	/**
	 * Getting the search product result row
	 */
	,_getSearchPrductResultRow: function(product, searchTxtBox,lastRow,newRow) {
		var tmp = {};
		tmp.me = this;
		tmp.lastRow = lastRow;
		tmp.newRow = newRow;
		tmp.defaultImgSrc = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZWVlIi8+PHRleHQgdGV4dC1hbmNob3I9Im1pZGRsZSIgeD0iMzIiIHk9IjMyIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjEycHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+NjR4NjQ8L3RleHQ+PC9zdmc+';
		tmp.newRow = new Element('a', {'class': 'list-group-item', 'href': 'javascript: void(0);'})
			.insert({'bottom': new Element('div', {'class': 'row'})
				.insert({'bottom': new Element('div', {'class': 'col-xs-2'})
					.insert({'bottom': new Element('div', {'class': 'thumbnail'})
						.insert({'bottom': new Element('img', {'data-src': 'holder.js/100%x64', 'alert': 'Product Image', 'src': product.images.size() === 0 ? tmp.defaultImgSrc : product.images[0].asset.url}) })
					})
				})
				.insert({'bottom': new Element('div', {'class': 'col-xs-10'})
					.insert({'bottom': new Element('div', {'class': 'row'})
						.insert({'bottom': new Element('strong').update(product.name)
							.insert({'bottom': new Element('small', {'class': '', 'style': 'padding-left: 10px;'}).update('SKU: ' + product.sku) })
						})
						.insert({'bottom': new Element('div')
							.insert({'bottom': new Element('small').update(product.shortDescription) })
						})
					})
					
				})
			})
			.observe('click', function(){
				tmp.inputRow = $(searchTxtBox).up('.new-order-item-input').store('product', product);
				tmp.me._selectProduct(product,tmp.lastRow,tmp.newRow);
				jQuery('#' + tmp.me.modalId).modal('hide');
				$$('[scanned-item="serialNo"]').first().focus();
			})
			;
		return tmp.newRow;
	}
	,init: function(selectedPO) {
		var tmp = {};
		tmp.me = this;
		if(selectedPO) {
			tmp.me.selectPO(selectedPO);
		} else {
			$(tmp.me._htmlIds.itemDiv).update(tmp.me._getPOListPanel()).down('.init-focus').focus();
		}
	}
});

