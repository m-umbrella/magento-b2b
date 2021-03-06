/**
 * The page Js file
 */
var PageJs = new Class.create();
PageJs.prototype = Object.extend(new DetailsPageJs(), {
	_manufacturers: []
	,_suppliers: []
	,_statuses: []
	,_priceTypes: []                         //pre defined data: productCodeType
	,_codeTypes: []                          //pre defined data: productCodeType
	,_locationTypes: []                          //pre defined data: locationTypes
	,_productTreeId: 'product_category_tree' //the html id of the tree
	,_imgPanelId: 'images_panel'             //the html id of the iamges panel
	/**
	 * Getting a form group for forms
	 */
	,_getFormGroup: function (label, input) {
		return new Element('div', {'class': 'form-group form-group-sm form-group-sm-label'})
			.insert({'bottom': new Element('label').update(label) })
			.insert({'bottom': input.addClassName('form-control') });
	}
	/**
	 * Set some pre defined data before javascript start
	 */
	,setPreData: function(manufacturers, suppliers, statuses, priceTypes, codeTypes, locationTypes) {
		this._manufacturers = manufacturers;
		this._suppliers = suppliers;
		this._statuses = statuses;
		this._priceTypes = priceTypes;
		this._codeTypes = codeTypes;
		this._locationTypes = locationTypes;
		return this;
	}
	/**
	 * General getting a selection box
	 */
	,_getSelBox: function(options, selectedValue) {
		var tmp = {};
		tmp.me = this;
		tmp.selBox = new Element('select');
		options.each(function(opt){
			tmp.selBox.insert({'bottom': new Element('option', {'value': opt.id, 'selected' : (selectedValue && opt.id === selectedValue ? true : false)}).update(opt.name) })
		});
		return tmp.selBox;
	}
	/**
	 * Getting the row for function: _getListPanel()
	 */
	,_getListPanelRow: function(data, selBoxData, titleData, isTitle, selBoxChangeFunc) {
		var tmp = {};
		tmp.me = this;
		tmp.isTitle = (isTitle || false);
		tmp.tag = (tmp.isTitle === true ? 'th' : 'td');
		tmp.typeString = titleData.type.toLowerCase();
		tmp.valueString = titleData.value.toLowerCase();
		tmp.randId = 'NEW_' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();
		
		tmp.newRow = new Element('tr')
			.insert({'bottom': new Element(tmp.tag).update(
					tmp.isTitle === true ? titleData.type : 
					tmp.me._getSelBox(selBoxData, (data[tmp.typeString] && data[tmp.typeString].id ? data[tmp.typeString].id : ''))
						.addClassName('form-control input-sm')
						.writeAttribute('list-panel-row', 'typeId')
						.writeAttribute('required', true)
						.writeAttribute('list-item', (data.id ? data.id : tmp.randId))
						.observe('change', function(event) {
							if(typeof(selBoxChangeFunc) === 'function')
								selBoxChangeFunc(event);
						})
						.wrap(new Element('div', {'class': 'form-group'}))
				)
			});
		if(data.id) {
			tmp.newRow.insert({'bottom': new Element('input', {'type': 'hidden', 'class': 'form-control', 'list-panel-row': 'id', 'value': (data.id) }) 
				.writeAttribute('list-item', (data.id ? data.id : tmp.randId))
			});
		}
		if(titleData.start) {
			tmp.newRow.insert({'bottom': new Element(tmp.tag).update( 
					tmp.isTitle === true ? titleData.start : 
						new Element('input', {'class': 'form-control input-sm datepicker', 'list-panel-row': 'start', 'value': (data.start ? data.start : ''), 'required': true, 'disabled': true, 'value': '0001-01-01 00:00:00'})
							.writeAttribute('list-item', (data.id ? data.id : tmp.randId))
							.wrap(new Element('div', {'class': 'form-group'}))
				)
			});
		}
		if(titleData.end){
			tmp.newRow.insert({'bottom': new Element(tmp.tag).update( tmp.isTitle === true ? titleData.end : 
				new Element('input', {'class': 'form-control input-sm datepicker', 'list-panel-row': 'end', 'value': (data.end ? data.end : ''), 'required': true, 'disabled': true, 'value': '9999-12-31 23:59:59'}) 
					.writeAttribute('list-item', (data.id ? data.id : tmp.randId))
					.wrap(new Element('div', {'class': 'form-group'}))
				) 
			});
		}
		tmp.inputBoxDiv = new Element('div', {'class': 'input-group input-group-sm'})
			.insert({'bottom': new Element('input', {'type': 'text', 'class': 'form-control', 'list-panel-row': 'value', 'required': true, 'value': (data[tmp.valueString] ? data[tmp.valueString]: '') })
				.writeAttribute('list-item', (data.id ? data.id : tmp.randId))
			})
			.insert({'bottom': new Element('input', {'type': 'hidden', 'class': 'form-control', 'list-panel-row': 'active', 'value': '1' }) 
				.writeAttribute('list-item', (data.id ? data.id : tmp.randId))
			})
			.insert({'bottom': new Element('span', {'class': 'btn btn-danger input-group-addon'})
				.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-trash'}) }) 
				.observe('click', function() {
					if(data.id) {
						$(this).up('.input-group').down('[list-panel-row=active]').value = '0';
						$(this).up('.list-panel-row').hide();
					} else {
						$(this).up('.list-panel-row').remove();
					}
				})
			});
		tmp.newRow.insert({'bottom': new Element(tmp.tag).update( tmp.isTitle === true ? titleData.value : tmp.inputBoxDiv.wrap(new Element('div', {'class': 'form-group'})) ) });
		return tmp.newRow;
	}
	/**
	 * General listing panel
	 */
	,_getListPanel: function(title, listData, titleData, selBoxData, selBoxChangeFunc) {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('div', {'class': 'panel panel-default'})
			.insert({'bottom': new Element('div', {'class': 'panel-heading'}) 
				.insert({'bottom': new Element('a', {'class': 'toggle-btn', 'href': 'javascript: void(0);', 'title': 'click show/hide content below'})
					.insert({'bottom': new Element('strong').update(title)})
					.observe('click', function() {
						$(this).up('.panel').down('.list-div').toggle();
					})
				})
				.insert({'bottom': new Element('span', {'class': 'btn btn-primary btn-xs pull-right', 'title': 'New'})
					.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-plus'}) })
					.insert({'bottom': ' NEW' })
					.observe('click', function(){
						tmp.parentPanel = $(this).up('.panel');
						tmp.parentPanel.down('.table tbody').insert({'bottom': tmp.me._getListPanelRow({}, selBoxData, titleData, false, selBoxChangeFunc).addClassName('list-panel-row').writeAttribute('item_id', '') });
						tmp.parentPanel.down('.list-div').show();
						tmp.me._bindDatePicker();
					})
				})
			})
			.insert({'bottom': new Element('div', {'class': 'list-div table-responsive'}) 
				.insert({'bottom': new Element('table', {'class': 'table table-condensed'}) 
					.insert({'bottom': new Element('thead').update( tmp.me._getListPanelRow(titleData, selBoxData, titleData, true, selBoxChangeFunc) ) })
					.insert({'bottom': tmp.listDiv = new Element('tbody') })
				})
			});
		if(listData) {
			listData.each(function(data){
				tmp.listDiv.insert({'bottom': tmp.me._getListPanelRow(data, selBoxData, titleData, false, selBoxChangeFunc).addClassName('list-panel-row').writeAttribute('item_id', data.id) });
			});
		}
		return tmp.newDiv;
	}
	/**
	 * Loading/Bind js to a textare to load rich Text editor
	 */
	,_loadRichTextEditor: function(input) {
		var tmp = {};
		tmp.me = this;
		tmp.me._signRandID(input);
		tmp.editor = new TINY.editor.edit('editor',{
			id: input.id,
			width: '100%',
			height: 100,
			cssclass: 'tinyeditor',
			controlclass: 'tinyeditor-control',
			rowclass: 'tinyeditor-header',
			dividerclass: 'tinyeditor-divider',
			controls: ['bold', 'italic', 'underline', 'strikethrough', '|', 'subscript', 'superscript', '|',
				'orderedlist', 'unorderedlist', '|', 'outdent', 'indent', '|', 'leftalign',
				'centeralign', 'rightalign', 'blockjustify', '|', 'unformat', '|', 'undo', 'redo', 'n',
				'font', 'size', 'style', '|', 'image', 'hr', 'link', 'unlink', '|', 'print'],
			footer: true,
			fonts: ['Verdana','Arial','Georgia','Trebuchet MS'],
			xhtml: true,
			cssfile: 'custom.css',
			bodyid: 'editor',
			footerclass: 'tinyeditor-footer',
			toggle: {text: 'source', activetext: 'wysiwyg', cssclass: 'toggle'},
			resize: {cssclass: 'resize'}
		});
		input.store('editor', tmp.editor);
		return tmp.me;
	}
	/**
	 * Ajax: getting the full description from asset
	 * 
	 * @TODO!!!!
	 */
	,_getRichTextEditor: function(text) {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('textarea', {'class': 'rich-text-editor', 'save-item': 'fullDescription'}).update(text ? text : '');
		return tmp.newDiv;
	}
	/**
	 * Getting the full description panel
	 */
	,_getFullDescriptionPanel: function(item) {
		var tmp = {};
		tmp.me = this;
		tmp.fullDescriptioAssetId = item.fullDescAssetId ? item.fullDescAssetId : '';
		tmp.loadFullBtn = !item.id ? tmp.me._getRichTextEditor('') : new Element('span', {'class': 'btn btn-default'}).update('click to show the full description editor')
			.observe('click', function(){
				tmp.btn = $(this);
				if(!item.fullDescriptionAsset) {
					tmp.newTextarea = tmp.me._getRichTextEditor('');
					$(tmp.btn).replace(tmp.newTextarea);
					tmp.me._loadRichTextEditor(tmp.newTextarea);
				} else {
					jQuery.ajax({
						type: 'GET',
						url: item.fullDescriptionAsset.url,
						success: function(result) {
							tmp.newTextarea = tmp.me._getRichTextEditor(result);
							$(tmp.btn).replace(tmp.newTextarea);
							tmp.me._loadRichTextEditor(tmp.newTextarea);
						}
					})
				}
			});
		tmp.newDiv = tmp.me._getFormGroup('Full Description:', tmp.loadFullBtn);
		return tmp.newDiv;
	}
	/**
	 * Getting each row of the category tree panel
	 */
	,_getChildCategoryJson: function(category, selectedCateIds) {
		var tmp = {};
		tmp.me = this;
		tmp.cate = {'text': category.name, 'id': category.id};
		if(selectedCateIds.indexOf(category.id) >= 0){
			tmp.cate.checked = true;
		}
		if(category.children && category.children.size() > 0) {
			tmp.cate.children = [];
			category.children.each(function(child){
				tmp.cate.children.push( tmp.me._getChildCategoryJson(child, selectedCateIds) );
			});
		}
		return tmp.cate;
	}
	/**
	 * initialising the tree
	 */
	,_initTree: function(categories, selector) {
		var tmp = {};
		tmp.me = this;
		tmp.categoies = [];
		tmp.selectedCateIds = [];
		tmp.me._item.categories.each(function(cate) {
			tmp.selectedCateIds.push(cate.id);
		})
		categories.each(function(category) {
			tmp.categoies.push(tmp.me._getChildCategoryJson(category, tmp.selectedCateIds));
		});
		jQuery(selector).tree({
			data: tmp.categoies
		});
		return tmp.me;
	}
	/**
	 * Ajax: getting all categories from server
	 */
	,_getCategories: function(resultDiv) {
		var tmp = {};
		tmp.me = this;
		tmp.me.postAjax(tmp.me.getCallbackId('getCategories'), {}, {
			'onLoading': function (sender, param) {
				$(resultDiv).update(tmp.me.getLoadingImg());
			}
			, 'onSuccess': function (sender, param) {
				try {
					tmp.result = tmp.me.getResp(param, false, true);
					if(!tmp.result || !tmp.result.items)
						return;
					tmp.treeDiv = new Element('ul', {'id': tmp.me._productTreeId, 'data-options': 'animate:true, checkbox:true'}) ;
					$(resultDiv).update(new Element('div', {'class': 'easyui-panel'}).update(tmp.treeDiv) );
					tmp.me._signRandID(tmp.treeDiv);
					tmp.me._initTree(tmp.result.items, '#' + tmp.treeDiv.id);
					$(resultDiv).addClassName('loaded');
				} catch (e) {
					$(resultDiv).update(tmp.me.getAlertBox('Error:', e).addClassName('alert-danger'));
				}
			}
		});
		return tmp.me;
	}
	/**
	 * Getting the product category panel
	 */
	,_getCategoryPanel: function(item) {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('div', {'class': 'panel panel-default'})
			.insert({'bottom': new Element('div', {'class': 'panel-heading'})
				.insert({'bottom': new Element('a', {'href': 'javascript: void(0);'})
					.insert({'bottom': new Element('strong').update( 'Categories: ' + (tmp.me._item.categories ? tmp.me._item.categories.size() + ' Selected' : ''))	})
				})
				.observe('click', function() {
					tmp.btn = this;
					tmp.panelBody = $(tmp.btn).up('.panel').down('.panel-body');
					if(!tmp.panelBody.hasClassName('loaded')) {
						tmp.me._getCategories(tmp.panelBody);
					}
					tmp.panelBody.toggle();
				})
			})
			.insert({'bottom': new Element('div', {'class': 'panel-body', 'style': 'display: none'}) })
		return tmp.newDiv;
	}
	/**
	 * Getting the summary div
	 */
	,_getSummaryDiv: function (item) {
		var tmp = {};
		tmp.me = this;
		tmp.item = item;
		tmp.newDiv = new Element('div', {'class': 'panel panel-default'})
			.insert({'bottom': new Element('div', {'class': 'panel-heading'})
				.insert({'bottom': new Element('a', {'href': 'javascript: void(0);', 'title': 'click to show/hide below'})
					.insert({'bottom': new Element('strong').update(tmp.item.name ? 'Editing: ' + tmp.item.name : 'Creating: ') })
					.observe('click', function() {
						$(this).up('.panel').down('.panel-body').toggle();
					})
				})
				.insert({'bottom': new Element('small', {'class': 'pull-right'}) 
					.insert({'bottom': new Element('label', {'for': 'showOnWeb_' + tmp.item.id}).update('Show on Web?') })
					.insert({'bottom': new Element('input', {'id': 'showOnWeb_' + tmp.item.id, 'save-item': 'sellOnWeb', 'type': 'checkbox', 'checked': tmp.item.sellOnWeb}) })
				})

			})
			.insert({'bottom': new Element('div', {'class': 'panel-body'})
				.insert({'bottom': new Element('div', {'class': ''})
					.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Name', new Element('input', {'save-item': 'name', 'type': 'text', 'required': true, 'value': tmp.item.name ? tmp.item.name : ''}) ) ) })
					.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('sku', new Element('input', {'save-item': 'sku', 'type': 'text', 'required': true, 'value': tmp.item.sku ? tmp.item.sku : ''}) ) ) })
					.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Status', 
							tmp.me._getSelBox(tmp.me._statuses, tmp.item.status ? tmp.item.status.id : null).writeAttribute('save-item', 'statusId').addClassName('chosen') 
					) ) })
				})
				.insert({'bottom': new Element('div', {'class': ''})
					.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Brand/Manf.', 
							tmp.me._getSelBox(tmp.me._manufacturers, tmp.item.manufacturer ? tmp.item.manufacturer.id : null).writeAttribute('save-item', 'manufacturerId').addClassName('chosen') 
					) ) })
					.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Web As New Start:', 
							new Element('input', {'class': 'datepicker', 'save-item': 'asNewFromDate', 'value': (tmp.item.asNewFromDate ? tmp.item.asNewFromDate : '') })  
					) ) })
					.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Web As New End:', 
							new Element('input', {'class': 'datepicker', 'save-item': 'asNewToDate', 'value': (tmp.item.asNewToDate ? tmp.item.asNewToDate : '') })  
					) ) })
				})
				.insert({'bottom': new Element('div', {'class': ''})
					.insert({'bottom': new Element('div', {'class': 'col-sm-12'}).update(tmp.me._getFormGroup('Short Description:', new Element('input', {'save-item': 'shortDescription', 'type': 'text', 'value': tmp.item.shortDescription ? tmp.item.shortDescription : ''}) ) ) })
				})
				.insert({'bottom': new Element('div', {'class': ''})
					.insert({'bottom': new Element('div', {'class': 'col-sm-12'}).update(tmp.me._getFullDescriptionPanel(tmp.item) ) })
				})
			});
		return tmp.newDiv;
	}
	/**
	 * Bind the fancy box
	 */
	,_loadFancyBox: function(elements) {
		var tmp = {};
		tmp.me = this;
		elements.each(function(item){
			item.observe('click', function(){
				tmp.imgs = [];
				elements.each(function(el){
					tmp.imgs.push({'href': el.down('img').readAttribute('src')});
				});
				jQuery.fancybox(tmp.imgs, {
					prevEffect	: 'none',
					nextEffect	: 'none',
					helpers	: {
						title	: {
							type: 'outside'
						},
						thumbs	: {
							height	: 50
						}
					}
				})
			});
		});
		return this;
	}
	/**
	 * Getting the image thumb
	 */
	,_getImageThumb: function(img) {
		var tmp = {};
		tmp.me = this;
		tmp.src = img.data ? img.data : img.path;
		tmp.newDiv = new Element('div', {'class': 'col-xs-12 col-sm-6 col-md-4 thumbnail-holder btn-hide-row product-image', 'active': '1'})
			.store('data', img) 
			.insert({'bottom': new Element('a', {'href': 'javascript: void(0)', 'class': 'thumbnail fancybox-thumb', 'ref': 'product_thumbs'})
				.insert({'bottom': new Element('img', {'data-src': 'holder.js/100%x180', 'src': tmp.src}) })
			})
			.insert({'bottom': new Element('span', {'class': 'btns'})
				.insert({'bottom': new Element('small', {'class': 'btn btn-danger btn-xs'}) 
					.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-trash'}) })
				})
				.observe('click', function(){
					if(!confirm('Delete this image?'))
						return false;
					tmp.imgDiv = $(this).up('.product-image');
					if(tmp.imgDiv.hasAttribute('asset-id')) {
						tmp.imgDiv.remove();
					} else {
						tmp.imgDiv.writeAttribute('active', '0').hide();
					}
				})
			});
		if(!img.imageAssetId) {
			tmp.newDiv.writeAttribute('file-name', img.filename)
				.writeAttribute('asset-id', img.imageAssetId);
		}
		return tmp.newDiv;
	}
	/**
	 * Reading image from local
	 */
	,_readImages: function(evt, targetDiv) {
		var tmp = {};
		tmp.me = this;
		tmp.files = evt.target.files; // FileList object
		// Loop through the FileList and render image files as thumbnails.
		for (tmp.i = 0; tmp.file = tmp.files[tmp.i]; tmp.i++) {
			// Only process image files.
			if (tmp.file.type.match('image.*')) {
				tmp.reader = new FileReader();
				// Closure to capture the file information.
				tmp.reader.onload = (function(theFile){
					return function(e) {
						// Render thumbnail.
						tmp.thumb = tmp.me._getImageThumb({'data': e.target.result, 'filename': theFile.name});
						$(targetDiv).insert({'bottom': tmp.thumb });
						evt.target.value = '';
						tmp.me._loadFancyBox($(tmp.me._imgPanelId).getElementsBySelector('.fancybox-thumb'));
			        };
				})(tmp.file);
				// Read in the image file as a data URL.
				tmp.reader.readAsDataURL(tmp.file);
			}
		}
		return tmp.me;
	}
	/**
	 * Getting Image Panels for a product
	 */
	,_getImagesPanel: function(item) {
		var tmp = {};
		tmp.me = this;
		tmp.noLocalReader = !(window.File && window.FileReader && window.FileList && window.Blob);
		tmp.newDiv = new Element('div', {'class': 'panel panel-default'})
			.insert({'bottom': new Element('div', {'class': 'panel-heading'})
				.insert({'bottom': new Element('a', {'href': 'javascript: void(0);', 'title': 'click to show/hide content below'})
					.insert({'bottom': new Element('strong').update('Images: ') })
					.observe('click', function() {
						$(this).up('.panel').down('.panel-body').toggle();
					})
				})
				.insert({'bottom': tmp.uploadDiv = new Element('span', {'class': 'pull-right new-btn-panel'}) })
			})
			.insert({'bottom': tmp.body = new Element('div', {'id': tmp.me._imgPanelId, 'class': 'panel-body'}) });
		if(item.images) {
			item.images.each(function(img) {
				if(img.asset)
					tmp.body.insert({'bottom': tmp.me._getImageThumb({'path': img.asset.url, 'filename': img.asset.filename, 'imageAssetId': img.asset.assetId}) });
			});
		}
		
		if(tmp.noLocalReader) {
			tmp.uploadDiv.update(new Element('span', {'class': 'btn btn-danger btn-xs pull-right', 'title': 'Your browser does NOT support this feature. Pls change browser and try again'})
				.insert({'bottom': new Element('span', {'class': ' glyphicon glyphicon-exclamation-sign'}) })
				.insert({'bottom': ' Not Supported'})
			);
		} else {
			tmp.uploadDiv.insert({'bottom': new Element('span', {'class': 'btn btn-primary btn-xs pull-right', 'title': 'New'})
				.insert({'bottom': new Element('span', {'class': 'glyphicon glyphicon-plus'}) })
				.insert({'bottom': ' NEW' })
				.observe('click', function(){
					$(this).up('.new-btn-panel').down('.new-images-file').click();
				})
			})
			.insert({'bottom': new Element('input', {'class': 'new-images-file', 'type': 'file', 'multiple': true, 'style': 'display: none'})
				.observe('change', function(evt) {
					tmp.panelBody = $(this).up('.panel').down('.panel-body');
					tmp.me._readImages(evt, tmp.panelBody);
					tmp.panelBody.show();
				})
			})
		}
		return tmp.newDiv;
	}
	/**
	 * Ajax: saving the item
	 */
	,_submitSave: function(btn) {
		var tmp = {};
		tmp.me = this;
		tmp.data = tmp.me._collectFormData($(tmp.me._htmlIds.itemDiv), 'save-item');
		if(tmp.data === null)
			return tmp.me;
		//get all prices
		tmp.data.prices = tmp.me._collectFormData($(tmp.me._htmlIds.itemDiv).down('.prices-panel'), 'list-panel-row', 'list-item');
		if(tmp.data.prices === null)
			return tmp.me;
		//get all suppliercode
		tmp.data.supplierCodes = tmp.me._collectFormData($(tmp.me._htmlIds.itemDiv).down('.suppliers-panel'), 'list-panel-row', 'list-item');
		if(tmp.data.supplierCodes === null)
			return tmp.me;
		//get all suppliercode
		tmp.data.productCodes = tmp.me._collectFormData($(tmp.me._htmlIds.itemDiv).down('.codes-panel'), 'list-panel-row', 'list-item');
		if(tmp.data.productCodes === null)
			return tmp.me;
		//get all locations
		tmp.data.locations = tmp.me._collectFormData($(tmp.me._htmlIds.itemDiv).down('.locations-panel'), 'list-panel-row', 'list-item');
		if(tmp.data.locations === null)
			return tmp.me;
		
		tmp.data.id = tmp.me._item.id;
		//tricks for fullDescription's editor
		if ($$('[save-item=fullDescription]').size() > 0 && (tmp.fullDescriptionBox = $$('[save-item=fullDescription]').first()))
		{
			//sign the value to the textarea
			tmp.fullDescriptionBox.retrieve('editor').toggle();
			tmp.fullDescriptionBox.retrieve('editor').toggle();
			tmp.data['fullDescription'] = $F(tmp.fullDescriptionBox);
		}
		
		//get all categories
		if(jQuery('#' + tmp.me._productTreeId).length >0) {
			tmp.data.categoryIds = [];
			tmp.checkedNodes = jQuery('#' + tmp.me._productTreeId).tree('getChecked');
			for(tmp.i = 0; tmp.i < tmp.checkedNodes.length; tmp.i++)
				tmp.data.categoryIds.push(tmp.checkedNodes[tmp.i].id);
		}
		//get all images
		tmp.data.images = [];
		tmp.imgPanel = $(tmp.me._imgPanelId);
		tmp.imgPanel.getElementsBySelector('.product-image').each(function(element) {
			tmp.img = element.retrieve('data');
			tmp.img.imageAssetId = (tmp.img.imageAssetId ? tmp.img.imageAssetId : '');
			tmp.img.active= (element.readAttribute('active') === '1');
			tmp.data.images.push(tmp.img);
		});
		//submit all data
		tmp.me.saveItem(btn, tmp.data, function(data){
			if(!data.url)
				throw 'System Error: no return product url';
			tmp.me._item = data.item;
			tmp.me.refreshParentWindow();
			tmp.me.showModalBox('<strong class="text-success">Saved Successfully!</strong>', 'Saved Successfully!', true);
			window.location = data.url; 
		});
		return tmp.me;
	}
	/**
	 * account info penl
	 */
	,_getAccInfoDiv: function(product) {
		var tmp = {};
		tmp.me = this;
		tmp.item = product;
		tmp.newDiv = new Element('div', {'class': 'panel panel-default'})
			.insert({'bottom': new Element('div', {'class': 'panel-heading'})
				.insert({'bottom': new Element('a', {'href': 'javascript: void(0);', 'title': 'click to show/hide content below'})
					.insert({'bottom': new Element('strong').update('Accounting Info') })
					.observe('click', function() {
						$(this).up('.panel').down('.panel-body').toggle();
					})
				})
				.insert({'bottom': tmp.uploadDiv = new Element('span', {'class': 'pull-right new-btn-panel'}) })
			})
			.insert({'bottom': new Element('div', {'class': 'panel-body'}) 
				.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Asset Account No.', new Element('input', {'save-item': 'assetAccNo', 'required': true, 'type': 'text', 'value': tmp.item.assetAccNo ? tmp.item.assetAccNo : ''}) ) ) })
				.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Revenue Account No.', new Element('input', {'save-item': 'revenueAccNo', 'required': true, 'type': 'text', 'value': tmp.item.revenueAccNo ? tmp.item.revenueAccNo : ''}) ) ) })
				.insert({'bottom': new Element('div', {'class': 'col-sm-4'}).update(tmp.me._getFormGroup('Cost Account No.', new Element('input', {'save-item': 'costAccNo', 'required': true, 'type': 'text', 'value': tmp.item.costAccNo ? tmp.item.costAccNo : ''}) ) ) })
			});
		return tmp.newDiv;
	}
	/**
	 * displaying the item
	 */
	,_getItemDiv: function() {
		var tmp = {};
		tmp.me = this;
		tmp.newDiv = new Element('div')
			.insert({'bottom': new Element('div', {'class': 'row'})
				.insert({'bottom': new Element('div', {'class': 'col-sm-4'})
					.insert({'bottom': tmp.me._getImagesPanel(tmp.me._item) })
					.insert({'bottom': tmp.me._getCategoryPanel(tmp.me._item) })
				})
				.insert({'bottom': new Element('div', {'class': 'col-sm-8'})
					.insert({'bottom': new Element('div', {'class': 'row'})
						.insert({'bottom': tmp.me._getSummaryDiv(tmp.me._item).wrap(new Element('div', {'class': 'col-sm-12'})) })
						.insert({'bottom': tmp.me._getAccInfoDiv(tmp.me._item).wrap(new Element('div', {'class': 'col-sm-12'})) })
						.insert({'bottom': tmp.me._getListPanel('Prices:', tmp.me._item.prices, {'type': 'Type', 'value': 'Price', 'start': 'From', 'end': 'To'}, tmp.me._priceTypes, function(e){
							tmp.selectedPriceType = null;
							tmp.selBox = e.target;
							tmp.me._priceTypes.each(function(priceObj) {
								if(priceObj.id === $F(tmp.selBox))
									tmp.selectedPriceType = priceObj;
							});
							tmp.selRow = $(tmp.selBox).up('.list-panel-row');
							tmp.startBox = tmp.selRow.down('[list-panel-row="start"]');
							tmp.endBox = tmp.selRow.down('[list-panel-row="end"]');
							if(tmp.selectedPriceType !== null && tmp.selectedPriceType.needTime === false) {
								tmp.startBox.writeAttribute('disabled', true).writeAttribute('value', '0001-01-01 00:00:00');
								tmp.endBox.writeAttribute('disabled', true).writeAttribute('value', '9999-12-31 23:59:59');
								tmp.selRow.down('[list-panel-row="value"]').select();
							} else {
								tmp.endBox.writeAttribute('disabled', false).writeAttribute('value', '');
								tmp.startBox.writeAttribute('disabled', false).writeAttribute('value', '').select();
							}
						}).wrap(new Element('div', {'class': 'col-sm-12 prices-panel'})) })
						.insert({'bottom': tmp.me._getListPanel('Suppliers:', tmp.me._item.supplierCodes, {'type': 'Supplier', 'value': 'Code'}, tmp.me._suppliers).wrap(new Element('div', {'class': 'col-sm-4 suppliers-panel'})) })
						.insert({'bottom': tmp.me._getListPanel('Codes:', tmp.me._item.productCodes, {'type': 'Type', 'value': 'Code'}, tmp.me._codeTypes).wrap(new Element('div', {'class': 'col-sm-4 codes-panel'})) })
						.insert({'bottom': tmp.me._getListPanel('Locations:', tmp.me._item.locations, {'type': 'Type', 'value': 'value'}, tmp.me._locationTypes).wrap(new Element('div', {'class': 'col-sm-4 locations-panel'})) })
					})
					.insert({'bottom': new Element('div', {'class': 'row'})
						.insert({'bottom': new Element('span', {'class': 'btn btn-primary pull-right col-sm-4', 'data-loading-text': 'saving ...'}).update('Save')
							.observe('click', function() {
								tmp.me._submitSave(this);
							})
						})
					})
				})
			});
		return tmp.newDiv;
	}
	/**
	 * initialing the js for date picker
	 */
	,_bindDatePicker: function() {
		var tmp = {};
		tmp.me = this;
		$$('.datepicker').each(function(item){
			if(!item.hasClassName('datepicked')) {
				tmp.me._signRandID(item);
				tmp.picker = new Prado.WebUI.TDatePicker({'ID': item.id, 'InputMode':"TextBox",'Format':"yyyy-MM-dd 00:00:00",'FirstDayOfWeek':1,'CalendarStyle':"default",'FromYear':2009,'UpToYear':2024,'PositionMode':"Bottom", "ClassName": 'datepicker-layer-fixer'});
				item.store('picker', tmp.picker);
			}
		});
		return tmp.me;
	}
	/**
	 * Public: binding all the js events
	 */
	,bindAllEventNObjects: function() {
		var tmp = {};
		tmp.me = this;
		tmp.me._bindDatePicker();
		$$('textarea.rich-text-editor').each(function(item){
			tmp.me._loadRichTextEditor(item);
		});
		return tmp.me;
	}
	,refreshParentWindow: function() {
		var tmp = {};
		tmp.me = this;
		if(!window.opener)
			return;
		tmp.parentWindow = window.opener;
		tmp.row = $(tmp.parentWindow.document.body).down('#' + tmp.parentWindow.pageJs.resultDivId + ' .product_item[product_id=' + tmp.me._item.id + ']');
		if(tmp.row) {
			tmp.row.replace(tmp.parentWindow.pageJs._getResultRow(tmp.me._item));
			if(tmp.row.hasClassName('success'))
				tmp.row.addClassName('success');
		}
	}
});