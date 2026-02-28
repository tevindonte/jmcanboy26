(function() {
  window.Revealer = class Revealer {
    constructor(el, options) {
      this.CONFIG = { hidden: false, color: '#fff' };
      Object.assign(this.CONFIG, options);
      this.DOM = {};
      this.DOM.item = el;
      this.layout();
    }
    layout() {
      this.allClasses = ['revealer--visible','revealer--right','revealer--left','revealer--top','revealer--bottom','revealer--showX','revealer--showY','revealer--hideX','revealer--hideY'];
      this.revealerEl = document.createElement('div');
      this.revealerEl.className = 'revealer';
      this.revealerEl.style.backgroundColor = this.CONFIG.color;
      this.DOM.item.appendChild(this.revealerEl);
      if (this.CONFIG.hidden) this.revealerEl.classList.add('revealer--visible');
    }
    show(animation) {
      return this.toggle(animation, 'show');
    }
    hide(animation) {
      return this.toggle(animation, 'hide');
    }
    toggle(animationOpts, action) {
      var self = this;
      return new Promise(function(resolve) {
        if (animationOpts) {
          self.animate(animationOpts, action);
          self.revealerEl.addEventListener('animationend', resolve);
        } else {
          self.revealerEl.classList.remove.apply(self.revealerEl.classList, self.allClasses);
          self.revealerEl.classList.add('revealer--visible');
          resolve();
        }
      });
    }
    showFilled(animation) {
      var self = this;
      return new Promise(function(resolve) {
        self.hide();
        animation.target = self.DOM.item;
        animation.target.style.visibility = 'hidden';
        self.animate(animation, 'hide');
        function completefn() {
          animation.target.removeEventListener('animationend', completefn);
          animation.target = self.revealerEl;
          self.animate(animation, 'show');
          animation.target.addEventListener('animationend', function(ev) {
            if (ev.target === animation.target) resolve();
          });
        }
        animation.target.addEventListener('animationend', completefn);
      });
    }
    hideFilled(animation) {
      var self = this;
      return new Promise(function(resolve) {
        self.animate(animation, 'hide');
        function completefn() {
          self.revealerEl.removeEventListener('animationend', completefn);
          animation.target = self.DOM.item;
          self.animate(animation, 'show');
          animation.target.addEventListener('animationend', function(ev) {
            if (ev.target === animation.target) resolve();
          });
        }
        self.revealerEl.addEventListener('animationend', completefn);
      });
    }
    animate(animationOpts, action) {
      var self = this;
      setTimeout(function() {
        var target = animationOpts.target || self.revealerEl;
        target.style.visibility = 'visible';
        target.classList.remove.apply(target.classList, self.allClasses);
        var dirClass = 'revealer--right';
        var orientation = 'h';
        if (animationOpts.direction === 'rtl') {
          dirClass = action === 'hide' ? 'revealer--right' : 'revealer--left';
          orientation = 'h';
        } else if (animationOpts.direction === 'ltr') {
          dirClass = action === 'hide' ? 'revealer--left' : 'revealer--right';
          orientation = 'h';
        } else if (animationOpts.direction === 'ttb') {
          dirClass = action === 'hide' ? 'revealer--top' : 'revealer--bottom';
          orientation = 'v';
        } else if (animationOpts.direction === 'btt') {
          dirClass = action === 'hide' ? 'revealer--bottom' : 'revealer--top';
          orientation = 'v';
        }
        target.classList.add(dirClass, orientation === 'h' ? 'revealer--' + action + 'X' : 'revealer--' + action + 'Y');
      }, animationOpts.delay || 0);
    }
  };
})();
