describe('opentok layout', function () {
  //describe('with jQuery specs', specs);
  describe('without jQuery', function () {
    beforeEach(function () {
      window.$ = undefined;
      window.jQuery = undefined;
    });
    describe('specs', specs);
  });
})

function specs() {
  it('defines initLayoutContainer', function () {
    expect(window.hasOwnProperty('initLayoutContainer')).toBe(true);
  });

  it('defines a layout method', function () {
    var layoutDiv = document.createElement('div');
    document.body.appendChild(layoutDiv);
    layoutContainer = initLayoutContainer(layoutDiv);

    expect(layoutContainer.hasOwnProperty('layout')).toBe(true);
    expect(typeof layoutContainer.layout).toEqual('function');
  });

  it('does not break jQuery', function() {
    expect(window.$).toBe(window.jQuery);
  });

  describe('handling layout of 2 elements', function () {
    var layoutDiv, div1, div2;
    beforeEach(function () {
      layoutDiv = document.createElement('div');
      layoutDiv.setAttribute('id', 'layoutDiv');
      layoutDiv.style.position = "absolute";
      layoutDiv.style.width = "400px";
      layoutDiv.style.height = "300px";
      layoutDiv.style.backgroundColor = "grey";
      document.body.appendChild(layoutDiv);

      div1 = document.createElement('div');
      div2 = document.createElement('div');
      div1.style.backgroundColor = "green";
      div2.style.backgroundColor = "red";
      layoutDiv.appendChild(div1);
      layoutDiv.appendChild(div2);
    });

    afterEach(function () {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      div1 = null;
      div2 = null;
    });

    it('handles default layout', function () {
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      expect(div1.style.width).toBe('200px');
      expect(div2.style.width).toBe('200px');
      expect(div1.style.height).toBe('300px');
      expect(div2.style.height).toBe('300px');
      expect(div1.style.left).toBe('0px');
      expect(div1.style.top).toBe('0px');
      expect(div2.style.left).toBe('200px');
      expect(div2.style.top).toBe('0px');
    });

    it('maintains aspect ratio if you set fixedRatio:true', function () {
      var layoutContainer = initLayoutContainer(layoutDiv, {fixedRatio: true});
      layoutContainer.layout();
      var width = parseFloat(div1.style.width, 10);
      var height = parseFloat(div1.style.height, 10);
      expect(width/height).toBeCloseTo(4/3, 3);
    });

    it('lets you change the min and maxRatio to force a ratio', function () {
      var layoutContainer = initLayoutContainer(layoutDiv, {minRatio: 9/16, maxRatio: 9/16});
      layoutContainer.layout();
      var width = parseFloat(div1.style.width, 10);
      var height = parseFloat(div1.style.height, 10);
      expect(width/height).toBeCloseTo(16/9, 3);
    });

    if (window.jQuery) {
      it('animates if you tell it to', function (done) {
        var layoutContainer = initLayoutContainer(layoutDiv, {animate: true});
        layoutContainer.layout();
        expect(200 - parseFloat(div1.style.width)).not.toBeLessThan(10);
        setTimeout(function () {
          expect(200 - parseFloat(div1.style.width)).toBeLessThan(10);
          done();
        }, 500);
      });

      it('allows you to set the animate duration', function (done) {
        var layoutContainer = initLayoutContainer(layoutDiv, {animate: {duration: 100}});
        layoutContainer.layout();
        expect(200 - parseFloat(div1.style.width)).not.toBeLessThan(10);
        setTimeout(function () {
          expect(200 - parseFloat(div1.style.width)).toBeLessThan(10);
          done();
        }, 150);
      });

      it('calls the animate completionHandler on complete for each element', function (done) {
        var div1Complete = false,
          div2Complete = false;

        var animateComplete = function () {
          if (this === div1) div1Complete = true;
          if (this === div2) div2Complete = true;
          expect(this.style.width).toBe('200px');
          if (div1Complete && div2Complete) done();
        };
        var layoutContainer = initLayoutContainer(layoutDiv, {animate: {complete:animateComplete}});
        layoutContainer.layout();
      });
    }

    describe('with a big element', function () {
      beforeEach(function () {
        div1.className = "OT_big";
      });

      it('handles default layout', function () {
        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        expect(div1.style.width).toBe('320px');
        expect(div2.style.width).toBe('80px');
        expect(div1.style.height).toBe('300px');
        expect(div2.style.height).toBe('120px');
        expect(div1.style.left).toBe('0px');
        expect(div1.style.top).toBe('0px');
        expect(div2.style.left).toBe('320px');
        expect(div2.style.top).toBe('90px');
      });

      it('handles bigFixedRatio:true', function () {
        var layoutContainer = initLayoutContainer(layoutDiv, {bigFixedRatio: true});
        layoutContainer.layout();
        var width = parseFloat(div1.style.width, 10);
        var height = parseFloat(div1.style.height, 10);
        expect(width/height).toBeCloseTo(4/3, 3);
      });

      it('lets you change the bigMinRatio and bigMaxRatio to force a ratio', function () {
        var layoutContainer = initLayoutContainer(layoutDiv, {bigMinRatio: 9/16, bigMaxRatio: 9/16});
        layoutContainer.layout();
        var width = parseFloat(div1.style.width, 10);
        var height = parseFloat(div1.style.height, 10);
        expect(width/height).toBeCloseTo(16/9, 3);
      });

      it('handles bigPercentage', function () {
        var layoutContainer = initLayoutContainer(layoutDiv, {bigPercentage: 0.9});
        layoutContainer.layout();
        expect(div1.style.width).toBe('360px');
        expect(div2.style.width).toBe('40px');
        expect(div1.style.height).toBe('300px');
        expect(div2.style.height).toBe('60px');
      });

      it('handles bigFirst', function () {
        var layoutContainer = initLayoutContainer(layoutDiv, {bigFirst: false});
        layoutContainer.layout();
        expect(div1.style.left).toBe('80px');
        expect(div1.style.top).toBe('0px');
      });

      it('takes margin into account', function () {
        div1.style.margin = "5px";
        div2.style.margin = "5px";

        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        expect(div1.style.width).toBe('310px');
        expect(div2.style.width).toBe('70px');
        expect(div1.style.height).toBe('290px');
        expect(div2.style.height).toBe('110px');
      });

      it('takes padding into account', function () {
        div1.style.padding = "5px";
        div2.style.padding = "5px";

        var layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        expect(div1.style.width).toBe('310px');
        expect(div2.style.width).toBe('70px');
        expect(div1.style.height).toBe('290px');
        expect(div2.style.height).toBe('110px');
      });
    });
  });

  describe('handling layout of 5 elements', function () {
    var layoutDiv, divs = [], divCount = 5;
    beforeEach(function () {
      layoutDiv = document.createElement('div');
      layoutDiv.setAttribute('id', 'layoutDiv');
      layoutDiv.style.position = "absolute";
      layoutDiv.style.width = "400px";
      layoutDiv.style.height = "300px";
      layoutDiv.style.backgroundColor = "grey";
      document.body.appendChild(layoutDiv);

      for (var i = 0; i < divCount; i++) {
        divs[i] = document.createElement('div');
        layoutDiv.appendChild(divs[i]);
      }
    });

    afterEach(function () {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      divs = [];
    });

    it('handles default layout', function () {
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect them to all have the same width and height
      for (var i = 0; i < divs.length; i++) {
        expect(divs[i].style.width).toBe('133px');
        expect(divs[i].style.height).toBe('150px');
      }
    });

    it('handles a big element', function () {
      divs[0].className = "OT_big";
      var layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect div[0] to be big
      expect(divs[0].style.width).toBe('320px');
      expect(divs[0].style.height).toBe('300px');
      // Expect them to all have the same width and height
      for (var i = 1; i < divs.length; i++) {
        expect(divs[i].style.width).toBe('80px');
        expect(divs[i].style.height).toBe('75px');
      }
    });
  });
};
