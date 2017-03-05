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
	function $$(where, selector, special_immediate_child_kludge) { 
		if (!selector)
			return document.querySelectorAll(where); 
		else {
			special_immediate_child_kludge = special_immediate_child_kludge || selector[0]='>';
			if (special_immediate_child_kludge) {
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
		if (el.classList)
		  el.classList.add(className);
		else
		  el.className += ' ' + className;
	}
	function removeClass(el, className) {
		if (el.classList) {
			el.classList.remove(className);
		} else {
			var classes = el.className.split(' ');
			var existingIndex = classes.indexOf(className);

			if (existingIndex >= 0)
				classes.splice(existingIndex, 1);

			el.className = classes.join(' ');
		}
	}
	function hasClass(el, className) {
		if (el.classList)
			return el.classList.contains(className);
		else
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
	}
	function toggleClass(el, className) {
		if (el.classList) {
			el.classList.toggle(className);
		} else {
			var classes = el.className.split(' ');
			var existingIndex = classes.indexOf(className);

			if (existingIndex >= 0)
				classes.splice(existingIndex, 1);
			else
				classes.push(className);

			el.className = classes.join(' ');
		}
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
	/*function closest(el, selector, stopSelector) { // from http://stackoverflow.com/a/38149758/125525
		var retval = null;
		while (el) {
			if (el.matches(selector)) {
				retval = el;
				break
			} else if (stopSelector && el.matches(stopSelector)) {
				break
			}
			el = el.parentElement;
		}
		return retval;
	}*/
	function parents(el, selector, stopSelector) { 
		var retval = [];
		el = el.parentElement;
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

	function createBackdrop(el, className, clickFn) {
		return;
		// if mobile we use a backdrop because click events don't delegate
		var backdrop = document.createElement('div');
		addClass(backdrop, 'modal-backdrop');
		if (className && className.length)
			addClass(backdrop, className);
		//addClass(document.body, 'modal-open');
		var parent = el.parentNode;
		parent.insertBefore(backdrop, parent.firstChild);
		on(backdrop, 'click', clickFn)
	}

	function modalClose() {
		removeClass(document.body, 'modal-open')
		forEach.call(clone($$('.modal-backdrop')), function(el) { 
			el.remove(); 
		});
	}
	function menuClearAll(e) {
		console.log('Menu clearing')
		if (e && e.which === 3) return; //? bootstrap does this?
		forEach.call($$('[data-hasmenu]:not(:hover)'), function(el) {
			console.log('> menu closed: ' + el.textContent.split('\n').slice(0,1).join(''))
			removeClass(el, 'open');
		})
		modalClose();
	}

	function menuInit(elOpen, elMenu) {
		removeClass(elOpen, "open")
		setAttr(elOpen, 'data-hasmenu', 'true');
		on(elOpen, 'click', function(e) { return menuClick(e, elOpen, elMenu); }); 
	}

	function menuClick(e, elOpen, elMenu) {
		//e.preventDefault();
		console.log('Menu click begin: ' + elOpen.textContent.split('\n').slice(0,1).join(''))
		var isActive = hasClass(elOpen, 'open');
		menuClearAll(e);
		if (!isActive) {
			createBackdrop(elOpen, 'clear', menuClearAll)
			var p=elOpen;
			console.log('> menu open: ' + p.textContent.split('\n').slice(0,1).join(''))
		}
		addClass(elOpen, 'open')
		console.log('Menu click complete')
	}

	ready(function() { // document.ready

		// nav fix ups
		forEach.call($$('nav li,.nav li'), function(li) {
			// Ensure <a> is a child of <li>
      		var text = (li.childNodes[0].nodeValue||'').trim();
			if (!$$(li, '>a', true)) {
				li.childNodes[0].remove();
				insertHTML(li, 'afterbegin', "<a>"+text+"</a>")
				//console.log("inserted <a> around li "+li.id+": '" + text + "': " + li.innerHTML)
			}
      		/*
        	var id_orig = li.id; // remember current element id
      		li.id = 'ID_' + parseInt(Math.random()*100000); // assign new unique id
			if (!li.querySelector('#'+li.id+'>a')) {
				li.childNodes[0].remove();
				insertHTML(li, 'afterbegin', "<a>"+text+"</a>")
				//console.log("inserted <a> around li "+li.id+": '" + text + "': " + li.innerHTML)
			}
			if (!!id_orig)
				li.id = id_orig;
			else
				li.removeAttribute('id')*/

			// add click handlers to all <li> with a child <ul>
			forEach.call($$(li, ">ul", true), function(ul) { 
				menuInit(li, ul);
			});
		});

		// add nav collapse handlers
		forEach.call($$("nav.collapse, .nav.collapse"), function(nav) {
			if (!nav.querySelector('#menu-toggle')) {
				// insert missing toggle button before the menu
				/*
<input type="checkbox" id="123" class="menu-toggle">
      <label for="123" class="label-toggle inv-menu"></label>
</input>
				*/
				console.log("Added #menu-toggle")
				var htmlString = "<input type=\"checkbox\" id=\"menu-toggle\"><label for=\"menu-toggle\" id=\"\" class=\"menu-toggle-label inv-menu\"></label></input>";
				insertHTML(nav, 'afterbegin', htmlString);
			}
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
	})



}());
