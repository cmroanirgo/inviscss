/*
  _____            _      _____  _____ _____ 
 |_   _|          (_)    / ____|/ ____/ ____|
   | |  _ ____   ___ ___| |    | (___| (___  
   | | | '_ \ \ / / / __| |     \___ \\___ \ 
  _| |_| | | \ V /| \__ \ |____ ____) |___) |
 |_____|_| |_|\_/ |_|___/\_____|_____/_____/ 
Copyright (c) kodespace.com, 2016
*/

(function() {
	"use strict";

	function ready(fn) {
		if (document.readyState != 'loading'){
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
		}
	}
	var debug = function(s) { console.log(s); }
	function $$(where, selector, special_immediate_child_kludge) { 
		if (!selector)
			return document.querySelectorAll(where); 
		else {
			if ( special_immediate_child_kludge || selector[0]=='>') {
		    	var id_orig = where.id; // remember current element id
		    	if (!id_orig)
		    		// assign new unique id
		  			where.id = 'ID_' + parseInt(Math.random()*100000); 
				var ret = where.querySelectorAll('#'+where.id+selector);
				if (id_orig != where.id)
					where.removeAttribute('id');
				return ret;
			}
			else
				return where.querySelectorAll(selector); 
		}
	}
	function clone(arrayIsh) {
		var ar = [];
		for (var i=0; i<arrayIsh.length; i++)
			ar.push(arrayIsh[i]);
		return ar;
	}

	function addClass(el, className) {
	  el.classList.add(className);
	}
	function removeClass(el, className) {
		el.classList.remove(className);
	}
	function hasClass(el, className) {
		return el.classList.contains(className);
	}
	function setAttr(el, attr, value) {
		el.setAttribute(attr, value);
	}
	function on(el, name, fn) {
		el.addEventListener(name, fn);
	}
	function insertHTML(el, where, str) {
		el.insertAdjacentHTML(where, str);
	}
	function getParents(el, selector, stopSelector) {  // may include self in result
		var retval = [];
		while (el) {
			if (el.matches(selector)) {
				retval.push(el);
			} else if (stopSelector && el.matches(stopSelector)) {
				break
			}
			el = el.parentElement;
		}
		return retval;
	}

	var forEach = Array.prototype.forEach;

/*
	function createBackdrop(el, className, clickFn) {
		// if mobile we use a backdrop because click events don't delegate
		modalClose();
		var backdrop = document.createElement('div');
		addClass(backdrop, 'modal-backdrop');
		if (className && className.length)
			addClass(backdrop, className);
		//addClass(document.body, 'modal-open');
		var parent = el.parentNode;
		parent.insertBefore(backdrop, null);
		on(backdrop, 'click', clickFn)
	}

	function modalClose() {
		removeClass(document.body, 'modal-open')
		forEach.call(clone($$('.modal-backdrop')), function(el) { 
			el.remove(); 
		});
	}
*/
	function menuClearAll(e) {
		debug('Menu clearing')
		if (e && e.which === 3) return; 
		forEach.call($$('.open[data-hasmenu]'), function(el) {
			debug('< menu closed: ' + el.textContent.split('\n').slice(0,1).join(''))
			removeClass(el, 'open');
		})
		menuOpen = false;
		//modalClose();
	}

	var menuExists = false;
	var menuOpen = false;
	function menuInit(elOpen, elSubMenu) {
		menuExists = true;
		removeClass(elOpen, "open")
		setAttr(elOpen, 'data-hasmenu', 'true');
		on(elOpen, 'click', menuClick); 
	}

	function menuClick(e) {
		var elOpen = this;
		e.preventDefault();
		e.stopPropagation();
		debug('Menu click begin: ' + elOpen.textContent.split('\n').slice(0,1).join(''));
		var isActive = hasClass(elOpen, 'open');
		var parents = getParents(elOpen, '[data-hasmenu]'); // includes self
		if (!isActive) {
			// close all open elements not part of parent tree
			forEach.call(clone($$('.open[data-hasmenu]')), function(li) {
				if (parents.indexOf(li)<0)
					removeClass(li, 'open');
			});
			//createBackdrop(parents[parents.length-1].parentNode, 'clear', menuClearAll)
			forEach.call(parents, function(li) {
				addClass(li, 'open')
			})
			menuOpen = true;
			debug('> menu open: ' + elOpen.textContent.split('\n').slice(0,1).join(''))
		}
		else {
			removeClass(elOpen, 'open');
			//if (!parents.length) // no other menus open
			//	modalClose();
			menuOpen = parents.length>1;
			debug('< menu closed: ' + elOpen.textContent.split('\n').slice(0,1).join(''))

		}
		debug('Menu click complete')
	}

	ready(function() { // document.ready

		// nav stuff
		forEach.call($$('nav li,.nav li'), function(li) {
			// Ensure <a> is a child of <li>
      		var text = (li.childNodes[0].nodeValue||'').trim();
			if (!$$(li, '>a', true).length && !$$(li, '>hr', true).length) {
				li.childNodes[0].remove();
				insertHTML(li, 'afterbegin', "<a>"+text+"</a>")
				//debug("inserted <a> around li "+li.id+": '" + text + "': " + li.innerHTML)
			}
			// add click handlers to all <li> with a child <ul>
			var ul = $$(li, ">ul", true);
			if (ul.length)
				// add menu handling for submenus
				menuInit(li, ul[0]);
			else {
				// not a submenu. add a 'click to cancel' handler
				var clickable = $$(li, '>a', true);
				if (clickable.length)
					on(clickable[0], 'click', function(e) { e.stopPropagation(); menuClearAll(e); })
			}
		});
		if (menuExists) {
			on(window, 'click', menuClearAll);
		}

		// add nav collapse handlers
		forEach.call($$("nav.collapse, .nav.collapse"), function(nav) {
			if (!nav.querySelector('.nav-toggle')) {
				// insert missing toggle button before the menu
				/*
					<span class="nav-toggle"></span>
				*/
				var htmlString = "<span class=\"nav-toggle\"></span>";
				insertHTML(nav, 'afterbegin', htmlString);
			}
			var toggle = $$(nav, '.nav-toggle')[0];
			on(toggle, 'click', function() {
				if (!hasClass(toggle, 'open')) 
					addClass(toggle, 'open');
				else 
					removeClass(toggle, 'open')
			})
		})


		// add nicer file uploading capabilities
		forEach.call($$('input.form-control[type="file"]'), function(input) {
			/*
			<input id="file1" type="file" 
				multiple 
				data-text="Drop here or click to upload files" 
				data-multiple-caption="{count} files selected"
				class="form-control"
				>
			*/

			var id = input.name || input.id; 
			if (!id) // it's useless without a name
				id = id.name = input.id = "file-" + parseInt(Math.random()*1000);
			var multiple = input.hasAttribute( 'multiple' );

			var filesStr = multiple ? 'files' : 'a file';
			var chooseString = input.getAttribute( 'data-text' ) || 'Choose '+filesStr+'…'; 

			/* 
			<label for="file-3">
			<span class="inv-upload">Choose a file…</span>
			</label>
			*/
			var htmlString = "<label for=\""+id+"\" class=\"file-notice\"><span class=\"inv-upload\">"+chooseString+"</span></label>"
			insertHTML(input, 'afterend', htmlString);
			addClass(input, 'js'); // this hides and moves the existing input & restyles the input entirely

			var label = input.nextElementSibling,
			labelVal = label.innerHTML;

			input.addEventListener('change', function(e) {
				var fileName = '';
				if( this.files && this.files.length > 1 )
					fileName = ( this.getAttribute( 'data-multiple-caption' ) || '{count} files selected' ).replace( '{count}', this.files.length );
				else
					fileName = e.target.value.split( '\\' ).pop();

				if( fileName )
					label.querySelector('span').innerHTML = fileName;
				else
					label.innerHTML = labelVal;
			});

			// Firefox bug fix
			on(input, 'focus', function() { addClass(input, 'has-focus' ); })
			on(input, 'blur', function() { input.classList.remove( 'has-focus' ); });
		})

		forEach.call($$('.file-drop input[type="file"]'), function(input) {
			setAttr(input, 'required', 'required'); 
			if (input.parentNode.children.length==1) {
				// auto add success labels, if needed
				var multiple = input.hasAttribute( 'multiple' );

				var filesStr = multiple ? 'files' : 'a file';
				/*
				<div>
					<span class="success inv-upload">Drop Files or Click Here...</span>
					<span class="default inv-upload">Drop Files or Click Here...</span>
				</div>
				*/
				var msg = "Drop "+filesStr+" or Click here…"
				var htmlString = "<div class=\"file-notice\"><span class=\"success inv-upload\">"+msg+"</span><span class=\"default inv-upload\">"+msg+"</span></div>";
				insertHTML(input, 'afterend', htmlString);
			}
			else if (!hasClass(input.nextElementSibling, 'file-notice')) {
				// ensure the adjacent element has 'file-notice'
				addClass(input.nextElementSibling, 'file-notice')
			}
	
			var label = input.nextElementSibling; // <div class="file-notice"
			var labelVal = label.innerHTML;

			on(input, 'change', function(e) {
				var fileName = '';
				if( this.files && this.files.length > 1 )
					fileName = ( this.getAttribute( 'data-multiple-caption' ) || '{count} files selected' ).replace( '{count}', this.files.length );
				else
					fileName = e.target.value.split( '\\' ).pop();

				if( fileName )
					label.querySelector('.success').innerHTML = fileName;
				else
					label.innerHTML = labelVal;
			});
		});
	}) // ready



}());
