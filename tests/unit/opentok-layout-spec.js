/* globals describe, beforeEach, expect, it, afterEach, initLayoutContainer */
describe('opentok layout', () => {
  it('defines initLayoutContainer', () => {
    expect(typeof window.initLayoutContainer).toEqual('function');
  });

  it('defines layout and getLayout methods', () => {
    const layoutDiv = document.createElement('div');
    document.body.appendChild(layoutDiv);
    const layoutContainer = initLayoutContainer(layoutDiv);

    expect(typeof layoutContainer.layout).toEqual('function');
    expect(typeof layoutContainer.getLayout).toEqual('function');
  });

  it('does not break jQuery', () => {
    expect(window.$).toBe(window.jQuery);
  });

  describe('handling layout of 2 elements', () => {
    let layoutDiv;
    let div1;
    let div2;
    let expectedLayout;
    let children;
    beforeEach(() => {
      layoutDiv = document.createElement('div');
      layoutDiv.setAttribute('id', 'layoutDiv');
      layoutDiv.style.position = 'absolute';
      layoutDiv.style.top = '0px';
      layoutDiv.style.left = '0px';
      layoutDiv.style.width = '400px';
      layoutDiv.style.height = '300px';
      layoutDiv.style.backgroundColor = 'grey';
      document.body.style.margin = '0px';
      document.body.style.padding = '0px';
      document.body.appendChild(layoutDiv);

      div1 = document.createElement('div');
      div2 = document.createElement('div');
      div1.style.backgroundColor = 'green';
      div2.style.backgroundColor = 'red';
      layoutDiv.appendChild(div1);
      layoutDiv.appendChild(div2);
      children = [div1, div2];
      expectedLayout = [{
        aspectRatio: 300 / 200,
        width: 200,
        height: 300,
        left: 0,
        top: 0,
      },
      {
        aspectRatio: 300 / 200,
        width: 200,
        height: 300,
        left: 200,
        top: 0,
      }];
    });

    afterEach(() => {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      div1 = null;
      div2 = null;
    });

    it('handles default getLayout', () => {
      const layoutContainer = initLayoutContainer({
        containerWidth: 400,
        containerHeight: 300,
      });
      expect(layoutContainer.getLayout(children.map(() => 300 / 200)))
        .toEqual(expectedLayout);
    });

    it('handles default layout', () => {
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      expectedLayout.forEach((box, idx) => {
        const boundingRect = children[idx].getBoundingClientRect();
        ['width', 'height', 'left', 'top'].forEach((val) => {
          expect(boundingRect[val]).toEqual(expectedLayout[idx][val]);
        });
      });
    });

    it('adds the "ot-layout" class to elements', () => {
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      expect(div1.classList.contains('ot-layout')).toBe(true);
      expect(div2.classList.contains('ot-layout')).toBe(true);
    });

    it('maintains multiple aspect ratios if you set fixedRatio:true', () => {
      div1.videoWidth = 640;
      div1.videoHeight = 480;
      div2.videoWidth = 480;
      div2.videoHeight = 640;
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const div1Rect = div1.getBoundingClientRect();
      expect(div1Rect.width / div1Rect.height).toBeCloseTo(640 / 480, 1);
      const div2Rect = div2.getBoundingClientRect();
      expect(div2Rect.width / div2Rect.height).toBeCloseTo(480 / 640, 1);
    });

    it('grows to takes up the whole height if there are narrow elements', () => {
      // The second element is portrait and so it doesn't take up as much
      // space as the first one. So we should account for that and make the height larger
      div1.videoWidth = 640;
      div1.videoHeight = 480;
      div2.videoWidth = 480;
      div2.videoHeight = 640;
      layoutDiv.style.width = '660px';
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const div1Rect = div1.getBoundingClientRect();
      const div2Rect = div2.getBoundingClientRect();
      expect(div1Rect.height).toBe(300);
      expect(div2Rect.height).toBe(300);
      expect(div2Rect.width).not.toBeGreaterThan(640);
    });

    it('adjusts to not go over the width if you have a wider element', () => {
      // The second element is 720p and so we need to adjust to not go over the width
      div1.videoWidth = 640;
      div1.videoHeight = 480;
      div2.videoWidth = 1280;
      div2.videoHeight = 720;
      layoutDiv.style.width = '600px';
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const div2Rect = div2.getBoundingClientRect();
      expect(div2Rect.left + div2Rect.width).toBeLessThan(600);
    });

    it('lets you change the min and maxRatio to force a ratio', () => {
      const layoutContainer = initLayoutContainer(layoutDiv,
        { minRatio: 9 / 16, maxRatio: 9 / 16 });
      layoutContainer.layout();
      const div1Rect = div1.getBoundingClientRect();
      expect(div1Rect.width / div1Rect.height).toBeCloseTo(16 / 9, 3);
    });

    describe('with a big element', () => {
      beforeEach(() => {
        div1.className = 'OT_big';
      });

      it('handles default layout', () => {
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        const div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBe(320);
        expect(div2Rect.width).toBe(80);
        expect(div1Rect.height).toBe(300);
        expect(div2Rect.height).toBe(120);
        expect(div1Rect.left).toBe(0);
        expect(div1Rect.top).toBe(0);
        expect(div2Rect.left).toBe(320);
        expect(div2Rect.top).toBe(90);
      });

      it('handles bigFixedRatio:true', () => {
        const layoutContainer = initLayoutContainer(layoutDiv, { bigFixedRatio: true });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width / div1Rect.height).toBeCloseTo(4 / 3, 3);
      });

      it('lets you change the bigMinRatio and bigMaxRatio to force a ratio', () => {
        const layoutContainer = initLayoutContainer(layoutDiv,
          { bigMinRatio: 9 / 16, bigMaxRatio: 9 / 16 });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.width / div1Rect.height).toBeCloseTo(16 / 9, 3);
      });

      it('handles bigPercentage', () => {
        const layoutContainer = initLayoutContainer(layoutDiv, { bigPercentage: 0.9 });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        const div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBe(360);
        expect(div2Rect.width).toBe(40);
        expect(div1Rect.height).toBe(300);
        expect(div2Rect.height).toBe(60);
      });

      it('handles bigFirst', () => {
        const layoutContainer = initLayoutContainer(layoutDiv, { bigFirst: false });
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        expect(div1Rect.left).toBe(80);
        expect(div1Rect.top).toBe(0);
      });

      it('takes margin into account', () => {
        div1.style.margin = '5px';
        div2.style.margin = '5px';

        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        const div1Rect = div1.getBoundingClientRect();
        const div2Rect = div2.getBoundingClientRect();
        expect(div1Rect.width).toBe(310);
        expect(div2Rect.width).toBe(70);
        expect(div1Rect.height).toBe(290);
        expect(div2Rect.height).toBe(110);
      });

      it('takes padding into account', () => {
        div1.style.padding = '5px';
        div2.style.padding = '5px';

        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        expect(div1.clientWidth).toBe(320);
        expect(div2.clientWidth).toBe(80);
        expect(div1.clientHeight).toBe(300);
        expect(div2.clientHeight).toBe(120);
      });
    });
  });

  describe('handling layout of 5 elements', () => {
    let layoutDiv; let divs = []; const
      divCount = 5;
    beforeEach(() => {
      layoutDiv = document.createElement('div');
      layoutDiv.setAttribute('id', 'layoutDiv');
      layoutDiv.style.position = 'absolute';
      layoutDiv.style.top = '0px';
      layoutDiv.style.left = '0px';
      layoutDiv.style.width = '400px';
      layoutDiv.style.height = '300px';
      layoutDiv.style.backgroundColor = 'grey';
      document.body.style.margin = '0px';
      document.body.style.padding = '0px';
      document.body.appendChild(layoutDiv);
      const colors = ['blue', 'green', 'orange', 'teal', 'yellow'];
      for (let i = 0; i < divCount; i += 1) {
        divs[i] = document.createElement('div');
        divs[i].style.backgroundColor = colors[i];
        layoutDiv.appendChild(divs[i]);
      }
    });

    afterEach(() => {
      document.body.removeChild(layoutDiv);
      layoutDiv = null;
      divs = [];
    });

    it('handles default layout', () => {
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect them to all have the same width and height
      let rect;
      for (let i = 0; i < divs.length; i += 1) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(133);
        expect(rect.height).toBe(150);
      }
      rect = divs[0].getBoundingClientRect();
      expect(rect.left).toBe(0.5);
      expect(rect.top).toBe(0);
      rect = divs[1].getBoundingClientRect();
      expect(rect.left).toBe(133.5);
      expect(rect.top).toBe(0);
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBe(266.5);
      expect(rect.top).toBe(0);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBe(67);
      expect(rect.top).toBe(150);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBe(200);
      expect(rect.top).toBe(150);
    });

    it('grows to takes up the whole height if there are narrow elements', () => {
      divs[1].videoWidth = 480;
      divs[1].videoHeight = 640;
      divs[2].videoWidth = 1280;
      divs[2].videoHeight = 720;
      layoutDiv.style.width = '400px';
      layoutDiv.style.height = '600px';
      const layoutContainer = initLayoutContainer(layoutDiv, { fixedRatio: true });
      layoutContainer.layout();
      const rect = divs[4].getBoundingClientRect();
      expect(rect.top + rect.height).toBe(600);
    });

    it('handles a big element', () => {
      divs[0].className = 'OT_big';
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect div[0] to be big
      const bigRect = divs[0].getBoundingClientRect();
      expect(bigRect.width).toBe(320);
      expect(bigRect.height).toBe(300);
      expect(bigRect.left).toBe(0);
      expect(bigRect.top).toBe(0);
      // Expect them to all have the same width and height
      let rect;
      for (let i = 1; i < divs.length; i += 1) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(80);
        expect(rect.height).toBe(75);
      }
      rect = divs[1].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(0);
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(75);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(150);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(225);
    });

    it('handles two big elements', () => {
      divs[0].className = 'OT_big';
      divs[1].className = 'OT_big';
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      // Expect div[0] to be big
      const bigRect = divs[0].getBoundingClientRect();
      expect(bigRect.width).toBeCloseTo(266.66, 1);
      expect(bigRect.height).toBe(150);
      expect(bigRect.left).toBeCloseTo(26.66, 1);
      expect(bigRect.top).toBe(0);
      // Expect div[1] to be big
      const big2Rect = divs[1].getBoundingClientRect();
      expect(big2Rect.width).toBeCloseTo(266.66, 1);
      expect(big2Rect.height).toBe(150);
      expect(big2Rect.left).toBeCloseTo(26.66, 1);
      expect(big2Rect.top).toBe(150);
      // Expect them to all have the same width and height
      let rect;
      for (let i = 2; i < divs.length; i += 1) {
        rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(80);
        expect(rect.height).toBe(100);
      }
      rect = divs[2].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(0);
      rect = divs[3].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(100);
      rect = divs[4].getBoundingClientRect();
      expect(rect.left).toBe(320);
      expect(rect.top).toBe(200);
    });

    it('handles hidden elements', () => {
      divs[0].style.display = 'none';
      const layoutContainer = initLayoutContainer(layoutDiv);
      layoutContainer.layout();
      for (let i = 1; i < divs.length; i += 1) {
        const rect = divs[i].getBoundingClientRect();
        expect(rect.width).toBe(200);
        expect(rect.height).toBe(150);
      }
    });

    describe('in really wide div', () => {
      beforeEach(() => {
        layoutDiv.style.width = '1000px';
      });

      it('handles default layout', () => {
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect them to all have the same width and height
        let rect;
        for (let i = 0; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(200);
          expect(rect.height).toBe(300);
        }
        rect = divs[0].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(0);
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(0);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(400);
        expect(rect.top).toBe(0);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(600);
        expect(rect.top).toBe(0);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(800);
        expect(rect.top).toBe(0);
      });

      it('handles a big element', () => {
        divs[0].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBeCloseTo(533.33, 1);
        expect(bigRect.height).toBe(300);
        expect(bigRect.left).toBeCloseTo(133.33, 1);
        expect(bigRect.top).toBe(0);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 1; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(100);
          expect(rect.height).toBe(150);
        }
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBe(800);
        expect(rect.top).toBe(0);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(900);
        expect(rect.top).toBe(0);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(800);
        expect(rect.top).toBe(150);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(900);
        expect(rect.top).toBe(150);
      });

      it('handles two big elements', () => {
        divs[0].className = 'OT_big';
        divs[1].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBe(400);
        expect(bigRect.height).toBe(300);
        expect(bigRect.left).toBe(0);
        expect(bigRect.top).toBe(0);
        // Expect div[1] to be big
        const big2Rect = divs[1].getBoundingClientRect();
        expect(big2Rect.width).toBe(400);
        expect(big2Rect.height).toBe(300);
        expect(big2Rect.left).toBe(400);
        expect(big2Rect.top).toBe(0);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 2; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBeCloseTo(177.76, 1);
          expect(rect.height).toBe(100);
        }
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(811.1, 1);
        expect(rect.top).toBe(0);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(811.1, 1);
        expect(rect.top).toBe(100);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBeCloseTo(811.1, 1);
        expect(rect.top).toBe(200);
      });
    });

    describe('in really tall div', () => {
      beforeEach(() => {
        layoutDiv.style.height = '800px';
      });

      it('handles default layout', () => {
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect them to all have the same width and height
        let rect;
        for (let i = 0; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(200);
          if (i > divs.length - 2) {
            // The last row grows a little bit to take up the extra space
            expect(rect.height).toBe(268);
          } else {
            expect(rect.height).toBe(266);
          }
        }
        rect = divs[0].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(0);
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(0);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(266);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(266);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(99.5);
        expect(rect.top).toBeCloseTo(532, 0);
      });

      it('handles a big element', () => {
        divs[0].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBe(400);
        expect(bigRect.height).toBe(600);
        expect(bigRect.left).toBe(0);
        expect(bigRect.top).toBe(20);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 1; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(100);
          expect(rect.height).toBe(150);
        }
        rect = divs[1].getBoundingClientRect();
        expect(rect.left).toBe(0);
        expect(rect.top).toBe(645);
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(100);
        expect(rect.top).toBe(645);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(200);
        expect(rect.top).toBe(645);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(300);
        expect(rect.top).toBe(645);
      });

      it('handles two big elements', () => {
        divs[0].className = 'OT_big';
        divs[1].className = 'OT_big';
        const layoutContainer = initLayoutContainer(layoutDiv);
        layoutContainer.layout();
        // Expect div[0] to be big
        const bigRect = divs[0].getBoundingClientRect();
        expect(bigRect.width).toBe(400);
        expect(bigRect.height).toBe(320);
        expect(bigRect.left).toBe(0);
        expect(bigRect.top).toBe(0);
        // Expect div[1] to be big
        const big2Rect = divs[1].getBoundingClientRect();
        expect(big2Rect.width).toBe(400);
        expect(big2Rect.height).toBe(320);
        expect(big2Rect.left).toBe(0);
        expect(big2Rect.top).toBe(320);
        // Expect them to all have the same width and height
        let rect;
        for (let i = 2; i < divs.length; i += 1) {
          rect = divs[i].getBoundingClientRect();
          expect(rect.width).toBe(133);
          expect(rect.height).toBe(160);
        }
        rect = divs[2].getBoundingClientRect();
        expect(rect.left).toBe(0.5);
        expect(rect.top).toBe(640);
        rect = divs[3].getBoundingClientRect();
        expect(rect.left).toBe(133.5);
        expect(rect.top).toBe(640);
        rect = divs[4].getBoundingClientRect();
        expect(rect.left).toBe(266.5);
        expect(rect.top).toBe(640);
      });
    });
  });
});
