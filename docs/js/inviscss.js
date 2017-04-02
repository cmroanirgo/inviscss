/*
@preserve
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
			if ( special_immediate_child_kludge || selector[0]=='>' || selector[0]=='~' || selector[0]=='+') {
		    	var id_orig = where.id; // remember current element id
		    	if (!id_orig)
		    		// assign new unique id
		  			where.id = 'ID_' + parseInt(Math.random()*100000); 
		  		var x = selector[0]!='>' ? (where.parentElement || document) : where; // ~ and + selectors need to use the parent
				var ret = x.querySelectorAll('#'+where.id+selector);
				if (id_orig != where.id)
					where.removeAttribute('id');
				return ret;
			}
			else
				return where.querySelectorAll(selector); 
		}
	}

	function $$each(where, selector, special_immediate_child_kludge, fn) {
		if (typeof selector === 'function') { fn = selector; selector = special_immediate_child_kludge = undefined; }
		else if (typeof special_immediate_child_kludge === 'function') { fn = special_immediate_child_kludge; special_immediate_child_kludge = undefined; }
		forEach.call($$(where, selector, special_immediate_child_kludge), fn);
	}

	function selectorMatches(el, selector) { // From: https://davidwalsh.name/element-matches-selector
		var p = Element.prototype;
		var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
			return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
		};
		return f.call(el, selector);
	}

	function $$dynamic(where, selector, fn) {		
		if (typeof selector === 'function') { fn = selector; selector = where; where=document.body; }

		try {
			// Add a MutationObserver, allowing dynamic 'listening' of selectors
			var MutationObserver   = window.MutationObserver || window.WebKitMutationObserver;
			var _observer          = new MutationObserver(mutationHandler);
		    _observer.observe(where, { childList: true, characterData:true, attributes:true, subtree: true });
		    function mutationHandler(mutations) {
	    		//debug('mutationHandler...')
		    	mutations.forEach(function(mutation) {
		    		if (!mutation.addedNodes) return;
		    		//debug('mutation type:' + mutation.type)
		    		forEach.call(mutation.addedNodes, function(node) {
	    				if (node.nodeType===1 && selectorMatches(node, selector))
	    					fn.call(node, node)
		    		});
		    	})
		    }
		}
		catch(e) {
			// mutation observer not supported on this platform :( IE10, Opera Mini
		}
		$$each(where, selector, fn);
		return _observer;
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
	function toggleClass(el, className, setValue) {
		if (setValue === undefined || typeof setValue !== "boolean")
			setValue = !hasClass(el, className);
		if (setValue) addClass(el, className)
		else removeClass(el, className)
		return setValue;
	}
	function setAttr(el, attr, value) {
		el.setAttribute(attr, value);
	}
	function getAttr(el, attr, value) {
		return el.getAttribute(attr);
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
			}
			if (stopSelector && el.matches(stopSelector)) {
				break
			}
			el = el.parentElement;
		}
		return retval;
	}
	function getParent(el, selector) {
		var retVal = getParents(el, selector, selector);
		if (retVal.length)
			return retVal[0];
		return null;
	}
	function getTargets(el, defaultTargets) {
		var targets = getAttr(el, 'data-target');
		//debug('target(s): ' + targets);
		if (targets)
			return $$(targets);
		return defaultTargets || [];
	}
	function getTarget(el, defaultTargets) {
		var targets = getTargets(toggle, defaultTargets);
		return targets.length ? targets[0] : null;
	}

	var forEach = Array.prototype.forEach;

	function createBackdrop(el, className, clickFn) {
		modalClose();
		modalOpen();
		var backdrop = document.createElement('div');
		addClass(backdrop, 'modal-backdrop');
		if (className && className.length)
			addClass(backdrop, className);
		//addClass(document.body, 'modal-open');
		var parent = el ; //el.parentNode;
		parent.insertBefore(backdrop, null);
		on(backdrop, 'click', clickFn)
	}

	function modalOpen() {
		addClass(document.body, 'modal-open')
	}
	function modalClose() {
		removeClass(document.body, 'modal-open')
		forEach.call(clone($$('.modal-backdrop')), function(el) { 
			el.remove(); 
		});
	}

	function menuClearAll(e) {
		//debug('Menu clearing')
		if (e && e.which === 3) return; 
		$$each('.open[data-hasmenu]', function(el) {
			//debug('< menu closed: ' + el.textContent.split('\n').slice(0,1).join(''))
			removeClass(el, 'open');
		})
		menuOpen = false;
	}

	var menuExists = false;
	var menuOpen = false;

	function menuInit(elOpen) {
		menuExists = true;
		removeClass(elOpen, "open")
		setAttr(elOpen, 'data-hasmenu', 'true');
		on(elOpen, 'click', menuClick); 
	}

	function menuClick(e) {
		var elOpen = this;
		e.preventDefault();
		e.stopPropagation();
		//debug('Menu click begin: ' + elOpen.textContent.split('\n').slice(0,1).join(''));
		var isActive = hasClass(elOpen, 'open');
		var parents = getParents(elOpen, '[data-hasmenu]'); // includes self
		if (!isActive) {
			// close all open elements not part of parent tree (NB: Only works for ul>li style trees)
			$$each('.open[data-hasmenu]', function(li) {
				if (parents.indexOf(li)<0)
					removeClass(li, 'open');
			});
			//createBackdrop(parents[parents.length-1].parentNode, 'clear', menuClearAll)
			forEach.call(parents, function(li) {
				addClass(li, 'open')
			})
			menuOpen = true;
			//debug('> menu open: ' + elOpen.textContent.split('\n').slice(0,1).join(''))
		}
		else {
			removeClass(elOpen, 'open');
			//if (!parents.length) // no other menus open
			//	modalClose();
			menuOpen = parents.length>1;
			//debug('< menu closed: ' + elOpen.textContent.split('\n').slice(0,1).join(''))

		}
		//debug('Menu click complete')
	}

	// Function from David Walsh: http://davidwalsh.name/css-animation-callback
	function whichTransitionEvent(){
	  var t, el = document.createElement("fakeelement");

	  var transitions = {
	    "transition"      : "transitionend",
	    "OTransition"     : "oTransitionEnd",
	    "MozTransition"   : "transitionend",
	    "WebkitTransition": "webkitTransitionEnd"
	  }

	  for (t in transitions){
	    if (el.style[t] !== undefined){
	      return transitions[t];
	    }
	  }
	}
	var transitionEvent = whichTransitionEvent();

	function handleFade(el, fn) {
		if (hasClass(el, 'fade')) {
			var ended = false;
			function onEnd(event) {
				ended = true;
				el.removeEventListener(transitionEvent, onEnd)
				removeClass(el, 'fade-me-now');
				removeClass(el, 'fade-me-now-active');
				fn.call(el, el);
			}

			// add transition properties to the class
			addClass(el, 'fade-me-now');
			// start listening
			el.addEventListener(transitionEvent, onEnd);
			addClass(el, 'fade-me-now-active');
			setTimeout(function() { // a catch-all, in case it fails, because we NEED our callback fn to be called!
				if (!ended) onEnd(null);
			}, 1000)
		}
		else
			fn.call(el, el);
	}

	function closeAndRemove(el, className) {
		var evClose = new Event(className + '-close');
		//el.parentNode.removeChild( el ); // detach from parent, jQuery does this
		forEach.call(getTargets(el, [el]), function(target) {
			target.dispatchEvent(evClose);
		})
		handleFade(el, function() {
			el.remove();	
		});
	}
	function __handleCloseable(el, className) {
		$$each(el, ".close", function(closeBtn) {
			on(closeBtn, 'click', function(e) {
				e.preventDefault();
				closeAndRemove(el, className)					
			})
		})
	}	
	function handleCloseable(className, selector) {
		selector = selector || '.' + className;
		$$each(selector, function(el) { 
			__handleCloseable(el, className)
		})
	}

	ready(function() { // document.ready
		addClass(document.body, 'js'); 
		removeClass(document.body, 'no-js');

		// modal
		var evModalClose = new Event('modal-close');
		var evModalOK = new Event('modal-ok');
		var evModalOpen = new Event('modal-open');
		$$each('.modal-toggle', function(toggle) {
			var target = getTargets(toggle);
			target = target.length ? target[0] : null;
			if (!target) return;
			removeClass(target, 'open');

			function open(target) {
				addClass(target, 'open');
				evModalOpen.relatedTarget = toggle;
				target.dispatchEvent(evModalOpen)
				createBackdrop(document.body, '', function(e){
					close(target, evModalClose)
				})
			}
			function close(target, ev) {
				if (!!ev) target.dispatchEvent(ev);
				handleFade(target, function() {
					removeClass(target, 'open');
					modalClose();
				});

			}
			on(toggle, 'click', function(e) {
				e.preventDefault();
				open(target);
			});

			$$each(target, '.close', function(closer) {
				on(closer, 'click', function(e) {
					close(target, evModalClose);
				})
			})
			$$each(target, '.modal-ok', function(closer) {
				on(closer, 'click', function(e) {
					close(target, evModalOK);
				})
			})
			on(target, 'invis-close-modal', function(e) {
				if (hasClass(target, 'open')) {
					close(target, evModalClose)
				} 
			})
			on(target, 'invis-open-modal', function(e) {
				if (!hasClass(target, 'open')) {
					open(target)
				}

			})
		})

		menuExists = false;
		// nav/menu stuff
		$$each('.nav li,.dropdown-toggle ~ ul li', function(li) {
			// Ensure <a> is a child of <li>
      		var text = (li.childNodes[0].nodeValue||'').trim();
			if (!$$(li, '>*:not(ul)', true).length && !$$(li, '>hr', true).length) {
				li.childNodes[0].remove();
				insertHTML(li, 'afterbegin', "<a href=\"#\">"+text+"</a>")
				//debug("inserted <a> around li "+li.id+": '" + text + "': " + li.innerHTML)
			}
			// add click handlers to all <li> with a child <ul>
			var ul = $$(li, ">ul", true);
			if (ul.length)
				// add menu handling for submenus
				menuInit(li);
			else {
				// not a submenu. add a 'click to cancel' handler
				var clickable = $$(li, '>*:not(ul)', true);
				if (clickable.length)
					on(clickable[0], 'click', function(e) { e.stopPropagation(); menuClearAll(e); })
			}
		});
		$$each('.dropdown-toggle', function(el) {
			menuInit(el);
		});
		if (menuExists) {
			on(window, 'click', menuClearAll);
		}

		// tab handling
		$$each('.tabs', function(tab) {
			//debug('got tabs')
			var tab_content = $$(tab, '~ .tab-content', true);
			if (!tab_content.length) {debug('WARNING! No .tab-content found at same level as .tabs'); return;}
			//debug('got sibling tab-content')
			tab_content = tab_content[0];
			$$each(tab, '>li>a', true, function(a) {
				on(a, 'click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					// mark the parent li as active
					$$each(tab, '>.active', function(el) {
						removeClass(el, 'active')
					})
					addClass(a.parentElement, 'active');

					// mark the associated tab content block as active
					var href = getAttr(a, 'href')
					//debug('tab activating: ' + href)
					$$each(tab_content, '>.active', function(el) {
						removeClass(el, 'active')
					})
					$$each(tab_content, '>' + href, function(el) {
						addClass(el, 'active')
					})
				})
			})

		})

		// add nav collapse handlers
		menuExists = false;
		$$each(".nav-toggle", function(toggle) {
			//debug('starting toggle');
			var targets = getTargets(toggle);
			removeClass(toggle, 'open'); // closed by default
			forEach.call(targets, function(targetEl) {
				//debug('registering toggle' + targetEl.id);
				addClass(targetEl, 'nav-collapse');
			})

			on(toggle, 'click', function(e){
				var open = toggleClass(toggle, 'open');
				//debug('nav toggling ' + open);
				forEach.call(targets, function(targetEl) {
					//debug('toggling ' + targetEl.id);
					toggleClass(targetEl, 'open', open)
				});	
			})
			
		});

		if (menuExists) {
			on(window, 'click', function(e){
				//debug('window click: nav-toggle closing')
				$$each('.nav-toggle.open', function(toggle) { removeClass(toggle, 'open');} );
			});
		}


		// add nicer file uploading capabilities
		$$each('input.form-control[type="file"]', function(input) {
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

		$$each('.file-drop input[type="file"]', function(input) {
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


		// alerts
		handleCloseable('alert', '.alert:not(.timeout)');
		$$dynamic('.alert.timeout', function(alert) {
			if (alert.__alert_inited) return;
			alert.__alert_inited = true;
			__handleCloseable(alert, 'alert')

			// add timeout capabilities
			var hovered = false;
			var timeout;
			on(alert, "mouseover", function() { hovered = true; stopTimer(); })
			on(alert, "mouseout", function() { hovered = false; startTimer(); }) // restart the timer when mouse exits
			on(alert, "alert-close", function() { stopTimer(); }) // alert closed manually
			function stopTimer() {
				if (timeout) {
					//debug('alert: stopTimer')
					clearTimeout(timeout);
				}
				timeout = 0;
			}
			function startTimer() {
				//debug('alert: startTimer')
				timeout = setTimeout(function() {
				if (!hovered)
					closeAndRemove(alert, 'alert')
				},  getAttr(alert, 'data-timeout')||5000);
			}
			setTimeout(startTimer, 100); // start the *actual* timer in just a little bit. ie. give the user a tiny window to actually notice the alert!
		})

	}) // ready



}());
