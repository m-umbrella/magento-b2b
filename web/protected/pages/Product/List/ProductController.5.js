/**
 * The page Js file
 */
var PageJs = new Class.create();
PageJs.prototype = Object.extend(new CRUDPageJs(), {
	manufactures: []
	,suppliers: []
	,productCategories: []
	,_getTitleRowData: function() {
		return {'sku': 'SKU', 'name': 'Product Name', 'active': 'act?'};
	}
	,_loadManufactures: function(manufactures) {
		this.manufactures = manufactures;
		var tmp = {};
		tmp.me = this;
		tmp.selectionBox = $(tmp.me.searchDivId).down('#productBrandId');
		tmp.me.manufactures.each(function(option) {
			tmp.selectionBox.insert({'bottom': new Element('option',{'value': option.id}).update(option.name) });
		});
		return this;
	}
	,_loadSuppliers: function(suppliers) {
		this.suppliers = suppliers;
		var tmp = {};
		tmp.me = this;
		tmp.selectionBox = $(tmp.me.searchDivId).down('#productSupplierId');
		tmp.me.suppliers.each(function(option) {
			tmp.selectionBox.insert({'bottom': new Element('option',{'value': option.id}).update(option.name) });
		});
		return this;
	}
	,_loadProductCategories: function(productCategories) {
		this.productCategories = productCategories;
		var tmp = {};
		tmp.me = this;
		tmp.selectionBox = $(tmp.me.searchDivId).down('#productCategoryId');
		tmp.me.productCategories.each(function(option) {
			tmp.selectionBox.insert({'bottom': new Element('option',{'value': option.id}).update(option.name) });
		});
		return this;
	}
	,_priceMatching: function(row) {
		var tmp = {};
		tmp.me = this;
		tmp.row = $(tmp.me.resultDivId).down('tbody').down('.item_row[item_id=' + row.id + ']');
		//tmp.me.postAjax(tmp.me.getCallbackId('deleteItems'), {'ids': [row.id]}, {});
		//console.debug(row.price);
		return tmp.me;
	}
	,_loadChosen: function () {
		$$(".chosen").each(function(item) {
			item.store('chosen', new Chosen(item, {
				disable_search_threshold: 10,
				no_results_text: "Oops, nothing found!",
				width: "95%"
			}) );
		});
		return this;
	}
	,openToolsURL: function(url, refreshFunc) {
		var tmp = {};
		tmp.me = this;
		tmp.options = {
				'width'			: '95%',
				'height'		: '95%',
				'autoScale'     : false,
				'autoDimensions': false,
				'fitToView'     : false,
				'autoSize'      : false,
				'type'			: 'iframe',
				'href'			: url
	 		};
		if(typeof(refreshFunc) === 'function') {
			tmp.options.beforeClose = refreshFunc;
		}
		jQuery.fancybox(tmp.options);
		return tmp.me;
	}
	,iframeSrc: function(url){
		var tmp = {};
		tmp.me = this;
	    $('productTrend').src = url;
	    $('productTrend').src = $('productTrend').src;
		return tmp.me;
	}
	,priceMatchResult: function(id){
		var tmp = {};
		tmp.me = this;
		console.debug(id);
		return tmp.me;
	}
	,_getEditPanel: function(row) {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('tr', {'class': 'save-item-panel info'}).store('data', row)
			.insert({'bottom': new Element('input', {'type': 'hidden', 'save-item-panel': 'id', 'value': row.id ? row.id : ''}) })
			.insert({'bottom': new Element('td', {'class': 'form-group'})
				.insert({'bottom': new Element('input', {'required': true, 'class': 'form-control', 'placeholder': 'The SKU of Product', 'save-item-panel': 'sku', 'value': row.sku ? row.sku : ''}) })
			})
			.insert({'bottom': new Element('td', {'class': 'form-group'})
				.insert({'bottom': new Element('input', {'class': 'form-control', 'placeholder': 'The Product Name of the Product', 'save-item-panel': 'name', 'value': row.name ? row.name : ''}) })
			})
			.insert({'bottom': new Element('td', {'class': 'form-group'})
				.insert({'bottom': new Element('input', {'type': 'checkbox', 'class': 'form-control', 'save-item-panel': 'active', 'checked': row.active}) })
			})
			.insert({'bottom': new Element('td', {'class': 'text-right'})
				.insert({'bottom':  new Element('span', {'class': 'btn-group btn-group-sm'})
					.insert({'bottom': new Element('span', {'class': 'btn btn-success', 'title': 'Save'})
						.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-ok'}) })
						.observe('click', function(){
							tmp.btn = this;
							tmp.me._saveItem(tmp.btn, $(tmp.btn).up('.save-item-panel'), 'save-item-panel');
						})
					})
					.insert({'bottom': new Element('span', {'class': 'btn btn-danger', 'title': 'Delete'})
						.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-remove'}) })
						.observe('click', function(){
							if(row.id)
								$(this).up('.save-item-panel').replace(tmp.me._getResultRow(row).addClassName('item_row').writeAttribute('item_id', row.id));
							else
								$(this).up('.save-item-panel').remove();
						})
					})
				})
			})
		return tmp.newDiv;
	}
	
	,_getResultRow: function(row, isTitle) {
		var tmp = {};
		tmp.me = this;
		tmp.tag = (tmp.isTitle === true ? 'th' : 'td');
		tmp.isTitle = (isTitle || false);
		tmp.row = new Element('tr', {'class': (tmp.isTitle === true ? '' : 'product_item'), 'product_id' : row.id}).store('data', row)
			.insert({'bottom': new Element(tmp.tag, {'class': 'sku'}).update(row.sku) 
				.observe('click', function(){
					tmp.me.priceMatchResult(row.sku);
					tmp.me.postAjax(tmp.me.getCallbackId('priceMatching'), {'id': row.id}, {});
				})
			})
			.insert({'bottom': new Element(tmp.tag, {'class': 'name'}).update(row.name) })
			.insert({'bottom': new Element(tmp.tag, {'class': 'product_active col-xs-1'})
				.insert({'bottom': (tmp.isTitle === true ? row.active : new Element('input', {'type': 'checkbox', 'disabled': false, 'checked': row.active})
					.observe('click', function(){
						tmp.active = $(this).checked;
					})
				) })
			})
			.insert({'bottom': new Element(tmp.tag, {'class': 'text-right btns col-xs-2'}).update(
				tmp.isTitle === true ?  
				(new Element('span', {'class': 'btn btn-primary btn-xs', 'title': 'New'})
					.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-plus'}) })
					.insert({'bottom': ' NEW' })
					.observe('click', function(){
						$(this).up('thead').insert({'bottom': tmp.me._getEditPanel({}) });
					})
				)
				: (new Element('span', {'class': 'btn-group btn-group-xs'})
					.insert({'bottom': new Element('span', {'class': 'btn btn-default', 'title': 'Edit'})
						.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-pencil'}) })
						.observe('click', function(){
							tmp.me.openToolsURL('/product/' + row.id + '.html',
								function() {
									if($(tmp.me.resultDivId).down('.product_item[product_id=' + row.id + ']'))
										$(tmp.me.resultDivId).down('.product_item[product_id=' + row.id + ']').replace(tmp.me._getResultRow($$('iframe.fancybox-iframe').first().contentWindow.pageJs._item));
								}
							)
						})
					})
					.insert({'bottom': new Element('span', {'class': 'btn btn-default', 'title': 'Trend'})
						.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-cog'}) })
						.observe('click', function(){
							tmp.me.iframeSrc('/statics/product/pricetrend.html?productid=' + row.id);
						})
					}) ) 
			) })
		;
		return tmp.row;
	}
});